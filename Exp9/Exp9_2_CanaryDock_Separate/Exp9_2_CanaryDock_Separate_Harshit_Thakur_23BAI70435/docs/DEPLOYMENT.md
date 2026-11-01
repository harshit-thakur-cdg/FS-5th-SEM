# Real Docker and GitHub Actions deployment

Run the commands below from the project ROOT (which contains frontend, backend, deploy, and the root Dockerfile).

The two development servers run separately. For the canary pipeline, the root Dockerfile deliberately copies frontend/public into Spring Boot's static resources at image-build time. Each immutable release image therefore contains matching frontend and backend versions. The original source folders stay separate. Nginx canary routing on port 8092 and GitHub Actions behavior are unchanged.

Local `docker compose up --build -d` is different: it starts TWO containers (frontend on 3000, backend on 8080). The root Dockerfile is used by `docker build .` and the CD workflow, not by that Compose setup.

## Real local canary experiment (Linux / WSL 2)
This mode requires Bash, Docker Engine or Docker Desktop WSL integration, Python 3, and `flock` (util-linux). Allocate roughly 2 GB of spare memory for containers and builds. Use a dedicated Linux environment. The production gateway is deliberately bound to localhost on port **8092**.

Run the following inside the project folder in a WSL/Linux terminal. Replace `YOUR_DOCKERHUB_USERNAME` with your actual lowercase Docker Hub username; do not use it literally.

```bash
docker login
docker build -t YOUR_DOCKERHUB_USERNAME/canarydock:baseline .
docker push YOUR_DOCKERHUB_USERNAME/canarydock:baseline
bash deploy/release.sh bootstrap YOUR_DOCKERHUB_USERNAME/canarydock:baseline
```

Open http://localhost:8092. The lab controls are disabled here. Use **Probe live backend** to see the real serving slot.

Make a small visible change (for example the greeting string in `ApiController.java`), then build and push a candidate with a new tag:

```bash
docker build -t YOUR_DOCKERHUB_USERNAME/canarydock:release-2 .
docker push YOUR_DOCKERHUB_USERNAME/canarydock:release-2
bash deploy/release.sh deploy YOUR_DOCKERHUB_USERNAME/canarydock:release-2
```

The script starts the inactive slot, waits for Docker health, routes 10%, waits 15 seconds and probes 100 actual requests, then repeats at 50% and 100%. Each probe checks HTTP success, valid slot/version, approximate allocation, and p95 latency below 1,500 ms. Any request error fails the gate. Expected 10%/50% splits allow ±10 percentage points; 100% requires every response from the candidate. A failed gate restores the saved stable Nginx route and exits nonzero. Candidate containers are retained for diagnostics.

Nginx uses weighted round robin per HTTP request. This is not sticky assignment of a fixed group of users. Health probes are a small lab smoke test, not a replacement for production telemetry or a long observation window. The default 15-second soak can be increased with `SOAK_SECONDS=60 bash deploy/release.sh deploy IMAGE`.

The first bootstrap establishes a baseline and has no earlier release to roll back to. Repeating a failed bootstrap is supported; repeating a successful bootstrap is rejected. A subsequent deployment preserves the current stable container while replacing the inactive slot. After a successful rollout the immediately previous stable container remains available:

```bash
bash deploy/release.sh rollback
docker ps --filter name=canarydock
```

A new candidate attempt retires the older rollback target in the inactive slot; the current stable remains protected. Files under `$HOME/.canarydock-exp92` record state and probe JSON. Keep bootstrap and deployment under the same Linux user and Docker daemon. The script uses a lock to prevent overlapping releases.

### Observe automatic rollback with actual containers
After a successful bootstrap, in a second terminal watch `docker ps`. Start a candidate deployment. During its 15-second 10% observation period, stop the candidate slot (the slot that is NOT the stable slot printed by `head -1 ~/.canarydock-exp92/current`):

```bash
docker stop canarydock-green  # example only: verify the candidate slot first
```

The readiness/probe gate fails, the script restores the stable route, and its exit code is nonzero. Wait for the readiness timeout (up to 120 seconds). Never stop the stable container for this test. Restart or redeploy the candidate for later experiments.

## GitHub Actions — configure once
1. Create a **private** GitHub repository and push the whole project, including hidden `.github` and `.mvn` folders, to `main`.
2. Create a Docker Hub repository named **canarydock** and a Docker Hub access token with the permissions needed to push/pull that repository.
3. GitHub → repository Settings → Secrets and variables → Actions → Secrets:
   - `DOCKERHUB_USERNAME`: your Docker Hub username.
   - `DOCKERHUB_TOKEN`: the access token. Do not commit it or paste it into source files.
4. On a dedicated Linux machine (a local Linux/WSL lab host is enough), install Docker, Python 3, Bash, and `flock`. Ensure the runner user can run `docker info` without `sudo`.
5. Bootstrap the stable baseline on that host, as above, using the **same user** that will run the GitHub runner. Keep the host running.
6. GitHub → Settings → Actions → Runners → New self-hosted runner. Follow GitHub's generated commands for Linux x64 and add the custom label **canarydock**. Do not put runner registration tokens in this project.
7. Create the **production** environment in repository Settings → Environments. For automatic CD in this lab, do not add a required reviewer. With required review enabled, it becomes approval-gated delivery.
8. Add Actions repository variable `ENABLE_CD` with value `true`. Until this is set, tests run but publish/deploy jobs are deliberately skipped.
9. Push a commit to `main`. Open Actions → **CanaryDock Continuous Deployment**. Verify all three jobs: `verify`, `publish`, `deploy`.
10. Download `test-results` and `deployment-evidence` from that run for your practical submission.

Build/test jobs run on GitHub-hosted Ubuntu. Only deployment runs on your labeled self-hosted Linux host. Pull requests run verification only; they do not publish or deploy. Do not use this privileged runner for untrusted repositories or changes. The workflow uses an immutable image digest from the registry for deployment, instead of a moving `latest` tag.

The gateway remains localhost-only; a running service on the runner does not create a public URL. To serve externally, you would need your own hosting, firewall policy, TLS, and authentication. They are outside this classroom package.


## References
- https://docs.github.com/en/actions/tutorials/publish-packages/publish-docker-images
- https://nginx.org/en/docs/http/load_balancing.html
