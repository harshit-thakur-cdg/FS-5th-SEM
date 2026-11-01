# Packaging validation — 23 October 2026 (India)

- React/Vite production build: PASS.
- Java production and all test sources: compiled successfully on OpenJDK 17.0.20.
- Maven clean verify: BUILD SUCCESS.
- JUnit 5 + Mockito: 8 passed.
- Spring MockMvc: 7 passed.
- Pact consumer: 1 passed; contract generated.
- Pact provider: 1 passed; generated contract verified against real HTTP provider.
- Total default test invocations: 17 passed, zero failures/errors/skips.
- Real-browser smoke check: API connection, record creation, search, ID inspection, theme persistence, test guide navigation, mobile overflow check all passed. No browser JavaScript errors.
- Desktop (1440px) and mobile (390px) layouts visually reviewed.
- PostgreSQL Testcontainers: test compiles and the full profile selects it, but execution is BLOCKED here by absence of a valid Docker environment. Its attempted execution failed at container startup. Database behavior is NOT verified here. Run .\mvnw.cmd clean verify -Pfull with Docker Desktop on your machine.
- GitHub Actions: workflow provided; no remote run performed.
- Windows launcher scripts and Maven Wrapper included, but Windows execution was not tested in this Linux environment.
- Tested runtime: Java 17. The pinned application supports JDK 21, but a JDK 21 run was not performed here.

The validation logs in docs/validation describe the packaging environment, not results from your computer. Complete the experiment locally and preserve your own evidence.
