import asyncio
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from database import (
    users_collection,
    doctors_collection,
    appointments_collection,
    referrals_collection,
    followups_collection,
    district_stats_collection,
)
from auth import get_password_hash

load_dotenv()

FACILITY_ID = "PHC-NORTH-01"

async def seed_database():
    print("Seeding database for SwasthyaQ Multi-Role System...")

    hashed_password = get_password_hash("demo1234")

    # 1. Seed Accounts in users_collection
    users_data = [
        {
            "email": "doctor@swasthyaq.com",
            "password": hashed_password,
            "name": "Dr. Ananya Kapoor",
            "role": "doctor",
            "facility_id": FACILITY_ID,
            "department": "General Medicine",
        },
        {
            "email": "worker@swasthyaq.com",
            "password": hashed_password,
            "name": "Priya Sharma (ASHA / HW)",
            "role": "health_worker",
            "facility_id": FACILITY_ID,
            "department": "Community Health",
        },
        {
            "email": "admin@swasthyaq.com",
            "password": hashed_password,
            "name": "Rajesh Verma (District CMO)",
            "role": "district_admin",
            "facility_id": None,
            "department": "District Health Administration",
        },
    ]

    for user in users_data:
        await users_collection.update_one(
            {"email": user["email"]},
            {"$set": user},
            upsert=True
        )
        # Also seed doctor account into doctors_collection for backward compatibility
        if user["role"] == "doctor":
            await doctors_collection.update_one(
                {"email": user["email"]},
                {"$set": {
                    "email": user["email"],
                    "password": user["password"],
                    "name": user["name"],
                    "department": user["department"],
                    "facility_id": FACILITY_ID,
                }},
                upsert=True
            )
        print(f"[OK] User account seeded: {user['email']} (role: {user['role']})")

    # 2. Seed Appointments in appointments_collection
    await appointments_collection.delete_many({})
    now = datetime.now(timezone.utc)

    dummy_appointments = [
        {
            "patient_id": "PAT-90821",
            "token_no": "A-104",
            "patient_name": "Sunita Devi",
            "age": 47,
            "symptom_category": "General",
            "symptoms": ["Persistent headache", "Mild dizziness", "No fever"],
            "status": "waiting",
            "waiting_since": now - timedelta(minutes=25),
            "source": "ai_call",
            "facility_id": FACILITY_ID,
            "risk_level": "high",
            "needs_human_callback": True,
        },
        {
            "patient_id": "PAT-90822",
            "token_no": "A-105",
            "patient_name": "Ramesh Kumar",
            "age": 62,
            "symptom_category": "Chronic care",
            "symptoms": ["Blood pressure follow-up", "Medication review"],
            "status": "waiting",
            "waiting_since": now - timedelta(minutes=18),
            "source": "manual",
            "facility_id": FACILITY_ID,
            "risk_level": "high",
            "needs_human_callback": False,
        },
        {
            "patient_id": "PAT-90823",
            "token_no": "A-106",
            "patient_name": "Meena Sharma",
            "age": 29,
            "symptom_category": "Maternal care",
            "symptoms": ["Lower back pain", "Prenatal checkup follow-up"],
            "status": "waiting",
            "waiting_since": now - timedelta(minutes=10),
            "source": "manual",
            "facility_id": FACILITY_ID,
            "risk_level": "high",
            "needs_human_callback": True,
        },
        {
            "patient_id": "PAT-90824",
            "token_no": "A-107",
            "patient_name": "Arjun Singh",
            "age": 35,
            "symptom_category": "Respiratory",
            "symptoms": ["Cough for 4 days", "Sore throat"],
            "status": "waiting",
            "waiting_since": now - timedelta(minutes=3),
            "source": "ai_call",
            "facility_id": FACILITY_ID,
            "risk_level": "low",
            "needs_human_callback": False,
        },
    ]

    result = await appointments_collection.insert_many(dummy_appointments)
    print(f"[OK] Inserted {len(result.inserted_ids)} initial appointments into {FACILITY_ID}.")

    # 3. Seed Follow-ups
    await followups_collection.delete_many({})
    today_str = datetime.now().strftime("%Y-%m-%d")
    tomorrow_str = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")

    dummy_followups = [
        {
            "patient_id": "PAT-90821",
            "patient_name": "Sunita Devi",
            "due_date": today_str,
            "assigned_to": "Priya Sharma (ASHA / HW)",
            "notes": "Verify blood pressure reading & headache symptoms post-medication.",
            "facility_id": FACILITY_ID,
            "status": "pending",
        },
        {
            "patient_id": "PAT-90823",
            "patient_name": "Meena Sharma",
            "due_date": today_str,
            "assigned_to": "Priya Sharma (ASHA / HW)",
            "notes": "Check ANC registration & iron supplement intake.",
            "facility_id": FACILITY_ID,
            "status": "pending",
        },
        {
            "patient_id": "PAT-90822",
            "patient_name": "Ramesh Kumar",
            "due_date": tomorrow_str,
            "assigned_to": "Priya Sharma (ASHA / HW)",
            "notes": "Confirm refill pickup for hypertensive regimen.",
            "facility_id": FACILITY_ID,
            "status": "pending",
        },
    ]
    await followups_collection.insert_many(dummy_followups)
    print(f"[OK] Inserted {len(dummy_followups)} initial follow-up tasks.")

    # 4. Seed Referrals
    await referrals_collection.delete_many({})
    dummy_referrals = [
        {
            "patient_id": "PAT-90821",
            "patient_name": "Sunita Devi",
            "from_facility": "PHC North 01",
            "to_facility": "District Hospital East",
            "reason": "Neurological evaluation for persistent migraines",
            "status": "pending",
            "created_at": now - timedelta(hours=5),
        },
        {
            "patient_id": "PAT-90810",
            "patient_name": "Kavita Rao",
            "from_facility": "Sub-Centre Rampur",
            "to_facility": "PHC North 01",
            "reason": "High-risk pregnancy consultation",
            "status": "completed",
            "created_at": now - timedelta(days=1),
        },
    ]
    await referrals_collection.insert_many(dummy_referrals)
    print(f"[OK] Inserted {len(dummy_referrals)} initial referrals.")

    # 5. Seed District Aggregate Stats
    await district_stats_collection.delete_many({})
    district_stats_doc = {
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
        ],
        "updated_at": now,
    }
    await district_stats_collection.insert_one(district_stats_doc)
    print(f"[OK] Seeded District aggregate stats.")

    print("\nDatabase seeding completed successfully!")

if __name__ == "__main__":
    asyncio.run(seed_database())
