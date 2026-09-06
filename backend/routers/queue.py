import random
from datetime import datetime, timezone, timedelta
import re
from bson import ObjectId
from fastapi import APIRouter, Depends, Header, HTTPException, status
from database import appointments_collection, users_collection, doctors_collection
from models import AppointmentCreate, AppointmentStatusUpdate
from auth import get_current_user, require_role, WEBHOOK_API_KEY
from fastapi import Query

router = APIRouter(prefix="/queue", tags=["queue"])

def serialize_appointment(appointment: dict) -> dict:
    appointment["id"] = str(appointment.pop("_id"))
    if isinstance(appointment.get("waiting_since"), datetime):
        appointment["waiting_since"] = appointment["waiting_since"].isoformat()
    return appointment

def parse_shift_to_slots(shift_str: str) -> list[str]:
    try:
        parts = [p.strip() for p in shift_str.split("-")]
        if len(parts) != 2:
            return []
        start_t = datetime.strptime(parts[0], "%I:%M %p")
        end_t = datetime.strptime(parts[1], "%I:%M %p")
        slots = []
        curr = start_t
        while curr < end_t:
            slots.append(curr.strftime("%I:%M %p"))
            curr += timedelta(minutes=30)
        return slots
    except Exception:
        return []

@router.get("/availability")
async def get_queue_availability(
    date: str = Query(..., description="Target appointment date in YYYY-MM-DD format (e.g. 2026-09-08)"),
    facility_id: str = Query("PHC-NORTH-01", description="Healthcare facility ID"),
    department: str = Query("General Medicine", description="Medical department")
):
    # 1. Parse and validate target date
    try:
        target_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid date format. Expected YYYY-MM-DD."
        )

    day_name_full = target_date.strftime("%A")      # e.g. "Tuesday"
    day_abbr = target_date.strftime("%a")           # e.g. "Tue"

    # 2. Fetch Doctor profile associated with facility & department
    doctor = await users_collection.find_one({
        "role": "doctor",
        "$or": [
            {"facility_id": facility_id},
            {"facility_id": None},
            {"facility_id": "PHC-NORTH-01"}
        ]
    })
    if not doctor:
        doctor = await doctors_collection.find_one({"facility_id": facility_id})

    # Default doctor settings if unconfigured
    doc_name = doctor.get("name", "Dr. Ananya Kapoor") if doctor else "Dr. Ananya Kapoor"
    doc_dept = doctor.get("department", department) if doctor else department
    doc_status = doctor.get("availability_status", "available") if doctor else "available"
    opd_days = doctor.get("opd_days", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) if doctor else ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    shift_morning = doctor.get("shift_morning", "09:00 AM - 01:00 PM") if doctor else "09:00 AM - 01:00 PM"
    shift_evening = doctor.get("shift_evening", "04:00 PM - 07:00 PM") if doctor else "04:00 PM - 07:00 PM"
    max_tokens = doctor.get("max_tokens_per_shift", 40) if doctor else 40

    # 3. Check if date is an active OPD day
    if day_abbr not in opd_days and day_name_full not in opd_days:
        return {
            "date": date,
            "day_of_week": day_name_full,
            "facility_id": facility_id,
            "department": doc_dept,
            "doctor_name": doc_name,
            "available": False,
            "reason": f"OPD is closed on {day_name_full}s at facility {facility_id}",
            "available_slots": []
        }

    # 4. Check if doctor is on duty
    if doc_status != "available":
        status_clean = doc_status.replace("_", " ").title()
        return {
            "date": date,
            "day_of_week": day_name_full,
            "facility_id": facility_id,
            "department": doc_dept,
            "doctor_name": doc_name,
            "available": False,
            "reason": f"{doc_name} is currently {status_clean}",
            "available_slots": []
        }

    # 5. Generate discrete 30-minute slots from OPD shifts
    morning_slots = parse_shift_to_slots(shift_morning) or [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM"
    ]
    evening_slots = parse_shift_to_slots(shift_evening) or [
        "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM"
    ]
    all_slot_times = morning_slots + evening_slots
    total_slots_count = len(all_slot_times)

    if total_slots_count == 0:
        return {
            "date": date,
            "day_of_week": day_name_full,
            "facility_id": facility_id,
            "department": doc_dept,
            "doctor_name": doc_name,
            "available": False,
            "reason": "No active shift hours configured for this doctor",
            "available_slots": []
        }

    # Base capacity per slot
    base_cap = max(1, max_tokens // total_slots_count)
    remainder = max_tokens % total_slots_count
    slot_capacities = {}
    for idx, slot_time in enumerate(all_slot_times):
        slot_capacities[slot_time] = base_cap + (1 if idx < remainder else 0)

    # 6. Query existing appointments on target date to compute occupied tokens
    start_dt = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0, tzinfo=timezone.utc)
    end_dt = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59, 999999, tzinfo=timezone.utc)

    booked_count = await appointments_collection.count_documents({
        "facility_id": facility_id,
        "status": {"$ne": "cancelled"},
        "waiting_since": {"$gte": start_dt, "$lte": end_dt}
    })

    if booked_count >= max_tokens:
        return {
            "date": date,
            "day_of_week": day_name_full,
            "facility_id": facility_id,
            "department": doc_dept,
            "doctor_name": doc_name,
            "available": False,
            "reason": "All OPD appointment tokens/slots for this date are fully booked",
            "available_slots": []
        }

    # Distribute existing bookings to compute remaining capacity per slot
    available_slots = []
    remaining_bookings = booked_count

    for slot_time in all_slot_times:
        cap = slot_capacities[slot_time]
        booked_for_slot = min(cap, remaining_bookings)
        remaining_bookings -= booked_for_slot
        remaining_in_slot = cap - booked_for_slot
        if remaining_in_slot > 0:
            available_slots.append({
                "time": slot_time,
                "remaining": remaining_in_slot
            })

    return {
        "date": date,
        "day_of_week": day_name_full,
        "facility_id": facility_id,
        "department": doc_dept,
        "doctor_name": doc_name,
        "available": len(available_slots) > 0,
        "available_slots": available_slots
    }

