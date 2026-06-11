from fastapi import APIRouter, HTTPException
from app.models import UserCreate, UserLogin, Token
from app.auth import get_password_hash, verify_password, create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES
from app.database import get_db
from datetime import timedelta, datetime
import uuid

router = APIRouter()

@router.post("/register")
async def register(user: UserCreate):
    db = get_db()
    existing_user = await db.users.find_one({"rollNumber": user.rollNumber})
    if existing_user:
        raise HTTPException(status_code=400, detail="Roll number already registered")
    
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict["password"] = hashed_password
    user_dict["_id"] = str(uuid.uuid4())
    user_dict["createdAt"] = str(datetime.utcnow())
    
    await db.users.insert_one(user_dict)
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.rollNumber}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {"name": user.name, "rollNumber": user.rollNumber}}

@router.post("/login")
async def login(user: UserLogin):
    db = get_db()
    db_user = await db.users.find_one({"rollNumber": user.rollNumber})
    if not db_user or not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Incorrect roll number or password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.rollNumber}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer", "user": {"name": db_user["name"], "rollNumber": db_user["rollNumber"]}}
