#!/usr/bin/env bash
set -euo pipefail

# Script to generate pgbouncer userlist.txt with proper MD5 hashes

# Load from .env if not provided in environment
if [ -z "${POSTGRES_APP_PASSWORD:-}" ] || [ -z "${PGBOUNCER_AUTH_PASSWORD:-}" ]; then
  if [ -f ".env" ]; then
    set -a
    . ./.env
    set +a
  fi
fi

if [ -z "${POSTGRES_APP_PASSWORD:-}" ] || [ -z "${PGBOUNCER_AUTH_PASSWORD:-}" ]; then
  echo "Error: POSTGRES_APP_PASSWORD and PGBOUNCER_AUTH_PASSWORD environment variables are required"
  echo "Hint: set them in .env or export them in your shell."
  exit 1
fi

# Function to create MD5 hash for PostgreSQL/PgBouncer (portable across macOS/Linux)
create_md5_hash() {
  local username="$1"
  local password="$2"

  if command -v md5sum >/dev/null 2>&1; then
    printf "%s" "${password}${username}" | md5sum | awk '{print $1}'
  elif command -v md5 >/dev/null 2>&1; then
    # macOS
    printf "%s" "${password}${username}" | md5 -r | awk '{print $1}'
  elif command -v openssl >/dev/null 2>&1; then
    printf "%s" "${password}${username}" | openssl md5 | awk '{print $2}'
  else
    echo "Error: md5sum/md5/openssl not found. Install coreutils or openssl." >&2
    exit 1
  fi
}

# Generate MD5 hashes
APP_HASH=$(create_md5_hash "app_user" "$POSTGRES_APP_PASSWORD")
BOUNCER_HASH=$(create_md5_hash "bouncer_user" "$PGBOUNCER_AUTH_PASSWORD")

# Create userlist.txt
cat > docker/pgbouncer/userlist.txt << EOF
"app_user" "md5${APP_HASH}"
"bouncer_user" "md5${BOUNCER_HASH}"
"postgres" "md5894f020e5a4b23c9eeebc4313bdfeb38"
EOF

echo "✅ Generated docker/pgbouncer/userlist.txt with proper MD5 hashes"
