import pytest
from app.services import rate_limit


def test_allows_calls_under_limit():
    for _ in range(3):
        rate_limit.check_rate_limit("studentX", "test_bucket_1", max_calls=5, window_seconds=60)
    # no exception raised means the test passes


def test_blocks_calls_over_limit():
    for _ in range(5):
        rate_limit.check_rate_limit("studentY", "test_bucket_2", max_calls=5, window_seconds=60)
    with pytest.raises(rate_limit.RateLimitError):
        rate_limit.check_rate_limit("studentY", "test_bucket_2", max_calls=5, window_seconds=60)


def test_different_buckets_are_independent():
    for _ in range(5):
        rate_limit.check_rate_limit("studentZ", "bucket_a", max_calls=5, window_seconds=60)
    # a different bucket for the same student should still be allowed
    rate_limit.check_rate_limit("studentZ", "bucket_b", max_calls=5, window_seconds=60)


def test_different_students_are_independent():
    for _ in range(5):
        rate_limit.check_rate_limit("student_one", "shared_bucket", max_calls=5, window_seconds=60)
    # a different student on the same bucket should still be allowed
    rate_limit.check_rate_limit("student_two", "shared_bucket", max_calls=5, window_seconds=60)