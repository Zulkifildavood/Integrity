from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Store windows as simple times, e.g., "08:00" and "20:00"
    am_window_start = Column(String, default="08:00")
    pm_window_start = Column(String, default="20:00")
    timezone = Column(String, default="UTC")
    
    is_locking_enabled = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    aims = relationship("Aim", back_populates="user")
    daily_logs = relationship("DailyLog", back_populates="user")
    streak = relationship("Streak", back_populates="user", uselist=False)

class Aim(Base):
    __tablename__ = "aims"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    primary_aim = Column(Text, nullable=False)
    description = Column(Text, nullable=True)
    active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="aims")

class DailyLog(Base):
    __tablename__ = "daily_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(String, nullable=False) # e.g., "2024-05-10"
    
    am_goals = Column(Text, nullable=True) # Stored as JSON string
    pm_reflection = Column(Text, nullable=True)
    
    am_completed_at = Column(DateTime(timezone=True), nullable=True)
    pm_completed_at = Column(DateTime(timezone=True), nullable=True)
    
    status = Column(String, default="PENDING") # PENDING, PASS, EXPAND, FAIL
    
    integrity_score = Column(Integer, nullable=True) # 0-100
    aim_alignment_score = Column(Integer, nullable=True) # 0-100
    ai_verdict = Column(String, nullable=True)
    ai_issues = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="daily_logs")

class Streak(Base):
    __tablename__ = "streaks"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True)
    current_streak = Column(Integer, default=0)
    longest_streak = Column(Integer, default=0)
    emergency_saves_available = Column(Integer, default=1)
    
    user = relationship("User", back_populates="streak")

class Gap(Base):
    __tablename__ = "gaps"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    start_date = Column(String, nullable=False)
    end_date = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
