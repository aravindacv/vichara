"""
Password hashing - stdlib-only PBKDF2, avoids needing a compiled
dependency like bcrypt (which can be finicky to install on Windows).
Good enough for a small instructor pool; not a concern at this scale.
"""
import hashlib
import os
import base64

ITERATIONS = 100_000


def hash_password(password: str) -> str:
    salt = os.urandom(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return base64.b64encode(salt).decode() + "$" + base64.b64encode(digest).decode()


def verify_password(password: str, stored: str) -> bool:
    try:
        salt_b64, digest_b64 = stored.split("$")
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(digest_b64)
    except (ValueError, Exception):
        return False
    actual = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return actual == expected