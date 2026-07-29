"""
Run from backend/ with venv active:
    python seed_problems.py
Safe to re-run - skips any problem ID that already exists.

Note: as of this version, the backend also seeds automatically on every
app startup (see app/main.py), so this script is now just a convenience
for local use - not required.
"""
from app.database import SessionLocal, engine, Base
from app.seed_data import seed_problems, PROBLEMS

Base.metadata.create_all(bind=engine)
db = SessionLocal()
seed_problems(db)
db.close()
print(f"Done. {len(PROBLEMS)} problems checked/seeded.")