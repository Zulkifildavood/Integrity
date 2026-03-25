from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from db import models
from schemas import aim as aim_schema
from api import deps

router = APIRouter()

@router.post("/", response_model=aim_schema.AimResponse)
def create_aim(aim_in: aim_schema.AimCreate, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    # Deactivate existing aims
    db.query(models.Aim).filter(models.Aim.user_id == current_user.id).update({"active": False})
    
    new_aim = models.Aim(
        user_id=current_user.id,
        primary_aim=aim_in.primary_aim,
        description=aim_in.description,
        active=True
    )
    db.add(new_aim)
    db.commit()
    db.refresh(new_aim)
    return new_aim

@router.get("/", response_model=List[aim_schema.AimResponse])
def get_aims(db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    aims = db.query(models.Aim).filter(models.Aim.user_id == current_user.id).all()
    return aims
