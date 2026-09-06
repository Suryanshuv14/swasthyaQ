from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
from database import referrals_collection
from models import ReferralCreate
from auth import require_role

router = APIRouter(prefix="/referrals", tags=["referrals"])

def serialize_referral(ref: dict) -> dict:
    ref["id"] = str(ref.pop("_id"))
    if isinstance(ref.get("created_at"), datetime):
        ref["created_at"] = ref["created_at"].isoformat()
    return ref

@router.get("/")
async def get_referrals(current_user: dict = Depends(require_role("doctor", "health_worker", "district_admin"))):
    query = {}
    if current_user.get("facility_id"):
        query["$or"] = [
            {"from_facility": current_user["facility_id"]},
            {"from_facility": "PHC North 01"},
            {"to_facility": current_user["facility_id"]},
            {"to_facility": "PHC North 01"}
        ]
    cursor = referrals_collection.find(query).sort("created_at", -1)
    referrals = []
    async for doc in cursor:
        referrals.append(serialize_referral(doc))
    return referrals

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_referral(
    payload: ReferralCreate,
    current_user: dict = Depends(require_role("doctor", "health_worker"))
):
    ref_data = payload.model_dump()
    ref_data["created_at"] = datetime.now(timezone.utc)
    if not ref_data.get("from_facility"):
        ref_data["from_facility"] = current_user.get("facility_id", "PHC North 01")

    res = await referrals_collection.insert_one(ref_data)
    created_doc = await referrals_collection.find_one({"_id": res.inserted_id})
    return serialize_referral(created_doc)
