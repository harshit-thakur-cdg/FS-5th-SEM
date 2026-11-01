# CanaryDock — Experiment 9.2 (separate frontend and backend)
**Harshit Thakur · 23BAI70435 · Full Stack II · CO6 / BT6**

## Open the correct folder
Extract the ZIP completely and open the folder containing **backend**, **frontend**, **deploy**, and **README.md** in VS Code. If you only see a folder named `Exp9_2_CanaryDock_Separate_Harshit_Thakur_23BAI70435`, open that inner folder first.

## Requirements
- Java 17+ for the backend (JDK 17 or 21 recommended for source development).
- Node.js 18+ for the frontend (Node 22 recommended).
- No `npm install` is required: the frontend uses only built-in Node modules.
- No Docker or Maven installation is required for the fastest local start.

Check: `java -version` and `node --version`. Restart VS Code after installing either runtime.

## Terminal 1 — backend
VS Code → Terminal → New Terminal, starting at the project root:

```powershell
cd backend
.\START_BACKEND.cmd
```

This runs the provided backend JAR. Wait for `Started CanaryDockApplication`. API health: http://localhost:8080/actuator/health. Port 8080 serves the API only in this separate-folder local setup; opening its root may show a 404 page.

## Terminal 2 — frontend
Create a second VS Code terminal. It should begin at the project root:

```powershell
cd frontend
node server.cjs
```

If the new terminal instead starts inside `backend`, use `cd ..\frontend` first.

Open **http://localhost:3000**. Keep BOTH terminals running. Ctrl+C stops the corresponding process.

`npm start` is an equivalent frontend command. In PowerShell, if `npm.ps1` is blocked, use `npm.cmd start` or the recommended `node server.cjs`. Do not change execution policy for this project.

## Run the backend from source after editing Java
Stop its ready-JAR process, then in the backend directory:

```powershell
.\mvnw.cmd spring-boot:run
```

The Maven Wrapper downloads dependencies on first use. The included `backend/dist/canarydock.jar` is a prebuilt snapshot and does not change when source files are edited. To rebuild that snapshot:

```powershell
.\mvnw.cmd clean verify
Copy-Item .\target\canarydock.jar .\dist\canarydock.jar -Force
```

Frontend HTML/CSS/JS changes need only a browser refresh. Restart `node server.cjs` if you modify that server file. Do not open index.html directly or use Live Server: API forwarding is provided by server.cjs.

## How the pieces connect
| Folder/component | Responsibility | Local address |
|---|---|---|
| `frontend/public/index.html` | Dashboard page | http://localhost:3000 |
| `frontend/public/styles.css` | Responsive visual design | Served by frontend |
| `frontend/public/app.js` | Buttons, charts, API calls | Browser |
| `frontend/server.cjs` | Static file server and API proxy | Port 3000 |
| `backend/src/main/java/` | Spring Boot REST API and lab logic | Port 8080 |
| `backend/src/test/java/` | Java tests | Maven verify |
| `backend/dist/canarydock.jar` | Prebuilt API server | Java 17+ |
| `deploy/` | Real Docker/Nginx canary scripts | Linux deployment host |
| `.github/workflows/cd.yml` | Test → publish → canary deployment | Your GitHub repository |

The browser sends `/api/...` to port 3000. The frontend server forwards it to Spring Boot on port 8080 and returns the response. The backend remains a separate running process. Browser requests use one origin, so a broad CORS allowance is unnecessary. The proxy target defaults to `http://127.0.0.1:8080`.

## Try the interactive lab
1. Start a candidate version such as `v1.1.0`: candidate exposure becomes 10%.
2. Send 100 lab requests: counters show 90 stable / 10 candidate.
3. Advance to 50%, then send another batch.
4. Promote to 100%: the candidate becomes stable.
5. Use manual rollback to restore the previous baseline.
6. Start another candidate, inject a failure, and send a batch to trigger automatic rollback.
7. Export JSON evidence or probe the actual backend.

The release lab simulates request batches in a real backend state machine. It does not execute Docker or GitHub jobs. The live backend probe makes a real HTTP call. Lab state is shared per backend process and resets on restart. The pipeline diagram is a blueprint, not live CI status.

## Docker — two separate local containers
Stop the two local processes to free ports 3000 and 8080. Start Docker Desktop and run from the project ROOT:

```powershell
docker compose up --build -d
docker compose ps
```

Open http://localhost:3000. Compose starts separate frontend and backend containers. Inspect logs with `docker compose logs -f`; stop them with `docker compose down`.

If `docker` is not found and you used a per-user Docker Desktop installation, check:

```powershell
Test-Path "$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin\docker.exe"
```

If True, add that folder for this terminal:

```powershell
$env:Path += ";$env:LOCALAPPDATA\Programs\DockerDesktop\resources\bin"
docker --version
docker info
```

Other installations may use `C:\Program Files\Docker\Docker\resources\bin`. The Docker engine must be running as well as the CLI being available.

## Real Continuous Deployment
See **docs/DEPLOYMENT.md** for Docker Hub, Linux deployment host, GitHub secrets, runner setup, 10% → 50% → 100% promotion, and rollback.

The root Dockerfile assembles both source folders into ONE release image for production canary routing, so frontend and backend versions promote/roll back together. The development folders and local processes remain separate. The local two-container Compose configuration is independent of that production packaging choice.

You must configure your own registry credentials and self-hosted deployment runner. Creating this ZIP has not deployed anything to your accounts. Actual Docker and GitHub execution is not claimed; see docs/VALIDATION.md for completed checks.

## Useful API endpoints
- GET http://localhost:8080/actuator/health
- GET http://localhost:8080/api/info
- GET http://localhost:8080/api/hello
- GET http://localhost:8080/api/lab
- POST http://localhost:8080/api/lab

The same paths also work through port 3000 while both processes are running. Request examples: docs/API.http.

## Troubleshooting
- **Command not recognized:** enter the correct subfolder first. Backend launchers are inside backend; server.cjs is inside frontend.
- **Port already in use:** stop the old Exp 9.2 app and/or its Docker container before launching this copy.
- **Backend unavailable in browser:** start the backend, check its health URL, then refresh the frontend.
- **Frontend 3000 works but backend 8080 homepage is 404:** expected in local mode; the UI is served on 3000.
- **node not recognized:** install Node.js and restart VS Code.
- **Maven download failure:** check internet and any school-network proxy settings; the ready JAR does not need dependency downloads.

For different local ports, start the backend from its folder with `java -jar dist/canarydock.jar --server.port=8081`; in the frontend terminal set `$env:API_TARGET='http://127.0.0.1:8081'` before `node server.cjs`. To change frontend port set `$env:FRONTEND_PORT='3001'`.
