"""
Lightweight in-memory rate limiter. Good enough for a single-process local
pilot; resets on server restart and won't work correctly across multiple
worker processes. If this ever runs behind multiple uvicorn workers or in
production, swap this for a Redis-backed limiter instead.
"""
import time
from collections import defaultdict

_calls: dict[tuple[str, str], list[float]] = defaultdict(list)


class RateLimitError(Exception):
    pass


def check_rate_limit(student_id: str, bucket: str, max_calls: int, window_seconds: int) -> None:
    key = (student_id, bucket)
    now = time.time()
    cutoff = now - window_seconds

    # Prune old timestamps outside the window
    _calls[key] = [t for t in _calls[key] if t > cutoff]

    if len(_calls[key]) >= max_calls:
        raise RateLimitError(
            f"You're sending requests quickly — take a moment to think it through, then try again shortly."
        )

    _calls[key].append(now)