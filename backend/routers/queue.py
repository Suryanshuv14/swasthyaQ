import random
from datetime import datetime, timezone
import re
from bson import ObjectId
from fastapi import APIRouter, Depends, Header, HTTPException, status
from database import appointments_collection
from models import AppointmentCreate, AppointmentStatusUpdate
from auth import get_current_user, require_role, WEBHOOK_API_KEY

router = APIRouter(prefix="/queue", tags=["queue"])

def serialize_appointment(appointment: dict) -> dict:
    appointment["id"] = str(appointment.pop("_id"))
    if isinstance(appointment.get("waiting_since"), datetime):
        appointment["waiting_since"] = appointment["waiting_since"].isoformat()
    return appointment

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

