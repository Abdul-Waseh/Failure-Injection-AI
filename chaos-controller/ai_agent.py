import random
import logging

logger = logging.getLogger(__name__)

class ChaosAI:
    def __init__(self, services, failures):
        self.services = services
        self.failures = failures
        self.q_table = {} # Key: (ServiceIdx, FailureIdx) -> Value: EstimatedReward
        self.counts = {}  # Key: (ServiceIdx, FailureIdx) -> Value: Count
        self.epsilon = 0.3 # Exploration rate
        
    def select_action(self):
        """
        Selects the next experiment target using Epsilon-Greedy strategy.
        Returns: (service_index, failure_index, is_exploitation)
        """
        actions = []
        for s_idx in range(len(self.services)):
            for f_idx in range(len(self.failures)):
                actions.append((s_idx, f_idx))
                
        if random.random() < self.epsilon:
            choice = random.choice(actions)
            return choice[0], choice[1], False # Exploration
        else:
            # Exploitation: Pick max Q
            best_q = -float('inf')
            best_action = actions[0]
            for a in actions:
                q = self.q_table.get(a, 0.0)
                if q > best_q:
                    best_q = q
                    best_action = a
            return best_action[0], best_action[1], True # Exploitation

    def update_knowledge(self, action, reward):
        """
        Updates the Q-Table based on the observed reward.
        """
        s_idx, f_idx = action
        key = (s_idx, f_idx)
        
        current_q = self.q_table.get(key, 0.0)
        count = self.counts.get(key, 0)
        
        # Simple averaging update rule
        # NewEstimate = OldEstimate + StepSize * (Target - OldEstimate)
        # Here we use 1/N as step size for true average
        new_q = (current_q * count + reward) / (count + 1)
        
        self.q_table[key] = new_q
        self.counts[key] = count + 1
        
        logger.info(f"AI Update: Action={self.services[s_idx]['name']}:{self.failures[f_idx]['type']} | Reward={reward:.2f} | NewQ={new_q:.2f}")

    def decay_confidence(self):
        """
        Slowly forgets old knowledge to encourage re-testing.
        """
        for k in self.q_table:
            self.q_table[k] *= 0.95
        logger.info("AI Confidence Decayed (forgetting factor applied).")
