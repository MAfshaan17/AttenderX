from pydantic import BaseModel, EmailStr
from typing import Optional

class UserCreate(BaseModel):
    name: str
    rollNumber: str
    department: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    rollNumber: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str