@router.get("/")
async def get_queue(current_user: dict = Depends(require_role("doctor", "health_worker", "district_admin"))):
    query = {"status": "waiting"}
    if current_user.get("facility_id"):
        query["facility_id"] = current_user["facility_id"]
    cursor = appointments_collection.find(query).sort("waiting_since", 1)
    appointments = []
    async for doc in cursor:
        appointments.append(serialize_appointment(doc))
    return appointments

@router.get("/all")
async def get_all_appointments(current_user: dict = Depends(require_role("doctor", "health_worker", "district_admin"))):
    query = {}
    if current_user.get("facility_id"):
        query["facility_id"] = current_user["facility_id"]
    cursor = appointments_collection.find(query).sort("waiting_since", -1)
    appointments = []
    async for doc in cursor:
        appointments.append(serialize_appointment(doc))
    return appointments

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_appointment(
    payload: AppointmentCreate,
    authorization: str = Header(None),
    x_api_key: str = Header(None)
):
    appointment_data = payload.model_dump()
    source = "manual"
    facility_id = payload.facility_id or "PHC-NORTH-01"

    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            user = await get_current_user(token)
            source = "manual"
            if user.get("facility_id"):
                facility_id = user["facility_id"]
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid staff credentials")
    elif x_api_key and x_api_key == WEBHOOK_API_KEY:
        source = "ai_call"
    else:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Requires valid staff Bearer token or X-API-Key header"
        )

    appointment_data["source"] = source
    appointment_data["facility_id"] = facility_id

    if not appointment_data.get("patient_id"):
        appointment_data["patient_id"] = f"PAT-{random.randint(10000, 99999)}"

    if not appointment_data.get("token_no"):
        appointment_data["token_no"] = await generate_token_no(facility_id)

    if not appointment_data.get("waiting_since"):
        appointment_data["waiting_since"] = datetime.now(timezone.utc)
    
    result = await appointments_collection.insert_one(appointment_data)
    created_doc = await appointments_collection.find_one({"_id": result.inserted_id})
    return serialize_appointment(created_doc)

async def generate_token_no(facility_id: str) -> str:
    highest = 100
    cursor = appointments_collection.find({"facility_id": facility_id}, {"token_no": 1})
    async for appointment in cursor:
        token = appointment.get("token_no", "")
        match = re.fullmatch(r"A-(\d+)", token)
        if match:
            highest = max(highest, int(match.group(1)))
    return f"A-{highest + 1}"

@router.get("/{appointment_id}")
async def get_appointment(appointment_id: str, current_user: dict = Depends(require_role("doctor", "health_worker", "district_admin"))):
    try:
        obj_id = ObjectId(appointment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid appointment ID format")
        
    doc = await appointments_collection.find_one({"_id": obj_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Appointment not found")
    return serialize_appointment(doc)

@router.patch("/{appointment_id}/status")
async def update_appointment_status(
    appointment_id: str,
    payload: AppointmentStatusUpdate,
    current_user: dict = Depends(require_role("doctor", "health_worker"))
):
    try:
        obj_id = ObjectId(appointment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid appointment ID format")

    result = await appointments_collection.update_one(
        {"_id": obj_id},
        {"$set": {"status": payload.status}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Appointment not found")

    updated_doc = await appointments_collection.find_one({"_id": obj_id})
    return serialize_appointment(updated_doc)

