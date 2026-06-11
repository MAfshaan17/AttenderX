from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth_routes, attendance_routes

app = FastAPI(title="Smart Attendance API")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # For development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(attendance_routes.router, prefix="/api/attendance", tags=["Attendance"])

@app.get("/")
def root():
    return {"message": "Welcome to Smart Attendance API"}
