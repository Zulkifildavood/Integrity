import json
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from db import models
from schemas import daily_log as log_schema
from api import deps
from services import time_lock, ai_engine

router = APIRouter()

@router.get("/sync-time")
def sync_time():
    """Returns the current server UTC time"""
    return {"server_time": time_lock.get_current_time_utc().isoformat()}

@router.get("/status")
def get_status(db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    """Returns the current state machine status for the user"""
    if not current_user.username:
        return {
            "status": "ONBOARDING",
            "time_remaining_seconds": 0,
            "is_burn": False
        }

    if not current_user.is_locking_enabled:
        return {
            "status": "SETUP",
            "time_remaining_seconds": 0,
            "is_burn": False
        }

    status, remaining = time_lock.evaluate_window_status(current_user.am_window_start, current_user.pm_window_start)
    
    # Check if they already completed today's log
    today_str = time_lock.get_current_time_utc().strftime("%Y-%m-%d")
    log = db.query(models.DailyLog).filter(
        models.DailyLog.user_id == current_user.id,
        models.DailyLog.date == today_str
    ).first()
    
    if log:
        if status == "OPEN_AM" and log.am_completed_at:
            status = "LOCKED"
            # next window is PM
            now = time_lock.get_current_time_utc()
            now_seconds = now.hour * 3600 + now.minute * 60 + now.second
            pm_h, pm_m = map(int, current_user.pm_window_start.split(":"))
            remaining = (pm_h * 60 + pm_m) * 60 - now_seconds
            if remaining < 0: 
                 remaining = (24 * 3600 - now_seconds) + (pm_h * 60 + pm_m) * 60
        elif status == "OPEN_PM" and log.pm_completed_at:
            status = "LOCKED"
            # next window is AM tomorrow
            now = time_lock.get_current_time_utc()
            now_seconds = now.hour * 3600 + now.minute * 60 + now.second
            am_h, am_m = map(int, current_user.am_window_start.split(":"))
            remaining = (24 * 3600 - now_seconds) + (am_h * 60 + am_m) * 60
            
    is_burn = False
    # If they missed a window? For MVP we just evaluate current status, Burn needs a daily cron or evaluated on login.
    
    return {
        "status": status,
        "time_remaining_seconds": remaining,
        "is_burn": is_burn
    }

@router.post("/enable-locking")
def enable_locking(db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    """Enables system locking natively, converting from SETUP to LOCKED/OPEN phase"""
    if current_user.is_locking_enabled:
        raise HTTPException(status_code=400, detail="Locking is already enabled.")
    
    now = time_lock.get_current_time_utc()
    current_user.is_locking_enabled = True
    current_user.locking_enabled_at = now
    db.commit()
    return {"message": "Locking enabled successfully"}

@router.post("/architect/submit", response_model=log_schema.DailyLogResponse)
def submit_am_goals(goals_in: log_schema.AMGoalSubmit, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    status_str, _ = time_lock.evaluate_window_status(current_user.am_window_start, current_user.pm_window_start)
    if status_str != "OPEN_AM":
         raise HTTPException(status_code=403, detail="Architect Window is closed.")
         
    today_str = time_lock.get_current_time_utc().strftime("%Y-%m-%d")
    log = db.query(models.DailyLog).filter(
        models.DailyLog.user_id == current_user.id,
        models.DailyLog.date == today_str
    ).first()
    
    if log and log.am_completed_at:
        raise HTTPException(status_code=400, detail="AM Goals already submitted for today.")
        
    primary_aim = db.query(models.Aim).filter(models.Aim.user_id == current_user.id, models.Aim.active == True).first()
    aim_text = primary_aim.primary_aim if primary_aim else "No primary aim set."
    
    # AI Validation
    ai_result = ai_engine.validate_am_goals(goals_in.goals, aim_text)
    
    if not log:
        log = models.DailyLog(user_id=current_user.id, date=today_str)
        db.add(log)
    
    log.am_goals = json.dumps(goals_in.goals)
    log.am_completed_at = time_lock.get_current_time_utc()
    log.status = ai_result.get("verdict", "FAIL")
    log.integrity_score = ai_result.get("integrity_score", 0)
    log.aim_alignment_score = ai_result.get("aim_alignment_score", 0)
    log.ai_verdict = ai_result.get("verdict", "FAIL")
    log.ai_issues = ai_result.get("issues", "")
    
    db.commit()
    db.refresh(log)
    return log

@router.post("/auditor/submit", response_model=log_schema.DailyLogResponse)
def submit_pm_reflection(reflection_in: log_schema.PMReflectionSubmit, db: Session = Depends(deps.get_db), current_user: models.User = Depends(deps.get_current_user)):
    status_str, _ = time_lock.evaluate_window_status(current_user.am_window_start, current_user.pm_window_start)
    if status_str != "OPEN_PM":
         raise HTTPException(status_code=403, detail="Auditor Window is closed.")
         
    today_str = time_lock.get_current_time_utc().strftime("%Y-%m-%d")
    log = db.query(models.DailyLog).filter(
        models.DailyLog.user_id == current_user.id,
        models.DailyLog.date == today_str
    ).first()
    
    if not log or not log.am_goals:
        # Grace period: if locking was enabled today (user set up system after AM window),
        # allow them to submit PM reflection without AM goals on day 1 only.
        today_str_check = time_lock.get_current_time_utc().strftime("%Y-%m-%d")
        locking_date = current_user.locking_enabled_at.strftime("%Y-%m-%d") if current_user.locking_enabled_at else None
        is_first_day = (locking_date == today_str_check)
        
        if not is_first_day:
            raise HTTPException(status_code=400, detail="No AM goals found for today. Complete your morning window first.")
        
        # First day grace: create a placeholder log so PM can be submitted
        if not log:
            log = models.DailyLog(user_id=current_user.id, date=today_str)
            db.add(log)
            db.flush()  # get the ID without committing
        
    if log.pm_completed_at:
        raise HTTPException(status_code=400, detail="PM Reflection already submitted for today.")
        
    primary_aim = db.query(models.Aim).filter(models.Aim.user_id == current_user.id, models.Aim.active == True).first()
    aim_text = primary_aim.primary_aim if primary_aim else "No primary aim set."
    
    am_goals = json.loads(log.am_goals)
    
    # AI Validation
    ai_result = ai_engine.validate_pm_reflection(reflection_in.reflection, am_goals, aim_text)
    
    log.pm_reflection = reflection_in.reflection
    log.pm_completed_at = time_lock.get_current_time_utc()
    log.status = ai_result.get("verdict", "FAIL")
    log.integrity_score = ai_result.get("integrity_score", 0)
    log.aim_alignment_score = ai_result.get("aim_alignment_score", 0)
    log.ai_verdict = ai_result.get("verdict", "FAIL")
    log.ai_issues = ai_result.get("issues", "")
    
    if log.status == "PASS":
        # Update streak
        streak = db.query(models.Streak).filter(models.Streak.user_id == current_user.id).first()
        if streak:
            streak.current_streak += 1
            if streak.current_streak > streak.longest_streak:
                streak.longest_streak = streak.current_streak
                
    db.commit()
    db.refresh(log)
    return log
