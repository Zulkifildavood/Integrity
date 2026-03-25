from datetime import datetime, timezone
from typing import Tuple

def get_current_time_utc() -> datetime:
    return datetime.now(timezone.utc)

def evaluate_window_status(am_start: str, pm_start: str) -> Tuple[str, int]:
    """
    Evaluates current server time against user's scheduled windows.
    Returns (status, time_remaining_seconds)
    Status can be "LOCKED", "OPEN_AM", "OPEN_PM"
    """
    now = get_current_time_utc()
    
    am_h, am_m = map(int, am_start.split(":"))
    pm_h, pm_m = map(int, pm_start.split(":"))
    
    now_minutes = now.hour * 60 + now.minute
    now_seconds = now.hour * 3600 + now.minute * 60 + now.second
    am_minutes = am_h * 60 + am_m
    pm_minutes = pm_h * 60 + pm_m
    
    # 5 minute window
    window_duration = 5
    
    if am_minutes <= now_minutes < (am_minutes + window_duration):
        remaining = (am_minutes + window_duration) * 60 - now_seconds
        return "OPEN_AM", remaining
        
    if pm_minutes <= now_minutes < (pm_minutes + window_duration):
        remaining = (pm_minutes + window_duration) * 60 - now_seconds
        return "OPEN_PM", remaining
        
    # If locked, calculate time to next window
    if now_minutes < am_minutes:
        remaining = am_minutes * 60 - now_seconds
    elif now_minutes < pm_minutes:
        remaining = pm_minutes * 60 - now_seconds
    else:
        remaining = (24 * 3600 - now_seconds) + (am_minutes * 60)
        
    return "LOCKED", remaining
