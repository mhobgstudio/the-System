#!/bin/bash
# START.sh — auto-generated for project directory
# Reference: /home/heavenly-dev/utilities.md
# Generated 2026-09-23

echo "Starting: $(basename $(pwd))"
echo "Utilities / setups: see /home/heavenly-dev/utilities.md"

# If existing start/run/init script exists, delegate to it
if [ -f "START.sh.bak" ]; then : ; fi

for s in START.sh start.sh run.sh init.sh run_start.sh deploy.sh setup.sh; do
    [ -f "$s" ] && { echo "Delegating to existing $s"; bash "$s"; exit; }
done

echo "No existing start script found — reference utilities.md for manual setup."
