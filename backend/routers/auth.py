from fastapi import APIRouter, Depends, HTTPException, status
from models import UserLogin, ProfileUpdate, PasswordChange
from database import users_collection, doctors_collection
from auth import verify_password, get_password_hash, create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/login")
async def login(credentials: UserLogin):
    user = await users_collection.find_one({"email": credentials.email})
    if not user:
        user = await doctors_collection.find_one({"email": credentials.email})
        if user:
            user["role"] = "doctor"
            user["facility_id"] = user.get("facility_id", "PHC-NORTH-01")

    if not user or not verify_password(credentials.password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Validate role if specified in credentials
    if credentials.role and user.get("role") != credentials.role:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Account '{credentials.email}' is registered as '{user.get('role')}', not '{credentials.role}'",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(data={
        "sub": user["email"],
        "role": user.get("role", "doctor"),
        "facility_id": user.get("facility_id", "PHC-NORTH-01"),
        "name": user.get("name", "Medical Professional")
    })

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "role": user.get("role", "doctor"),
            "facility_id": user.get("facility_id"),
            "department": user.get("department", "General Healthcare"),
            "phone": user.get("phone", "+91 98765 43210"),
            "avatar_url": user.get("avatar_url", ""),
            "medical_reg_no": user.get("medical_reg_no", "MH-20481"),
            "qualification": user.get("qualification", "MBBS, MD (Medicine)"),
            "experience_years": user.get("experience_years", 8),
            "chamber_room": user.get("chamber_room", "Room #03 - Doctor Chamber"),
            "opd_days": user.get("opd_days", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]),
            "shift_morning": user.get("shift_morning", "09:00 AM - 01:00 PM"),
            "shift_evening": user.get("shift_evening", "04:00 PM - 07:00 PM"),
            "max_tokens_per_shift": user.get("max_tokens_per_shift", 40),
            "availability_status": user.get("availability_status", "available"),
            "emergency_alerts_enabled": user.get("emergency_alerts_enabled", True),
            "auto_prescription_validity_days": user.get("auto_prescription_validity_days", 5),
        },
        # Backward compatibility field
        "doctor": {
            "id": str(user["_id"]),
            "email": user["email"],
            "name": user["name"],
            "department": user.get("department", "General Healthcare"),
        }
    }


@router.get("/profile")
async def get_profile(current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        user = await doctors_collection.find_one({"email": current_user["email"]})
    if not user:
        user = current_user

    return {
        "id": str(user.get("_id", current_user.get("_id"))),
        "email": user["email"],
        "name": user.get("name", current_user.get("name")),
        "role": user.get("role", current_user.get("role")),
        "facility_id": user.get("facility_id", current_user.get("facility_id")),
        "department": user.get("department", "General Medicine & OPD"),
        "phone": user.get("phone", "+91 98765 43210"),
        "avatar_url": user.get("avatar_url", ""),
        "medical_reg_no": user.get("medical_reg_no", "MH-20481"),
        "qualification": user.get("qualification", "MBBS, MD (Medicine)"),
        "experience_years": user.get("experience_years", 8),
        "chamber_room": user.get("chamber_room", "Room #03 - Doctor Chamber"),
        "opd_days": user.get("opd_days", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]),
        "shift_morning": user.get("shift_morning", "09:00 AM - 01:00 PM"),
        "shift_evening": user.get("shift_evening", "04:00 PM - 07:00 PM"),
        "max_tokens_per_shift": user.get("max_tokens_per_shift", 40),
        "availability_status": user.get("availability_status", "available"),
        "emergency_alerts_enabled": user.get("emergency_alerts_enabled", True),
        "auto_prescription_validity_days": user.get("auto_prescription_validity_days", 5),
    }


@router.patch("/profile")
async def update_profile(updates: ProfileUpdate, current_user: dict = Depends(get_current_user)):
    update_data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update")

    # If updating email, verify unique
    if "email" in update_data and update_data["email"] != current_user["email"]:
        existing = await users_collection.find_one({"email": update_data["email"]})
        if existing and str(existing["_id"]) != str(current_user["_id"]):
            raise HTTPException(status_code=400, detail="Email is already registered by another user")

    await users_collection.update_many({"email": current_user["email"]}, {"$set": update_data})
    await doctors_collection.update_many({"email": current_user["email"]}, {"$set": update_data})

    # Fetch updated
    target_email = update_data.get("email", current_user["email"])
    updated_user = await users_collection.find_one({"email": target_email})
    if not updated_user:
        updated_user = await doctors_collection.find_one({"email": target_email})

    # Generate new token if email or name changed
    new_token = create_access_token(data={
        "sub": target_email,
        "role": updated_user.get("role", "doctor"),
        "facility_id": updated_user.get("facility_id", "PHC-NORTH-01"),
        "name": updated_user.get("name", "Doctor")
    })

    return {
        "message": "Profile updated successfully",
        "access_token": new_token,
        "user": {
            "id": str(updated_user["_id"]),
            "email": updated_user["email"],
            "name": updated_user["name"],
            "role": updated_user.get("role", "doctor"),
            "facility_id": updated_user.get("facility_id"),
            "department": updated_user.get("department", "General Medicine"),
            "phone": updated_user.get("phone", "+91 98765 43210"),
            "avatar_url": updated_user.get("avatar_url", ""),
            "medical_reg_no": updated_user.get("medical_reg_no", "MH-20481"),
            "qualification": updated_user.get("qualification", "MBBS, MD (Medicine)"),
            "experience_years": updated_user.get("experience_years", 8),
            "chamber_room": updated_user.get("chamber_room", "Room #03 - Doctor Chamber"),
            "opd_days": updated_user.get("opd_days", ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]),
            "shift_morning": updated_user.get("shift_morning", "09:00 AM - 01:00 PM"),
            "shift_evening": updated_user.get("shift_evening", "04:00 PM - 07:00 PM"),
            "max_tokens_per_shift": updated_user.get("max_tokens_per_shift", 40),
            "availability_status": updated_user.get("availability_status", "available"),
            "emergency_alerts_enabled": updated_user.get("emergency_alerts_enabled", True),
            "auto_prescription_validity_days": updated_user.get("auto_prescription_validity_days", 5),
        }
    }


@router.post("/change-password")
async def change_password(payload: PasswordChange, current_user: dict = Depends(get_current_user)):
    user = await users_collection.find_one({"email": current_user["email"]})
    if not user:
        user = await doctors_collection.find_one({"email": current_user["email"]})

    if not user or not verify_password(payload.current_password, user.get("password", "")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password entered is incorrect",
        )

    if len(payload.new_password) < 6:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be at least 6 characters long",
        )

    hashed = get_password_hash(payload.new_password)
    await users_collection.update_many({"email": current_user["email"]}, {"$set": {"password": hashed}})
    await doctors_collection.update_many({"email": current_user["email"]}, {"$set": {"password": hashed}})

    return {"message": "Password changed successfully"}

