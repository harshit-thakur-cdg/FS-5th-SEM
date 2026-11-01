# Validation — separate-folder edition, 23 October 2026

Completed:
- Backend Maven verify: BUILD SUCCESS, 7 Java tests, 0 failures/errors.
- Rebuilt backend-only JAR; verified it does not contain frontend static resources.
- Started separate Spring Boot (8080) and Node (3000) processes.
- Chromium end-to-end tests through port 3000: healthy 10% / 50% / 100% rollout, manual rollback, injected failure with automatic rollback, JSON export, live backend probe, and reset all passed.
- Browser tests: no page errors or mobile horizontal overflow at 390px.
- Direct API and frontend-proxied API returned the expected student identity.
- Backend root returned 404 as expected; frontend root served the dashboard.
- Encoded traversal request was blocked by the frontend server.
- Stopping the backend produced a helpful HTTP 502 response through the frontend.
- Frontend server JavaScript syntax checked.
- Updated Compose and GitHub Actions YAML parsed; deployment shell syntax checked.
- Deployment probe implementation is unchanged from the original package, whose three Python gate tests passed.
- ZIP integrity, launchers, workflow, wrapper JAR, and backend JAR verified.

Not executed:
- Windows CMD launchers were inspected, not run on Windows.
- Docker and Nginx containers, Docker Hub publishing, and GitHub Actions runs require your own Docker host/repository setup. They were not executed in this workspace.

Architecture:
Local development and Compose use separate frontend/backend services. For production canary CD, the root Dockerfile assembles both source folders into one immutable release image. This preserves matching frontend/backend versions during promotion and rollback. See DEPLOYMENT.md.
