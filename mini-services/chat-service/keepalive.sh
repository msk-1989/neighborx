#!/bin/bash
# Keepalive script for NeighborX chat service
if ! pgrep -f "bun.*chat-service/index" > /dev/null 2>&1; then
  cd /home/z/my-project/mini-services/chat-service
  setsid bun run dev > /home/z/my-project/mini-services/chat-service.log 2>&1 < /dev/null &
  disown
  echo "[$(date)] restarted chat service" >> /home/z/my-project/mini-services/chat-service-keepalive.log
fi
