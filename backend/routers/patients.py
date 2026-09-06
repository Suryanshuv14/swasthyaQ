from fastapi import APIRouter, Depends
from database import appointments_collection
from auth import require_role

router = APIRouter(prefix="/patients", tags=["patients"])

@router.get("/")
async def get_patients(current_user: dict = Depends(require_role("doctor", "health_worker", "district_admin"))):
    query = {}
    if current_user.get("facility_id"):
        query["facility_id"] = current_user["facility_id"]

    cursor = appointments_collection.find(query).sort("waiting_since", -1)
    patients_list = []
    async for doc in cursor:
        patients_list.append({
            "id": str(doc["_id"]),
            "patient_id": doc.get("patient_id", f"PAT-{doc['token_no']}"),
            "token_no": doc.get("token_no"),
            "patient_name": doc.get("patient_name"),
            "age": doc.get("age"),
            "symptom_category": doc.get("symptom_category"),
            "symptoms": doc.get("symptoms", []),
            "status": doc.get("status"),
            "waiting_since": doc.get("waiting_since").isoformat() if hasattr(doc.get("waiting_since"), "isoformat") else str(doc.get("waiting_since")),
            "source": doc.get("source", "manual"),
            "facility_id": doc.get("facility_id", "PHC-NORTH-01"),
            "risk_level": doc.get("risk_level", "low"),
            "needs_human_callback": doc.get("needs_human_callback", False),
        })
    return patients_list
