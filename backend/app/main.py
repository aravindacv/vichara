from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

from app.database import engine, Base
from app.models import design, reflection, student, execution_log, instructor_feedback, session, instructor  # noqa: F401
from app.routers import design as design_router
from app.routers import execution as execution_router
from app.routers import tutor as tutor_router
from app.routers import reflection as reflection_router
from app.routers import auth as auth_router
from app.routers import instructor as instructor_router

load_dotenv()

app = FastAPI(title="Vichara Backend")

# FRONTEND_URL should be set in production (e.g. your Cloudflare Pages URL).
# Falls back to the local Vite dev server if not set.
allowed_origins = [o.strip() for o in os.getenv("FRONTEND_URL", "http://localhost:5173").split(",")]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

# Auto-seed the problem bank on every startup — idempotent (skips existing
# problems), so this works safely on every deploy/restart with zero manual
# steps. Needed because Render's free tier has no Shell access to run a
# seed script by hand.
from app.database import SessionLocal
from app.seed_data import seed_problems as _seed_problems
_db = SessionLocal()
try:
    _seed_problems(_db)
finally:
    _db.close()

app.include_router(design_router.router)
app.include_router(execution_router.router)
app.include_router(tutor_router.router)
app.include_router(reflection_router.router)
app.include_router(auth_router.router)
app.include_router(instructor_router.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "vichara-backend"}