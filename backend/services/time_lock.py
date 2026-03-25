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
    current_time_str = now.strftime("%H:%M")
    
    # Simple evaluation logic for MVP (assuming daily recurrence and UTC timezone)
    
    am_h, am_m = map(int, am_start.split(":"))
    pm_h, pm_m = map(int, pm_start.split(":"))
    
    now_minutes = now.hour * 60 + now.minute
    am_minutes = am_h * 60 + am_m
    pm_minutes = pm_h * 60 + pm_m
    
    # 5 minute window
    window_duration = 5
    
    if am_minutes <= now_minutes < (am_minutes + window_duration):
        remaining = (am_minutes + window_duration) * 60 - (now.hour * 3600 + now.minute * 60 + now.second)
        return "OPEN_AM", remaining
        
    if pm_minutes <= now_minutes < (pm_minutes + window_duration):
        remaining = (pm_minutes + window_duration) * 60 - (now.hour * 3600 + now.minute * 60 + now.second)
        return "OPEN_PM", remaining
        
    return "LOCKED", 0
