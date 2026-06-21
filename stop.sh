#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/.compass.pids"

if [ ! -f "$PID_FILE" ]; then
  echo "⚠️  Career Compass doesn't appear to be running."
  exit 1
fi

read BACKEND_PID FRONTEND_PID < "$PID_FILE"

echo "🛑  Stopping Career Compass..."
kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
rm -f "$PID_FILE"
echo "✅  Stopped."