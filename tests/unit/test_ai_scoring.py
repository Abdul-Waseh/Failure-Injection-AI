import pytest
import sys
import os

# Add chaos-controller to path so we can import 'ai_agent'
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '../../chaos-controller')))

from ai_agent import ChaosAI

@pytest.fixture
def ai():
    # Mock services and failures
    services = [{"name": "auth"}, {"name": "gateway"}]
    failures = [{"type": "latency"}]
    return ChaosAI(services, failures)

def test_learning_update_success(ai):
    # Action (0, 0)
    action = (0, 0)
    ai.update_knowledge(action, reward=10.0)
    assert ai.q_table[action] == 10.0
    
    # Second update
    ai.update_knowledge(action, reward=0.0)
    # Average of 10 and 0 is 5
    assert ai.q_table[action] == 5.0

def test_target_selection_greedy(ai):
    # Set Q-values
    ai.q_table[(0, 0)] = 50.0 # Auth
    ai.q_table[(1, 0)] = 20.0 # Gateway
    
    # Force exploitation
    ai.epsilon = 0.0
    
    s_idx, f_idx, exploit = ai.select_action()
    assert s_idx == 0 # Should pick Auth (max Q)
    assert exploit is True

def test_confidence_decay(ai):
    action = (0, 0)
    ai.q_table[action] = 100.0
    ai.decay_confidence()
    assert ai.q_table[action] < 100.0
    assert ai.q_table[action] == 95.0
