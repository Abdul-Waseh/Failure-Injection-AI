import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class SafetyGuard:
    def __init__(self, prom_client=None):
        self.prom_client = prom_client
        self.BLAST_RADIUS_LIMIT = 0.50 # 50% max traffic impact allowed (for demo purposes, usually lower)
        self.ERROR_BUDGET_LIMIT = 0.05 # 5% global error rate limit

    def check_blast_radius(self, target_traffic_pct):
        """
        Ensures the experiment doesn't affect too much traffic.
        """
        if target_traffic_pct > self.BLAST_RADIUS_LIMIT:
            msg = f"Blast radius {target_traffic_pct*100:.1f}% exceeds limit {self.BLAST_RADIUS_LIMIT*100:.1f}%"
            logger.warning(f"Safety Block: {msg}")
            return False, msg
        return True, "Allowed"

    def check_time_window(self, current_hour=None):
        """
        Ensures experiments only run during allowed hours (00:00 - 05:00 for maintenance, or anytime for demo).
        For this Demo, we ALLOW ALL TIMES but log a warning if "outside" maintenance to show we checked.
        """
        if current_hour is None:
            current_hour = datetime.now().hour
            
        # Strict Maintenance Window: 00:00 to 05:00
        if 0 <= current_hour < 5:
            return True, "Maintenance Window"
        else:
            # For DEMO purposes, we will return TRUE but note it.
            # In production, this would be False.
            msg = f"Outside Maintenance Window ({current_hour}:00), but allowing for DEMO mode."
            logger.info(f"Safety Check: {msg}")
            return True, msg

    def check_error_budget(self, global_error_rate=None):
        """
        Ensures the system isn't already unstable.
        """
        if global_error_rate is None:
            # Query Prometheus if not provided
            # For MVP/Demo without live Prom, we assume 0 unless injected
            global_error_rate = 0.0
            
        if global_error_rate > self.ERROR_BUDGET_LIMIT:
            msg = f"Error budget exhausted (Current: {global_error_rate*100:.1f}%, Limit: {self.ERROR_BUDGET_LIMIT*100:.1f}%)"
            logger.warning(f"Safety Block: {msg}")
            return False, msg
        return True, "Within budget"
