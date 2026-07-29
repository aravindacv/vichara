from datetime import datetime, timedelta, timezone
from app.services import auth
from app.models.session import Session


def test_login_creates_student_and_token(db):
    student, token = auth.login(db, "A001", "Test One")
    assert student.roll_number == "A001"
    assert isinstance(token, str) and len(token) > 20


def test_login_reuses_existing_student(db):
    student1, _ = auth.login(db, "A001", "Test One")
    student2, token2 = auth.login(db, "A001", "Test One Updated")
    assert student1.roll_number == student2.roll_number
    assert student2.name == "Test One Updated"


def test_login_rejects_empty_roll_number(db):
    import pytest
    with pytest.raises(auth.AuthError):
        auth.login(db, "", "Someone")


def test_validate_session_returns_correct_student(db):
    student, token = auth.login(db, "A002", "Someone")
    validated = auth.validate_session(db, token)
    assert validated.roll_number == "A002"


def test_validate_session_rejects_bad_token(db):
    assert auth.validate_session(db, "not-a-real-token") is None


def test_validate_session_rejects_empty_token(db):
    assert auth.validate_session(db, "") is None


def test_validate_session_rejects_expired_token(db):
    student, token = auth.login(db, "A003", "Expired Person")
    sess = db.query(Session).filter(Session.token == token).first()
    sess.expires_at = datetime.now(timezone.utc) - timedelta(days=1)
    db.commit()
    assert auth.validate_session(db, token) is None


def test_logout_removes_session(db):
    student, token = auth.login(db, "A004", "Logout Person")
    auth.logout(db, token)
    assert auth.validate_session(db, token) is None


def test_different_students_get_different_tokens(db):
    _, token1 = auth.login(db, "A005", "Person One")
    _, token2 = auth.login(db, "A006", "Person Two")
    assert token1 != token2