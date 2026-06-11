from fastapi import APIRouter, HTTPException, UploadFile, File, Form
from app.database import get_db
from app.ai.blink_detector import process_frame_for_blink
from datetime import datetime, timedelta
import cv2
import numpy as np
import base64

router = APIRouter()

@router.post("/verify-frame")
async def verify_frame(
    image: str = Form(...), # Base64 encoded image
):
    try:
        # Decode base64 image
        encoded_data = image.split(',')[1] if ',' in image else image
        nparr = np.frombuffer(base64.b64decode(encoded_data), np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        # Process for blink
        result = process_frame_for_blink(img)
        if result is None:
            return {"detected": False, "ear": 0, "message": "No face detected"}
            
        return {"detected": True, "ear": result["ear"], "face_box": result["face_box"]}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image processing failed: {str(e)}")

@router.post("/mark")
async def mark_attendance(
    rollNumber: str = Form(...),
    session: str = Form(...)
):
    db = get_db()
    user = await db.users.find_one({"rollNumber": rollNumber})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    # Check if already marked for this session today
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    
    existing_record = await db.attendance.find_one({
        "rollNumber": rollNumber,
        "date": today_str,
        "session": session
    })
    
    if existing_record:
        return {"success": False, "message": "Attendance already marked for this session today"}
    
    attendance_record = {
        "userId": str(user["_id"]),
        "rollNumber": rollNumber,
        "name": user["name"],
        "date": today_str,
        "time": now.strftime("%H:%M:%S"),
        "status": "Present",
        "session": session
    }
    
    await db.attendance.insert_one(attendance_record)
    
    return {
        "success": True,
        "message": "Attendance marked successfully",
        "record": attendance_record
    }

@router.get("/all")
async def get_all_attendance():
    db = get_db()
    records = await db.attendance.find().to_list(1000)
    for r in records:
        r["_id"] = str(r["_id"])
    return records

@router.get("/stats")
async def get_attendance_stats():
    db = get_db()
    
    now = datetime.now()
    today_str = now.strftime("%Y-%m-%d")
    
    today_records = await db.attendance.count_documents({"date": today_str})
    
    pipeline = [
        {"$group": {"_id": "$session", "count": {"$sum": 1}}}
    ]
    session_data = await db.attendance.aggregate(pipeline).to_list(None)
    session_dist = {item["_id"]: item["count"] for item in session_data}
    
    weekly_trends = {}
    for i in range(6, -1, -1):
        d = (now - timedelta(days=i)).strftime("%Y-%m-%d")
        count = await db.attendance.count_documents({"date": d})
        weekly_trends[d] = count
        
    return {
        "todayScans": today_records,
        "sessionDistribution": session_dist,
        "weeklyTrends": weekly_trends
    }
