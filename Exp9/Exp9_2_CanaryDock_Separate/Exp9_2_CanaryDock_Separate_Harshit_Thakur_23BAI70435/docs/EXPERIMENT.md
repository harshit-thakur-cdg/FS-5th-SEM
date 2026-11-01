# Experiment 9.2 — Continuous Deployment and Automated Release Strategies
**Name:** Harshit Thakur  
**UID:** 23BAI70435  
**Course:** Full Stack II  
**CO mapped:** CO6 – BT6

## Aim
To design and implement a Continuous Deployment pipeline with containerization and automated release strategies.

## Objectives
- Understand Continuous Deployment.
- Containerize a Java application with Docker.
- Automate verification, image publication, and deployment with GitHub Actions.
- Implement a canary strategy with health gates and rollback.

## Prerequisites and software
CI fundamentals, Docker basics, release concepts; JDK 17+, Docker, GitHub, Docker Hub. The real deployment host also needs Linux, Bash, Python 3, and a self-hosted GitHub runner. Maven Wrapper is provided. The separately launched frontend requires Node.js 18+; it has no npm dependencies.

## Theory
Continuous Integration verifies changes frequently. Continuous Delivery keeps verified changes ready for release, often with an approval step. Continuous Deployment automatically releases verified changes to the deployment environment. A Docker image packages the application and runtime. A container is a running instance of that image.

Canary deployment introduces a candidate to a small portion of traffic while the stable release continues to serve the remainder. A health gate evaluates the candidate before exposure increases. Failure restores the stable route. This project uses request-based weighted routing, not persistent user cohorts.

## Application design
The frontend Node server serves the responsive dashboard on port 3000 and proxies API calls to the separate Spring Boot backend on port 8080. For production CD, the root Dockerfile assembles both sources into one versioned release image. The classroom lab uses a synchronized service to record simulated state transitions. This makes the strategy observable without granting browser users access to Docker. The real deployment is performed separately by a host-side script, invoked by GitHub Actions.

Docker builds the project in a Maven stage, then copies its JAR into a smaller Java runtime stage. The application runs as a non-root user. Nginx routes requests between blue and green slots. Slot names identify infrastructure positions; the candidate role alternates each release.

## Procedure
1. Start the backend from backend/ and the frontend from frontend/ in separate terminals.
2. Exercise a healthy classroom rollout and a failed candidate.
3. Build and run the Docker image; inspect its health.
4. Publish a baseline image to Docker Hub.
5. Bootstrap the Linux deployment host with the stable image.
6. Publish a changed candidate image and run the real canary script.
7. Observe 10%, 50%, and 100% routing and inspect the probe JSON.
8. Configure repository secrets, a dedicated deployment runner, and the ENABLE_CD variable.
9. Push a new change to main and observe verification, publication, and automatic deployment.
10. Record an automatic rollback and successful promotion using your own execution evidence.

Local commands are in README.md; production CD commands are in docs/DEPLOYMENT.md.

## Expected observations — not pre-recorded results
| Scenario | Expected behavior |
|---|---|
| Local healthy lab | Stable version changes only after both health-gated stages pass. |
| Injected lab failure | Candidate traffic becomes zero and rollback is recorded. |
| Docker image | Application container reaches healthy state. |
| Real canary | Gateway responses come from both slots at intermediate stages. |
| Real failed gate | Previous route is restored; deployment job fails. |
| Real promotion | All sampled requests reach the candidate; old stable is retained. |

Capture your actual observations. The package's test results are documented separately in VALIDATION.md; they are not evidence of a deployment to your registry or machine.

## Screenshot checklist
- Dashboard showing your name and UID.
- Lab exposure at 10% and 50% after successful batches.
- Promotion at 100% and updated stable version.
- Failure injection with automatic rollback event.
- `docker compose ps` or Docker Desktop showing container health.
- Docker Hub image tag/digest.
- GitHub Actions successful verify, publish, and deploy jobs.
- Real gate evidence and live backend response slot.

## Viva questions
**Why use Docker?** It packages a consistent application/runtime environment for deployment.

**Image versus container?** The image is the packaged template; a container is its running instance.

**Why a multi-stage Dockerfile?** Build tooling stays in the build stage; the runtime contains the JAR and Java runtime.

**Why not deploy latest?** A moving tag can refer to different content later. The CD workflow deploys the exact registry digest returned by the build.

**What is a canary?** A candidate release receiving a limited fraction of traffic before wider promotion.

**What is the health gate?** Here it is Docker readiness plus a real HTTP request sample that validates errors, response identity, traffic split, and p95 latency.

**What is rollback?** Restoring the previously healthy traffic route. It does not undo database migrations.

**Does the dashboard operate Docker?** No. Its labeled lab demonstrates the algorithm through a backend state machine. Real deployment uses the host script and GitHub Actions.

**Why a self-hosted deployment runner?** The running containers must remain on a persistent host. GitHub-hosted build runners are temporary.

**Is a passing probe enough for production?** No. A real system needs longer monitoring, application-specific quality checks, alerting, security, and state/schema compatibility.

**Is blue-green the same as canary?** Blue-green names two environments. This project uses two slots but gradually splits traffic between them, implementing canary promotion rather than only switching all traffic at once.

## Limitations
No persistent application database, authentication, HTTPS termination, multi-host failover, sticky sessions, or automatic database rollback. The lab stores shared state only in memory. Real release state is on the deployment host. A host failure or forced termination can require operator recovery. The smoke sample is intentionally small for a practical exercise.
