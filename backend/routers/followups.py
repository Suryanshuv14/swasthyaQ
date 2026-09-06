from fastapi import APIRouter, Depends, status
from database import followups_collection
from models import FollowUpCreate
from auth import require_role

router = APIRouter(prefix="/follow-ups", tags=["follow-ups"])

def serialize_followup(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    return doc

@router.get("/")
async def get_followups(current_user: dict = Depends(require_role("doctor", "health_worker", "district_admin"))):
    query = {}
    if current_user.get("facility_id"):
        query["facility_id"] = current_user["facility_id"]
    cursor = followups_collection.find(query).sort("due_date", 1)
    followups = []
    async for doc in cursor:
        followups.append(serialize_followup(doc))
    return followups

@router.post("/", status_code=status.HTTP_201_CREATED)
async def create_followup(
    payload: FollowUpCreate,
    current_user: dict = Depends(require_role("doctor", "health_worker"))
):
    followup_data = payload.model_dump()
    followup_data["status"] = "pending"
    if not followup_data.get("facility_id"):
        followup_data["facility_id"] = current_user.get("facility_id", "PHC-NORTH-01")

    res = await followups_collection.insert_one(followup_data)
    created_doc = await followups_collection.find_one({"_id": res.inserted_id})
    return serialize_followup(created_doc)
