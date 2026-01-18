import time
import requests
import random
import json
import logging
from prometheus_api_client import PrometheusConnect

# Configuration
PROMETHEUS_URL = "http://prometheus:9090"
SERVICES = [
    {"name": "gateway", "url": "http://gateway:8080"},
    {"name": "auth", "url": "http://auth:8081"},
    {"name": "business", "url": "http://business:8082"},
]

FAILURES = [
    {"type": "latency", "value": 100, "rate": 1.0}, # 100ms latency, always
    {"type": "latency", "value": 500, "rate": 0.5}, # 500ms latency, 50% chance
    {"type": "error", "value": 500, "rate": 0.1},   # 500 error, 10% chance
    {"type": "cpu", "value": 500, "rate": 1.0},     # CPU burn 500ms
]

# State
q_table = {} # Key: (ServiceName, FailureIndex) -> Value: EstimatedReward
counts = {}  # Key: (ServiceName, FailureIndex) -> Value: Count

EPSILON = 0.3 # Exploration rate
EXPERIMENT_DURATION = 15 # seconds

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_reward(service_name):
    # Query Prometheus for request duration (p99) specifically for this service
    # query = f'histogram_quantile(0.99, sum(rate(http_server_duration_bucket{{job="{service_name}"}}[1m])) by (le))'
    # Simplified: request count or error count logic
    # For now, let's just use latency from "http_server_duration_milliseconds" if available, 
    # OR since we have custom OTel metrics, let's look for "http_server_duration_bucket"
    
    # Actually, simpler: Measure direct impact.
    # We want to see if we BROKE it.
    # Reward = Error Rate + Latency/100
    
    prom = PrometheusConnect(url=PROMETHEUS_URL, disable_ssl=True)
    
    # 1. Error Rate
    # rate(http_requests_total{status_code=~"5.."}[1m])
    # Note: OTel metrics might be named differently. Usually 'http_server_request_duration_seconds_count' with attributes.
    # Let's assume standard names for now, we might need to debug this.
    
    # Fake reward for MVP without waiting for live prom data in first pass:
    return random.random() * 10 

def reset_all():
    logger.info("Resetting all injections...")
    for svc in SERVICES:
        try:
            requests.post(f"{svc['url']}/chaos/config", json={
                "type": "none", "rate": 0, "value": 0, "active": False
            }, timeout=2)
        except Exception as e:
            logger.error(f"Failed to reset {svc['name']}: {e}")

def run_experiment():
    # 1. Select Action (Epsilon Greedy)
    # Action space = Services x Failures
    actions = []
    for s_idx, svc in enumerate(SERVICES):
        for f_idx, fail in enumerate(FAILURES):
            actions.append((s_idx, f_idx))
            
    if random.random() < EPSILON:
        choice = random.choice(actions)
        is_exploitation = False
    else:
        # Greedily pick max Q
        best_q = -1.0
        best_action = actions[0]
        for a in actions:
            q = q_table.get(a, 0.0)
            if q > best_q:
                best_q = q
                best_action = a
        choice = best_action
        is_exploitation = True
        
    svc_idx, fail_idx = choice
    target_svc = SERVICES[svc_idx]
    failure = FAILURES[fail_idx]
    
    logger.info(f"Generated Action: Target={target_svc['name']}, Failure={failure['type']}/{failure['value']}, Exploit={is_exploitation}")
    
    # 2. Inject
    payload = {
        "type": failure["type"],
        "rate": failure["rate"],
        "value": failure["value"],
        "active": True
    }
    try:
        requests.post(f"{target_svc['url']}/chaos/config", json=payload, timeout=2)
    except Exception as e:
        logger.error(f"Injection failed: {e}")
        return

    # 3. Wait
    logger.info(f"Waiting {EXPERIMENT_DURATION}s for measurement...")
    time.sleep(EXPERIMENT_DURATION)
    
    # 4. Measure Reward
    # In a real system, we measure SYSTEM WIDE impact (e.g. Gateway latency) not just local component.
    # If we inject Auth, and Gateway gets slow, that's a high reward (cascade found).
    gateway_reward = get_reward("gateway")
    logger.info(f"Observed System Impact (Reward): {gateway_reward}")
    
    # 5. Update Q-Table
    # Simple averaging
    current_q = q_table.get(choice, 0.0)
    count = counts.get(choice, 0)
    
    new_q = (current_q * count + gateway_reward) / (count + 1)
    q_table[choice] = new_q
    counts[choice] = count + 1
    
    logger.info(f"Updated Q-Value for {target_svc['name']}-{failure['type']}: {new_q:.2f}")

    # 6. Safety Reset
    reset_all()
    time.sleep(5) # Cooldown

if __name__ == "__main__":
    logger.info("Starting Failure Injection AI Controller...")
    time.sleep(10) # Wait for system to settle
    
    while True:
        try:
            run_experiment()
        except KeyboardInterrupt:
            reset_all()
            break
        except Exception as e:
            logger.error(f"Loop error: {e}")
            reset_all()
            time.sleep(5)
