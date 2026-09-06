import asyncio
from datetime import datetime
from httpx import AsyncClient, ASGITransport
from main import app
from database import appointments_collection

async def run_tests():
    print("=== STARTING SWASTHYAQ BACKEND SLOT BOOKING VERIFICATION ===")
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        # Step 0: Clean up test appointments for 2026-09-08 to have clean baseline
        await appointments_collection.delete_many({
            "appointment_date": "2026-09-08",
            "facility_id": "PHC-NORTH-01"
        })
        print("[0] Cleaned up previous test records for 2026-09-08")

        # Step 1: Test GET /queue/availability
        print("\n--- STEP 1: Test Availability Endpoint ---")
        res1 = await client.get("/queue/availability?date=2026-09-08&facility_id=PHC-NORTH-01&department=General%20Medicine")
        assert res1.status_code == 200, f"Expected 200, got {res1.status_code}: {res1.text}"
        data1 = res1.json()
        print(f"Date: {data1['date']} ({data1['day_of_week']})")
        print(f"Doctor: {data1['doctor_name']}, Department: {data1['department']}")
        print(f"Total Available Slots: {len(data1['available_slots'])}")
        
        slot_10am_initial = next((s for s in data1["available_slots"] if s["time"] == "10:00 AM"), None)
        assert slot_10am_initial is not None, "10:00 AM slot must be available"
        initial_cap = slot_10am_initial["remaining"]
        print(f"[OK] Initial 10:00 AM slot capacity: {initial_cap}")

        # Step 2: Test Booking for 2026-09-08 at 10:00 AM
        print("\n--- STEP 2: Test Successful Slot Booking ---")
        booking_payload = {
            "patient_name": "Rahul Sharma",
            "age": 20,
            "symptoms": ["fever", "cough for two days"],
            "symptom_category": "General Medicine",
            "appointment_date": "2026-09-08",
            "appointment_time": "10:00 AM",
            "facility_id": "PHC-NORTH-01",
            "department": "General Medicine",
            "source": "patient_app"
        }
        res2 = await client.post("/queue/book", json=booking_payload)
        assert res2.status_code == 201, f"Expected 201, got {res2.status_code}: {res2.text}"
        book_data = res2.json()
        print(f"Booking Response: {book_data}")
        assert book_data["success"] is True
        assert book_data["patient_name"] == "Rahul Sharma"
        assert book_data["appointment_date"] == "2026-09-08"
        assert book_data["appointment_time"] == "10:00 AM"
        assert book_data["token_no"].startswith("A-")
        print(f"[OK] Booking succeeded with Token: {book_data['token_no']}")

        # Step 3: Verify MongoDB document
        print("\n--- STEP 3: Verify Written MongoDB Document ---")
        from bson import ObjectId
        saved_doc = await appointments_collection.find_one({"_id": ObjectId(book_data["appointment_id"])})
        assert saved_doc is not None
        assert saved_doc["patient_name"] == "Rahul Sharma"
        assert saved_doc["appointment_date"] == "2026-09-08"
        assert saved_doc["appointment_time"] == "10:00 AM"
        assert saved_doc["source"] == "patient_app"
        assert "created_at" in saved_doc
        print("[OK] MongoDB document verified successfully with all required fields")

        # Step 4 & 5: Check updated capacity in GET /queue/availability
        print("\n--- STEP 4 & 5: Check Decreased Capacity in Availability ---")
        res3 = await client.get("/queue/availability?date=2026-09-08&facility_id=PHC-NORTH-01&department=General%20Medicine")
        data3 = res3.json()
        slot_10am_after1 = next((s for s in data3["available_slots"] if s["time"] == "10:00 AM"), None)
        assert slot_10am_after1 is not None
        after1_cap = slot_10am_after1["remaining"]
        print(f"Capacity before: {initial_cap} -> Capacity after 1 booking: {after1_cap}")
        assert after1_cap == initial_cap - 1, f"Expected capacity {initial_cap - 1}, got {after1_cap}"
        print("[OK] Remaining slot capacity decreased accurately by 1")

        # Step 6 & 7: Exhaust slot capacity and verify rejection (HTTP 409)
        print("\n--- STEP 6 & 7: Exhaust Slot Capacity and Test Rejection ---")
        for i in range(after1_cap):
            p_payload = {
                "patient_name": f"Patient Extra {i+1}",
                "age": 25 + i,
                "symptoms": ["headache"],
                "symptom_category": "General Medicine",
                "appointment_date": "2026-09-08",
                "appointment_time": "10:00 AM",
                "facility_id": "PHC-NORTH-01",
                "department": "General Medicine",
                "source": "patient_app"
            }
            res_fill = await client.post("/queue/book", json=p_payload)
            assert res_fill.status_code == 201, f"Failed filling slot {i+1}: {res_fill.text}"
            print(f"  -> Booked slot token {res_fill.json()['token_no']} (Filled {i+1}/{after1_cap})")

        # Attempt booking when slot is full
        res_full = await client.post("/queue/book", json={
            "patient_name": "Over Capacity Patient",
            "age": 30,
            "symptoms": ["cough"],
            "symptom_category": "General Medicine",
            "appointment_date": "2026-09-08",
            "appointment_time": "10:00 AM",
            "facility_id": "PHC-NORTH-01",
            "department": "General Medicine",
            "source": "patient_app"
        })
        print(f"Over-capacity response code: {res_full.status_code}, body: {res_full.json()}")
        assert res_full.status_code == 409, f"Expected 409 Conflict, got {res_full.status_code}"
        assert res_full.json()["success"] is False
        assert "no longer available" in res_full.json()["message"]
        print("[OK] Rejection for exhausted slot successfully returned HTTP 409 with proper message")

        # Verify availability now excludes or shows 0 for 10:00 AM
        res4 = await client.get("/queue/availability?date=2026-09-08&facility_id=PHC-NORTH-01&department=General%20Medicine")
        data4 = res4.json()
        slot_10am_exhausted = next((s for s in data4["available_slots"] if s["time"] == "10:00 AM"), None)
        assert slot_10am_exhausted is None, "Exhausted slot should not be listed in available slots"
        print("[OK] Availability correctly omits fully booked slot")

        # Step 8: Test Doctor login and existing Queue endpoints
        print("\n--- STEP 8: Test Doctor Dashboard Compatibility ---")
        login_res = await client.post("/auth/login", json={
            "email": "doctor@swasthyaq.com",
            "password": "demo1234",
            "role": "doctor"
        })
        assert login_res.status_code == 200, f"Doctor login failed: {login_res.text}"
        doctor_token = login_res.json()["access_token"]
        print(f"[OK] Doctor login successful")

        # GET /queue/ with Bearer token
        q_res = await client.get("/queue/", headers={"Authorization": f"Bearer {doctor_token}"})
        assert q_res.status_code == 200, f"GET /queue/ failed: {q_res.text}"
        queue_items = q_res.json()
        print(f"[OK] GET /queue/ returned {len(queue_items)} waiting appointments")

        # GET /queue/all with Bearer token
        q_all_res = await client.get("/queue/all", headers={"Authorization": f"Bearer {doctor_token}"})
        assert q_all_res.status_code == 200, f"GET /queue/all failed: {q_all_res.text}"
        all_items = q_all_res.json()
        print(f"[OK] GET /queue/all returned {len(all_items)} total appointments")

        # Test manual creation from Doctor Dashboard via POST /queue/
        manual_res = await client.post("/queue/", headers={"Authorization": f"Bearer {doctor_token}"}, json={
            "patient_name": "Walk-in Patient",
            "age": 55,
            "symptom_category": "General",
            "symptoms": ["Mild cold"],
            "facility_id": "PHC-NORTH-01"
        })
        assert manual_res.status_code == 201, f"Manual queue add failed: {manual_res.text}"
        manual_item = manual_res.json()
        assert manual_item["patient_name"] == "Walk-in Patient"
        print(f"[OK] Dashboard manual queue addition works with token: {manual_item['token_no']}")

        print("\n=======================================================")
        print("ALL BACKEND SLOT BOOKING TESTS PASSED PERFECTLY!")
        print("=======================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
