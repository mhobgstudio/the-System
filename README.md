# The System — Gamified Productivity & Spiritual Tracking

Solo Leveling-style RPG system for tracking daily habits, quests, stats, and spiritual growth. Built with vanilla JS, IndexedDB (Dexie), and Google OAuth.

## Quick Start

```bash
# Serve locally (static files — no build needed)
python3 -m http.server 8000
# Open http://localhost:8000

# Or use any static server
npx serve .
```

## Git Commands

```bash
git clone <repo-url>
cd system
git pull
```

## Local Hosting

```bash
# Python
python3 -m http.server 8000

# Node
npx serve .

# VS Code Live Server
```

## Tech Stack

- **Frontend**: Vanilla JS (`app.js` — 302 KB), HTML (`index.html` — 36 KB), CSS (`styles.css` — 140 KB)
- **Storage**: IndexedDB via Dexie.js (v8 schema)
- **Auth**: Google OAuth 2.0 (client ID in `app.js:4`)
- **Audio**: `it_is_time.mp3` entry sound
- **Data**: `quotes.txt` (446 KB), `quotes-audio.json` (74 KB), `ruvector.db` (1.5 MB)

## Features

- **RPG Stats**: Strength, Agility, Intelligence, Stamina, Willpower, Discipline
- **Quests/XP**: Daily quests with XP rewards, categories (work, health, learning, personal, faith, etc.)
- **Leveling**: XP → Level progression
- **Streaks**: Consecutive days tracking
- **Achievements**: Unlockable with icons/categories
- **Quotes**: Favorite quotes with audio
- **Google Sign-In**: Per-user isolated databases
- **Offline**: Works offline with IndexedDB

## Key Files

| File | Description |
|------|-------------|
| `index.html` | Main HTML entry |
| `app.js` | Core application logic (302 KB) |
| `styles.css` | Styling (140 KB) |
| `quotes.txt` | Quote database |
| `quotes-audio.json` | Audio metadata |
| `ruvector.db` | Vector database |
| `BUTTON_ANALYSIS.md` | Button analysis docs |

## Google OAuth Setup

Edit `app.js:4`:

```js
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
```

Get credentials at: https://console.cloud.google.com/apis/credentials

## Data Schema (Dexie v8)

- `playerStats`: level, xp, stats, streaks
- `quests`: title, difficulty, xp, stat, category, status
- `savedGames`: backup/restore
- `achievements`: title, description, unlocked, icon
- `favoriteQuotes`: quoteId, dateAdded
- `statHistory`: daily stat snapshots
- `deletedQuests`: soft delete log

## Notes

- Runs entirely in browser (no backend required)
- Audio autoplay blocked by browsers — plays on first click
- Works in Safari private browsing (in-memory fallback)