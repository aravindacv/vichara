"""
Builds a structured flow diagram (like a Nassi-Shneiderman structogram)
from a student's function using Python's `ast` module. This is pure
parsing — no code execution — so it's safe to run directly in the
FastAPI process, no sandbox subprocess needed.

Output shape (recursive):
{
  "type": "sequence" | "if" | "while" | "for" | "stmt" | "return",
  "line": <source line number>,
  "label": "<human-readable label, e.g. the condition or statement text>",
  "children": [...]      # for "sequence"
  "then": {...}, "else": {...}   # for "if"
  "body": {...}                  # for "while" / "for"
}
"""
import ast


class FlowchartError(Exception):
    pass


def _label(node) -> str:
    try:
        return ast.unparse(node)
    except Exception:
        return "<expr>"


def _build_block(stmts) -> dict:
    children = [_build_node(s) for s in stmts]
    return {"type": "sequence", "children": children}


def _build_node(node) -> dict:
    line = getattr(node, "lineno", None)

    if isinstance(node, ast.If):
        return {
            "type": "if",
            "line": line,
            "label": _label(node.test),
            "then": _build_block(node.body),
            "else": _build_block(node.orelse) if node.orelse else None,
        }

    if isinstance(node, ast.While):
        return {
            "type": "while",
            "line": line,
            "label": _label(node.test),
            "body": _build_block(node.body),
        }

    if isinstance(node, ast.For):
        return {
            "type": "for",
            "line": line,
            "label": f"{_label(node.target)} in {_label(node.iter)}",
            "body": _build_block(node.body),
        }

    if isinstance(node, ast.Return):
        return {
            "type": "return",
            "line": line,
            "label": f"return {_label(node.value)}" if node.value else "return",
        }

    # Generic statement (assignment, expr, etc.)
    return {"type": "stmt", "line": line, "label": _label(node)}


def build_flowchart(code: str, function_name: str) -> dict:
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        raise FlowchartError(f"Could not parse code: {e}")

    for node in ast.walk(tree):
        if isinstance(node, ast.FunctionDef) and node.name == function_name:
            return _build_block(node.body)

    raise FlowchartError(f"Function '{function_name}' not found.")