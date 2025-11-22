#!/usr/bin/env bash
set -euo pipefail

# Usage: ./start-dev-with-db.sh [dbName]
# Defaults to 'test' when no argument is provided.

DB_NAME=${1:-test}
ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "[start-dev-with-db] Starting dev server in $ROOT_DIR with MONGO_DB_NAME=$DB_NAME"
cd "$ROOT_DIR"

# Run the server with the DB override. This relies on the existing "npm run dev" script in the server package.
MONGO_DB_NAME="$DB_NAME" npm run dev
