# Experiment 8.1 — KafkaPulse
**Harshit Thakur | UID: 23BAI70435 | Full Stack II**

A modern React + Spring Boot application for the Kafka reliability experiment in your report. Contains two application folders: `frontend` and `backend`. It uses real Apache Kafka (or KRaft broker), not a browser simulation. The frontend displays Harshit Thakur's name, UID, and avatar in both its sidebar and footer.

## 1. Prerequisites
- Docker Desktop (or local Apache Kafka running on port 9092).
- Java 17+ (Eclipse Adoptium JDK 17).
- Node.js 18+ / 22 LTS and npm.
- VS Code / Terminal.

Check in PowerShell:
```powershell
java -version
node -v
npm -v
docker version
```

## 2. Start the Three Components
Keep all three components running during the demonstration.

**Terminal 1 — Kafka Broker**
```powershell
cd backend
docker compose up -d --wait
```
Wait for the container to become healthy. Topics `scheduled-posts` and `scheduled-posts-dlq` are created automatically by Spring Boot on startup.

**Terminal 2 — Spring Boot Backend**
```powershell
cd backend
.\mvnw.cmd spring-boot:run
```
*(Or run `powershell -ExecutionPolicy Bypass -File .\run-backend.ps1` or double-click `START-BACKEND.cmd`)*.
Backend runs on: **http://localhost:8300/api/events**

**Terminal 3 — React Frontend**
```powershell
cd frontend
npm install
npm run dev
```
*(Or double-click `START-FRONTEND.cmd`)*.
Open: **http://localhost:3002**

## 3. Demonstration Sequence for Viva / Lab Evaluation
1. **Student Verification**: Point to the top telemetry bar and sidebar showing **Harshit Thakur** (UID: **23BAI70435**).
2. **Normal Flow**:
   - Click **Happy Path (Normal)** preset, then click **Publish Event →**.
   - Event status transitions: `QUEUED` ➔ `PROCESSING` ➔ `PROCESSED` on attempt **1**.
3. **Transient Fault Recovery**:
   - Click **Retry Twice** preset (2 simulated failures), then click **Publish Event →**.
   - Event fails attempts 1 and 2 with exponential backoff (1s, 2s) and automatically succeeds on attempt **3** (`PROCESSED`).
4. **Poison Pill / DLQ Exhaustion**:
   - Click **Route to DLQ** preset (10 simulated failures), then click **Publish Event →**.
   - Event retries 3 times (1s, 2s, 4s delay). When retries are exhausted, `DeadLetterPublishingRecoverer` automatically forwards it to `scheduled-posts-dlq` (`DLQ` status).
   - Click **Inspect** to see the full stack trace / error details.
5. **Idempotency & Duplicate Protection**:
   - Without modifying the Event ID, click **Publish Event →** again.
   - The backend validates the existing ID and returns **HTTP 409 Conflict**, preventing duplicate event processing.
6. **Live Ledger Search & Filter**:
   - Use the live search bar and status filters (`ALL`, `PROCESSED`, `RETRYING`, `DLQ`) to inspect real-time events.
7. **Persistence Demonstration**:
   - Stop the backend with `Ctrl+C` and restart it.
   - All events remain safely persisted in the file-backed H2 database (`./data/kafka-reliability-db`).

## 4. Architecture & Key Files
- `backend/src/main/java/com/harshit/kafkapulse/EventController.java`: REST API with CORS, event submission, and cluster health checking.
- `backend/src/main/java/com/harshit/kafkapulse/EventService.java`: Business logic, duplicate checks, transaction management, and status updates.
- `backend/src/main/java/com/harshit/kafkapulse/EventConsumer.java`: `@KafkaListener` consumers for both main and DLQ topics.
- `backend/src/main/java/com/harshit/kafkapulse/KafkaConfig.java`: Topic creation, `DefaultErrorHandler`, and `ExponentialBackOffWithMaxRetries`.
- `backend/src/main/java/com/harshit/kafkapulse/EventRecord.java`: JPA Entity for file-backed H2 storage.
- `frontend/src/main.jsx`: Redesigned React dashboard with live telemetry, visual architecture flow, presets, and inspector.
- `frontend/src/style.css`: Modern high-contrast dark & light themes with glowing accents.

## 5. Configuration Summary
| Setting | Value |
|---|---|
| Backend Port | 8300 |
| Frontend Port | 3002 |
| Kafka Broker | localhost:9092 |
| Main Topic | scheduled-posts |
| Dead-Letter Topic | scheduled-posts-dlq |
| Consumer Groups | scheduled-posts-group, scheduled-posts-dlq-group |
| Retry Policy | Exponential Backoff (1000ms, 2.0 multiplier, 3 retries max) |
| Total Attempts | 1 Initial + 3 Retries = 4 Attempts Max |
