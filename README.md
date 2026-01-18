# Failure Injection AI (Chaos Engineering++)

## Overview
Failure Injection AI is an intelligent chaos engineering system designed to expose hidden resilience weaknesses in microservice architectures. Unlike random chaos monkeys, this system observes real-time traffic, builds a dependency model, and uses a reinforcement learning (Multi-Armed Bandit) approach to decide **where**, **when**, and **how** to inject failures to maximize learning while minimizing blast radius.

## Architecture
The system consists of three main layers:
1.  **Target System**: A demo microservices environment (Gateway, Auth, Business Logic) instrumented with OpenTelemetry.
2.  **Chaos Controller (The Brain)**: An AI agent that ingests observability data, updates its internal graph model, and issues injection commands.
3.  **Infrastructure**: Prometheus (metrics), Jaeger (traces), and Redis (state).

## Key Features
-   **Smart Failure Selection**: Uses Multi-Armed Bandit algorithms to prioritize untested or fragile paths.
-   **Safety Guardrails**: strict blast radius limits and automated kill switches.
-   **Real-time Learning**: Continuous feedback loop from observability data to the AI agent.

## Getting Started

### Prerequisites
-   Docker & Docker Compose
-   Go 1.21+ (for services)
-   Python 3.10+ (for AI controller)

### Running the Demo
```bash
docker-compose up --build
```

Access the dashboard at `http://localhost:8080` (Gateway) and the properties of the system via the Chaos Controller logs.
