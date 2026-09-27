#!/usr/bin/env bash
set -Eeuo pipefail

APP_DIR="${APP_DIR:-/opt/sanda-lt/app}"
LOCK_FILE="${LOCK_FILE:-/opt/sanda-lt/deploy.lock}"
LOG_FILE="${LOG_FILE:-/opt/sanda-lt/deploy.log}"

exec 9>"$LOCK_FILE"
flock -n 9 || exit 0
cd "$APP_DIR"

before="$(git rev-parse HEAD)"
git fetch --quiet origin main
after="$(git rev-parse origin/main)"

if [[ "$before" == "$after" ]]; then
  exit 0
fi

{
  printf '%s deploying %s -> %s\n' "$(date -Is)" "$before" "$after"
  git pull --ff-only origin main
  docker compose build web
  docker compose up -d --no-deps web
  for attempt in {1..30}; do
    if curl --fail --silent --show-error http://127.0.0.1:3000/healthz >/dev/null; then
      printf '%s deployment succeeded\n' "$(date -Is)"
      exit 0
    fi
    sleep 2
  done
  printf '%s health check failed\n' "$(date -Is)"
  exit 1
} >>"$LOG_FILE" 2>&1
