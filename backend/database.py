import os
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("DB_NAME", "swasthyaq")

client = AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]

patients_collection = db["patients"]
appointments_collection = db["appointments"]
doctors_collection = db["doctors"]
users_collection = db["users"]
prescriptions_collection = db["prescriptions"]
referrals_collection = db["referrals"]
followups_collection = db["followups"]
district_stats_collection = db["district_stats"]

