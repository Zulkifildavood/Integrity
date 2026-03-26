from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.config import settings
from db.session import engine
from db import models
from api.routers import auth, aims, windows, gaps

from sqlalchemy import text

# Create DB tables
models.Base.metadata.create_all(bind=engine)

# Quick migration for is_locking_enabled and username
with engine.begin() as conn:
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN is_locking_enabled BOOLEAN DEFAULT FALSE;"))
    except Exception:
        pass  # Column likely already exists
    try:
        conn.execute(text("ALTER TABLE users ADD COLUMN username VARCHAR UNIQUE;"))
    except Exception:
        pass

app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json"
)

# CORS
origins = [
    "http://localhost:3000",
    "https://integrity-tau.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(aims.router, prefix=f"{settings.API_V1_STR}/aims", tags=["aims"])
app.include_router(windows.router, prefix=f"{settings.API_V1_STR}/windows", tags=["windows"])
app.include_router(gaps.router, prefix=f"{settings.API_V1_STR}/gaps", tags=["gaps"])

@app.get("/")
def root():
    return {"message": "Welcome to Ritual Window API"}
