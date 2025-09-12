#!/usr/bin/env bash
set -euo pipefail

# Script to generate pgbouncer userlist.txt with proper MD5 hashes

if [ -z "${POSTGRES_APP_PASSWORD:-}" ] || [ -z "${PGBOUNCER_AUTH_PASSWORD:-}" ]; then
  echo "Error: POSTGRES_APP_PASSWORD and PGBOUNCER_AUTH_PASSWORD environment variables are required"
  exit 1
fi

# Function to create MD5 hash for PostgreSQL/PgBouncer
create_md5_hash() {
  local username="$1"
  local password="$2"
  echo -n "${password}${username}" | md5sum | cut -d' ' -f1
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
