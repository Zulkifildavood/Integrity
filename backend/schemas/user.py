from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    am_window_start: Optional[str] = "08:00"
    pm_window_start: Optional[str] = "20:00"
    timezone: Optional[str] = "UTC"

class UserCreate(UserBase):
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    am_window_start: Optional[str] = None
    pm_window_start: Optional[str] = None
    timezone: Optional[str] = None

class UserResponse(UserBase):
    id: int
    username: Optional[str] = None
    is_locking_enabled: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
    
class TokenData(BaseModel):
    email: Optional[str] = None
