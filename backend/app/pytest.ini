import pytest
from app.services import flowchart


def test_build_flowchart_simple_sequence():
    code = """
def foo(n):
    x = 1
    return x
"""
    tree = flowchart.build_flowchart(code, "foo")
    assert tree["type"] == "sequence"
    assert len(tree["children"]) == 2
    assert tree["children"][0]["type"] == "stmt"
    assert tree["children"][1]["type"] == "return"


def test_build_flowchart_detects_if_else():
    code = """
def foo(n):
    if n > 0:
        return 1
    else:
        return -1
"""
    tree = flowchart.build_flowchart(code, "foo")
    if_node = tree["children"][0]
    assert if_node["type"] == "if"
    assert if_node["then"] is not None
    assert if_node["else"] is not None


def test_build_flowchart_detects_while_loop():
    code = """
def foo(arr):
    i = 0
    while i < len(arr):
        i += 1
    return i
"""
    tree = flowchart.build_flowchart(code, "foo")
    loop_node = tree["children"][1]
    assert loop_node["type"] == "while"


def test_build_flowchart_detects_for_loop():
    code = """
def foo(arr):
    total = 0
    for x in arr:
        total += x
    return total
"""
    tree = flowchart.build_flowchart(code, "foo")
    loop_node = tree["children"][1]
    assert loop_node["type"] == "for"


def test_build_flowchart_missing_function_raises():
    with pytest.raises(flowchart.FlowchartError):
        flowchart.build_flowchart("def bar(): pass", "foo")


def test_build_flowchart_syntax_error_raises():
    with pytest.raises(flowchart.FlowchartError):
        flowchart.build_flowchart("def foo(:\n  this is not valid python", "foo")