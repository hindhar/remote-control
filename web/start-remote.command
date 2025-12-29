#!/bin/bash
# Samsung TV Remote - Silent launcher
cd "$(dirname "$0")"
PORT=3020

# Clean any stale locks
rm -f .next/dev/lock 2>/dev/null

# If already running, just open browser
if curl -s http://localhost:$PORT > /dev/null 2>&1; then
    open -a "Google Chrome" http://localhost:$PORT
    exit 0
fi

# Start server silently in background
nohup npm run dev -- -p $PORT > /tmp/tv-remote.log 2>&1 &

# Wait for server
for i in {1..30}; do
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        break
    fi
    sleep 1
done

# Open Chrome
open -a "Google Chrome" http://localhost:$PORT
