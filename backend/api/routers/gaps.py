from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
from backend.db import models
from backend.api import deps

router = APIRouter()

# Stub for GAP feature
@router.post("/schedule")
def schedule_gap(start_date: str, end_date: str, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    # Check 7 days in advance
    # Check max 7 days per year
    new_gap = models.Gap(
        user_id=current_user.id,
        start_date=start_date,
        end_date=end_date
    )
    db.add(new_gap)
    db.commit()
    return {"message": "Gap scheduled"}
