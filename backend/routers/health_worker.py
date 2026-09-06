from datetime import datetime
from fastapi import APIRouter, Depends
from database import appointments_collection, referrals_collection, followups_collection
from auth import require_role

router = APIRouter(prefix="/health-worker", tags=["health-worker"])

def serialize_doc(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    if isinstance(doc.get("waiting_since"), datetime):
        doc["waiting_since"] = doc["waiting_since"].isoformat()
    if isinstance(doc.get("created_at"), datetime):
        doc["created_at"] = doc["created_at"].isoformat()
    return doc

@router.get("/patients")
async def get_registered_patients(current_user: dict = Depends(require_role("health_worker", "doctor"))):
    facility_id = current_user.get("facility_id", "PHC-NORTH-01")
    cursor = appointments_collection.find({"facility_id": facility_id}).sort("waiting_since", -1)
    patients = []
    async for doc in cursor:
        patients.append(serialize_doc(doc))
    return patients

@router.get("/high-risk")
async def get_high_risk_patients(current_user: dict = Depends(require_role("health_worker", "doctor"))):
    facility_id = current_user.get("facility_id", "PHC-NORTH-01")
    cursor = appointments_collection.find({
        "facility_id": facility_id,
        "risk_level": "high"
    }).sort("waiting_since", -1)
    patients = []
    async for doc in cursor:
        patients.append(serialize_doc(doc))
    return patients

@router.get("/referrals")
async def get_hw_referrals(current_user: dict = Depends(require_role("health_worker", "doctor"))):
    facility_id = current_user.get("facility_id", "PHC-NORTH-01")
    cursor = referrals_collection.find({
        "$or": [
            {"from_facility": facility_id},
            {"from_facility": "PHC North 01"}
        ]
    }).sort("created_at", -1)
    referrals = []
    async for doc in cursor:
        referrals.append(serialize_doc(doc))
    return referrals

@router.get("/follow-ups")
async def get_hw_followups(current_user: dict = Depends(require_role("health_worker", "doctor"))):
    facility_id = current_user.get("facility_id", "PHC-NORTH-01")
    cursor = followups_collection.find({
        "facility_id": facility_id
    }).sort("due_date", 1)
    followups = []
    async for doc in cursor:
        followups.append(serialize_doc(doc))
    return followups

@router.get("/callbacks")
async def get_hw_callbacks(current_user: dict = Depends(require_role("health_worker", "doctor"))):
    facility_id = current_user.get("facility_id", "PHC-NORTH-01")
    cursor = appointments_collection.find({
        "facility_id": facility_id,
        "needs_human_callback": True
    }).sort("waiting_since", -1)
    callbacks = []
    async for doc in cursor:
        callbacks.append(serialize_doc(doc))
    return callbacks
