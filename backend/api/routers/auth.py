from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from core import config, security
from db import models
from schemas import user as user_schema
from api import deps

router = APIRouter()

@router.post("/register", response_model=user_schema.UserResponse)
def register_user(user_in: user_schema.UserCreate, db: Session = Depends(deps.get_db)):
    user = db.query(models.User).filter(models.User.email == user_in.email).first()
    if user:
        raise HTTPException(
            status_code=400,
            detail="User with this email already exists"
        )
    user = models.User(
        email=user_in.email,
        hashed_password=security.get_password_hash(user_in.password),
        am_window_start=user_in.am_window_start,
        pm_window_start=user_in.pm_window_start,
        timezone=user_in.timezone
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    
    # Initialize streak
    streak = models.Streak(user_id=user.id)
    db.add(streak)
    db.commit()
    return user

@router.post("/login", response_model=user_schema.Token)
def login_access_token(db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()):
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not security.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect email or password")
    
    access_token_expires = timedelta(minutes=config.settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(user.email, expires_delta=access_token_expires),
        "token_type": "bearer",
    }

@router.get("/me", response_model=user_schema.UserResponse)
def read_users_me(current_user: models.User = Depends(deps.get_current_user)):
    return current_user
