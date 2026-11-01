# Validation — Experiment 8.1

- Frontend production build: PASS (Vite).
- Backend Java compilation: PASS (Java 17).
- Backend integration test with an actual embedded Kafka broker: PASS, 1 test, 0 failures, 0 errors.
- Verified normal processing (1 attempt), retry recovery (3 attempts), DLQ routing (4 attempts), HTTP 409 duplicate rejection, consumer duplicate skipping, invalid-input HTTP 400, missing-event HTTP 404, and Kafka health.
- Browser UI checks: PASS for offline messaging, three form scenarios, duplicate feedback, DLQ navigation, search, status filter, and mobile overflow. Browser interaction tests used controlled API responses; broker behavior was tested separately in the integration test.
- Desktop and mobile layouts visually inspected.
- Docker Desktop launch and JDK 25 execution were not tested in this Linux workspace. The supplied source targets Java 17 and the conduct instructions use Docker Kafka on Windows.

Run `backend/mvnw.cmd test` from the backend folder as `.\mvnw.cmd test` to repeat backend verification on your computer.
