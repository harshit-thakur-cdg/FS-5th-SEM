# Experiment 8.2 — StreamOps Reliability Suite
**Harshit Thakur | UID: 23BAI70435 | Full Stack II**

StreamOps is an advanced operations console for Apache Kafka demonstrating **Retry Policies, Dead-Letter Queue (DLQ) Isolation, and Idempotent Event Processing**. It contains separate `frontend` (React + Vite on port 3003) and `backend` (Spring Boot 3.4 on port 8301) applications.

## 1. Prerequisites
- Docker Desktop with Kafka broker running on port `9092` (can share the broker from Exp 8.1 with distinct topics `scheduled-posts-82` and `scheduled-posts-dlq-82`).
- Java 17+ (Eclipse Adoptium JDK 17).
- Node.js 18+ / 22 LTS and npm.

## 2. Start the Three Components

**Terminal 1 — Kafka Broker**
```powershell
# If exp81-kafka is already running, you can use that directly!
# Otherwise, from backend:
cd backend
docker compose up -d --wait
```

**Terminal 2 — Spring Boot Backend (Port 8301)**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*(Or double-click `START-BACKEND.cmd` or run `powershell -ExecutionPolicy Bypass -File .\run-backend.ps1`)*

**Terminal 3 — React Frontend (Port 3003)**
```powershell
cd frontend
npm install
npm run dev
```
*(Or double-click `START-FRONTEND.cmd`)*.
Open: **http://localhost:3003**

## 3. Demonstration Sequence for Evaluation / Viva
1. **Student Attribution**: Show Harshit Thakur (UID: `23BAI70435`) and avatar `HT` in the sidebar and top telemetry bar.
2. **Normal Processing Flow**:
   - Select **Normal** preset (0 simulated failures), click **Publish Event →**.
   - Event status transitions: `QUEUED` ➔ `PROCESSING` ➔ `PROCESSED` on attempt **1**.
3. **Transient Fault & Exponential Backoff Recovery**:
   - Select **Retry Twice** preset (2 simulated failures), click **Publish Event →**.
   - Consumer encounters simulated transient errors on attempts 1 and 2.
   - Recovers after exponential backoff delays (1s, 2s) and succeeds on attempt **3** (`PROCESSED`).
4. **Poison Pill & Dead-Letter Queue (DLQ) Isolation**:
   - Select **Route to DLQ** preset (10 simulated failures), click **Publish Event →**.
   - Event fails all 4 delivery attempts (1 initial + 3 retries at 1s, 2s, 4s).
   - Once exhausted, `DeadLetterPublishingRecoverer` automatically forwards it to `scheduled-posts-dlq-82` (`DLQ` status).
   - Open **Dead-Letter Queue** tab and click **Inspect** to examine the stack trace and retry history.
5. **Idempotency & Duplicate Prevention**:
   - Click **Test Dup** next to any record in the ledger table.
   - Click **Publish Event →** to attempt re-submitting an identical Event ID.
   - Backend enforces idempotency and returns **HTTP 409 Conflict**, preventing duplicate event processing.
6. **Retry & Backoff Analysis**:
   - Open the **Retry & Backoff Analysis** tab to review the Delivery Effort Histogram (`0`, `1`, `2`, `3`, `4+` attempts), Extra Processing Attempts metric, and Backoff Ladder.

## 4. Key Metrics Explained
- **Total Submitted:** All persisted events in the file-backed H2 database.
- **Success Rate %:** `(PROCESSED / Total) * 100`.
- **Retried Events:** Events requiring more than 1 delivery attempt.
- **Extra Processing Attempts:** Sum of `(attempts - 1)` across all events.
- **Recovered after Retry:** Events that successfully reached `PROCESSED` on attempt > 1.
