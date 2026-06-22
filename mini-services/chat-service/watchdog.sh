#!/bin/bash
# Watchdog: restarts chat service if it dies
while true; do
  if ! curl -s http://localhost:3003/ > /dev/null 2>&1; then
    cd /home/z/my-project/mini-services/chat-service
    bun run dev > /home/z/my-project/mini-services/chat-service.log 2>&1 &
    echo "[$(date)] restarted" >> /home/z/my-project/mini-services/watchdog.log
    sleep 3
  fi
  sleep 10
done
