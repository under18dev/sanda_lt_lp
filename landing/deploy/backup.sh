#!/usr/bin/env bash
set -Eeuo pipefail

DATA_DIR="${DATA_DIR:-/opt/sanda-lt/data}"
BACKUP_DIR="${BACKUP_DIR:-/opt/sanda-lt/backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"

mkdir -p "$BACKUP_DIR"
if [[ -f "$DATA_DIR/event.db" ]]; then
  sqlite3 "$DATA_DIR/event.db" ".backup '$BACKUP_DIR/event-$STAMP.db'"
fi
tar -czf "$BACKUP_DIR/uploads-$STAMP.tar.gz" -C "$DATA_DIR" uploads ogp
find "$BACKUP_DIR" -type f -mtime +14 -delete
