from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers.auth import router as auth_router
from routers.queue import router as queue_router
from routers.prescriptions import router as prescriptions_router
from routers.patients import router as patients_router
from routers.referrals import router as referrals_router
from routers.followups import router as followups_router
from routers.health_worker import router as health_worker_router
from routers.district import router as district_router

app = FastAPI(
    title="SwasthyaQ Backend API",
    description="API for SwasthyaQ Patient Queue and Doctor Workspace",
    version="1.0.0"
)

# CORS middleware enabling all origins for prototype development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth_router)
app.include_router(queue_router)
app.include_router(prescriptions_router)
app.include_router(patients_router)
app.include_router(referrals_router)
app.include_router(followups_router)
app.include_router(health_worker_router)
app.include_router(district_router)


@app.get("/")
async def root():
    return {"message": "SwasthyaQ Backend API is running"}
