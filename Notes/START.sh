#!/bin/bash
# START.sh — auto-detect and start project in directory
# Reference: /home/heavenly-dev/utilities.md
# Generated 2026-09-23

DIR="$(pwd)"
PROJECT="$(basename "$DIR")"
echo "=== START: $PROJECT ==="
echo "Utilities / setups: /home/heavenly-dev/utilities.md"

# Auto-detect existing start file (highest priority)
for s in START.sh.bak start.sh run.sh run_start.sh init.sh deploy.sh setup.sh; do
    [ -f "$s" ] && { echo "Delegating to $s"; bash "$s"; exit $?; }
done

# Type detection
if [ -f "package.json" ]; then
    echo "Detected: Node (package.json)"
    if command -v npm >/dev/null 2>&1; then npm start; else echo "npm not found"; fi
elif [ -f "pubspec.yaml" ]; then
    echo "Detected: Flutter (pubspec.yaml)"
    if command -v flutter >/dev/null 2>&1; then flutter run; else echo "flutter not found"; fi
elif [ -f "init_db.py" ] || [ -f "init-db.php" ]; then
    echo "Detected: DB init script"
    if [ -f "init_db.py" ]; then python3 init_db.py; elif [ -f "init-db.php" ]; then php init-db.php; fi
elif [ -f "docker-compose.yml" ] || [ -f "docker-compose.yaml" ]; then
    echo "Detected: Docker Compose"
    if command -v docker-compose >/dev/null 2>&1; then docker-compose up; else echo "docker-compose not found"; fi
elif ls *.apk 2>/dev/null | grep -q .; then
    echo "Detected: APK project"
    echo "APK files present — refer to build scripts (e.g., build-gateway-apk.sh)"
else
    echo "Detected: Generic / unknown"
    echo "No recognized launcher (package.json, pubspec.yaml, init_db.py, docker-compose)"
    echo "Refer to /home/heavenly-dev/utilities.md for setup"
fi
