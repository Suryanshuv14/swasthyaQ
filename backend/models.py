from datetime import datetime
from typing import List, Literal, Optional
from pydantic import BaseModel, EmailStr, Field

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    role: Optional[Literal["doctor", "health_worker", "district_admin"]] = None

class User(BaseModel):
    id: Optional[str] = None
    email: EmailStr
    name: str
    role: Literal["doctor", "health_worker", "district_admin"]
    facility_id: Optional[str] = None
    department: Optional[str] = "General Medicine"

# Backward compatibility alias
DoctorLogin = UserLogin
Doctor = User

class AppointmentCreate(BaseModel):
    patient_id: Optional[str] = None
    token_no: Optional[str] = None
    patient_name: str
    age: int = Field(ge=0, le=130)
    symptom_category: str
    symptoms: List[str] = []
    status: Literal["waiting", "in_consultation", "done"] = "waiting"
    waiting_since: Optional[datetime] = None
    source: Literal["ai_call", "manual", "patient_app"] = "manual"
    facility_id: Optional[str] = "PHC-NORTH-01"
    risk_level: Literal["low", "high"] = "low"
    needs_human_callback: bool = False

class AppointmentStatusUpdate(BaseModel):
    status: Literal["waiting", "in_consultation", "done"]

class Appointment(BaseModel):
    id: Optional[str] = None
    patient_id: Optional[str] = None
    token_no: str
    patient_name: str
    age: int
    symptom_category: str
    symptoms: List[str]
    status: str = "waiting"
    waiting_since: datetime
    source: str = "manual"
    facility_id: Optional[str] = "PHC-NORTH-01"
    risk_level: str = "low"
    needs_human_callback: bool = False

class Medicine(BaseModel):
    name: str
    dose: str
    duration: str

class PrescriptionCreate(BaseModel):
    appointment_id: str
    medicines: List[Medicine]
    notes: Optional[str] = ""

class Prescription(BaseModel):
    id: Optional[str] = None
    appointment_id: str
    doctor_email: str
    doctor_name: str
    medicines: List[Medicine]
    notes: Optional[str] = ""
    created_at: datetime

class FollowUpCreate(BaseModel):
    patient_id: str
    patient_name: str
    due_date: str
    assigned_to: Optional[str] = "Priya Sharma (ASHA)"
    notes: Optional[str] = ""
    facility_id: Optional[str] = "PHC-NORTH-01"

class FollowUp(BaseModel):
    id: Optional[str] = None
    patient_id: str
    patient_name: str
    due_date: str
    assigned_to: str
    notes: str
    facility_id: str
    status: str = "pending"

class ReferralCreate(BaseModel):
    patient_id: str
    patient_name: str
    from_facility: str = "PHC North 01"
    to_facility: str = "District Hospital East"
    reason: str
    status: str = "pending"

class Referral(BaseModel):
    id: Optional[str] = None
    patient_id: str
    patient_name: str
    from_facility: str
    to_facility: str
    reason: str
    status: str
    created_at: datetime


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    avatar_url: Optional[str] = None
    department: Optional[str] = None
    medical_reg_no: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    chamber_room: Optional[str] = None
    opd_days: Optional[List[str]] = None
    shift_morning: Optional[str] = None
    shift_evening: Optional[str] = None
    max_tokens_per_shift: Optional[int] = None
    availability_status: Optional[str] = None
    emergency_alerts_enabled: Optional[bool] = None
    auto_prescription_validity_days: Optional[int] = None


class PasswordChange(BaseModel):
    current_password: str
    new_password: str

