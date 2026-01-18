import time
import requests
import random
import json
import logging
from prometheus_api_client import PrometheusConnect
from safety import SafetyGuard
from ai_agent import ChaosAI

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

EXPERIMENT_DURATION = 15 # seconds

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

def get_reward(service_name):
    # In a real scenario, query Prometheus
    # prom = PrometheusConnect(url=PROMETHEUS_URL, disable_ssl=True)
    # For MVP/Demo, simulate a reward (High latency/Privacy errors = High impact)
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

def run_experiment(ai, safety):
    # 1. Decay Confidence (simulate forgetting)
    if random.random() < 0.1:
        ai.decay_confidence()

    # 2. Select Action
    s_idx, f_idx, is_exploitation = ai.select_action()
    target_svc = SERVICES[s_idx]
    failure = FAILURES[f_idx]
    
    logger.info(f"AI Proposal: Target={target_svc['name']}, Failure={failure['type']}/{failure['value']}, Exploit={is_exploitation}")
    
    # 3. Safety Checks
    # Check Blast Radius
    allowed, msg = safety.check_blast_radius(failure['rate'])
    if not allowed:
        logger.warning(f"Experiment BLOCKED: {msg}")
        # Penalize AI for unsafe proposal? Or just skip.
        # Let's slightly penalize to teach it safety constraints
        ai.update_knowledge((s_idx, f_idx), -1.0)
        return

    # Check Time Window
    allowed, msg = safety.check_time_window()
    if not allowed:
        logger.warning(f"Experiment PAUSED: {msg}")
        return

    # Check Error Budget (Simulation)
    # global_error_rate = get_global_error_rate() 
    global_error_rate = 0.01 # Mock
    allowed, msg = safety.check_error_budget(global_error_rate)
    if not allowed:
        logger.warning(f"Experiment BLOCKED: {msg}")
        return
    
    # 4. Inject
    logger.info("Safety Checks Passed. Injecting failure...")
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
    
    # 5. Wait & Observe
    logger.info(f"Waiting {EXPERIMENT_DURATION}s for measurement...")
    time.sleep(EXPERIMENT_DURATION)
    
    # 6. Measure Reward
    # If we broke the system in a meaningful way, that's a "Success" for Chaos Engineering
    reward = get_reward("gateway")
    logger.info(f"Observed System Impact (Reward): {reward:.2f}")
    
    # 7. Update AI
    ai.update_knowledge((s_idx, f_idx), reward)
    
    # 8. Reset
    reset_all()
    time.sleep(2) # Cooldown

if __name__ == "__main__":
    logger.info("Starting Failure Injection AI Controller (Enhanced)...")
    time.sleep(10) # Wait for system to settle
    
    # Initialize Modules
    prom_client = PrometheusConnect(url=PROMETHEUS_URL, disable_ssl=True)
    safety = SafetyGuard(prom_client)
    ai = ChaosAI(SERVICES, FAILURES)
    
    while True:
        try:
            run_experiment(ai, safety)
        except KeyboardInterrupt:
            reset_all()
            break
        except Exception as e:
            logger.error(f"Loop error: {e}")
            reset_all()
            time.sleep(5)
