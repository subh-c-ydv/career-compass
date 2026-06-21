#!/bin/bash

# Career Compass — start backend and frontend as background processes
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/.compass.pids"

# If already running, warn and exit
if [ -f "$PID_FILE" ]; then
  echo "⚠️  Career Compass appears to already be running."
  echo "   Run 'stop.sh' first if you want to restart."
  exit 1
fi

echo ""
echo "🧭  Starting Career Compass..."

# Start backend
cd "$SCRIPT_DIR/backend"
source venv/bin/activate
nohup python3 app.py > "$SCRIPT_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

# Start frontend
cd "$SCRIPT_DIR/frontend"
nohup npm run dev > "$SCRIPT_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

# Save PIDs
echo "$BACKEND_PID $FRONTEND_PID" > "$PID_FILE"

# Wait for servers to be ready
sleep 3

echo "✅  Career Compass is running in the background."
echo "   App:  http://localhost:5173"
echo "   API:  http://localhost:5001"
echo ""
echo "   Logs: backend.log / frontend.log"
echo "   Stop: ./stop.sh"
echo ""

open http://localhost:5173