# Experiment 8.2 validation

- Java 17 backend compilation and integration test: PASS (1 test, 0 failures, 0 errors).
- Actual embedded Kafka broker verified normal processing, retry recovery, DLQ routing, duplicate submission rejection, completed-event duplicate skipping, HTTP input validation, missing-event response and broker health.
- React/Vite production build: PASS.
- Browser checks with controlled API responses: PASS for offline state, all three scenario submissions, duplicate feedback, DLQ view, ledger search, status filter, success rate 66.7%, extra processing attempts 5, recovered events 1, mobile overflow and JavaScript errors.
- Desktop overview, retry analysis and mobile layout visually inspected.
- Exp 8.2 ports, topic names, consumer groups and file database configured separately from Exp 8.1.
- Optional Compose YAML parsed and init-service dependency checked. Docker Desktop/Compose runtime was not available here, so the standalone Docker startup was not executed. The primary run route reuses your working Exp 8.1 Kafka broker.
- Windows launcher execution and JDK 25 execution were not tested in this Linux environment.

Repeat backend checks from backend with `.\mvnw.cmd test`; repeat the frontend build from frontend with `npm.cmd run build`.


UI redesign: production frontend build passed. Backend and event-processing code were unchanged. The updated layout has not been visually verified in a browser in this update.
