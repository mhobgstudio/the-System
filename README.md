# My System (WORKSTATION)

Gamified productivity & spiritual tracking system — WORKSTATION copy. Solo Leveling-style RPG for daily habits, quests, and spiritual growth.

## Quick Start

```bash
python3 -m http.server 8000
# Open http://localhost:8000
```

## Git Commands

```bash
git clone <repo-url>
cd "WORKSTATION/My System"
git pull
```

## Local Hosting

```bash
python3 -m http.server 8000
# Open index.html
```

## Tech Stack

- **Frontend**: Vanilla JS (`app.js` — 218 KB), HTML (`index.html` — 43 KB), CSS (`styles.css` — 153 KB)
- **Storage**: IndexedDB via Dexie.js
- **Auth**: Google OAuth 2.0 (set client ID in `app.js`)
- **Service Worker**: `sw.js` for offline support
- **PWA**: `manifest.json` for installable app

## Features

- RPG stats, quests, XP, leveling
- Streaks, achievements, quotes
- Google Sign-In (per-user DB)
- Offline-first with service worker
- PWA installable

## Key Files

| File | Description |
|------|-------------|
| `index.html` | Main entry |
| `app.js` | Core logic |
| `styles.css` | Styling |
| `sw.js` | Service worker |
| `manifest.json` | PWA manifest |
| `quotes.txt` | Quote database |
| `Solo_Leveling.apk` | Android build (69 MB) |

## Notes

- Copy of `/home/heavenly-dev/TermProj/system/`
- Android APK available at `Solo_Leveling.apk`
- See `system/README.md` for full details