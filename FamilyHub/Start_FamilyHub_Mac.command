#!/bin/bash
cd "$(dirname "$0")"
PORT=8091
while lsof -iTCP:$PORT -sTCP:LISTEN >/dev/null 2>&1; do
  PORT=$((PORT + 1))
done
python3 -m http.server "$PORT" >/tmp/familyhub_v1.log 2>&1 &
SERVER_PID=$!
sleep 1
open "http://localhost:$PORT"
echo "FamilyHub V1 läuft auf http://localhost:$PORT"
echo "Dieses Terminalfenster offen lassen. Beenden mit Ctrl+C."
wait "$SERVER_PID"
