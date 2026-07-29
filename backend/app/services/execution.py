import subprocess
import sys
import json
import tempfile
import os

SANDBOX_RUNNER = os.path.join(os.path.dirname(__file__), "sandbox_runner.py")
TIMEOUT_SECONDS = 5


class ExecutionError(Exception):
    pass


def run_traced(code: str, function_name: str, call_args) -> dict:
    with tempfile.NamedTemporaryFile(mode="w", suffix=".py", delete=False) as f:
        f.write(code)
        temp_path = f.name

    try:
        proc = subprocess.run(
            [sys.executable, SANDBOX_RUNNER, temp_path, function_name, json.dumps(call_args)],
            capture_output=True,
            text=True,
            timeout=TIMEOUT_SECONDS,
        )
    except subprocess.TimeoutExpired:
        raise ExecutionError(f"Execution timed out after {TIMEOUT_SECONDS}s — check for infinite loops.")
    finally:
        os.unlink(temp_path)

    if not proc.stdout.strip():
        raise ExecutionError(f"Sandbox produced no output. stderr: {proc.stderr[-500:]}")

    try:
        return json.loads(proc.stdout.strip().splitlines()[-1])
    except (json.JSONDecodeError, IndexError):
        raise ExecutionError(f"Could not parse sandbox output: {proc.stdout[-300:]} | {proc.stderr[-300:]}")