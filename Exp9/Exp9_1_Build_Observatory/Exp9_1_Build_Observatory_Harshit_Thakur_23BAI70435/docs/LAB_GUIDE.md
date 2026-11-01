# Experiment 9.1 — Continuous Integration
Name: Harshit Thakur  
UID: 23BAI70435  
Subject: Full Stack II

## Aim
Design and implement an automated build-and-test pipeline that detects defects early.

## What each layer does
1. **Entity:** BuildRun represents a persisted record: generated ID, commit message, QUEUED status, UTC creation time.
2. **Repository:** Spring Data JPA provides database operations without handwritten CRUD SQL.
3. **Service:** Rejects null/blank messages and messages longer than 200 characters after trimming; saves valid messages and retrieves records.
4. **Controller:** Exposes POST and GET endpoints; returns 201 with Location for creation, 400 for invalid input and 404 for a missing record.
5. **React frontend:** Sends actual HTTP requests, displays records, searches loaded data, shows API JSON and handles failures. Themes are saved in the browser; records are saved on the backend.

## Test design
- BuildRunServiceTest uses Mockito to isolate the repository. Eight tests cover valid trimming, null/blank/oversized input, the 200-character boundary, existing/missing IDs and ordered retrieval.
- BuildRunApiTest uses a real Spring test application plus MockMvc and isolated H2 storage. Seven tests check creation/retrieval, validation, malformed JSON, 404 and an empty history.
- BuildConsumerTest runs a Pact mock server and generates a consumer contract for an empty GET /api/builds response.
- BuildProviderIT runs the real HTTP provider on a random port and verifies that contract. The provider state clears its isolated test database. This contract intentionally covers only empty history; it does not prove every populated-record shape or POST behavior.
- BuildRunPostgresIT starts a disposable PostgreSQL container and checks persistence of the message, ID, default status and timestamp. It runs only in the full profile.

## Why test ordering matters
Maven's test phase runs Surefire (*Test), creating the Pact file. The later integration-test/verify phases run Failsafe (*IT), which verifies the provider using that file. A successful unit-test phase alone is not proof that the provider or PostgreSQL tests passed.

## Expected observations (record your actual results)
| Action | Expected observation |
|---|---|
| Create a valid record | HTTP 201, generated ID, QUEUED |
| Submit blank message via API | HTTP 400 |
| Submit 201-character trimmed message | HTTP 400 |
| Retrieve missing ID | HTTP 404 |
| Restart app | Previously saved records remain |
| Default clean verify | 17 test invocations pass; PostgreSQL excluded |
| Full clean verify -Pfull | 18 test invocations pass, including PostgreSQL |

Do not copy expected counts into a report as measured results without checking your own run. If dependencies/frameworks change, inspect XML reports for actual counts.

## Screenshot checklist
1. Overview with your name/UID and Connected indicator.
2. A created record and its JSON response.
3. Searchable build history in your preferred colour theme.
4. Maven BUILD SUCCESS and suite counts.
5. PostgreSQL container test evidence from the full profile.
6. GitHub Actions run only if you actually push and run it remotely.

## Learning outcomes
- Explain Continuous Integration and early feedback.
- Isolate service logic using JUnit 5 and Mockito.
- Validate REST endpoints using MockMvc.
- Generate and verify a consumer-provider Pact contract.
- Test JPA persistence against PostgreSQL with Testcontainers.
- Automate a reproducible Maven workflow in GitHub Actions.

## Viva preparation
**What is CI?** Frequently integrate changes and automatically build/test them.

**Why Mockito?** Replace dependencies with controlled test doubles to isolate behavior.

**Why MockMvc?** Exercise Spring MVC routing/validation/serialization without a separate deployed HTTP server.

**Why Pact?** Check an explicit API agreement between a consumer and provider.

**Why Testcontainers instead of only H2?** H2 can differ from PostgreSQL; a real PostgreSQL engine tests database-specific behavior in an isolated disposable environment.

**What is the Maven Wrapper?** Scripts/configuration that download and run a pinned Maven distribution.

**test vs verify?** test runs Surefire tests; verify also checks integration tests through Failsafe.

**Does Create record execute the CI pipeline?** No. It persists the sample domain record. Maven and GitHub Actions execute the automated checks separately.

**What is continuous deployment?** Automatic release/deployment after validation; this experiment implements CI, not automatic deployment.
