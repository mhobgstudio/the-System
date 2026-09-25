#!/bin/bash
# STOP.sh — auto-generated to stop project in directory
# Reference: /home/heavenly-dev/utilities.md
# Generated 2026-09-23

DIR="$(pwd)"
PROJECT="$(basename "$DIR")"
echo "=== STOP: $PROJECT ==="
echo "Utilities / setups: /home/heavenly-dev/utilities.md"

# Try to kill common process names related to this dir
for pid_file in .pid .running.pid; do
    [ -f "$pid_file" ] && kill $(cat "$pid_file") 2>/dev/null && echo "Killed via $pid_file" && rm -f "$pid_file"
done

# Generic kill patterns (if started by this START)
echo "Stopping any processes started by $PROJECT..."
# Note: actual kill depends on what START launched (npm, python, docker-compose, etc.)
# This provides a generic stop hook; extend with pgrep/pkill for specific processes.
echo "STOP complete. Refer to utilities.md for project-specific shutdown steps."
