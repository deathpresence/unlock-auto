#!/usr/bin/env bash
set -euo pipefail

wait_for() {
  local host="$1" port="$2"
  echo "Waiting for ${host}:${port} ..."
  for i in {1..60}; do
    if (echo > /dev/tcp/${host}/${port}) >/dev/null 2>&1; then
      echo "OK ${host}:${port}"
      return 0
    fi
    sleep 1
  done
  echo "Timeout waiting for ${host}:${port}"
  exit 1
}

wait_for postgres 5432
wait_for pgbouncer 6432

echo "Running global migrations..."
npm run drizzle:migrate:global

echo "Starting Next.js..."
exec "$@"
