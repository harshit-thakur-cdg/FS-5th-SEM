#!/usr/bin/env bash
# Two-slot, health-gated deployment. Run on a dedicated Linux Docker host.
set -Eeuo pipefail
command -v docker >/dev/null
command -v python3 >/dev/null
command -v flock >/dev/null
MODE=${1:-}
IMAGE=${2:-}
ROOT=${CD_STATE_DIR:-"$HOME/.canarydock-exp92"}
PORT=${CD_PORT:-8092}
NETWORK=canarydock-exp92
GATEWAY=canarydock-gateway
SOAK_SECONDS=${SOAK_SECONDS:-15}
[[ "$PORT" =~ ^[0-9]+$ && "$SOAK_SECONDS" =~ ^[0-9]+$ ]] || { echo 'Invalid port or soak duration'; exit 1; }
[[ "$MODE" =~ ^(bootstrap|deploy|rollback)$ ]] || { echo 'Usage: bash deploy/release.sh bootstrap|deploy IMAGE or rollback'; exit 1; }
mkdir -p "$ROOT/nginx" "$ROOT/evidence"
exec 9>"$ROOT/release.lock"
flock -n 9 || { echo 'Another release is running.'; exit 1; }
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)
log(){ printf '%s %s\n' "$(date -u +%FT%TZ)" "$*"; }
ready(){
  for ((i=0;i<60;i++)); do
    if [[ $(docker inspect --format '{{.State.Health.Status}}' "$1" 2>/dev/null || true) == healthy ]]; then return 0; fi
    sleep 2
  done
  log "Container $1 did not become healthy"; return 1
}
route(){
  local stable=$1 candidate=$2 weight=$3
  {
    echo 'upstream app {'
    if ((weight < 100)); then echo " server $stable:8080 weight=$((100-weight)) max_fails=0;"; fi
    if ((weight > 0)); then echo " server $candidate:8080 weight=$weight max_fails=0;"; fi
    cat <<'NGINX'
}
server {
 listen 80;
 server_tokens off;
 location / {
  proxy_pass http://app;
  proxy_next_upstream off;
  proxy_connect_timeout 3s;
  proxy_read_timeout 10s;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  add_header Cache-Control "no-store" always;
 }
}
NGINX
  } > "$ROOT/nginx/default.conf.new"
  mv "$ROOT/nginx/default.conf.new" "$ROOT/nginx/default.conf"
  if docker container inspect "$GATEWAY" >/dev/null 2>&1; then
    docker exec "$GATEWAY" nginx -t
    docker exec "$GATEWAY" nginx -s reload
  else
    docker run -d --name "$GATEWAY" --network "$NETWORK" --restart unless-stopped \
      -p "127.0.0.1:$PORT:80" -v "$ROOT/nginx:/etc/nginx/conf.d:ro" nginx:1.28-alpine >/dev/null
  fi
  sleep 2
}
start(){
  local slot=$1 image=$2
  docker rm -f "$slot" >/dev/null 2>&1 || true
  docker run -d --name "$slot" --network "$NETWORK" --restart unless-stopped \
    --memory 512m --cpus 1 -e DEMO_ENABLED=false -e APP_SLOT="$slot" -e APP_VERSION="$image" "$image" >/dev/null
  ready "$slot"
}
probe(){
  python3 "$SCRIPT_DIR/probe.py" "http://127.0.0.1:$PORT" "$1" "$2" "$ROOT/evidence/$(date -u +%Y%m%dT%H%M%S)-$2.json"
}
if [[ "$MODE" == bootstrap ]]; then
  [[ ! -f "$ROOT/current" ]] || { log 'Already bootstrapped. Use deploy.'; exit 1; }
  [[ -n "$IMAGE" && "$IMAGE" != -* ]] || { log 'Image is required'; exit 1; }
  docker image inspect "$IMAGE" >/dev/null 2>&1 || docker pull "$IMAGE"
  docker network inspect "$NETWORK" >/dev/null 2>&1 || docker network create "$NETWORK" >/dev/null
  start canarydock-blue "$IMAGE"
  route canarydock-blue canarydock-blue 100
  probe canarydock-blue 100
  printf '%s\n%s\n' canarydock-blue "$IMAGE" > "$ROOT/current"
  log "Bootstrap complete: http://localhost:$PORT"; exit 0
fi
[[ -f "$ROOT/current" ]] || { log 'Bootstrap a stable baseline first.'; exit 1; }
mapfile -t current < "$ROOT/current"
STABLE=${current[0]}
[[ "$STABLE" == canarydock-blue || "$STABLE" == canarydock-green ]] || { log 'Invalid state'; exit 1; }
CANDIDATE=canarydock-green
[[ "$STABLE" != canarydock-green ]] || CANDIDATE=canarydock-blue
ready "$STABLE"
cp "$ROOT/nginx/default.conf" "$ROOT/nginx/last-good.conf.bak"
rollback_on_failure(){
  local status=$?
  trap - ERR INT TERM
  log 'Release failed. Restoring the previous route.'
  cp "$ROOT/nginx/last-good.conf.bak" "$ROOT/nginx/default.conf"
  if docker exec "$GATEWAY" nginx -t && docker exec "$GATEWAY" nginx -s reload; then
    log "Rollback route restored to $STABLE. Candidate retained for inspection."
  else
    log 'CRITICAL: route reload failed; inspect the Docker host immediately.'
  fi
  exit "${status:-1}"
}
trap rollback_on_failure ERR
trap 'false' INT TERM
if [[ "$MODE" == rollback ]]; then
  [[ -f "$ROOT/previous" ]] || { log 'No previous release recorded.'; exit 1; }
  mapfile -t previous < "$ROOT/previous"
  [[ "${previous[0]}" == "$CANDIDATE" ]] || { log 'Previous slot does not match expected slot'; exit 1; }
  ready "$CANDIDATE"
  # Ensure retained container still contains the recorded previous image.
  [[ $(docker inspect --format '{{.Config.Image}}' "$CANDIDATE") == "${previous[1]}" ]]
  route "$STABLE" "$CANDIDATE" 100
  probe "$CANDIDATE" 100
  cp "$ROOT/current" "$ROOT/swap"
  cp "$ROOT/previous" "$ROOT/current"
  mv "$ROOT/swap" "$ROOT/previous"
  log "Rolled back to ${previous[1]}"; exit 0
fi
[[ -n "$IMAGE" && "$IMAGE" != -* ]] || { log 'Image is required'; exit 1; }
[[ "$IMAGE" != "${current[1]}" ]] || { log 'Candidate image must differ from current image'; exit 1; }
# Always pull for CD. Use an immutable registry digest supplied by the workflow.
docker pull "$IMAGE"
# Reusing the inactive slot retires the older rollback target; the current stable stays running.
rm -f "$ROOT/previous"
start "$CANDIDATE" "$IMAGE"
for weight in 10 50 100; do
  route "$STABLE" "$CANDIDATE" "$weight"
  log "Candidate $CANDIDATE now receives $weight percent of requests"
  sleep "$SOAK_SECONDS"
  ready "$CANDIDATE"
  probe "$CANDIDATE" "$weight"
done
cp "$ROOT/current" "$ROOT/previous"
printf '%s\n%s\n' "$CANDIDATE" "$IMAGE" > "$ROOT/current.new"
mv "$ROOT/current.new" "$ROOT/current"
trap - ERR INT TERM
log 'Promotion complete. Previous stable container retained for rollback.'
