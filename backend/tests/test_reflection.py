import pytest
from app.services import reflection


def test_reflection_rejects_short_text(db):
    with pytest.raises(reflection.ReflectionValidationError):
        reflection.submit_reflection(db, "student1", "p1", "too short")


def test_reflection_accepts_real_text(db):
    entry = reflection.submit_reflection(
        db, "student1", "p1", "I finally understood why the loop invariant matters here."
    )
    assert entry.content.startswith("I finally")


def test_reflection_strips_whitespace(db):
    entry = reflection.submit_reflection(
        db, "student1", "p1", "   plenty of real content here to pass validation   "
    )
    assert not entry.content.startswith(" ")
    assert not entry.content.endswith(" ")


def test_get_latest_reflection_returns_most_recent(db):
    reflection.submit_reflection(db, "student1", "p2", "first reflection long enough to pass validation")
    reflection.submit_reflection(db, "student1", "p2", "second reflection also long enough to pass")
    latest = reflection.get_latest_reflection(db, "student1", "p2")
    assert latest.content.startswith("second")


def test_get_latest_reflection_returns_none_when_nothing_submitted(db):
    assert reflection.get_latest_reflection(db, "student1", "no_such_problem") is None