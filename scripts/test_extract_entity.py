"""
Simple tests for the scripts directory.
"""

def test_hello_world():
    """Basic hello world test to verify testing works."""
    assert "hello" == "hello"
    assert 1 + 1 == 2
    assert True is True


if __name__ == "__main__":
    print("Running basic tests...")
    test_hello_world()
    print("All tests passed!")