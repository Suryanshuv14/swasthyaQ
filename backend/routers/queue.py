import random
from datetime import datetime, timezone, timedelta
import re
from bson import ObjectId
from fastapi import APIRouter, Depends, Header, HTTPException, status, Query
from fastapi.responses import JSONResponse
from database import appointments_collection, users_collection, doctors_collection
from models import AppointmentCreate, AppointmentStatusUpdate
from auth import get_current_user, require_role, WEBHOOK_API_KEY

router = APIRouter(prefix="/queue", tags=["queue"])

def serialize_appointment(appointment: dict) -> dict:
    appointment["id"] = str(appointment.pop("_id"))
    if isinstance(appointment.get("waiting_since"), datetime):
        appointment["waiting_since"] = appointment["waiting_since"].isoformat()
    if isinstance(appointment.get("created_at"), datetime):
        appointment["created_at"] = appointment["created_at"].isoformat()
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

async def get_facility_doctor_config(facility_id: str, department: str = "General Medicine"):
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

    doc_name = doctor.get("name", "Dr. Keshav Kapoor") if doctor else "Dr. Keshav Kapoor"
    doc_dept = doctor.get("department", department) if doctor else department
    doc_status = doctor.get("availability_status", "available") if doctor else "available"
    opd_days = doctor.get("opd_days", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]) if doctor else ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    shift_morning = doctor.get("shift_morning", "09:00 AM - 01:00 PM") if doctor else "09:00 AM - 01:00 PM"
    shift_evening = doctor.get("shift_evening", "04:00 PM - 07:00 PM") if doctor else "04:00 PM - 07:00 PM"
    max_tokens = doctor.get("max_tokens_per_shift", 40) if doctor else 40

    morning_slots = parse_shift_to_slots(shift_morning) or [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "12:00 PM", "12:30 PM"
    ]
    evening_slots = parse_shift_to_slots(shift_evening) or [
        "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM"
    ]
    all_slot_times = morning_slots + evening_slots
    total_slots_count = len(all_slot_times)

    slot_capacities = {}
    if total_slots_count > 0:
        base_cap = max(1, max_tokens // total_slots_count)
        remainder = max_tokens % total_slots_count
        for idx, slot_time in enumerate(all_slot_times):
            slot_capacities[slot_time] = base_cap + (1 if idx < remainder else 0)

    return {
        "doctor": doctor,
        "doctor_name": doc_name,
        "department": doc_dept,
        "availability_status": doc_status,
        "opd_days": opd_days,
        "shift_morning": shift_morning,
        "shift_evening": shift_evening,
        "max_tokens": max_tokens,
        "all_slot_times": all_slot_times,
        "slot_capacities": slot_capacities
    }

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

    # 2. Fetch Doctor configuration
    cfg = await get_facility_doctor_config(facility_id, department)
    doc_name = cfg["doctor_name"]
    doc_dept = cfg["department"]
    doc_status = cfg["availability_status"]
    opd_days = cfg["opd_days"]
    max_tokens = cfg["max_tokens"]
    all_slot_times = cfg["all_slot_times"]
    slot_capacities = cfg["slot_capacities"]

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

    if len(all_slot_times) == 0:
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

    # 5. Query existing appointments on target date
    start_dt = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0, tzinfo=timezone.utc)
    end_dt = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59, 999999, tzinfo=timezone.utc)

    total_booked = await appointments_collection.count_documents({
        "facility_id": facility_id,
        "status": {"$ne": "cancelled"},
        "$or": [
            {"appointment_date": date},
            {"waiting_since": {"$gte": start_dt, "$lte": end_dt}}
        ]
    })

    if total_booked >= max_tokens:
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

    # 6. Compute available slots dynamically based on booked appointments
    available_slots = []
    for slot_time in all_slot_times:
        cap = slot_capacities.get(slot_time, 1)
        booked_for_slot = await appointments_collection.count_documents({
            "facility_id": facility_id,
            "status": {"$ne": "cancelled"},
            "$or": [
                {"appointment_date": date, "appointment_time": slot_time},
                {"waiting_since": {"$gte": start_dt, "$lte": end_dt}, "appointment_time": slot_time}
            ]
        })
        remaining_in_slot = max(0, cap - booked_for_slot)
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

