import pytest
import sys
import os

# Add chaos-controller to path so we can import 'safety'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../chaos-controller')))

from safety import SafetyGuard

@pytest.fixture
def safety():
    return SafetyGuard()

def test_blast_radius_rejection(safety):
    # Limit is 0.50 (50%)
    allowed, msg = safety.check_blast_radius(0.60)
    assert not allowed
    assert "exceeds limit" in msg

def test_blast_radius_approval(safety):
    allowed, msg = safety.check_blast_radius(0.10)
    assert allowed

def test_maintenance_window_block(safety):
    # 2 PM (14:00) -> Allowed in Demo Mode but logs check
    allowed, msg = safety.check_time_window(14)
    assert allowed 
    assert "Outside Maintenance Window" in msg

def test_maintenance_window_allow(safety):
    # 2 AM
    allowed, msg = safety.check_time_window(2)
    assert allowed

def test_error_budget_enforcement(safety):
    # Limit is 0.05 (5%)
    allowed, msg = safety.check_error_budget(0.06)
    assert not allowed
    assert "budget exhausted" in msg
