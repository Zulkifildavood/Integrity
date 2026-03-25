from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class AMGoalSubmit(BaseModel):
    goals: List[str]

class PMReflectionSubmit(BaseModel):
    reflection: str

class DailyLogResponse(BaseModel):
    id: int
    user_id: int
    date: str
    am_goals: Optional[str] = None
    pm_reflection: Optional[str] = None
    status: str
    integrity_score: Optional[int] = None
    aim_alignment_score: Optional[int] = None
    ai_verdict: Optional[str] = None
    ai_issues: Optional[str] = None

    class Config:
        from_attributes = True
