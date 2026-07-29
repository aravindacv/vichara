"""
Sandbox runner - executed as a SEPARATE subprocess, never imported into the
FastAPI process. Loads student code, calls the target function with the
given input, and traces execution of that function line-by-line.

Tracks recursion: each invocation of the target function gets a unique
call_id (in call order) and a depth (0 = outermost). "call" and "return"
events are captured in addition to "line", so the frontend can reconstruct
a real call-stack view instead of a flat, ambiguous variable timeline.

SECURITY NOTE - read before this goes anywhere beyond a supervised local
classroom exercise:
This gives you a subprocess boundary, a wall-clock timeout, and a
restricted builtins set. It does NOT give you memory limits (Python's
resource module is Unix-only - this targets local Windows dev) or
filesystem/network isolation. Do not expose this to the open internet
without real container-based sandboxing (Docker + seccomp, gVisor, or a
hosted service like Piston/Judge0). Fine for local dev and a supervised
lab session - not fine beyond that.
"""
import sys
import json

SAFE_BUILTINS = {
    "range": range, "len": len, "int": int, "float": float,
    "str": str, "bool": bool, "list": list, "dict": dict, "set": set,
    "tuple": tuple, "min": min, "max": max, "sum": sum, "abs": abs,
    "sorted": sorted, "enumerate": enumerate, "zip": zip, "map": map,
    "filter": filter, "reversed": reversed, "isinstance": isinstance,
    "True": True, "False": False, "None": None, "ValueError": ValueError,
    "IndexError": IndexError, "TypeError": TypeError, "Exception": Exception,
}

MAX_EVENTS = 2000  # safety cap so a deep/runaway recursion can't blow up the payload


def _snapshot_value(v):
    if isinstance(v, (int, float, str, bool)) or v is None:
        return v
    if isinstance(v, list) and len(v) <= 200:
        return v
    return None  # unsupported type for display (e.g. custom objects) - omit rather than crash


def _snapshot_locals(locals_dict):
    snapshot = {}
    for k, v in locals_dict.items():
        val = _snapshot_value(v)
        if val is not None or v is None:
            snapshot[k] = val
    return snapshot


def make_tracer(events, target_function_name):
    call_stack = []          # frame ids currently active for the target function, in call order
    frame_call_ids = {}      # frame id -> assigned call_id
    call_counter = {"n": 0}

    def tracer(frame, event, arg):
        if frame.f_code.co_name != target_function_name:
            return tracer
        if len(events) >= MAX_EVENTS:
            return None  # stop tracing further - avoid runaway payloads on deep/infinite recursion

        frame_id = id(frame)

        if event == "call":
            call_counter["n"] += 1
            call_id = call_counter["n"]
            frame_call_ids[frame_id] = call_id
            call_stack.append(frame_id)
            depth = len(call_stack) - 1
            events.append({
                "event": "call",
                "depth": depth,
                "call_id": call_id,
                "line": frame.f_lineno,
                "locals": _snapshot_locals(frame.f_locals),
            })

        elif event == "line":
            call_id = frame_call_ids.get(frame_id)
            depth = call_stack.index(frame_id) if frame_id in call_stack else max(len(call_stack) - 1, 0)
            events.append({
                "event": "line",
                "depth": depth,
                "call_id": call_id,
                "line": frame.f_lineno,
                "locals": _snapshot_locals(frame.f_locals),
            })

        elif event == "return":
            call_id = frame_call_ids.get(frame_id)
            depth = call_stack.index(frame_id) if frame_id in call_stack else max(len(call_stack) - 1, 0)
            events.append({
                "event": "return",
                "depth": depth,
                "call_id": call_id,
                "line": frame.f_lineno,
                "locals": _snapshot_locals(frame.f_locals),
                "return_value": _snapshot_value(arg),
            })
            if frame_id in call_stack:
                call_stack.remove(frame_id)

        return tracer

    return tracer


def main():
    code_path, function_name, args_json = sys.argv[1], sys.argv[2], sys.argv[3]
    with open(code_path, "r") as f:
        source = f.read()

    call_args = json.loads(args_json)
    events = []
    output = {"success": False, "trace": [], "result": None, "error": None}

    module_globals = {"__builtins__": SAFE_BUILTINS}
    try:
        exec(compile(source, code_path, "exec"), module_globals)
    except Exception as e:
        output["error"] = f"Error in submitted code: {e}"
        print(json.dumps(output))
        return

    target_fn = module_globals.get(function_name)
    if not callable(target_fn):
        output["error"] = f"Function '{function_name}' not found in submitted code."
        print(json.dumps(output))
        return

    sys.settrace(make_tracer(events, function_name))
    try:
        if isinstance(call_args, dict):
            result = target_fn(**call_args)
        elif isinstance(call_args, list):
            result = target_fn(*call_args)
        else:
            result = target_fn(call_args)
        output["success"] = True
        output["result"] = result
    except RecursionError:
        output["error"] = "Maximum recursion depth exceeded - check your base case."
    except Exception as e:
        output["error"] = f"Runtime error: {e}"
    finally:
        sys.settrace(None)

    output["trace"] = events
    print(json.dumps(output))


if __name__ == "__main__":
    main()