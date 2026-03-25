from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AimBase(BaseModel):
    primary_aim: str
    description: Optional[str] = None

class AimCreate(AimBase):
    pass

class AimResponse(AimBase):
    id: int
    user_id: int
    active: bool
    created_at: datetime

    class Config:
        from_attributes = True
