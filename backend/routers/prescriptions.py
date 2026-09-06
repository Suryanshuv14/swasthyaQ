from datetime import datetime, timezone
from bson import ObjectId
from fastapi import APIRouter, Depends, HTTPException, status
from database import prescriptions_collection, appointments_collection
from models import PrescriptionCreate
from auth import get_current_doctor

router = APIRouter(prefix="/prescriptions", tags=["prescriptions"])

def serialize_prescription(prescription: dict) -> dict:
    prescription["id"] = str(prescription.pop("_id"))
    if isinstance(prescription.get("created_at"), datetime):
        prescription["created_at"] = prescription["created_at"].isoformat()
    return prescription

@router.get("/")
async def get_prescriptions(current_doctor: dict = Depends(get_current_doctor)):
    cursor = prescriptions_collection.find().sort("created_at", -1)
    prescriptions = []
    async for doc in cursor:
        p_data = serialize_prescription(doc)
        # If missing patient info, attempt lookup from linked appointment
        if not p_data.get("patient_name") and p_data.get("appointment_id"):
            try:
                obj_id = ObjectId(p_data["appointment_id"])
                appt = await appointments_collection.find_one({"_id": obj_id})
                if appt:
                    p_data["patient_name"] = appt.get("patient_name", "Patient")
                    p_data["patient_id"] = appt.get("patient_id", f"PAT-{str(obj_id)[-5:].upper()}")
                    p_data["token_no"] = appt.get("token_no", "A-100")
                    p_data["age"] = appt.get("age", 35)
            except Exception:
                pass
        if not p_data.get("patient_name"):
            p_data["patient_name"] = "Registered Patient"
            p_data["patient_id"] = "PAT-REG-01"
            p_data["token_no"] = "A-100"
            p_data["age"] = 35
        prescriptions.append(p_data)
    return prescriptions

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_prescription(
    payload: PrescriptionCreate,
    current_doctor: dict = Depends(get_current_doctor)
):
    try:
        obj_id = ObjectId(payload.appointment_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid appointment ID format")

    appointment = await appointments_collection.find_one({"_id": obj_id})
    if not appointment:
        raise HTTPException(status_code=404, detail="Linked appointment not found")

    prescription_doc = {
        "appointment_id": payload.appointment_id,
        "patient_name": appointment.get("patient_name", "Patient"),
        "patient_id": appointment.get("patient_id", f"PAT-{str(obj_id)[-5:].upper()}"),
        "token_no": appointment.get("token_no", "A-100"),
        "age": appointment.get("age", 35),
        "doctor_email": current_doctor["email"],
        "doctor_name": current_doctor["name"],
        "medicines": [m.model_dump() for m in payload.medicines],
        "notes": payload.notes or "",
        "created_at": datetime.now(timezone.utc)
    }

    res = await prescriptions_collection.insert_one(prescription_doc)
    
    # Mark linked appointment status as "done"
    await appointments_collection.update_one(
        {"_id": obj_id},
        {"$set": {"status": "done"}}
    )

    created_prescription = await prescriptions_collection.find_one({"_id": res.inserted_id})
    return serialize_prescription(created_prescription)
