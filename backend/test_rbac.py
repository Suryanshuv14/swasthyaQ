import asyncio
from auth import create_access_token
from routers.auth import login
from routers.queue import get_queue, create_appointment
from routers.health_worker import get_registered_patients
from routers.district import get_district_stats
from models import UserLogin, AppointmentCreate

async def run_async_tests():
    print("Testing SwasthyaQ RBAC & Multi-Role System Logic...")

    # 1. Login Doctor
    doc_resp = await login(UserLogin(email="doctor@swasthyaq.com", password="demo1234", role="doctor"))
    assert doc_resp["user"]["role"] == "doctor"
    doc_user = doc_resp["user"]
    print(f"[OK] Doctor login verified: {doc_user['name']} (Role: {doc_user['role']})")

    # 2. Login Health Worker
    hw_resp = await login(UserLogin(email="worker@swasthyaq.com", password="demo1234", role="health_worker"))
    assert hw_resp["user"]["role"] == "health_worker"
    hw_user = hw_resp["user"]
    print(f"[OK] Health Worker login verified: {hw_user['name']} (Role: {hw_user['role']})")

    # 3. Login District Admin
    admin_resp = await login(UserLogin(email="admin@swasthyaq.com", password="demo1234", role="district_admin"))
    assert admin_resp["user"]["role"] == "district_admin"
    admin_user = admin_resp["user"]
    print(f"[OK] District Admin login verified: {admin_user['name']} (Role: {admin_user['role']})")

    # 4. Doctor Queue Access
    queue_items = await get_queue(current_user=doc_user)
    print(f"[OK] Doctor Queue retrieved: {len(queue_items)} waiting appointments.")

    # 5. Health Worker Patients Access
    hw_patients = await get_registered_patients(current_user=hw_user)
    print(f"[OK] Health Worker Patients retrieved: {len(hw_patients)} registered patients.")

    # 6. District Admin Stats Access
    stats = await get_district_stats(current_user=admin_user)
    assert stats["total_opd_load"] > 0
    print(f"[OK] District Admin Stats retrieved: Total OPD Load = {stats['total_opd_load']}")

    # 7. Test Dual Auth Appointment Creation (Manual Staff)
    doc_token = doc_resp["access_token"]
    manual_appt = await create_appointment(
        payload=AppointmentCreate(
            patient_name="Rani Devi",
            age=28,
            symptom_category="Maternal care",
            symptoms=["Pregnancy checkup", "Vitamins review"]
        ),
        authorization=f"Bearer {doc_token}",
        x_api_key=None
    )
    assert manual_appt["source"] == "manual"
    print(f"[OK] Staff manual appointment creation verified (source: '{manual_appt['source']}'). Token: {manual_appt['token_no']}")

    # 8. Test Dual Auth Appointment Creation (AI Call Webhook)
    ai_appt = await create_appointment(
        payload=AppointmentCreate(
            patient_name="Deepak Patel",
            age=52,
            symptom_category="Respiratory",
            symptoms=["High fever", "Shortness of breath"]
        ),
        authorization=None,
        x_api_key="swasthyaq_secret_api_key_2026"
    )
    assert ai_appt["source"] == "ai_call"
    print(f"[OK] AI telephony webhook appointment creation verified (source: '{ai_appt['source']}'). Token: {ai_appt['token_no']}")

    print("\nALL SYSTEM VERIFICATION TESTS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    asyncio.run(run_async_tests())
