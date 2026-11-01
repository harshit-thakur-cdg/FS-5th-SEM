# Build Observatory — Experiment 9.1
**Harshit Thakur | UID: 23BAI70435 | Full Stack II**

A complete Continuous Integration (CI) testing lab with a React dashboard, Spring Boot REST API, persistent file-backed H2 storage, JUnit 5/Mockito unit tests, MockMvc API validation, Pact consumer/provider contract verification, PostgreSQL Testcontainers, and a GitHub Actions workflow.

## 1. Quick Start on Windows
1. Check Java version in PowerShell: `java -version` (Java 17+ or JDK 21).
2. Open terminal in the project directory (containing `pom.xml` and `mvnw.cmd`).
3. Start the application:
   ```powershell
   .\mvnw.cmd spring-boot:run
   ```
   *(Or double-click `START_HERE.cmd` or run `powershell -ExecutionPolicy Bypass -File .\run-backend.ps1`)*
4. Wait for `Started ObservatoryApplication`, then open: **http://localhost:8400**
5. All build records persist locally in the `./data/observatory` file-backed H2 database.

## 2. Conduct the Experiment for Evaluation & Viva
1. **Student Verification**: Point to the top telemetry bar and sidebar showing **Harshit Thakur** (UID: **23BAI70435**) and avatar **HT**.
2. **Dispatch a Build Record**:
   - In the **Commit Composer**, click any preset (e.g., `feat: Add CI workflow and GitHub Actions runner`) or type your own commit description.
   - Click **+ Create Build Record (201 Created)**.
   - The backend validates the message (1–200 characters), generates a unique ID, returns **201 Created** with a `Location: /api/builds/{id}` header, and stores it in H2 with initial status **`QUEUED`**.
3. **Inspect Build History**:
   - Switch to the **Build History** tab.
   - Search by commit text or ID.
   - Click **Inspect ↗** on any build to view the full JSON response.
   - Click **Export JSON ↓** to download `build-history.json`.
4. **Theme Customization**:
   - Switch among Dark Ops, Light Studio, Mint Horizon, Amethyst, and Amber Solar using the top header dropdown.
5. **Run Terminal CI Verification (16 Tests)**:
   - In a terminal, run:
     ```powershell
     .\mvnw.cmd clean verify
     ```
   - Automatically runs:
     - 8 Unit tests (`BuildRunServiceTest`) isolating service logic with Mockito.
     - 7 API tests (`BuildRunApiTest`) with Spring MockMvc testing 201 Created, 400 Bad Request (blank, missing, >200 chars, malformed JSON), and 404 Not Found.
     - 1 Pact consumer test (`BuildConsumerTest`) generating JSON contract definitions in `target/pacts`.
     - Pact provider verification (`BuildProviderIT`) ensuring the Spring Boot provider adheres to the contract.
6. **Full Integration with Docker & PostgreSQL (Optional / Full Profile)**:
   - Ensure Docker Desktop is running in Linux containers mode.
   - Execute:
     ```powershell
     .\mvnw.cmd clean verify -Pfull
     ```
   - Boots a live `postgres:16-alpine` container via Testcontainers to verify real database schema creation and transactional persistence (`BuildRunPostgresIT`).

## 3. Architecture & Test Layers
- **Stage 1 (Unit Testing):** `BuildRunServiceTest.java` (JUnit 5 + Mockito).
- **Stage 2 (Web & API Integration):** `BuildRunApiTest.java` (Spring MockMvc).
- **Stage 3 (Consumer-Driven Contract):** `BuildConsumerTest.java` and `BuildProviderIT.java` (Pact 4.6).
- **Stage 4 (Database Integration):** `BuildRunPostgresIT.java` (Testcontainers 1.20 + PostgreSQL 16).
- **Backend:** `src/main/java/in/harshit/observatory` (Spring Boot 3.4 on Port 8400).
- **Frontend:** `frontend/src` (React + Vite, built directly into `src/main/resources/static`).
- **CI Workflow:** `.github/workflows/ci.yml` (multi-step GitHub Actions pipeline).
