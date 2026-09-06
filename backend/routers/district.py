from fastapi import APIRouter, Depends, HTTPException
from database import district_stats_collection
from auth import require_role

router = APIRouter(prefix="/district", tags=["district"])

@router.get("/stats")
async def get_district_stats(current_user: dict = Depends(require_role("district_admin"))):
    doc = await district_stats_collection.find_one({})
    if not doc:
        # Fallback dummy stats response
        return {
            "district_name": "North Central Healthcare Zone",
            "total_opd_load": 1420,
            "avg_doctor_availability": 88,
            "avg_wait_minutes": 14,
            "active_referrals": 34,
            "referral_flow": [
                {"facility": "PHC North 01", "inflow": 42, "outflow": 18},
                {"facility": "PHC West 02", "inflow": 38, "outflow": 25},
                {"facility": "Sub-Centre Rampur", "inflow": 12, "outflow": 30},
                {"facility": "District Hospital East", "inflow": 85, "outflow": 5},
            ],
            "medicine_stock": [
                {"facility": "PHC North 01", "medicine": "Paracetamol 500mg", "status": "In Stock", "level": "green", "quantity": "4,500 tabs"},
                {"facility": "PHC North 01", "medicine": "Amoxicillin 500mg", "status": "Low Stock", "level": "yellow", "quantity": "320 tabs"},
                {"facility": "PHC North 01", "medicine": "Amlodipine 5mg", "status": "Critical", "level": "red", "quantity": "45 tabs"},
                {"facility": "PHC West 02", "medicine": "ORLS Packets", "status": "In Stock", "level": "green", "quantity": "1,200 units"},
                {"facility": "District Hospital East", "medicine": "Insulin Regular 40IU", "status": "In Stock", "level": "green", "quantity": "850 vials"},
            ],
            "disease_trends": [
                {"category": "General Outpatient", "cases": 640},
                {"category": "Respiratory & Cold", "cases": 380},
                {"category": "Maternal & Child Care", "cases": 210},
                {"category": "Hypertension & Cardiac", "cases": 120},
                {"category": "Diabetes & Endocrine", "cases": 70},
            ]
        }
    
    doc["id"] = str(doc.pop("_id"))
    if hasattr(doc.get("updated_at"), "isoformat"):
        doc["updated_at"] = doc["updated_at"].isoformat()
    return doc
