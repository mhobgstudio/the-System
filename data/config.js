/* ──────────────────────────────────────────────
 * Solo Leveling System — Shared Configuration
 * ────────────────────────────────────────────── */

const SL_CONFIG = {
  // Game balance
  MAX_STAT: 10000,
  XP_PER_LEVEL: 10,
  MAX_QUEST_TITLE_LENGTH: 100,
  XP_MIN: 1,
  XP_MAX: 99999999,
  MAX_QUESTS_DISPLAY: 200,

  // DB
  DB_NAME: 'SoloLevelingDB',
  DB_VERSION: 8,

  // Pomodoro
  POMODORO_TIMES: { work: 25, break: 5, longBreak: 15 },
  POMODORO_SOUND_DURATION: 2000,

  // Streak
  STREAK_TITLES: [
    { days: 0, title: 'Mortal' },
    { days: 1, title: 'Qi Condensation (练气期)' },
    { days: 3, title: 'Quasi Apprentice' },
    { days: 5, title: 'Foundation Establishment (筑基期)' },
    { days: 7, title: 'Apprentice' },
    { days: 10, title: 'Core Formation / Golden Core (金丹期)' },
    { days: 14, title: 'Quasi Student' },
    { days: 18, title: 'Nascent Soul (元婴期)' },
    { days: 21, title: 'Student' },
    { days: 25, title: 'Spirit Transformation / Soul Formation (化神期)' },
    { days: 30, title: 'Quasi Master' },
    { days: 45, title: 'Void Refinement (炼虚期)' },
    { days: 60, title: 'Master' },
    { days: 75, title: 'Body Integration (合体期)' },
    { days: 90, title: 'Quasi Grand Master' },
    { days: 105, title: 'Mahayana (大乘期)' },
    { days: 120, title: 'Grand Master' },
    { days: 135, title: 'Tribulation Transcendence (渡劫期)' },
    { days: 150, title: 'Quasi Great Grand Master' },
    { days: 180, title: 'Great Grand Master' },
    { days: 210, title: 'True Immortal (真仙)' },
    { days: 250, title: 'Golden Immortal (金仙)' },
    { days: 280, title: 'Taiyi Jade Immortal (太乙玉仙)' },
    { days: 310, title: 'Daluo Golden Immortal (大罗金仙)' },
    { days: 330, title: 'Immortal' },
    { days: 365, title: 'Dao Ancestor (道祖)' },
  ],

  // Quest categories (must match the category filter options in index.html)
  CATEGORIES: ['work', 'health', 'learning', 'personal', 'spiritual', 'fitness', 'social', 'finance', 'creative'],
  DIFFICULTIES: ['Easy', 'Medium', 'Hard'],
  STATS: ['strength', 'agility', 'intelligence', 'stamina', 'willpower', 'discipline'],

  // Quote categories
  QUOTE_CATEGORIES: ['power', 'wisdom', 'discipline', 'growth', 'perseverance', 'faith'],

  // Category-to-quote mapping
  QUEST_TO_QUOTE_CATEGORY: {
    work: 'discipline',
    health: 'perseverance',
    learning: 'wisdom',
    personal: 'growth',
    faith: 'faith',
    discipline: 'discipline',
    power: 'power',
    cultivation: 'discipline',
    physical: 'strength',
    spiritual: 'faith',
    fitness: 'strength',
    social: 'discipline',
    finance: 'discipline',
    creative: 'growth',
  },

  // Auth
  AUTH_STORAGE_KEY: 'sl_auth',

  // Timings (ms)
  AUTO_SAVE_INTERVAL: 60000,
  SEARCH_DEBOUNCE: 300,
  TOAST_DURATION: 3000,
  STAT_INCREASE_DISPLAY_DURATION: 3000,
  DUE_DATE_REMINDER_CHECK_INTERVAL: 60000,
};