async def process_appointment_booking(
    payload: AppointmentCreate,
    authorization: str = None,
    x_api_key: str = None
):
    appointment_data = payload.model_dump()
    source = payload.source or "manual"
    facility_id = payload.facility_id or "PHC-NORTH-01"
    department = payload.department or "General Medicine"

    # Authorization verification
    if authorization and authorization.startswith("Bearer "):
        token = authorization.split(" ")[1]
        try:
            user = await get_current_user(token)
            if user.get("facility_id"):
                facility_id = user["facility_id"]
        except Exception:
            raise HTTPException(status_code=401, detail="Invalid staff credentials")
    elif x_api_key and x_api_key == WEBHOOK_API_KEY:
        source = payload.source if payload.source in ["patient_app", "ai_call"] else "ai_call"
    elif payload.source == "patient_app":
        source = "patient_app"
    else:
        # Default allow patient_app or authenticated requests
        source = payload.source or "patient_app"

    appointment_data["source"] = source
    appointment_data["facility_id"] = facility_id
    appointment_data["department"] = department

    # 1. Fetch Doctor configuration for validation
    cfg = await get_facility_doctor_config(facility_id, department)
    doc_name = cfg["doctor_name"]
    doc_status = cfg["availability_status"]
    opd_days = cfg["opd_days"]
    max_tokens = cfg["max_tokens"]
    all_slot_times = cfg["all_slot_times"]
    slot_capacities = cfg["slot_capacities"]

    appointment_data["doctor_name"] = payload.doctor_name or doc_name

    # 2. Slot & Date Validation when appointment_date is supplied
    if payload.appointment_date:
        try:
            target_date = datetime.strptime(payload.appointment_date, "%Y-%m-%d").date()
        except ValueError:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"success": False, "message": "Invalid appointment_date format. Expected YYYY-MM-DD."}
            )

        day_name_full = target_date.strftime("%A")
        day_abbr = target_date.strftime("%a")

        # Check OPD day
        if day_abbr not in opd_days and day_name_full not in opd_days:
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={
                    "success": False,
                    "message": f"OPD is closed on {day_name_full}s at facility {facility_id}."
                }
            )

        # Check doctor availability status
        if doc_status != "available":
            return JSONResponse(
                status_code=status.HTTP_409_CONFLICT,
                content={
                    "success": False,
                    "message": f"{doc_name} is currently {doc_status.replace('_', ' ')}."
                }
            )

        # Check discrete 30-minute slot validity
        if payload.appointment_time:
            if payload.appointment_time not in all_slot_times:
                return JSONResponse(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    content={
                        "success": False,
                        "message": f"Invalid appointment time '{payload.appointment_time}'. Valid slots: {all_slot_times}"
                    }
                )

            start_dt = datetime(target_date.year, target_date.month, target_date.day, 0, 0, 0, tzinfo=timezone.utc)
            end_dt = datetime(target_date.year, target_date.month, target_date.day, 23, 59, 59, 999999, tzinfo=timezone.utc)

            # Check capacity of specific slot
            slot_cap = slot_capacities.get(payload.appointment_time, 1)
            booked_for_slot = await appointments_collection.count_documents({
                "facility_id": facility_id,
                "status": {"$ne": "cancelled"},
                "$or": [
                    {"appointment_date": payload.appointment_date, "appointment_time": payload.appointment_time},
                    {"waiting_since": {"$gte": start_dt, "$lte": end_dt}, "appointment_time": payload.appointment_time}
                ]
            })

            total_booked = await appointments_collection.count_documents({
                "facility_id": facility_id,
                "status": {"$ne": "cancelled"},
                "$or": [
                    {"appointment_date": payload.appointment_date},
                    {"waiting_since": {"$gte": start_dt, "$lte": end_dt}}
                ]
            })

            if booked_for_slot >= slot_cap or total_booked >= max_tokens:
                return JSONResponse(
                    status_code=status.HTTP_409_CONFLICT,
                    content={
                        "success": False,
                        "message": "The selected appointment slot is no longer available."
                    }
                )

    # 3. Patient ID & Token Generation
    if not appointment_data.get("patient_id"):
        appointment_data["patient_id"] = f"PAT-{random.randint(10000, 99999)}"

    if not appointment_data.get("token_no"):
        appointment_data["token_no"] = await generate_token_no(facility_id)

    now_utc = datetime.now(timezone.utc)
    if not appointment_data.get("waiting_since"):
        appointment_data["waiting_since"] = now_utc

    appointment_data["created_at"] = now_utc

    # 4. Insert into MongoDB
    result = await appointments_collection.insert_one(appointment_data)
    created_doc = await appointments_collection.find_one({"_id": result.inserted_id})

    # 5. Formulate response
    if payload.appointment_date or source == "patient_app" or (x_api_key and x_api_key == WEBHOOK_API_KEY):
        return {
            "success": True,
            "appointment_id": str(created_doc["_id"]),
            "patient_id": created_doc.get("patient_id"),
            "token_no": created_doc.get("token_no"),
            "patient_name": created_doc.get("patient_name"),
            "age": created_doc.get("age"),
            "appointment_date": created_doc.get("appointment_date"),
            "appointment_time": created_doc.get("appointment_time"),
            "facility_id": created_doc.get("facility_id"),
            "department": created_doc.get("department", department),
            "doctor_name": created_doc.get("doctor_name", doc_name),
            "status": created_doc.get("status", "waiting"),
            "source": created_doc.get("source", source)
        }

    # Backward compatible serialization for dashboard
    return serialize_appointment(created_doc)

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_appointment(
    payload: AppointmentCreate,
    authorization: str = Header(None),
    x_api_key: str = Header(None)
):
    return await process_appointment_booking(payload, authorization, x_api_key)

@router.post("/book", status_code=status.HTTP_201_CREATED)
async def book_appointment_slot(
    payload: AppointmentCreate,
    authorization: str = Header(None),
    x_api_key: str = Header(None)
):
    return await process_appointment_booking(payload, authorization, x_api_key)

async def generate_token_no(facility_id: str) -> str:
    highest = 100
    cursor = appointments_collection.find({"facility_id": facility_id}, {"token_no": 1})
    async for appointment in cursor:
        token = appointment.get("token_no", "")
        match = re.fullmatch(r"A-(\d+)", token)
        if match:
            highest = max(highest, int(match.group(1)))
    return f"A-{highest + 1}"

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
