// --- Google Auth State ---
// Replace this with your Google OAuth 2.0 Web Client ID
// Get one at https://console.cloud.google.com/apis/credentials
const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com';
const AUTH_STORAGE_KEY = 'sl_auth';

let currentUser = null;
(function() {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.sub) currentUser = parsed;
    }
  } catch(e) { /* ignore */ }
})();

// Play entry sound on first load or reload
(function() {
  var audio = new Audio('it_is_time.mp3');
  audio.volume = 1.0;
  var playPromise = audio.play();
  if (playPromise && typeof playPromise.catch === 'function') {
    playPromise.catch(function() {
      // Browser blocked autoplay - play on first click/touch
      document.addEventListener('click', function playOnFirst() {
        audio.play().catch(function(){});
        document.removeEventListener('click', playOnFirst);
      }, { once: true });
    });
  }
})();

function getDbName() {
  return currentUser && currentUser.sub
    ? 'SoloLevelingDB_' + currentUser.sub
    : 'SoloLevelingDB';
}

function saveAuth(user) {
  currentUser = user;
  try { localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user)); } catch(e) {}
}

function clearAuth() {
  currentUser = null;
  try { localStorage.removeItem(AUTH_STORAGE_KEY); } catch(e) {}
}

let activeQuoteCategory = null;

const questToQuoteCategory = {
  work: "discipline",
  health: "perseverance",
  learning: "wisdom",
  personal: "growth",
  faith: "faith",
  discipline: "discipline",
  power: "power",
  cultivation: "discipline",
  physical: "strength"
};

function linkify(text) {
  if (!text) return '';
  // Match bare YouTube/TikTok domains without protocol (e.g. www.youtube.com, youtu.be, vm.tiktok.com, tiktok.com/@user)
  const bareDomainPattern = /(?:https?:\/\/)?((?:www\.)?(?:youtube\.com|youtu\.be|tiktok\.com|vm\.tiktok\.com)\/[^\s<]*)/g;
  // First, add https:// to bare domain matches so the standard pattern catches them
  text = text.replace(bareDomainPattern, (match, domain) => {
    if (match.startsWith('http://') || match.startsWith('https://')) {
      return match; // already has protocol, leave it
    }
    return 'https://' + domain;
  });
  const parts = text.split(/(https?:\/\/[^\s<]+)/g);
  return parts.map((part, i) => {
    if (i % 2) return `<a href="${part}" target="_blank" rel="noopener noreferrer">${part}</a>`;
    return escapeHtml(part);
  }).join('');
}

function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.toString().replace(/[&<>"']/g, c => map[c]);
}

function escapeJsStr(str) {
  if (str == null) return '';
  return String(str).replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n').replace(/\r/g, '\\r');
}

let db;
try {
  db = new Dexie(getDbName());
  db.version(8).stores({
  playerStats:
    "++id, level, xp, strength, agility, intelligence, stamina, willpower, discipline, lastActive, consecutiveDays, currentStreak, longestStreak, username, lastStreakCheck",
  quests: "++id, title, difficulty, xp, stat, status, category, createdAt, completedAt, dueDate",
  savedGames: "++id, timestamp, stats, quests",
  achievements: "++id, title, description, unlocked, unlockedAt, icon, category",
  favoriteQuotes: "++id, quoteId, dateAdded",
  statHistory: "++id, date, strength, agility, intelligence, stamina, willpower, discipline",
  deletedQuests: '++id,compositeKey'
});
} catch(e) {
  console.warn('IndexedDB unavailable, using in-memory fallback:', e);
  // Minimal fallback so app does not crash on Safari private browsing
  db = { playerStats: { toArray: async () => [], put: async () => {} },
         quests: { toArray: async () => [], put: async () => {}, bulkAdd: async () => {}, where: () => ({ equals: () => ({ toArray: async () => [], delete: async () => {}, first: async () => null, modify: async () => {} }), anyOf: () => ({ toArray: async () => [], delete: async () => {}, modify: async () => {} }), and: () => ({ toArray: async () => [], first: async () => null }) }) },
         savedGames: { toArray: async () => [], add: async () => {}, put: async () => {}, orderBy: () => ({ last: () => ({ toArray: async () => [], first: async () => null }) }) },
         achievements: { toArray: async () => [], put: async () => {}, filter: () => ({ toArray: async () => [] }) },
         favoriteQuotes: { toArray: async () => [], add: async () => {}, put: async () => {}, where: () => ({ equals: () => ({ toArray: async () => [], delete: async () => {}, first: async () => null, modify: async () => {} }) }) },
         statHistory: { toArray: async () => [], add: async () => {}, put: async () => {} },
         deletedQuests: { toArray: async () => [], add: async () => {}, put: async () => {}, where: () => ({ equals: () => ({ toArray: async () => [], delete: async () => {}, first: async () => null }) }) } };
}

const MAX_STAT = 10000;

const rawDefaultQuests = [
  // EASY - Quick daily spiritual tasks (5 XP)
  { title: "SACRIFICE YOUR DESIRES", difficulty: "Easy", xp: 99999999, stat: "willpower", category: "personal" },
  { title: "Dua Daily", difficulty: "Easy", xp: 335, stat: "willpower", category: "personal" },
  { title: "Quiet Dhikr", difficulty: "Easy", xp: 335, stat: "willpower", category: "personal" },
  { title: "Sleeping Prayer", difficulty: "Easy", xp: 335, stat: "willpower", category: "personal" },
  { title: "Pray b4 Sleep then Quran Buffs", difficulty: "Easy", xp: 335, stat: "willpower", category: "personal" },
  { title: "Please ask for help from Allah in each sujuud", difficulty: "Easy", xp: 335, stat: "willpower", category: "personal" },
  { title: "think of imam abroad, Allah's is better", difficulty: "Easy", xp: 335, stat: "willpower", category: "personal" },
  { title: "After all, you asked to be close to the throne", difficulty: "Easy", xp: 335, stat: "willpower", category: "personal" },
  { title: "Email", difficulty: "Easy", xp: 333, stat: "discipline", category: "work" },
  { title: "watch teleGratitude", difficulty: "Easy", xp: 333, stat: "discipline", category: "personal" },        
  { title: "All Actions As Worship", difficulty: "Easy", xp: 33333, stat: "discipline", category: "personal" },   
  { title: "HealthCheck", difficulty: "Easy", xp: 333, stat: "stamina", category: "health" },
  { title: "Be an Observer", difficulty: "Easy", xp: 3315, stat: "willpower", category: "personal", isPinned: true },
  { title: "Dont get stuck in a 1hr+ loop", difficulty: "Easy", xp: 3315, stat: "willpower", category: "personal", comment: "code, short videos", isPinned: true },
  { title: "I WILL NOT LET THE VOICES IN MY HEAD CONTROL ME", difficulty: "Easy", xp: 3315, stat: "willpower", category: "personal" },
  { title: "Always Choose the Pleasure of Allah", difficulty: "Easy", xp: 3315, stat: "willpower", category: "personal", isPinned: true },
  { title: "Selective fast (Jihad of silence): be like salah", difficulty: "Easy", xp: 3310, stat: "willpower", category: "personal", comment: "Be on the me app, ask Allah for help for your soul", isPinned: true },
  { title: "Don't Disregard Allah in times of sin_softHeart", difficulty: "Easy", xp: 3310, stat: "willpower", category: "personal" },
  { title: "Nawwafi_Murájá", difficulty: "Easy", xp: 3310, stat: "willpower", category: "personal", comment: "1/3 of page per raka; Deep", isPinned: true },
  { title: "Take Haram Seriously, it's a big deal in GodSight.", difficulty: "Easy", xp: 3310, stat: "willpower", category: "personal" },

  { title: "99 Names", difficulty: "Easy", xp: 338, stat: "discipline", category: "learning", comment: "https://drive.google.com/file/d/1OOfWSArPLilmJHmeOtrLgGhfaHmqMTY4/view?usp=sharing", isPinned: true },
  { title: "English Tafseer 1pg/Quran", difficulty: "Easy", xp: 338, stat: "intelligence", category: "learning" },
  { title: "Liquid Drop concentration", difficulty: "Easy", xp: 338, stat: "intelligence", category: "learning" },
  { title: "There is more to life than your desires", difficulty: "Easy", xp: 338, stat: "discipline", category: "personal" },
  { title: "people doing what you don't want to do", difficulty: "Easy", xp: 338, stat: "discipline", category: "personal" },
  { title: "Systematic Review || At least 15 mins", difficulty: "Easy", xp: 338, stat: "intelligence", category: "learning" },
  { title: "Effectiveness Audit", difficulty: "Easy", xp: 500, stat: "discipline", category: "cultivation" },
  { title: "Quran Word Memorization", difficulty: "Easy", xp: 500, stat: "intelligence", category: "cultivation" },
  { title: "Posture Alignment", difficulty: "Easy", xp: 300, stat: "stamina", category: "physical" },
  { title: "50 Push-ups (Punishment)", difficulty: "Easy", xp: 500, stat: "strength", category: "physical" },
  // MEDIUM - Moderate effort tasks (10 XP Islamic, 8 XP others)
  { title: "SACRIFICE YOUR DESIRES", difficulty: "Medium", xp: 99999999, stat: "willpower", category: "personal" },
  { title: "Give up something for Allah -Fitna is Refinement", difficulty: "Medium", xp: 2310, stat: "willpower", category: "personal" },
  { title: "Grad school", difficulty: "Medium", xp: 238, stat: "intelligence", category: "learning", comment: "EBOOK/PLAYLIST", isPinned: true },
  { title: "Teach Quran", difficulty: "Medium", xp: 238, stat: "intelligence", category: "learning" },
  { title: "Nahwu", difficulty: "Medium", xp: 238, stat: "intelligence", category: "learning" },
  { title: "Agentic Ai", difficulty: "Medium", xp: 238, stat: "discipline", category: "work" },
  { title: "Word4word Quran", difficulty: "Medium", xp: 238, stat: "intelligence", category: "learning" },
  { title: "Madina series", difficulty: "Medium", xp: 238, stat: "intelligence", category: "learning" },
  { title: "Juz Daily - get 1pg/min of each juz pg", difficulty: "Medium", xp: 238, stat: "intelligence", category: "learning", comment: "EBOOK", isPinned: true },
  { title: "extras Research", difficulty: "Medium", xp: 238, stat: "intelligence", category: "work", comment: "https://floor796.com/", isPinned: true },
  { title: "Project", difficulty: "Medium", xp: 238, stat: "intelligence", category: "work" },
  { title: "n8n tasks", difficulty: "Medium", xp: 238, stat: "discipline", category: "work" },
  { title: "Seerah / Khushu of the Ruh and Nafs", difficulty: "Medium", xp: 238, stat: "intelligence", category: "learning" },
  { title: "Revise students Quran with AudioBook || At least 1 page", difficulty: "Medium", xp: 238, stat: "discipline", category: "learning" },
  { title: "Money Research || At least 1 Idea", difficulty: "Medium", xp: 238, stat: "intelligence", category: "personal" },
  { title: "MUJAWWAD .5P", difficulty: "Medium", xp: 238, stat: "discipline", category: "personal" },
  { title: "MultiTask => Brain =< Sleep", difficulty: "Medium", xp: 238, stat: "stamina", category: "health", comment: "shorts", isPinned: true },
  { title: "CyberExpo_Dev", difficulty: "Medium", xp: 238, stat: "intelligence", category: "work" },
  { title: "Pimsleur Arabic || At least 1 Line || 10mins/1 vid", difficulty: "Medium", xp: 238, stat: "intelligence", category: "learning", comment: "https://floor796.com/", isPinned: true },
  { title: "Hifz revision", difficulty: "Medium", xp: 238, stat: "intelligence", category: "learning" },
  { title: "Yoruba perfection", difficulty: "Medium", xp: 238, stat: "intelligence", category: "learning" },
  { title: "Zad University", difficulty: "Medium", xp: 238, stat: "intelligence", category: "work", comment: "GAME: 2048", isPinned: true },
  { title: "Workout", difficulty: "Medium", xp: 238, stat: "strength", category: "health" },
  
  // HARD - High effort, high reward tasks (15 XP Islamic, 10 XP others)
  { title: "SACRIFICE YOUR DESIRES", difficulty: "Hard", xp: 99999999, stat: "willpower", category: "personal" },
  { title: "Real Maths", difficulty: "Hard", xp: 1310, stat: "intelligence", category: "learning" },
  { title: "Quantum Code", difficulty: "Hard", xp: 1310, stat: "intelligence", category: "learning" },
  { title: "Thesis Project NoteBookLM", difficulty: "Hard", xp: 1310, stat: "intelligence", category: "work" },
  { title: "Complete 5 sets of 25 push-ups", difficulty: "Hard", xp: 1310, stat: "strength", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true },
  { title: "Complete a 30-minute intense agility drill session", difficulty: "Hard", xp: 1310, stat: "agility", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true },
  { title: "Maintain a rigorous daily workout routine for a month", difficulty: "Hard", xp: 1310, stat: "strength", category: "personal", comment: "GAME: Tele", isPinned: true },
  { title: "MERN FULL STACK || At least 15mins", difficulty: "Hard", xp: 1310, stat: "intelligence", category: "learning" },
  { title: "MPhil Proposal Research work || At least 1 Slide", difficulty: "Hard", xp: 1310, stat: "intelligence", category: "learning" },
  { title: "Do 100 push-ups throughout the day", difficulty: "Hard", xp: 1310, stat: "strength", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true },
  { title: "Do a 300m run", difficulty: "Hard", xp: 1310, stat: "agility", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true },
];

const GLOBAL_DEFAULT_QUESTS = (() => {
  const uniqueQuests = [];
  const seenKeys = new Set();

  for (const quest of rawDefaultQuests) {
    const compositeKey = `${quest.title}-${quest.difficulty}-${quest.xp}-${quest.stat}-${quest.category}`;
    if (!seenKeys.has(compositeKey)) {
      seenKeys.add(compositeKey);
      uniqueQuests.push(quest);
    }
  }
  return uniqueQuests;
})();

// Pool of quest titles that were excess (beyond the 64) turned into suggestions
let questSuggestionPool = [];

// Enhanced motivational quotes with categories and sources
const motivationalQuotesSystem = {
  categories: {
    POWER: "power",
    WISDOM: "wisdom",
    DISCIPLINE: "discipline",
    GROWTH: "growth",
    PERSEVERANCE: "perseverance",
    FAITH: "faith"
  },
  contexts: {
    QUEST_COMPLETE: "questComplete",
    LEVEL_UP: "levelUp",
    STREAK_MILESTONE: "streakMilestone",
    ACHIEVEMENT_UNLOCKED: "achievementUnlocked",
    DAILY: "daily"
  },
  quotes: [
    {
      id: 4,
      text: "Knowledge is power, and power is everything!",
      author: "Leylin Farlier",
      source: "Warlock of the Magus World",
      category: "wisdom",
      contexts: ["questComplete"],
      favorite: false
    },
    {
      id: 5,
      text: "The strong do as they please, while the weak suffer what they must.",
      author: "Leylin Farlier",
      source: "Warlock of the Magus World",
      category: "power",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 6,
      text: "There's no such thing as a free lunch in this world.",
      author: "Leylin Farlier",
      source: "Warlock of the Magus World",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 9,
      text: "Weakness is a sin.",
      author: "Leylin Farlier",
      source: "Warlock of the Magus World",
      category: "power",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 10,
      text: "Power is a means, not an end.",
      author: "Leylin Farlier",
      source: "Warlock of the Magus World",
      category: "wisdom",
      contexts: ["levelUp"],
      favorite: false
    },
    {
      id: 13,
      text: "In a world of cultivation, only absolute power can guarantee freedom.",
      author: "Leylin Farlier",
      source: "Warlock of the Magus World",
      category: "power",
      contexts: ["achievementUnlocked"],
      favorite: false
    },
    {
      id: 15,
      text: "He who controls resources controls destiny.",
      author: "Leylin Farlier",
      source: "Warlock of the Magus World",
      category: "power",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 17,
      text: "Cunning is a weapon more powerful than any blade.",
      author: "Leylin Farlier",
      source: "Warlock of the Magus World",
      category: "wisdom",
      contexts: ["questComplete"],
      favorite: false
    },
    {
      id: 19,
      text: "The weak fall, the strong rise. Such is the way of the world.",
      author: "Leylin Farlier",
      source: "Warlock of the Magus World",
      category: "power",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 21,
      text: "Trust is a luxury only fools can afford.",
      author: "Leylin Farlier",
      source: "Warlock of the Magus World",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 24,
      text: "A mind without ambition is a body without a soul.",
      author: "Leylin Farlier",
      source: "Warlock of the Magus World",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 31,
      text: "A time comes when you need to stop waiting for the man you want to become and start being the man you want to be.",
      author: "Unknown",
      source: "Personal Development Wisdom",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 32,
      text: "The longer you wait to do something you should do now, the greater the odds that you will never actually do it.",
      author: "Unknown",
      source: "The Law of Diminishing Intent",
      category: "discipline",
      contexts: ["questComplete", "daily"],
      favorite: false
    },
    {
      id: 33,
      text: "You cannot change your destination overnight, but you can change your direction overnight.",
      author: "Unknown",
      source: "Personal Development Wisdom",
      category: "growth",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 34,
      text: "The first step toward change is awareness. The second step is acceptance.",
      author: "Unknown",
      source: "Personal Development Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 35,
      text: "You cannot win if you do not begin! The people who get ahead in the world are the ones who look for the circumstances they want, and if they can't find them, they make them.",
      author: "Unknown",
      source: "Personal Development Wisdom",
      category: "power",
      contexts: ["questComplete", "levelUp"],
      favorite: false
    },
    {
      id: 36,
      text: "Your vision will become clear only when you look into your heart. Who looks outside, dreams. Who looks inside, awakens.",
      author: "Carl Jung",
      source: "Modern Psychology",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 37,
      text: "If you put a small value on yourself, rest assured the world will not raise the price.",
      author: "Unknown",
      source: "Personal Development Wisdom",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 38,
      text: "When a man has put a limit on what he will do, he has put a limit on what he can do.",
      author: "Unknown",
      source: "Personal Development Wisdom",
      category: "perseverance",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 39,
      text: "You will never change your life until you change something you do daily.",
      author: "John Maxwell",
      source: "Today Matters",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 40,
      text: "Once you learn to quit it becomes a habit.",
      author: "Vince Lombardi",
      source: "Leadership Wisdom",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 41,
      text: "Life begins at the end of your comfort zone.",
      author: "Neale Donald Walsch",
      source: "Conversations with God",
      category: "growth",
      contexts: ["levelUp", "daily"],
      favorite: false
    },
    {
      id: 42,
      text: "Facing difficulties is inevitable. Learning from them is optional.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 43,
      text: "Success in life comes not from holding a good hand, but in playing a poor hand well.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["questComplete", "daily"],
      favorite: false
    },
    {
      id: 44,
      text: "If you go to work on your goals, your goals will go to work on you. Whatever good things we build end up building us.",
      author: "Jim Rohn",
      source: "Personal Development",
      category: "growth",
      contexts: ["streakMilestone", "daily"],
      favorite: false
    },
    {
      id: 45,
      text: "The secret of your success is found in your daily routine.",
      author: "John Maxwell",
      source: "Today Matters",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 46,
      text: "You only live once. But if you work it right, once is enough.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 47,
      text: "If you don't design your own life plan, chances are you'll fall into someone else's plan.",
      author: "Jim Rohn",
      source: "Personal Development",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 48,
      text: "It's never too late to be what you might have been.",
      author: "George Eliot",
      source: "Literature",
      category: "growth",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 49,
      text: "God's gift to us: potential. Our gift to God: developing it.",
      author: "Unknown",
      source: "Faith Reflections",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 50,
      text: "Habit is the daily battleground of character.",
      author: "Unknown",
      source: "Character Development",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 51,
      text: "There is no finish line.",
      author: "Unknown",
      source: "Motivation",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 52,
      text: "The potential that exists within us is limitless and largely untapped… when you think of limits, you create them.",
      author: "Unknown",
      source: "Personal Growth",
      category: "growth",
      contexts: ["levelUp", "daily"],
      favorite: false
    },
    {
      id: 53,
      text: "The cure for boredom is curiosity. There is no cure for curiosity.",
      author: "Dorothy Parker",
      source: "Literature",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 54,
      text: "I am always doing that which I cannot do, in order to learn how to do it.",
      author: "Vincent van Gogh",
      source: "Art & Creativity",
      category: "growth",
      contexts: ["questComplete", "daily"],
      favorite: false
    },
    {
      id: 55,
      text: "Man's mind, once stretched by a new idea, never regains its original dimensions.",
      author: "Oliver Wendell Holmes Jr.",
      source: "Legal Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 56,
      text: "The greatest gift you can give to someone is your own personal development.",
      author: "Jim Rohn",
      source: "Personal Development",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 57,
      text: "Wisdom is the lost property of the believer.",
      author: "Prophet Muhammad (saw)",
      source: "Hadith",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 58,
      text: "Today is the beginning of the rest of your life.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 59,
      text: "Opportunity favors those who are prepared.",
      author: "Louis Pasteur",
      source: "Science",
      category: "discipline",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 60,
      text: "Greatness is a choice.",
      author: "Unknown",
      source: "Motivation",
      category: "perseverance",
      contexts: ["levelUp", "daily"],
      favorite: false
    },
    {
      id: 61,
      text: "My mercy prevails over my wrath.",
      author: "Allah",
      source: "Hadith Qudsi",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 62,
      text: "I am as My servant thinks I am. I am with him when he makes mention of Me.",
      author: "Allah",
      source: "Hadith Qudsi",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 63,
      text: "Spend (on charity), O son of Adam, and I shall spend on you.",
      author: "Allah",
      source: "Hadith Qudsi",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 64,
      text: "If My servant likes to meet Me, I like to meet him.",
      author: "Allah",
      source: "Hadith Qudsi",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 65,
      text: "I have prepared for My righteous servants what no eye has seen and no ear has heard.",
      author: "Allah",
      source: "Hadith Qudsi",
      category: "faith",
      contexts: ["achievementUnlocked", "daily"],
      favorite: false
    },
    {
      id: 66,
      text: "We will not change the condition of the people until they change that which is within themselves.",
      author: "Allah",
      source: "Qur'an 13:11",
      category: "faith",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 67,
      text: "Allah has a plan for you, don't worry.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 68,
      text: "Prostrate and get closer to Allah, That Is Your Purpose.",
      author: "Unknown",
      source: "Spiritual Wisdom",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 69,
      text: "When your Salah is straight, your life is straight.",
      author: "Unknown",
      source: "Islamic Wisdom",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 70,
      text: "Whoever is protected from his natural greed—it is they who are successful.",
      author: "Allah",
      source: "Qur'an 59:9",
      category: "faith",
      contexts: ["achievementUnlocked", "daily"],
      favorite: false
    },
    {
      id: 71,
      text: "If you have gained the love of Allah, what have you truly lost? Nothing.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 72,
      text: "I wonder for the one who is certain that there is death, and yet laughs.",
      author: "Prophet Dawud",
      source: "Zabura (Psalms)",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 73,
      text: "I wonder for the one who is certain that there is Hellfire and its chastisement, and yet sleeps without fleeing from it.",
      author: "Prophet Dawud",
      source: "Zabura (Psalms)",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 74,
      text: "I wonder for the one who is certain that there is Paradise and its pleasure, and yet sleeps without seeking it.",
      author: "Prophet Dawud",
      source: "Zabura (Psalms)",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 75,
      text: "I wonder for the one who is certain about this world and its transience, and yet trusts in it implicitly.",
      author: "Prophet Dawud",
      source: "Zabura (Psalms)",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },

    {
      id: 82,
      text: "The strong and weak would never be on equal footing; the difference was as wide as heaven and earth.",
      author: "Wang Lin",
      source: "Renegade Immortal",
      category: "power",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 83,
      text: "If you are weak, the other person is strong. If you are strong, the other person is weak.",
      author: "Wang Lin",
      source: "Renegade Immortal",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 84,
      text: "Strike the iron while it's hot, cultivate when you are still young... even if you don't become emperor, you will find many surprises ahead while traveling at the apex.",
      author: "Li Qiye",
      source: "Emperor's Domination",
      category: "growth",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 85,
      text: "The reason why the strong are strong, is exactly because they are able to endure what normal people aren't able to.",
      author: "Jasmine",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["streakMilestone", "daily"],
      favorite: false
    },
    {
      id: 86,
      text: "Man, no matter which world they lived in, conquer; conquer the enemy and conquer themselves.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "power",
      contexts: ["levelUp", "daily"],
      favorite: false
    },
    {
      id: 87,
      text: "No matter which world, how could one gain anything without paying a price?",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 88,
      text: "Stop being satisfied with such meagre progress.",
      author: "Unknown",
      source: "Personal Growth",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 89,
      text: "As long as you haven't fallen yet, there is still a chance to turn everything around.",
      author: "Unknown",
      source: "Motivation",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 90,
      text: "Don't Disappoint Allah n Surely He Shall Not Let Down Your Expectations.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 91,
      text: "MASTER THE ART OF PATIENCE.",
      author: "Unknown",
      source: "Spiritual Wisdom",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 92,
      text: "ENDURE THE HARDSHIP FOR EASE FOLLOWS.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 93,
      text: "Sometimes in life, your situation will KEEP REPEATING ITSELF UNTIL YOU LEARN YOUR LESSON.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 94,
      text: "WORK WHILE THEY SLEEP. LEARN WHILE THEY PARTY. SAVE WHILE THEY SPEND. THEN LIVE LIKE THEY DREAM.",
      author: "Unknown",
      source: "Success Principle",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 95,
      text: "When Allah said: 'I test only those I love' I took the pain like it was an honour.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 96,
      text: "I WOULD RATHER DIE THAN STOP NOW.",
      author: "Unknown",
      source: "Determination",
      category: "perseverance",
      contexts: ["levelUp", "daily"],
      favorite: false
    },
    {
      id: 97,
      text: "The man whom even the devil was afraid of.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "power",
      contexts: ["levelUp", "daily"],
      favorite: false
    },
    {
      id: 98,
      text: "Don't waste your potential.",
      author: "Unknown",
      source: "Personal Growth",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 99,
      text: "O Human, you have done enough wrong... Paradise for you? I cannot tell, / Undoubtedly you will dwell in hell.",
      author: "Unknown",
      source: "Divine Exhortation",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 100,
      text: "Change your living and make amends / For heaven, on your deeds depends.",
      author: "Unknown",
      source: "Divine Exhortation",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 101,
      text: "O child of Adam! your religion is yours, your work is yours, your flesh is yours, and your blood is yours. If your religion becomes bad, your work, flesh, and blood, too, would become bad.",
      author: "Allah",
      source: "Divine Exhortation - Chapter 14",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 102,
      text: "O child of Adam! do not be like a lamp which burns itself in order to provide light for people. Remove the love of the world from your heart.",
      author: "Allah",
      source: "Divine Exhortation - Chapter 14",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 103,
      text: "The best wisdom is the fear of Allah. The best wealth is contentment. The best preparation (in life) is consciousness of Allah.",
      author: "Allah",
      source: "Divine Exhortation - Chapter 14",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 104,
      text: "O child of Adam! obey Me in exact degree as your heart is inclined to the world, and if you will not do that, then remove My love from your heart.",
      author: "Allah",
      source: "Divine Exhortation - Chapter 30",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 105,
      text: "O child of Adam! many a time you will stand before Allah while you think of another thing. If you had known the reality of Allah, you would not have concerned yourself with something different from Allah.",
      author: "Allah",
      source: "Divine Exhortation - Chapter 30",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 106,
      text: "Challenge your limits again and again and again.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 107,
      text: "Pain of Discipline OR Pain of Regret.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 108,
      text: "PRIORITIES STRAIGHT.",
      author: "Unknown",
      source: "Personal Development",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 109,
      text: "Stay calm under pressure.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 110,
      text: "BE PROACTIVE IN YOUR AFFAIRS.",
      author: "Unknown",
      source: "Personal Development",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 111,
      text: "My soul calls me to evil.",
      author: "Prophet Yusuf (AS)",
      source: "Qur'an 12:53",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 112,
      text: "Self-confidence was the most basic requirement of a truly strong expert.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "growth",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 113,
      text: "Knowledge is the Noor of Allah to His Beloved",
      author: "Unknown",
      source: "Islamic Wisdom",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 114,
      text: "No matter how ruthless the devil is, you can be more ruthless.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 115,
      text: "heaven will always leave a path for you, as long as you want to walk, there will always be a road for you to step on!",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 116,
      text: "Everything exists in balance, heaven is impartial...strength comes with weakness, blessings comes with calamities.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 117,
      text: "His greatest quirk was that, when he made up his mind to concentrate, nothing could distract him.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 118,
      text: "Heart filled with resolution from his pursuit of truth. There was no fear of death.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 119,
      text: "Hardest choices require strongest wills",
      author: "Unknown",
      source: "Life Wisdom",
      category: "perseverance",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 120,
      text: "If Everyone else can do it, then why can't I?",
      author: "Unknown",
      source: "Motivation",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 121,
      text: "She needed rivals and opponents, and she needed pressure that would force her to transform into someone greater than she was before.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 122,
      text: "He always thought it right to keep improving instead of having fun so that you wouldn't be regretful when you found yourself in trouble yet lacked strength.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 123,
      text: "It was when I achieved everything I ever wanted when I realised what was truly important to me.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 124,
      text: "No matter how busy he was, he would always find time for it.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 125,
      text: "Everytime you wake up to reality is a new day.",
      author: "Unknown",
      source: "Motivation",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 126,
      text: "Freedom while not depending on oneself is merely an illusion.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 127,
      text: "The faster you act on your dreams the more successful you will be.",
      author: "Unknown",
      source: "Motivation",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 128,
      text: "The worldly life was a cultivation method created by ALLAH Himself, so how could it be easy?",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 129,
      text: "To stop being ignorant and become wise, you will feel pain because that shows you are growing.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "growth",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 130,
      text: "Life is only a few hundred years, it is all a great gamble.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 131,
      text: "It is merely another version of your self that has exceeded your current limits.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "growth",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 132,
      text: "There was no absolutely desperate situation in this world, there were only people who despair. The answer to resolving problems will always be in our own hands.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 133,
      text: "Increase your Rank in the sight of ALLAH.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 134,
      text: "Be more ruthless to thyself, verily...all the great ones were ruthless to others n more ruthless to themselves.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 135,
      text: "ALLAH tells iblis about those who resist their lower selves that satan will have no authority over them.",
      author: "Allah",
      source: "Qur'an 16:99",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 136,
      text: "The physical body is a carrier for the mind and spirit. With a rise in spiritual force, it would naturally require an even more sturdy body to support it!",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 137,
      text: "Rather make ALLAH Happy. Satisfied.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 138,
      text: "Do people think that they will be left (at ease) only on their saying, 'We believe' and will not be put to any test?",
      author: "Allah",
      source: "Qur'an 29:2",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 139,
      text: "The journey was difficult, there Would always be some obstacles preventing people from progressing.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 140,
      text: "Monks were people devils did not want to meet at all. They rejected the pleasures of life, their staunch souls not corroded by anything.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 141,
      text: "No matter who you are, you do not truly know what kind of man u'v become...Until you reach the very end.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 142,
      text: "Deceiving your self to believe you hav not been deceived.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 143,
      text: "If you don't Trust ALLAH, then trust your self experience.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 144,
      text: "humans possess great wisdom. If they used this wisdom only to fight, they would be letting down this gift from Allah.",
      author: "Unknown",
      source: "Islamic Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 145,
      text: "He withstood the loneliness of seclusion.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 146,
      text: "The ability of a peerless genius is not something that we ordinary people can ever begin to imagine! But it doesn't come easy.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 147,
      text: "ALLAH wanted to see if HIS WORDS carried any weight in Man's heart.",
      author: "Unknown",
      source: "Islamic Wisdom",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 148,
      text: "Oh young Muslim, those of old sacrificed much for Islam, what have you sacrificed.",
      author: "Unknown",
      source: "Islamic Wisdom",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 149,
      text: "Too bad, there were no pills that could cure one's regrets.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 150,
      text: "Even if this increase was very little, a little progress every day would accumulate to a terrifying amount after several days.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "growth",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 151,
      text: "His mind had been trained to stay calm no matter what situation he was facing",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 152,
      text: "What is your purpose.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 153,
      text: "FOCUS ON TODAY",
      author: "Unknown",
      source: "Motivation",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 154,
      text: "THE TRUTH LIES IN DETACHMENT.",
      author: "Unknown",
      source: "Spiritual Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 155,
      text: "Stop being destracted, the world will chase you when you chase Allah.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 156,
      text: "When your Salah is crooked, your life is crooked.",
      author: "Unknown",
      source: "Islamic Wisdom",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 157,
      text: "When a man makes a choice, he should stick to it till the end, even if the results of his choice may seem bad.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 158,
      text: "No matter how big of a genius you are, you will only be able to grow under constant competition.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 159,
      text: "This is life after all, hard work does not mean results, nor success. But if one does not work hard, they are destined to fail.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 160,
      text: "Making mistakes was a normal thing, even the men of old made mistakes in their lives. After making a mistake, realizing the mistake and correcting it was the behavior of an outstanding person!",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 161,
      text: "Before obtaining the greatest strength at the apex, do not plan to slow your footsteps.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "discipline",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 162,
      text: "Know that your words n actions shackle u.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 163,
      text: "Every single person who was cheated, was it because they were stupid? No, it was only because they wanted to believe in it from the depths of their heart.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 164,
      text: "People who could confidently say they did their best",
      author: "Unknown",
      source: "Motivation",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 165,
      text: "If you were not this challenging, how then would you be worthy of my effort.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 166,
      text: "Heaven does not want us to succeed, thus it sent such a calamity, but I will defy heaven. Competing with men, competing with heaven, this is the fun of life.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 167,
      text: "The mentality of the Companions was a hundred times more powerful than mere mortals'. They could withstand tremendous physical pain, they could withstand cultivating in loneliness.",
      author: "Unknown",
      source: "Islamic Wisdom",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 168,
      text: "There is time for everything.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 169,
      text: "Opportunities favor those who are prepared.",
      author: "Unknown",
      source: "Motivation",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 170,
      text: "As long as you haven't fallen, there is a chance to turn everything around.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 171,
      text: "Everything is merely an illusion.",
      author: "Unknown",
      source: "Spiritual Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 172,
      text: "Collective seemingly insignificant choices lead to success.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 173,
      text: "No matter how busy he was, he would always find time for it.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 174,
      text: "To stop being ignorant and become wise, you will feel pain because that shows you are growing.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "growth",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 175,
      text: "Every time you wake up to reality is a new day.",
      author: "Unknown",
      source: "Motivation",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 176,
      text: "Everything exists in balance, heaven is impartial...strength comes with weakness, blessings come with calamities.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 177,
      text: "People are anxious to improve their circumstances but are unwilling to improve themselves; they therefore remain bound by their own words and actions.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 178,
      text: "There is no absolutely desperate situation in this world, there are only people who despair.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 179,
      text: "Those who produce rather than consume in their free time",
      author: "Unknown",
      source: "Motivation",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 180,
      text: "Be so strong even the demons are afraid of u.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "power",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 181,
      text: "Keep silent and do the right thing at the right time",
      author: "Unknown",
      source: "Life Wisdom",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 182,
      text: "The worldly life was a cultivation method created by ALLAH Himself, so how could it be easy?",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 183,
      text: "U will stay like this till the end if you do not make the 1st move",
      author: "Unknown",
      source: "Motivation",
      category: "perseverance",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 184,
      text: "How could a farmer understand the thoughts of a conqueror.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "power",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 185,
      text: "Only the foolishness of mortals is eternal in the rivers of time!",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 186,
      text: "Allah takes away somethings in other for you to return, if you do not wish 4 it to be taken away...never leave in the first place.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 187,
      text: "Don't Disappoint Allah n Surely He Shall Not Let Down Your Expectations.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 188,
      text: "A mistake is simply another way of doing things.",
      author: "Unknown",
      source: "Motivation",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 189,
      text: "You cannot change your destination overnight, but you can change your direction overnight.",
      author: "Unknown",
      source: "Motivation",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 190,
      text: "There are two great days in a person's life: the day you were born and the day you discover why.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 191,
      text: "If someone is going down the wrong road, he doesn't need motivation to speed up. He needs to stop.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 192,
      text: "If you develop the habits of success, you'll make success a habit.",
      author: "Unknown",
      source: "Motivation",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 193,
      text: "The wise man questions himself, the fool others.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 194,
      text: "A bend in the road is not the end of the road unless you fail to make the turn.",
      author: "Unknown",
      source: "Motivation",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 195,
      text: "If you plan on being anything less than you are capable of being, you will probably be unhappy all the days of your life.",
      author: "Unknown",
      source: "Motivation",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 196,
      text: "To know the road ahead, ask those coming back.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 197,
      text: "Everything looks like a failure in the middle.",
      author: "Unknown",
      source: "Motivation",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 198,
      text: "If you want to keep giving, you have to keep growing.",
      author: "Unknown",
      source: "Motivation",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 199,
      text: "You have to give up to grow up.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 200,
      text: "O son of Adam, so long as you call upon Me and ask of Me, I shall forgive you for what you have done.",
      author: "Hadith Qudsi",
      source: "Sacred Hadith",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 201,
      text: "Strike the iron while it's hot, cultivate when you are still young.",
      author: "Li Qiye",
      source: "Cultivation Wisdom",
      category: "growth",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 202,
      text: "The road to the peak is one with battles, to begin with.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 203,
      text: "IF YOUR PARENTS COUNT ON YOU, DON'T PLAY THE SAME GAME AS THOSE WHO COUNT ON THEIR PARENTS.",
      author: "Unknown",
      source: "Motivation",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 204,
      text: "Take care of the first half of your deen before seeking the other half.",
      author: "Unknown",
      source: "Islamic Wisdom",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 205,
      text: "You will not achieve virtuous conduct until you give of what you cherish.",
      author: "Unknown",
      source: "Islamic Wisdom",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 206,
      text: "THE JOURNEY AWAITS.",
      author: "Unknown",
      source: "Motivation",
      category: "perseverance",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 207,
      text: "Many geniuses are born but only a few reach their potential.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "growth",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 208,
      text: "I wonder for the one who is pre-occupied by the faults of others while he forgets about his own.",
      author: "Unknown",
      source: "Excellence Exhortations",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 209,
      text: "Faith is trusting in advance what will only make sense in reverse.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 210,
      text: "Unhappiness is not knowing what we want and killing ourselves to get it.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 211,
      text: "Spend (on charity), O son of Adam, and I shall spend on you.",
      author: "Hadith Qudsi",
      source: "Sacred Hadith",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 212,
      text: "Like naruto, struggle through the pain.",
      author: "Unknown",
      source: "Motivation",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 213,
      text: "Don't just go with the flow.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 214,
      text: "Heaven's will is unable to control men completely.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "power",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 215,
      text: "The sweet scent of a woman is the grave of a hero!",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 216,
      text: "Remember your wish to travel throughout all the realms.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 217,
      text: "If you don't Trust your self, then at least TRUST ALLAH.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 218,
      text: "On the Day [some] faces will turn white and [some] faces will turn black.",
      author: "Qur'an 3:106",
      source: "Holy Quran",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 219,
      text: "The key to the good life, as far as Socrates understood it, was wisdom. As you become wiser, you become a better person. Wisdom is not so much about knowledge — what you think, but rather about how you think.",
      author: "Steven Gambardella",
      source: "5 Philosophy Quotes to Actually Make You Think (2024)",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 220,
      text: "I know that I know nothing.",
      author: "Socrates",
      source: "Plato's Apology",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 221,
      text: "If we possess our 'why' of life we can put up with almost any 'how'.",
      author: "Friedrich Nietzsche",
      source: "Twilight of the Idols",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 222,
      text: "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe.",
      author: "Albert Einstein",
      source: "—",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 223,
      text: "The opposite of love is not hate, it's indifference. The opposite of art is not ugliness, it's indifference. The opposite of faith is not heresy, it's indifference.",
      author: "Elie Wiesel",
      source: "—",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 224,
      text: "The unexamined life is not worth living.",
      author: "Socrates",
      source: "Plato's Apology",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 225,
      text: "Simplicity, patience, compassion. These three are your greatest treasures.",
      author: "Lao Tzu",
      source: "Tao Te Ching",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 226,
      text: "Without deviation from the norm, progress is not possible.",
      author: "Frank Zappa",
      source: "—",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 227,
      text: "Do not fear to be eccentric in opinion, for every opinion now accepted was once eccentric.",
      author: "Bertrand Russell",
      source: "—",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 228,
      text: "Knowing others is intelligence. Knowing yourself is true wisdom. Mastering others is strength. Mastering yourself is true power.",
      author: "Lao Tzu",
      source: "Tao Te Ching",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 229,
      text: "The only true wisdom is in knowing you know nothing.",
      author: "Socrates",
      source: "—",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 230,
      text: "Turn your wounds into wisdom.",
      author: "Oprah Winfrey",
      source: "—",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 231,
      text: "The function of wisdom is to discriminate between good and evil.",
      author: "Marcus Tullius Cicero",
      source: "De Officiis",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 232,
      text: "By three methods we may learn wisdom: First, by reflection, which is noblest; Second, by imitation, which is easiest; and third by experience, which is the bitterest.",
      author: "Confucius",
      source: "Analects",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 233,
      text: "It is the mark of an educated mind to be able to entertain a thought without accepting it.",
      author: "Aristotle",
      source: "Metaphysics",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 234,
      text: "Wisdom begins in wonder.",
      author: "Socrates",
      source: "—",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 235,
      text: "The fool thinks himself to be wise, but the wise man knows himself to be a fool.",
      author: "William Shakespeare",
      source: "As You Like It",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 236,
      text: "Knowledge speaks, but wisdom listens.",
      author: "Jimi Hendrix",
      source: "—",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 237,
      text: "The wise man speaks because he has something to say; the fool speaks because he has to say something.",
      author: "Plato",
      source: "—",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 238,
      text: "Not all those who wander are lost.",
      author: "J.R.R. Tolkien",
      source: "The Lord of the Rings",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 239,
      text: "A man's worth is no greater than the worth of his ambitions.",
      author: "Marcus Aurelius",
      source: "Meditations",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 240,
      text: "The happiness of your life depends upon the quality of your thoughts.",
      author: "Marcus Aurelius",
      source: "Meditations",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 241,
      text: "Waste no more time arguing what a good man should be. Be one.",
      author: "Marcus Aurelius",
      source: "Meditations",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 242,
      text: "Life is not a problem to be solved, but a reality to be experienced.",
      author: "Søren Kierkegaard",
      source: "—",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 243,
      text: "He who has a why to live for can bear almost any how.",
      author: "Friedrich Nietzsche",
      source: "—",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 244,
      text: "Becoming is better than being.",
      author: "Carol Dweck",
      source: "Mindset: The New Psychology of Success",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 245,
      text: "The view you adopt for yourself profoundly affects the way you lead your life.",
      author: "Carol Dweck",
      source: "Mindset",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 246,
      text: "In a growth mindset, challenges are exciting rather than threatening. So rather than thinking, 'Oh, I'm going to reveal my weaknesses,' you say, 'Wow, here's a chance to grow.'",
      author: "Carol Dweck",
      source: "Mindset",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 247,
      text: "The passion for stretching yourself and sticking to it, even when it's not going well, is the hallmark of the growth mindset.",
      author: "Carol Dweck",
      source: "Mindset",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 248,
      text: "No matter what your ability is, effort is what ignites that ability and turns it into accomplishment.",
      author: "Carol Dweck",
      source: "Mindset",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 249,
      text: "Why waste time proving over and over how great you are, when you could be getting better?",
      author: "Carol Dweck",
      source: "Mindset",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 250,
      text: "Picture your brain forming new connections as you meet the challenge and learn. Keep on going.",
      author: "Carol Dweck",
      source: "Mindset",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 251,
      text: "I have not failed. I've just found 10,000 ways that won't work.",
      author: "Thomas Edison",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 252,
      text: "It's not that I'm so smart, it's just that I stay with problems longer.",
      author: "Albert Einstein",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 253,
      text: "Success is not an accident. It is hard work, perseverance, learning, studying, sacrifice, and most of all, love of what you are doing.",
      author: "Pelé",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 254,
      text: "Education is the most powerful weapon which you can use to change the world.",
      author: "Nelson Mandela",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 255,
      text: "There are no secrets to success. It is the result of preparation, hard work, and learning from failure.",
      author: "Colin Powell",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 256,
      text: "Your time is limited, don't waste it living someone else's life.",
      author: "Steve Jobs",
      source: "Stanford Commencement (2005)",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 257,
      text: "In the middle of every difficulty lies opportunity.",
      author: "Albert Einstein",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 258,
      text: "Don't watch the clock; do what it does. Keep going.",
      author: "Sam Levenson",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 259,
      text: "The only thing that overcomes hard luck is hard work.",
      author: "Harry Golden",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 260,
      text: "If you believe it will work out, you'll see opportunities. If you believe it won't, you will see obstacles.",
      author: "Wayne Dyer",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 261,
      text: "You are never too old to set another goal or to dream a new dream.",
      author: "C.S. Lewis",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 262,
      text: "The best way to predict the future is to create it.",
      author: "Peter Drucker",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 263,
      text: "Your life does not get better by chance, it gets better by change.",
      author: "Jim Rohn",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 264,
      text: "Whether you think you can or think you can't, you're right.",
      author: "Henry Ford",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 265,
      text: "The mind is not a vessel to be filled, but a fire to be kindled.",
      author: "Plutarch",
      source: "On Listening",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 266,
      text: "Change your thoughts and you change your world.",
      author: "Norman Vincent Peale",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 267,
      text: "You don't have to be great to start, but you have to start to be great.",
      author: "Zig Ziglar",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 268,
      text: "Your attitude, not your aptitude, will determine your altitude.",
      author: "Zig Ziglar",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 269,
      text: "Do the best you can until you know better. Then when you know better, do better.",
      author: "Maya Angelou",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 270,
      text: "True nobility is being superior to your former self.",
      author: "Ernest Hemingway",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 271,
      text: "Growth must be chosen again and again; fear must be overcome again and again.",
      author: "Abraham Maslow",
      source: "Toward a Psychology of Being",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 272,
      text: "If there is no struggle, there is no progress.",
      author: "Frederick Douglass",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 273,
      text: "Anyone can start from now and make a brand new ending.",
      author: "Carl Bard",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 274,
      text: "Be not afraid of growing slowly; be afraid only of standing still.",
      author: "Chinese Proverb",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 275,
      text: "The expert in anything was once a beginner.",
      author: "Helen Hayes",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 276,
      text: "We can't become what we need to be by remaining what we are.",
      author: "Oprah Winfrey",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 277,
      text: "It does not matter how slowly you go as long as you do not stop.",
      author: "Confucius",
      source: "Analects",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 278,
      text: "The greatest glory in living lies not in never falling, but in rising every time we fall.",
      author: "Nelson Mandela",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 279,
      text: "Continuous improvement is better than delayed perfection.",
      author: "Mark Twain",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 280,
      text: "Little strokes fell great oaks.",
      author: "Benjamin Franklin",
      source: "Poor Richard's Almanack",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 281,
      text: "All growth is a leap in the dark, a spontaneous, unpremeditated act without benefit of experience.",
      author: "Henry Miller",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 282,
      text: "One can choose to go back toward safety or forward toward growth. Growth must be chosen again and again; fear must be overcome again and again.",
      author: "Abraham Maslow",
      source: "—",
      category: "growth",
      contexts: ["daily", "questComplete"],
      favorite: false
    },
    {
      id: 283,
      text: "Courage doesn't always roar. Sometimes courage is the quiet voice at the end of the day saying 'I will try again tomorrow.'",
      author: "Mary Anne Radmacher",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 284,
      text: "Fall seven times and stand up eight.",
      author: "Japanese Proverb",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 285,
      text: "It does not matter how slowly you go as long as you do not stop.",
      author: "Confucius",
      source: "Analects",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 286,
      text: "Success is not final, failure is not fatal: it is the courage to continue that counts.",
      author: "Winston Churchill",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 287,
      text: "Never, never, never give up.",
      author: "Winston Churchill",
      source: "Address at Harrow School (1941)",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 288,
      text: "If you're going through hell, keep going.",
      author: "Winston Churchill",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 289,
      text: "Our greatest glory is not in never falling, but in rising every time we fall.",
      author: "Confucius",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 290,
      text: "Many of life's failures are people who did not realize how close they were to success when they gave up.",
      author: "Thomas Edison",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 291,
      text: "Courage is not having the strength to go on; it is going on when you don't have the strength.",
      author: "Theodore Roosevelt",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 292,
      text: "It always seems impossible until it's done.",
      author: "Nelson Mandela",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 293,
      text: "Energy and persistence conquer all things.",
      author: "Benjamin Franklin",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 294,
      text: "The path to success is to take massive, determined action.",
      author: "Tony Robbins",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 295,
      text: "You may encounter many defeats, but you must not be defeated.",
      author: "Maya Angelou",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 296,
      text: "Success is how high you bounce when you hit bottom.",
      author: "George S. Patton",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 297,
      text: "Out of difficulties grow miracles.",
      author: "Jean de La Bruyère",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 298,
      text: "The human spirit is stronger than anything that can happen to it.",
      author: "C.C. Scott",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 299,
      text: "Tough times never last, but tough people do.",
      author: "Robert H. Schuller",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 300,
      text: "When you come to the end of your rope, tie a knot and hang on.",
      author: "Franklin D. Roosevelt",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 301,
      text: "Storms make trees take deeper roots.",
      author: "D. O. Flynn",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 302,
      text: "A river cuts through rock not because of its power, but because of its persistence.",
      author: "James Watkins",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 303,
      text: "No pressure, no diamonds.",
      author: "Thomas Carlyle",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 304,
      text: "Perseverance, secret of all triumphs.",
      author: "Victor Hugo",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 305,
      text: "The best way out is always through.",
      author: "Robert Frost",
      source: "\"A Servant to Servants\"",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 306,
      text: "I am not afraid of storms, for I am learning how to sail my ship.",
      author: "Louisa May Alcott",
      source: "Little Women",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 307,
      text: "He conquers who endures.",
      author: "Persius",
      source: "Satires",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 308,
      text: "Victory belongs to the most persevering.",
      author: "Napoleon Bonaparte",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 309,
      text: "The difference between the impossible and the possible lies in a person's determination.",
      author: "Tommy Lasorda",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 310,
      text: "Permanence, perseverance and persistence in spite of all obstacles, discouragements and impossibilities: It is this, that in all things distinguishes the strong soul from the weak.",
      author: "Thomas Carlyle",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 311,
      text: "I am not a product of my circumstances. I am a product of my decisions.",
      author: "Stephen R. Covey",
      source: "The 7 Habits of Highly Effective People",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 312,
      text: "Grit is living life like it's a marathon, not a sprint.",
      author: "Angela Duckworth",
      source: "Grit: The Power of Passion and Perseverance",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 313,
      text: "Persistence is the twin sister of excellence. One is a matter of quality; the other, a matter of time.",
      author: "Marabel Morgan",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 314,
      text: "To succeed, work hard, never give up and above all, cherish a magnificent obsession.",
      author: "Walt Disney",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 315,
      text: "I am a slow walker, but I never walk back.",
      author: "Abraham Lincoln",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 316,
      text: "You never know how strong you are until being strong is your only choice.",
      author: "Bob Marley",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 317,
      text: "Rock bottom became the solid foundation on which I rebuilt my life.",
      author: "J.K. Rowling",
      source: "Harvard Commencement (2008)",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 318,
      text: "The brick walls are there for a reason. They're not there to keep us out. The brick walls are there to give us a chance to show how badly we want something.",
      author: "Randy Pausch",
      source: "The Last Lecture",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 319,
      text: "You can't cross the sea merely by standing and staring at the water.",
      author: "Rabindranath Tagore",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 320,
      text: "The gem cannot be polished without friction, nor man perfected without trials.",
      author: "Confucius",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 321,
      text: "Perseverance is not a long race; it is many short races one after the other.",
      author: "Walter Elliott",
      source: "—",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 322,
      text: "The oak fought the wind and broke, the willow bent when it must and survived.",
      author: "Robert Jordan",
      source: "The Fires of Heaven",
      category: "perseverance",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 323,
      text: "He who conquers himself is the mightiest warrior.",
      author: "Confucius",
      source: "Analects",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 324,
      text: "Self-control is strength. Right thought is mastery. Calmness is power.",
      author: "James Allen",
      source: "As a Man Thinketh",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 325,
      text: "The first and best victory is to conquer self.",
      author: "Plato",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 326,
      text: "Discipline is the bridge between goals and accomplishment.",
      author: "Jim Rohn",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 327,
      text: "Mastering others is strength; mastering yourself is true power.",
      author: "Lao Tzu",
      source: "Tao Te Ching",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 328,
      text: "Without self-discipline, success is impossible, period.",
      author: "Lou Holtz",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 329,
      text: "Discipline is choosing between what you want now and what you want most.",
      author: "Abraham Lincoln",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 330,
      text: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
      author: "John C. Maxwell",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 331,
      text: "The more disciplined you become, the easier life gets.",
      author: "Steve Pavlina",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 332,
      text: "Self-discipline is the magic power that makes you virtually unstoppable.",
      author: "Dan Kennedy",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 333,
      text: "Discipline equals freedom.",
      author: "Jocko Willink",
      source: "Extreme Ownership",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 334,
      text: "No man is fit to command another that cannot command himself.",
      author: "William Penn",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 335,
      text: "The discipline of desire is the backbone of character.",
      author: "Will Durant",
      source: "The Story of Philosophy",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 336,
      text: "Freedom is not procured by a full enjoyment of what is desired, but by controlling the desire.",
      author: "Epictetus",
      source: "Discourses",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 337,
      text: "He who reigns within himself, and rules passions, desires, and fears, is more than a king.",
      author: "John Milton",
      source: "Paradise Regained",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 338,
      text: "He who overcomes others is strong, but he who overcomes himself is mightier still.",
      author: "Lao Tzu",
      source: "Tao Te Ching",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 339,
      text: "Self-control is at the root of all virtues. Let a man yield to his impulses and passions, and from that moment he gives up his moral freedom.",
      author: "Orison Swett Marden",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 340,
      text: "There never has been, and cannot be, a good life without self-control.",
      author: "Leo Tolstoy",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 341,
      text: "The greatest power of ruling consists in the exercise of self-control.",
      author: "Seneca",
      source: "On Clemency",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 342,
      text: "He that would govern others, first should be the master of himself.",
      author: "Philip Massinger",
      source: "The Bondman",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 343,
      text: "If you master self-control, you can master anything.",
      author: "Maxime Lagacé",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 344,
      text: "Rule your mind, which, if it is not your servant, is your master.",
      author: "Horace",
      source: "Epistles",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 345,
      text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
      author: "Marcus Aurelius",
      source: "Meditations",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 346,
      text: "The ability to subordinate an impulse to a value is the essence of the proactive person.",
      author: "Stephen R. Covey",
      source: "The 7 Habits of Highly Effective People",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 347,
      text: "Seek freedom and become captive of your desires. Seek discipline and find your liberty.",
      author: "Frank Herbert",
      source: "Dune",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 348,
      text: "I am, indeed, a king, because I know how to rule myself.",
      author: "Pietro Aretino",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 349,
      text: "The first and greatest victory is to conquer yourself; to be conquered by yourself is of all things most shameful and vile.",
      author: "Plato",
      source: "Laws",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 350,
      text: "Not being able to govern events, I govern myself.",
      author: "Michel de Montaigne",
      source: "Essays",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 351,
      text: "Ultimately, the only power to which man should aspire is that which he exercises over himself.",
      author: "Elie Wiesel",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 352,
      text: "By constant self-discipline and self-control you can develop greatness of character.",
      author: "Grenville Kleiser",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 353,
      text: "If you don't control what you think, you cannot control what you do.",
      author: "Napoleon Hill",
      source: "Think and Grow Rich",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 354,
      text: "To enjoy freedom we have to control ourselves.",
      author: "Virginia Woolf",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 355,
      text: "The best fighter is never angry.",
      author: "Lao Tzu",
      source: "Tao Te Ching",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 356,
      text: "Self-discipline without talent can often achieve astounding results, whereas talent without self-discipline inevitably dooms itself to failure.",
      author: "Sydney Harris",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 357,
      text: "First say to yourself what you would be; and then do what you have to do.",
      author: "Epictetus",
      source: "Discourses",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 358,
      text: "Don't explain your philosophy. Embody it.",
      author: "Epictetus",
      source: "Enchiridion",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 359,
      text: "Your ability to discipline yourself to set clear goals and then to work toward them every day will do more to guarantee your success than any other single factor.",
      author: "Brian Tracy",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 360,
      text: "No man is free who is not master of himself.",
      author: "Epictetus",
      source: "Discourses",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 361,
      text: "The successful warrior is the average man, with laser-like focus.",
      author: "Bruce Lee",
      source: "—",
      category: "discipline",
      contexts: ["daily", "streakMilestone"],
      favorite: false
    },
    {
      id: 362,
      text: "Knowing others is intelligence. Knowing yourself is true wisdom. Mastering others is strength. Mastering yourself is true power.",
      author: "Lao Tzu",
      source: "Tao Te Ching",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 363,
      text: "Power is of two kinds. One is obtained by the fear of punishment and the other by acts of love. Power based on love is a thousand times more effective than the one derived from fear of punishment.",
      author: "Mahatma Gandhi",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 364,
      text: "Nearly all men can stand adversity, but if you want to test a man's character, give him power.",
      author: "Abraham Lincoln",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 365,
      text: "The greater the power, the more dangerous the abuse.",
      author: "Edmund Burke",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 366,
      text: "Power tends to corrupt, and absolute power corrupts absolutely. Great men are almost always bad men.",
      author: "Lord Acton",
      source: "Letter to Bishop Mandell Creighton (1887)",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 367,
      text: "What a man can be, he must be. This need we call self-actualization.",
      author: "Abraham Maslow",
      source: "Toward a Psychology of Being",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 368,
      text: "The key is to keep company only with people who uplift you, whose presence calls forth your best.",
      author: "Epictetus",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 369,
      text: "The world is a dangerous place to live, not because of the people who are evil, but because of the people who don't do anything about it.",
      author: "Albert Einstein",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 370,
      text: "Mastering others requires strength. Mastering yourself requires true power.",
      author: "Lao Tzu",
      source: "Tao Te Ching",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 371,
      text: "What does not kill me makes me stronger.",
      author: "Friedrich Nietzsche",
      source: "Twilight of the Idols",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 372,
      text: "He who has a strong enough why can bear almost any how.",
      author: "Friedrich Nietzsche",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 373,
      text: "You have power over your mind — not outside events. Realize this, and you will find strength.",
      author: "Marcus Aurelius",
      source: "Meditations",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 374,
      text: "The measure of a man is what he does with power.",
      author: "Plato",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 375,
      text: "One who condones evils is just as guilty as the one who commits them.",
      author: "Martin Luther King Jr.",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 376,
      text: "In any moment of decision, the best thing you can do is the right thing, the next best thing is the wrong thing, and the worst thing you can do is nothing.",
      author: "Theodore Roosevelt",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 377,
      text: "The ultimate measure of a man is not where he stands in moments of comfort and convenience, but where he stands at times of challenge and controversy.",
      author: "Martin Luther King Jr.",
      source: "Strength to Love",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 378,
      text: "I cannot always control what goes on outside. But I can always control what goes on inside.",
      author: "Wayne Dyer",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 379,
      text: "The secret of power is not might, but the ability to adapt oneself to the forces of nature and use them.",
      author: "Miyamoto Musashi",
      source: "The Book of Five Rings",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 380,
      text: "True power is not about domination over others, but about mastery over oneself.",
      author: "Miyamoto Musashi",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 381,
      text: "Knowledge will give you power, but character respect.",
      author: "Bruce Lee",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 382,
      text: "Power is not revealed by striking hard or often, but by striking true.",
      author: "Miyamoto Musashi",
      source: "The Book of Five Rings",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 383,
      text: "If you want to find the real power in life, help others. If you want to find the real power in work, master your craft.",
      author: "Robert Greene",
      source: "The Laws of Human Nature",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 384,
      text: "Weakness is a choice. Strength is earned.",
      author: "David Goggins",
      source: "Can't Hurt Me",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 385,
      text: "The most powerful person in the room is not the one shouting. It's the one who doesn't need to.",
      author: "Unknown",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 386,
      text: "Power without compassion is tyranny. Compassion without power is weakness.",
      author: "Robert Greene",
      source: "The 48 Laws of Power",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 387,
      text: "You must be shapeless, formless, like water. When you pour water in a cup, it becomes the cup. Water can flow or it can crash. Be water, my friend.",
      author: "Bruce Lee",
      source: "—",
      category: "power",
      contexts: ["daily", "levelUp"],
      favorite: false
    }
  ],
  
  // Get a random quote
  _shown: {},
  
  _pickUnseen: function(pool, key) {
    if (!this._shown[key]) this._shown[key] = new Set();
    const unseen = pool.filter(q => !this._shown[key].has(q.id));
    if (unseen.length === 0) {
      this._shown[key] = new Set();
      const picked = pool[Math.floor(Math.random() * pool.length)];
      this._shown[key].add(picked.id);
      return picked;
    }
    const picked = unseen[Math.floor(Math.random() * unseen.length)];
    this._shown[key].add(picked.id);
    return picked;
  },

  getRandomQuote: function() {
    return this._pickUnseen(this.quotes, 'all');
  },
  
  // Get a random quote by context
  getQuoteByContext: function(context) {
    const contextQuotes = this.quotes.filter(quote => 
      quote.contexts.includes(context)
    );
    return contextQuotes.length > 0 
      ? this._pickUnseen(contextQuotes, 'ctx:' + context)
      : this.getRandomQuote();
  },
  
  // Get a random quote by category
  getQuoteByCategory: function(category) {
    const categoryQuotes = this.quotes.filter(quote => 
      quote.category === category
    );
    return categoryQuotes.length > 0 
      ? this._pickUnseen(categoryQuotes, 'cat:' + category)
      : this.getRandomQuote();
  },
  
  // Get all favorite quotes
  getFavoriteQuotes: function() {
    // This returns a Promise that resolves to favorite quotes
    return db.favoriteQuotes.toArray()
      .then(favorites => {
        return this.quotes.filter(quote => 
          favorites.some(fav => fav.quoteId === quote.id)
        );
      });
  },
  
  // Toggle favorite status
  toggleFavorite: function(quoteId) {
    // This returns a Promise that resolves to boolean
    return db.favoriteQuotes
      .where('quoteId')
      .equals(quoteId)
      .first()
      .then(existingFavorite => {
        if (existingFavorite) {
          return db.favoriteQuotes.delete(existingFavorite.id)
            .then(() => {
                console.log(`Removed favorite for quoteId: ${quoteId}, favoriteQuotes entry ID: ${existingFavorite.id}`);
                return false; // Not favorited anymore
            });
        } else {
          // If not favorited, add it
          return db.favoriteQuotes.add({
            quoteId: quoteId,
            dateAdded: new Date()
          }).then(newId => { // newId is the primary key of the newly added entry
              console.log(`Added favorite for quoteId: ${quoteId}, new favoriteQuotes entry ID: ${newId}`);
              return true; // Now favorited
          });
        }
      });
  }
};

// Achievement definitions
const achievementDefinitions = [
  {
    id: 1,
    title: "First Steps",
    description: "Complete your first quest",
    icon: "fa-solid fa-shoe-prints",
    category: "quests",
    condition: (stats) => stats.completedQuests >= 1
  },
  {
    id: 2,
    title: "Quest Master",
    description: "Complete 50 quests",
    icon: "fa-solid fa-trophy",
    category: "quests",
    condition: (stats) => stats.completedQuests >= 50
  },
  {
    id: 3, 
    title: "Level 10",
    description: "Reach level 10",
    icon: "fa-solid fa-award",
    category: "level",
    condition: (stats) => stats.level >= 10
  },
  {
    id: 4,
    title: "Balanced",
    description: "Get all stats to level 5",
    icon: "fa-solid fa-scale-balanced",
    category: "stats",
    condition: (stats) => 
      Object.keys(statsElems).every(stat => stats[stat] >= 5)
  },
  {
    id: 5,
    title: "Specialist",
    description: "Get any stat to level 10",
    icon: "fa-solid fa-user-graduate",
    category: "stats",
    condition: (stats) => 
      Object.keys(statsElems).some(stat => stats[stat] >= 10)
  },
  {
    id: 6,
    title: "Consistent",
    description: "Maintain a 3-day streak",
    icon: "fa-solid fa-calendar-check",
    category: "streak",
    condition: (stats) => stats.currentStreak >= 3
  },
  {
    id: 7,
    title: "Dedicated",
    description: "Maintain a 7-day streak",
    icon: "fa-solid fa-fire",
    category: "streak",
    condition: (stats) => stats.currentStreak >= 7
  },
  {
    id: 8,
    title: "Unstoppable",
    description: "Maintain a 30-day streak",
    icon: "fa-solid fa-fire-flame-curved",
    category: "streak",
    condition: (stats) => stats.currentStreak >= 30
  },
  {
    id: 9,
    title: "Pomodoro Master",
    description: "Complete 10 pomodoro sessions",
    icon: "fa-solid fa-clock",
    category: "pomodoro",
    condition: (stats) => stats.pomodoroCompleted >= 10
  },
  {
    id: 10,
    title: "All-Rounder",
    description: "Complete at least one quest in each category",
    icon: "fa-solid fa-circle-check",
    category: "quests",
    condition: (stats) => stats.categoriesCompleted && stats.categoriesCompleted.length >= 4
  },
  {
    id: 11,
    title: "Quest Enthusiast",
    description: "Complete 25 quests",
    icon: "fa-solid fa-list",
    category: "quests",
    condition: (stats) => stats.completedQuests >= 25
  },
  {
    id: 12,
    title: "Quest Legend",
    description: "Complete 100 quests",
    icon: "fa-solid fa-crown",
    category: "quests",
    condition: (stats) => stats.completedQuests >= 100
  },
  {
    id: 13,
    title: "Quest Fanatic",
    description: "Complete 250 quests",
    icon: "fa-solid fa-trophy",
    category: "quests",
    condition: (stats) => stats.completedQuests >= 250
  },
  {
    id: 14,
    title: "Completionist",
    description: "Complete quests in all 6 categories",
    icon: "fa-solid fa-check-double",
    category: "quests",
    condition: (stats) => stats.categoriesCompleted && stats.categoriesCompleted.length >= 6
  },
  {
    id: 15,
    title: "Awakening",
    description: "Reach level 5",
    icon: "fa-solid fa-star",
    category: "level",
    condition: (stats) => stats.level >= 5
  },
  {
    id: 16,
    title: "Ascendant",
    description: "Reach level 25",
    icon: "fa-solid fa-arrow-up",
    category: "level",
    condition: (stats) => stats.level >= 25
  },
  {
    id: 17,
    title: "Transcendent",
    description: "Reach level 50",
    icon: "fa-solid fa-crown",
    category: "level",
    condition: (stats) => stats.level >= 50
  },
  {
    id: 18,
    title: "Godlike",
    description: "Reach level 100",
    icon: "fa-solid fa-star",
    category: "level",
    condition: (stats) => stats.level >= 100
  },
  {
    id: 19,
    title: "Well-Rounded",
    description: "Get all stats to level 10",
    icon: "fa-solid fa-scale-balanced",
    category: "stats",
    condition: (stats) => Object.keys(statsElems).every(stat => stats[stat] >= 10)
  },
  {
    id: 20,
    title: "Elite",
    description: "Get any stat to level 25",
    icon: "fa-solid fa-bolt",
    category: "stats",
    condition: (stats) => Object.keys(statsElems).some(stat => stats[stat] >= 25)
  },
  {
    id: 21,
    title: "Peak Performance",
    description: "Get any stat to level 50",
    icon: "fa-solid fa-star",
    category: "stats",
    condition: (stats) => Object.keys(statsElems).some(stat => stats[stat] >= 50)
  },
  {
    id: 22,
    title: "Resilient",
    description: "Maintain a 14-day streak",
    icon: "fa-solid fa-calendar-check",
    category: "streak",
    condition: (stats) => stats.currentStreak >= 14
  },
  {
    id: 23,
    title: "Legendary Streak",
    description: "Maintain a 100-day streak",
    icon: "fa-solid fa-fire",
    category: "streak",
    condition: (stats) => stats.currentStreak >= 100
  },
  {
    id: 24,
    title: "Immortal Will",
    description: "Maintain a 365-day streak",
    icon: "fa-regular fa-snowflake",
    category: "streak",
    condition: (stats) => stats.currentStreak >= 365
  },
  {
    id: 25,
    title: "Focused",
    description: "Complete 1 pomodoro session",
    icon: "fa-solid fa-clock",
    category: "pomodoro",
    condition: (stats) => stats.pomodoroCompleted >= 1
  },
  {
    id: 26,
    title: "Pomodoro Pro",
    description: "Complete 25 pomodoro sessions",
    icon: "fa-solid fa-clock",
    category: "pomodoro",
    condition: (stats) => stats.pomodoroCompleted >= 25
  },
  {
    id: 27,
    title: "Time Lord",
    description: "Complete 100 pomodoro sessions",
    icon: "fa-solid fa-clock",
    category: "pomodoro",
    condition: (stats) => stats.pomodoroCompleted >= 100
  },
  {
    id: 28,
    title: "Rising Star",
    description: "Earn 1,000 total XP from quests",
    icon: "fa-solid fa-star",
    category: "quests",
    condition: (stats) => stats.totalXpEarned >= 1000
  },
  {
    id: 29,
    title: "XP Collector",
    description: "Earn 10,000 total XP from quests",
    icon: "fa-solid fa-star",
    category: "quests",
    condition: (stats) => stats.totalXpEarned >= 10000
  },
  {
    id: 30,
    title: "XP Hoarder",
    description: "Earn 100,000 total XP from quests",
    icon: "fa-solid fa-star",
    category: "quests",
    condition: (stats) => stats.totalXpEarned >= 100000
  },
  {
    id: 31,
    title: "Hard Worker",
    description: "Complete 1 Hard quest",
    icon: "fa-solid fa-hammer",
    category: "quests",
    condition: (stats) => stats.hardQuestsCompleted >= 1
  },
  {
    id: 32,
    title: "Hardcore",
    description: "Complete 50 Hard quests",
    icon: "fa-solid fa-hammer",
    category: "quests",
    condition: (stats) => stats.hardQuestsCompleted >= 50
  },
  {
    id: 33,
    title: "Easy Does It",
    description: "Complete 100 Easy quests",
    icon: "fa-solid fa-feather",
    category: "quests",
    condition: (stats) => stats.easyQuestsCompleted >= 100
  },
  {
    id: 34,
    title: "Diverse Training",
    description: "Complete quests for all 6 stats",
    icon: "fa-solid fa-dumbbell",
    category: "quests",
    condition: (stats) => stats.statsCompleted && stats.statsCompleted.length >= 6
  },
  {
    id: 35,
    title: "Balanced Effort",
    description: "Complete at least 1 quest of each difficulty",
    icon: "fa-solid fa-scale-balanced",
    category: "quests",
    condition: (stats) => (stats.easyQuestsCompleted >= 1 && stats.mediumQuestsCompleted >= 1 && stats.hardQuestsCompleted >= 1)
  },
  {
    id: 36,
    title: "Soul Feeder",
    description: "Complete a quest in the spiritual category — feed your soul, not the scroll",
    icon: "fa-solid fa-hand-sparkles",
    category: "quests",
    condition: (stats) => stats.categoriesCompleted && stats.categoriesCompleted.includes('spiritual')
  },
  {
    id: 37,
    title: "Mind Over Scroll",
    description: "Get willpower to level 3 — resist the infinite scroll",
    icon: "fa-solid fa-brain",
    category: "stats",
    condition: (stats) => (stats.willpower || 0) >= 3
  },
  {
    id: 38,
    title: "Content Curator",
    description: "Get intelligence to level 5 — choose educational over mindless",
    icon: "fa-solid fa-graduation-cap",
    category: "stats",
    condition: (stats) => (stats.intelligence || 0) >= 5
  },
  {
    id: 39,
    title: "Digital Minimalist",
    description: "Complete quests in both personal and spiritual categories",
    icon: "fa-solid fa-mobile-screen-button",
    category: "quests",
    condition: (stats) => stats.categoriesCompleted && stats.categoriesCompleted.includes('spiritual') && stats.categoriesCompleted.includes('personal')
  },
  {
    id: 40,
    title: "Deep Focus",
    description: "Get discipline to level 7 — replace distraction with devotion",
    icon: "fa-solid fa-bullseye",
    category: "stats",
    condition: (stats) => (stats.discipline || 0) >= 7
  }
];

let currentLevel = 0;
let currentXP = 0;

// Add these variables for spider chart tracking
let previousStats = null;
let currentStats = null;
let statIncreases = { strength: 0, agility: 0, intelligence: 0, stamina: 0, willpower: 0, discipline: 0 };
let statHistory = [];
let currentChartView = 'current'; // 'current', 'history', or 'compare'
let timeRange = 'week'; // 'week', 'month', or 'alltime'
let achievementCategory = 'all';
let achievementStatus = 'all';

// Track stat changes for relative increase display
function trackStatIncrease(stat, oldValue, newValue) {
  if (oldValue !== undefined && newValue > oldValue) {
    statIncreases[stat] = newValue - oldValue;
    // Reset increase after 3 seconds
    setTimeout(() => {
      statIncreases[stat] = 0;
      // Re-render to remove increase indicator
      if (typeof updateMainStatsDisplay === 'function') updateMainStatsDisplay();
    }, 3000);
  }
}

// Helper to update a single stat's progress bar
function updateStatProgressBar(stat) {
  const mainBar = document.getElementById(`${stat}-progress-main`);
  const progressText = document.getElementById(`${stat}-progress-text`);
  if (mainBar && currentStats) {
    // Use bucket size (100) so each point = 1% of bar (visible movement)
    const bucketSize = 100;
    const progressInBucket = currentStats[stat] % bucketSize;
    // Show progress within current bucket as percentage
    const pct = Math.min(100, Math.round((progressInBucket / bucketSize) * 100));
    mainBar.style.width = pct + '%';
    
    if (statIncreases[stat] > 0) {
      mainBar.classList.add('stat-increase');
      void mainBar.offsetWidth; // Force reflow
    } else {
      mainBar.classList.remove('stat-increase');
    }
  }
  if (progressText && currentStats) {
    const increaseText = statIncreases[stat] > 0 ? ` (+${statIncreases[stat]})` : '';
    // Show: current/total [bucket progress]
    const bucketSize = 100;
    const currentBucket = Math.floor(currentStats[stat] / bucketSize) + 1;
    progressText.textContent = `${currentStats[stat]}/${MAX_STAT} [${currentBucket}00s]${increaseText}`;
  }
}

const statsElems = {
  strength: document.getElementById("strength"),
  agility: document.getElementById("agility"),
  intelligence: document.getElementById("intelligence"),
  stamina: document.getElementById("stamina"),
  willpower: document.getElementById("willpower"),
  discipline: document.getElementById("discipline"),
};
const levelElem = document.getElementById("current-level");
const xpElem = document.getElementById("current-xp");
const xpProgressElem = document.getElementById("xp-progress");
const questsElem = document.getElementById("quests");
const levelUpBtn = document.getElementById("level-up-btn");
// Open quest creation modal when Add New Quest is clicked
document.addEventListener('click', (e) => {
  if (e.target.closest('#add-quest-btn')) {
    openQuestModal();
  }
});

// Wire up toggle listeners for the quest modal once
const questModalPanel = document.querySelector('#quest-modal .quest-edit-panel');
if (questModalPanel) setupEditPanelListeners(questModalPanel);

function openQuestModal() {
  const modal = document.getElementById('quest-modal');
  if (modal) modal.style.display = 'flex';
  document.getElementById('modal-overlay')?.classList.add('show');
}

function closeQuestModal() {
  const modal = document.getElementById('quest-modal');
  if (modal) modal.style.display = 'none';
  document.getElementById('modal-overlay')?.classList.remove('show');
}

function saveQuestFromModal() {
  const title = document.getElementById('quest-modal-title').value.trim();
  if (!title) { showNotification('Enter a quest title', 'error'); return; }
  const category = document.querySelector('#quest-modal .edit-category-group .tag-button.selected')?.dataset.category || 'Personal';
  const difficulty = document.querySelector('#quest-modal .edit-diff-group .tag-button.selected')?.dataset.difficulty || 'Medium';
  const xp = parseInt(document.getElementById('quest-modal-xp').value) || 2;
  const stat = document.querySelector('#quest-modal .edit-stat-group .tag-button.selected')?.dataset.stat || 'discipline';
  const dueDate = document.getElementById('quest-modal-due').value || null;
  const comment = document.getElementById('quest-modal-comment').value.trim() || '';
  const isPinned = document.querySelector('#quest-modal .pin-comment')?.checked || !!comment;

  const newQuest = {
    title,
    difficulty,
    xp,
    stat,
    category,
    comment,
    isPinned,
    dueDate,
    status: 'inbox',
    createdAt: new Date()
  };

  db.quests.where('title').equalsIgnoreCase(title).first().then(function(existing) {
    if (existing) {
      showNotification('A quest with this title already exists', 'error');
      return Promise.reject('DUPLICATE');
    }
    return db.quests.add(newQuest);
  }).then(function() {
    closeQuestModal();
    document.getElementById('quest-modal-title').value = '';
    document.getElementById('quest-modal-comment').value = '';
    document.getElementById('quest-modal-due').value = '';
    document.querySelectorAll('#quest-modal .tag-button.selected').forEach(b => b.classList.remove('selected'));
    document.querySelector('#quest-modal .edit-category-group .tag-button[data-category="Work"]')?.classList.add('selected');
    document.querySelector('#quest-modal .edit-diff-group .tag-button[data-difficulty="Medium"]')?.classList.add('selected');
    document.querySelector('#quest-modal .edit-stat-group .tag-button[data-stat="discipline"]')?.classList.add('selected');
    document.getElementById('quest-modal-xp').value = '2';
    const pinCheck = document.querySelector('#quest-modal .pin-comment');
    if (pinCheck) pinCheck.checked = false;
    // Re-render from DB to pick up the new quest element
    refreshData();
    showNotification('New quest added', 'info');
  }).catch(e => {
    if (e === 'DUPLICATE') return;
    console.error('Error saving quest:', e);
    showNotification('Failed to save quest', 'error');
  });
}
const usernameDisplay = document.getElementById("username-display");
const xpRequiredElem = document.getElementById("xp-required");

const settingsIcon = document.getElementById("settings-icon");
const settingsModal = document.getElementById("settings-modal");
const modalClose = document.getElementById("modal-close");
const saveBtn = document.getElementById("save-btn");
const restartBtn = document.getElementById("restart-btn");
const resetBtn = document.getElementById("reset-btn");
const editUsernameBtn = document.getElementById("edit-username-btn");
const tourGuideBtn = document.getElementById("tour-guide-btn");
const voiceSelect = document.getElementById("voice-select");

// Sync voice select dropdown from playerStats/localStorage
async function syncVoiceSelect() {
  if (!voiceSelect) return;
  try {
    const pStats = await db.playerStats.toArray();
    if (pStats.length > 0 && pStats[0].voicePref) {
      voiceSelect.value = pStats[0].voicePref;
      localStorage.setItem('voicePref', pStats[0].voicePref);
    } else {
      voiceSelect.value = localStorage.getItem('voicePref') || 'female';
    }
  } catch (e) {
    voiceSelect.value = localStorage.getItem('voicePref') || 'female';
  }
}

// Save voice preference when the select changes
async function onVoiceChange() {
  if (!voiceSelect) return;
  const newVoice = voiceSelect.value;
  try { localStorage.setItem('voicePref', newVoice); } catch(_) {}
  try {
    const pStats = await db.playerStats.toArray();
    if (pStats.length > 0) {
      pStats[0].voicePref = newVoice;
      await db.playerStats.put(pStats[0]);
    }
  } catch (e) {
    console.warn('Failed to persist voice preference:', e);
  }
}

// --- Google Auth ---
let googleSignInBtn = null;
let googleUserInfo = null;
let googleSignOutBtn = null;

// Set refs on DOMContentLoaded since these elements may be added dynamically
function cacheAuthElements() {
  googleSignInBtn = document.getElementById('google-signin-btn-container');
  googleUserInfo = document.getElementById('google-user-info');
  googleSignOutBtn = document.getElementById('google-signout-btn');
}

function updateAuthUI() {
  if (!googleSignInBtn) cacheAuthElements();
  if (currentUser) {
    // Update header avatar with Google profile picture
    const avatar = document.querySelector('.avatar');
    if (avatar) {
      avatar.innerHTML = '<img src="' + escapeHtml(currentUser.picture) + '" alt="Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">';
    }
    // Update username
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) usernameDisplay.textContent = escapeHtml(currentUser.name);
    // Show sign-out UI in settings
    if (googleSignInBtn) googleSignInBtn.style.display = 'none';
    if (googleUserInfo) {
      googleUserInfo.style.display = 'flex';
      googleUserInfo.innerHTML =
        '<img src="' + escapeHtml(currentUser.picture) + '" alt="" class="google-avatar">' +
        '<div class="google-user-details">' +
          '<span class="google-user-name">' + escapeHtml(currentUser.name) + '</span>' +
          '<span class="google-user-email">' + escapeHtml(currentUser.email) + '</span>' +
        '</div>';
    }
    if (googleSignOutBtn) googleSignOutBtn.style.display = 'block';
  } else {
    const avatar = document.querySelector('.avatar');
    if (avatar) avatar.innerHTML = '<i class="fas fa-user"></i>';
    if (googleSignInBtn) googleSignInBtn.style.display = 'block';
    if (googleUserInfo) {
      googleUserInfo.style.display = 'none';
      googleUserInfo.innerHTML = '';
    }
    if (googleSignOutBtn) googleSignOutBtn.style.display = 'none';
  }
}

// Called by GIS when user signs in with Google
window.handleGoogleCredential = function(response) {
  try {
    const payload = JSON.parse(atob(response.credential.split('.')[1]));
    const user = {
      sub: payload.sub,
      name: payload.name || 'Player',
      email: payload.email || '',
      picture: payload.picture || ''
    };
    saveAuth(user);
    location.reload();
  } catch(e) {
    console.error('Google sign-in error:', e);
    showNotification('Google sign-in failed', 'error');
  }
};

function signOut() {
  if (window.google && google.accounts && google.accounts.id) {
    google.accounts.id.disableAutoSelect();
  }
  clearAuth();
  location.reload();
}

function initGIS() {
  if (!GOOGLE_CLIENT_ID || GOOGLE_CLIENT_ID === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com') {
    console.warn('Google Login: Set GOOGLE_CLIENT_ID in app.js to enable sign-in.');
    return;
  }
  if (currentUser) {
    // Already signed in — just render the button in settings so they can switch accounts
  }
  if (window.google && google.accounts) {
    google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: 'handleGoogleCredential',
      cancel_on_tap_outside: false
    });
    const btnContainer = document.getElementById('google-signin-btn-container');
    if (btnContainer && btnContainer.children.length === 0) {
      google.accounts.id.renderButton(btnContainer, {
        theme: 'outline',
        size: 'large',
        width: 250,
        text: 'signin_with'
      });
    }
    // Also prompt auto-login if not currently signed in
    if (!currentUser) {
      google.accounts.id.prompt();
    }
    return;
  }
  // GIS library not loaded yet — retry on next render
  setTimeout(initGIS, 500);
}

// Settings modal functionality - wrapped in DOMContentLoaded for safety
function initSettingsHandlers() {
  if (settingsIcon) {
    settingsIcon.addEventListener("click", () => {
      settingsModal.classList.add("show");
      document.getElementById("modal-overlay").classList.add("show");
      document.body.style.overflow = "hidden";
      syncVoiceSelect();
      updateAuthUI();
      // Re-init GIS when modal opens (container may have been hidden)
      if (!currentUser) initGIS();
    });
  }
  if (voiceSelect) {
    voiceSelect.addEventListener('change', onVoiceChange);
  }
}


// Streak references
const currentStreakElem = document.getElementById("current-streak");
const characterTitleElem = document.getElementById("character-title");
const characterTitleStatsElem = document.getElementById("character-title-stats");
const streakTitleElem = document.getElementById("streak-title");
const streakDayElems = document.querySelectorAll(".streak-day");

const streakTitles = [
  { days: 0, title: "Mortal" },
  { days: 1, title: "Qi Condensation (练气期)" },
  { days: 3, title: "Quasi Apprentice" },
  { days: 5, title: "Foundation Establishment (筑基期)" },
  { days: 7, title: "Apprentice" },
  { days: 10, title: "Core Formation / Golden Core (金丹期)" },
  { days: 14, title: "Quasi Student" },
  { days: 18, title: "Nascent Soul (元婴期)" },
  { days: 21, title: "Student" },
  { days: 25, title: "Spirit Transformation / Soul Formation (化神期)" },
  { days: 30, title: "Quasi Master" },
  { days: 45, title: "Void Refinement (炼虚期)" },
  { days: 60, title: "Master" },
  { days: 75, title: "Body Integration (合体期)" },
  { days: 90, title: "Quasi Grand Master" },
  { days: 105, title: "Mahayana (大乘期)" },
  { days: 120, title: "Grand Master" },
  { days: 135, title: "Tribulation Transcendence (渡劫期)" },
  { days: 150, title: "Quasi Great Grand Master" },
  { days: 180, title: "Great Grand Master" },
  { days: 210, title: "True Immortal (真仙)" },
  { days: 250, title: "Golden Immortal (金仙)" },
  { days: 280, title: "Taiyi Jade Immortal (太乙玉仙)" },
  { days: 310, title: "Daluo Golden Immortal (大罗金仙)" },
  { days: 330, title: "Immortal" },
  { days: 365, title: "Dao Ancestor (道祖)" },
];

const levelTitles = [
  { level: 1, title: "E-Rank Hunter" },
  { level: 5, title: "D-Rank Hunter" },
  { level: 10, title: "C-Rank Hunter" },
  { level: 20, title: "B-Rank Hunter" },
  { level: 35, title: "A-Rank Hunter" },
  { level: 50, title: "S-Rank Hunter" },
  { level: 75, title: "National Level Hunter" },
  { level: 100, title: "Monarch" },
  { level: 150, title: "Ruler" },
  { level: 200, title: "Divine Ruler" },
];

function updateCharacterTitle() {
  let title = "Mortal";
  for (const t of levelTitles) {
    if (currentLevel >= t.level) {
      title = t.title;
    }
  }
  characterTitleElem.textContent = title;
  if (characterTitleStatsElem) characterTitleStatsElem.textContent = title;
}

async function updateStreakDisplay() {
  const playerStats = await db.playerStats.toArray();
  if (playerStats.length > 0) {
    const stats = playerStats[0];
    const currentStreak = stats.currentStreak || 0;
    currentStreakElem.textContent = currentStreak;

    let currentTitle = "Mortal";
    for (const level of streakTitles) {
      if (currentStreak >= level.days) {
        currentTitle = level.title;
      }
    }
    streakTitleElem.textContent = `(${currentTitle})`;
    updateCharacterTitle();

    let today = new Date().getDay(); // 0 for Sunday, 1 for Monday, etc.
    // Adjust to match data-day mapping (0 for Monday, 6 for Sunday)
    if (today === 0) { // If today is Sunday
        today = 6; // Map to data-day="6" for Sunday
    } else {
        today = today - 1; // Monday=1 becomes 0, Tuesday=2 becomes 1, etc.
    }

    // Calculate dates for the current week (Mon-Sun)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon...
    // Monday of this week
    const monday = new Date(now);
    monday.setDate(now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    const weekDates = Array.from({length: 7}, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d.getDate();
    });

    streakDayElems.forEach((dayElem, index) => {
      const isToday = parseInt(dayElem.dataset.day) === today;
      dayElem.classList.toggle("active", isToday);

      // Populate day-date span
      const dateSpan = dayElem.querySelector('.day-date');
      if (dateSpan) {
        dateSpan.textContent = weekDates[index];
        dateSpan.classList.toggle('today', isToday);
      }
    });

    // Populate streak details (shown in detailed view)
    try {
      // This week's quests completed
      const weekStart = new Date(monday);
      weekStart.setHours(0,0,0,0);
      const allQuests = await db.quests.toArray();
      const weekQuests = allQuests.filter(q => {
        if (!q.completedAt) return false;
        const cd = new Date(q.completedAt);
        return cd >= weekStart;
      });
      const weekCountEl = document.getElementById('week-quest-count');
      if (weekCountEl) weekCountEl.textContent = weekQuests.length;

      // Best streak
      const bestEl = document.getElementById('best-streak');
      if (bestEl) bestEl.textContent = stats.longestStreak || stats.currentStreak || 0;

      // Total active days (from statHistory)
      const activeEl = document.getElementById('active-days');
      if (activeEl) {
        const totalEntries = await db.statHistory.count();
        activeEl.textContent = totalEntries;
      }
    } catch (e) { /* non-fatal */ }
  }
}


// Quest filter references
const questSearchInput = document.getElementById("quest-search");
const categoryFilter = document.getElementById("category-filter");
const difficultyFilter = document.getElementById("difficulty-filter");
const statFilter = document.getElementById("stat-filter");
const sortBtn = document.getElementById("sort-btn");
const sortOptions = document.getElementById("sort-options");

// Global variable to store current sort criteria
let currentSortBy = 'title'; // Default sort by title
let isStreakMessageShown = false;

// Pomodoro timer references
const minutesElem = document.getElementById("minutes");
const secondsElem = document.getElementById("seconds");
const startTimerBtn = document.getElementById("start-timer");
const pauseTimerBtn = document.getElementById("pause-timer");
const resetTimerBtn = document.getElementById("reset-timer");
const timerModeButtons = document.querySelectorAll(".timer-mode");

// Achievements references
const achievementsGrid = document.getElementById("achievements-grid");
const achievementCountElem = document.getElementById("achievement-count");

function makeSound(src) {
  try {
    return new Howl({ src, preload: false, onloaderror: () => {} });
  } catch (e) {
    return { play: () => {}, stop: () => {} };
  }
}
let audioUnlocked = false;

function unlockAudioOnce() {
  if (audioUnlocked) return;
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    ctx.close();
  } catch(_) {}
  audioUnlocked = true;
}

// Unlock on any user gesture
['click', 'touchstart', 'keydown'].forEach(evt =>
  document.addEventListener(evt, unlockAudioOnce, { once: true })
);

const sounds = {
  complete: makeSound(["sounds/complete.mp3"]),
  levelUp: makeSound(["sounds/level-up.mp3"]),
  achievement: makeSound(["sounds/achievement.mp3"]),
  streakUp: makeSound(["sounds/streak.mp3"]),
  timerComplete: makeSound(["sounds/timer-complete.mp3"]),
  favorite: makeSound(["sounds/favorite.mp3"]),
  itIsTime: makeSound(["it_is_time.mp3"])
};

function calculateXPForNextLevel(level) {
  return Math.floor(10 * Math.pow(1.5, level));
}

async function initializeGame() {
  try {
    const defaultQuests = GLOBAL_DEFAULT_QUESTS;
    const existingQuests = await db.quests.toArray();

  // Populate suggestion pool with ALL default quest titles — grid stays empty for new users
  questSuggestionPool = [...new Set(defaultQuests.map(q => q.title))];

  // Delete ALL existing quests from DB so the dashboard starts fresh
  const allQuestIds = existingQuests.map(q => q.id);
  if (allQuestIds.length > 0) {
    await db.quests.bulkDelete(allQuestIds);
    console.log(`Cleared ${allQuestIds.length} existing quests. All ${defaultQuests.length} defaults moved to suggestions.`);
  }

  // Initialize achievements by ensuring all defined achievements exist in the database
  const existingAchievements = await db.achievements.toArray();

  if (existingAchievements.length === 0) {
    // If no achievements exist in the database, add all default definitions
    const achievementsToInitialAdd = achievementDefinitions.map(({ condition, ...rest }) => ({
      ...rest,
      unlocked: false,
      unlockedAt: null
    }));
    await db.achievements.bulkAdd(achievementsToInitialAdd);
    console.log(`Initially added ${achievementsToInitialAdd.length} achievement definitions.`);
  } else {
    // If achievements already exist, check for new definitions and add them
    const existingAchievementIds = new Set(existingAchievements.map(a => a.id));
    const achievementsToAdd = achievementDefinitions.filter(
      def => !existingAchievementIds.has(def.id)
    ).map(({ condition, ...rest }) => ({
      ...rest,
      unlocked: false,
      unlockedAt: null
    }));

        if (achievementsToAdd.length > 0) {
          await db.achievements.bulkAdd(achievementsToAdd);
          console.log(`Added ${achievementsToAdd.length} new achievement definitions.`);
        }
    
        // Update existing achievements if their definitions change (e.g., description, icon)
        for (const existingAch of existingAchievements) {
          const definition = achievementDefinitions.find(def => def.id === existingAch.id);
          if (definition) {
            let changed = false;
            if (existingAch.title !== definition.title) { existingAch.title = definition.title; changed = true; }
            if (existingAch.description !== definition.description) { existingAch.description = definition.description; changed = true; }
            if (existingAch.icon !== definition.icon) { existingAch.icon = definition.icon; changed = true; }
            if (existingAch.category !== definition.category) { existingAch.category = definition.category; changed = true; }
            
            if (changed) {
              await db.achievements.put(existingAch);
              console.log(`Updated achievement definition for ID: ${existingAch.id}`);
            }
          }
        }
      }
      
  // Initialize player statistics if they don't exist

  // Initialize player statistics if they don't exist
  const playerStats = await db.playerStats.toArray();
  if (playerStats.length === 0) {
    await db.playerStats.add({
      level: 0,
      xp: 0,
      strength: 1,
      agility: 1,
      intelligence: 1,
      stamina: 1,
      willpower: 1,
      discipline: 1,
      lastActive: new Date(),
      consecutiveDays: 0,
      currentStreak: 0,
      longestStreak: 0,
      voicePref: 'female',
      username: "HeavenlyDev|",
      completedQuests: 0,
      categoriesCompleted: [],
      pomodoroCompleted: 0,
      lastStreakCheck: null,
      totalXpEarned: 0,
      hardQuestsCompleted: 0,
      mediumQuestsCompleted: 0,
      easyQuestsCompleted: 0,
      statsCompleted: []
    });
  } else {
    // Update existing player stats with new fields if they're missing
    const stats = playerStats[0];
    if (stats.currentStreak === undefined) { stats.currentStreak = 0; }
    if (stats.longestStreak === undefined) { stats.longestStreak = 0; }
    if (stats.consecutiveDays === undefined) { stats.consecutiveDays = 0; }
    if (stats.completedQuests === undefined) { stats.completedQuests = 0; }
    if (!stats.categoriesCompleted) { stats.categoriesCompleted = []; }
    if (stats.totalXpEarned === undefined) {
      stats.totalXpEarned = 0;
      stats.hardQuestsCompleted = 0;
      stats.mediumQuestsCompleted = 0;
      stats.easyQuestsCompleted = 0;
      stats.statsCompleted = [];
      await db.playerStats.put(stats);
    }
    if (stats.voicePref === undefined) {
      stats.voicePref = 'female';
      await db.playerStats.put(stats);
    }
    if (stats.pomodoroCompleted === undefined) {
      stats.pomodoroCompleted = 0;
      await db.playerStats.put(stats);
    }
  }

  // Load all quests from the database
  const quests = await db.quests.toArray();
  const questsContainer = document.getElementById('quests');
  const emptyState = document.getElementById('quests-empty');
  if (quests.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    const frag = document.createDocumentFragment();
    quests.forEach((quest, i) => {
      const questElement = createQuestElement(quest);
      questElement.style.animationDelay = `${i * 0.05}s`;
      frag.appendChild(questElement);
    });
    questsContainer.appendChild(frag);
    updateQuestsEmptyState();
  }

  // Initialize currentStats for progress bars
  if (playerStats.length > 0) {
    const stats = playerStats[0];
    currentStats = {
      strength: stats.strength,
      agility: stats.agility,
      intelligence: stats.intelligence,
      stamina: stats.stamina,
      willpower: stats.willpower,
      discipline: stats.discipline
    };
    // Initialize stat progress bars
    updateStatDetails();
  }

  // Initialize streak display
  updateStreakDisplay();
  
  // Initialize achievements display
  initializeAchievements();

  // Initialize quest filters
  initializeQuestFilters();

  // Initialize pomodoro timer
  initializePomodoro();

  // Hide the loading spinner after data loads
  document.getElementById("loading-spinner").style.display = "none";

  // Initialize quotes
  initializeQuotes();
  
  // Initialize enhanced UI system
  initializeEnhancedUI();
  
  // Initialize theme settings
  initializeTheme();
  
  // Update main stats display with progress bars
  updateMainStatsDisplay();
  
  // Initialize stats properly
  await initializeStats();
  
  // Migrate existing quests: attach video link comments from SUGGESTION_VIDEO_LINKS
  try {
    const allQuests = await db.quests.toArray();
    const toUpdate = [];
    for (const q of allQuests) {
      const link = SUGGESTION_VIDEO_LINKS[q.title];
      if (link && (!q.comment || !q.comment.trim())) {
        q.comment = link;
        q.isPinned = true;
        toUpdate.push(q);
      }
    }
    if (toUpdate.length > 0) {
      await Promise.all(toUpdate.map(q => db.quests.put(q)));
      console.log(`Attached video link comments to ${toUpdate.length} existing quests.`);
      // Re-apply filters if quests are already displayed
      filterQuests();
    }
  } catch (e) {
    console.warn('Quest comment migration error (non-fatal):', e);
  }

  // Initialize due date reminders
  initializeDueDateReminders();
  } catch (error) {
    console.error("Error during game initialization:", error);
    showErrorOverlay("Game Initialization Error: " + (error.message || error));
  }
}
// Call the initialize function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  initGIS();
  cacheAuthElements();
  updateAuthUI();
  // Wire up sign-out button
  const soBtn = document.getElementById('google-signout-btn');
  if (soBtn) soBtn.addEventListener('click', signOut);
  // Ensure initializeGame is called only once
  initializeGame();
});

async function scheduleDailyReset() {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const msTillMidnight = tomorrow.getTime() - now.getTime();

  setTimeout(async () => {
    isStreakMessageShown = false;
    const unfinishedQuests = document.querySelectorAll(".quest").length;
    if (unfinishedQuests > 0) {
      const playerStats = await db.playerStats.toArray();
      const stats = playerStats[0];
      stats.willpower = Math.max(0, stats.willpower - unfinishedQuests);
      await db.playerStats.put(stats);
      updateStats();
      showNotification(`Lost ${unfinishedQuests} willpower due to unfinished quests.`);
    }
    generateDailyQuests(await db.quests.toArray());
    scheduleDailyReset(); // schedule next midnight
  }, msTillMidnight);
}

scheduleDailyReset();

async function generateDailyQuests(quests) {
  questsElem.innerHTML = "";
  const dailyQuests = getRandomQuests(quests, 31);
  const frag = document.createDocumentFragment();
  dailyQuests.forEach((quest) => {
    const questElem = createQuestElement(quest);
    frag.appendChild(questElem);
  });
  questsElem.appendChild(frag);
  updateQuestsEmptyState();
}

function createQuestElement(quest, animate = true) {
  const questElem = document.createElement("div");
  questElem.className = "quest";
  questElem.dataset.questId = quest.id; // Store quest ID for reference
  questElem.dataset.category = quest.category || "personal"; // Default to personal if no category
  questElem.dataset.difficulty = quest.difficulty;
  questElem.dataset.stat = quest.stat;
  questElem.dataset.xp = quest.xp;
  questElem.dataset.title = quest.title;
  if (quest.dueDate) {
    questElem.dataset.dueDate = quest.dueDate;
  }

  const isDefault = GLOBAL_DEFAULT_QUESTS.some(
    (defaultQuest) => defaultQuest.title === quest.title
  );

  let countdownHTML = '';
  if (quest.dueDate) {
    const dueDate = quest.dueDate.includes('T') ? new Date(quest.dueDate) : new Date(quest.dueDate + 'T23:59:59Z');
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) {
      countdownHTML = `<span class="quest-countdown">${diffDays} days left</span>`;
    } else if (diffDays === 0) {
        countdownHTML = `<span class="quest-countdown">Due today</span>`;
    } else {
      countdownHTML = `<span class="quest-countdown overdue">${Math.abs(diffDays)} days overdue</span>`;
    }
  }

  questElem.innerHTML = `
    <div class="quest-content">
      <div class="quest-header">
        <span class="quest-status status-${quest.status || 'inbox'} quest-selector" data-quest-id="${quest.id}" onclick="event.stopPropagation(); toggleQuestSelect(${quest.id},this)"></span>
        <span class="quest-check" onclick="event.stopPropagation(); completeQuest(${quest.xp}, '${quest.stat}', this.closest('.quest'))">
          <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z" fill="#4a90e2"></path>
          </svg>
        </span>
        <span class="quest-title">${escapeHtml(quest.title)}</span>
        <button class="delete-quest-btn" onclick="event.stopPropagation(); deleteQuest(${quest.id}, this.closest('.quest'))">
          <i class="fas fa-trash"></i>
        </button>
        <button class="default-quest-btn ${ isDefault ? "favorited" : "" }" onclick="event.stopPropagation(); toggleDefaultQuest('${escapeJsStr(quest.title)}', this)">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <div class="quest-tags">
        <span class="quest-difficulty difficulty-${(quest.difficulty || 'medium').toLowerCase()}">${ quest.difficulty || 'Medium' }</span>
        <span class="quest-xp">${quest.xp || 0} XP</span>
        <span class="quest-stat stat-${quest.stat || 'discipline'}">${quest.stat || 'discipline'}</span>
        <span class="quest-category category-${(quest.category || 'personal').toLowerCase()}">${ quest.category || 'personal' }</span>
        ${countdownHTML}
      </div>
      ${ quest.comment ? `<div class="pinned-comment">${linkify(quest.comment)}</div>` : '' }
    </div>
  `;

  // Add click event listener with proper event handling
  questElem.addEventListener("click", (e) => {
    // Don't trigger edit if clicking controls or if already in edit mode
    if (questElem.classList.contains("quest-edit-panel")) {
      e.stopPropagation();
      return;
    }
    if (e.target.closest(".quest-check")) {
      e.stopPropagation();
      return;
    }
    // .quest-status.quest-selector has inline onclick with stopPropagation
    if (e.target.closest(".quest-status.quest-selector")) {
      return;
    }

    // Don't trigger edit if clicking a link in the pinned comment
    if (e.target.closest(".pinned-comment a")) {
      return;
    }

    // Check if another edit panel is open
    const existingPanel = document.querySelector('.quest-edit-panel');
    if (existingPanel && existingPanel !== questElem) {
      existingPanel.className = 'quest';
      existingPanel.innerHTML = existingPanel.dataset.originalContent;
    }

    openQuestEditPanel(quest, questElem);
  });

  if (animate) {
    questElem.classList.add('quest-enter');
  }

  return questElem;
}

function updateQuestsEmptyState() {
  const container = document.getElementById('quests');
  const empty = document.getElementById('quests-empty');
  if (!container || !empty) return;
  const hasQuests = container.querySelector('.quest:not(.quest-edit-panel)');
  empty.style.display = hasQuests ? 'none' : 'flex';
}

function appendQuestWithAnimation(container, questElem, delay = 0) {
  if (delay) questElem.style.animationDelay = `${delay}s`;
  container.appendChild(questElem);
  updateQuestsEmptyState();
}

async function toggleDefaultQuest(questTitle, heartIcon) {
  const questIndex = GLOBAL_DEFAULT_QUESTS.findIndex(
    (quest) => quest.title === questTitle
  );

  if (questIndex > -1) {
    // It's a default quest, so remove it.
    GLOBAL_DEFAULT_QUESTS.splice(questIndex, 1);
    heartIcon.classList.remove("favorited");
    showNotification("Quest removed from default quests.");
  } else {
    // It's not a default quest, so add it.
    const quest = await db.quests.where("title").equals(questTitle).first();
    if (quest) {
      GLOBAL_DEFAULT_QUESTS.push(quest);
      heartIcon.classList.add("favorited");
      showNotification("Quest added to default quests.");
    }
  }
}

// Maps suggestion titles to YouTube/TikTok links for auto-pinning as comments
const SUGGESTION_VIDEO_LINKS = {
  "30-day digital diet - replace TikTok with learning": "https://www.tiktok.com/@greateryouu",
  "Achieve one significant goal through pure willpower": "https://www.youtube.com/shorts/Kj-ARSlDido",
  "Acknowledge one blessing you usually take for granted": "https://www.youtube.com/shorts/RU-o1i4ggGk",
  "Ask yourself: 'What do I want Allah to say about me?'": "https://www.youtube.com/shorts/FhU73f46zMY",
  "Avoid gossip/backbiting for a full day": "https://www.youtube.com/shorts/jCkTfrDFvls",
  "Complete 10 mins of quiet dhikr": "https://www.youtube.com/shorts/FeZZCJUtROc",
  "Complete 30 days of constant kindness and service": "https://www.youtube.com/shorts/FhU73f46zMY",
  "Complete 30-day consistent Fajr prayer": "https://www.youtube.com/shorts/Whx2YVXfNks",
  "Complete a challenge that tests both body and mind": "https://www.youtube.com/shorts/RM9-QE7zYI0",
  "Complete a full 7-day discipline streak": "https://www.youtube.com/shorts/SJV1M6mwySA",
  "Complete a full life audit across all domains": "https://www.youtube.com/shorts/rGJt5NzLVc4",
  "Complete a full task despite wanting to quit halfway": "https://www.youtube.com/shorts/pzrxDslo65o",
  "Complete morning routine without phone for 7 days": "https://www.youtube.com/shorts/RvFjwZT4MsY",
  "Complete one daily non-negotiable habit": "https://www.youtube.com/shorts/3aZLLZl3utg",
  "Control your tongue — speak only good or stay silent": "https://www.youtube.com/shorts/SbF1sQhK-k4",
  "Cut social media scrolling for 24 hours - replace with worship": "https://www.tiktok.com/@_roadtoallah_",
  "Digital declutter - unfollow 5 wasteful channels": "https://www.tiktok.com/@taophilosophy",
  "Do a digital detox for 24 hours": "https://www.youtube.com/shorts/1D7rDyfztIg",
  "Do a full self-accountability (muhasabah) session": "https://www.youtube.com/shorts/fdc4TLg2yC4",
  "Do one thing that scares you a little": "https://www.youtube.com/shorts/bmlgKIwyn18",
  "Do something uncomfortable every day for a week": "https://www.youtube.com/shorts/Kj-ARSlDido",
  "Fast from one bad habit for 7 days": "https://www.youtube.com/shorts/zsJ4pEjrVmE",
  "Feed your soul - watch one Islamic reminder": "https://www.tiktok.com/@ibadah_inspiration",
  "Finish a 7-day streak of a difficult habit": "https://www.youtube.com/shorts/rGJt5NzLVc4",
  "Finish one task you were about to give up on": "https://www.youtube.com/shorts/LnnXG4efZ7g",
  "Follow one Islamic TikTok channel for daily reminders": "https://www.tiktok.com/@the_quranpage",
  "Forgive someone who wronged you": "https://www.youtube.com/shorts/AOjI4gxwN7w",
  "Give charity secretly (can be small)": "https://www.youtube.com/shorts/4sS-KLrXQH8",
  "Give sincere charity (sadaqah) secretly": "https://www.youtube.com/shorts/4sS-KLrXQH8",
  "Help two parties reconcile a dispute": "https://www.youtube.com/shorts/AOjI4gxwN7w",
  "Identify a lesson learned from a past mistake": "https://www.youtube.com/shorts/K1ROAnt4mQA",
  "Identify and break one limiting belief": "https://www.youtube.com/shorts/-dhYQdC-yV0",
  "Identify and eliminate one worldly distraction from your life": "https://www.youtube.com/shorts/1D7rDyfztIg",
  "Identify your 'why' and write it clearly": "https://www.youtube.com/shorts/rGJt5NzLVc4",
  "Know yourself — identify one blind spot today": "https://www.youtube.com/shorts/qnlPXCmxn9E",
  "Learn one new thing outside your comfort zone": "https://www.youtube.com/shorts/rJ72rTiW_oE",
  "Learn the tafseer of one full surah": "https://www.youtube.com/shorts/yuKwYYUAQD0",
  "Listen more than you speak today": "https://www.youtube.com/shorts/SbF1sQhK-k4",
  "Maintain a gratitude journal for 7 days": "https://www.youtube.com/shorts/Cavb9RvTNe4",
  "Make Dua for someone else secretly": "https://www.youtube.com/shorts/4sS-KLrXQH8",
  "Make istighfar 100 times": "https://www.youtube.com/shorts/FeZZCJUtROc",
  "Make peace between two people who are upset": "https://www.youtube.com/shorts/AOjI4gxwN7w",
  "Make sincere Dua in sujood": "https://www.youtube.com/shorts/5xM0bTbxD90",
  "Master a completely new skill in 30 days": "https://www.youtube.com/shorts/SoVAMFYPA0Y",
  "Memorize a new short surah with meaning": "https://www.youtube.com/shorts/aHM41HiQ6fA",
  "Plan your ideal life with the Hereafter in mind": "https://www.youtube.com/shorts/H1y52_9sP7s",
  "Practice the art of strategic patience": "https://www.youtube.com/shorts/bGIw4ztC1rg",
  "Pray 5 daily salah on time": "https://www.youtube.com/shorts/Whx2YVXfNks",
  "Pray Tahajjud (night prayer)": "https://www.youtube.com/shorts/RGPutpWNseQ",
  "Pray Tahajjud nightly for 30 days": "https://www.youtube.com/shorts/Nfpn2C-4bLE",
  "Put your trust in Allah for one worry": "https://www.youtube.com/shorts/5xM0bTbxD90",
  "Read 20 pages of a self-development book": "https://www.youtube.com/shorts/unom3_-SyHk",
  "Read Quran 59:18 — let every soul look to what it sent forth": "https://www.youtube.com/shorts/OLI7TWyLAyQ",
  "Read Quran with meaning for 5 mins": "https://www.youtube.com/shorts/yuKwYYUAQD0",
  "Read and reflect on the 99 Names in 1 week": "https://www.youtube.com/shorts/H1y52_9sP7s",
  "Read one of the 99 Names and reflect on it": "https://www.youtube.com/shorts/AOjI4gxwN7w",
  "Recite Ayat-ul-Kursi with reflection": "https://www.youtube.com/shorts/Dwi2PjiOgpQ",
  "Recite surah Al-Asr and reflect on time": "https://www.youtube.com/shorts/Cavb9RvTNe4",
  "Reflect deeply on purpose every day for 30 days": "https://www.youtube.com/shorts/bGIw4ztC1rg",
  "Reflect on death for 5 mins": "https://www.youtube.com/shorts/dKegzBVrQu8",
  "Reflect on the purpose of your existence for 15 mins": "https://www.youtube.com/shorts/Nfpn2C-4bLE",
  "Reflect on the question 'Why am I here?' for 5 mins": "https://www.youtube.com/shorts/Nfpn2C-4bLE",
  "Review your TikTok feed for wasteful time spent": "https://www.tiktok.com/@mindobserver1",
  "Review your social media content diet": "https://www.tiktok.com/@zenfis_",
  "Say Alhamdulillah genuinely 100 times": "https://www.youtube.com/shorts/5zSyk3aHQBA",
  "Send salawat upon the Prophet (PBUH) 10 times": "https://www.youtube.com/shorts/RGPutpWNseQ",
  "Stand firm on a principle despite pressure": "https://www.youtube.com/shorts/lscIoWK_sFU",
  "Stand up against an injustice you witness": "https://www.youtube.com/shorts/lscIoWK_sFU",
  "Study a full Surah with 3 different Tafseer sources": "https://www.youtube.com/watch?v=odr9Q_OuJQQ",
  "Study tafseer of 5 full surahs from different Juz": "https://www.youtube.com/watch?v=odr9Q_OuJQQ",
  "Study the story of a prophet from the Quran": "https://www.youtube.com/shorts/gAJDUPZHNSk",
  "Take responsibility for everything in your life": "https://www.youtube.com/shorts/OLI7TWyLAyQ",
  "Transform one major area of life to align with your purpose": "https://www.youtube.com/shorts/gAJDUPZHNSk",
  "Wake up at Fajr every day for 7 days": "https://www.youtube.com/shorts/Whx2YVXfNks",
  "Wake up early and work on your hardest task first": "https://www.youtube.com/shorts/8_SvwBgrC6I",
  "Watch one Islamic reminder on TikTok": "https://www.tiktok.com/@ibadah_inspiration",
  "Watch one educational TikTok daily": "https://www.tiktok.com/@akademiakmal",
  "Write 3 things you're grateful for today": "https://www.youtube.com/shorts/5zSyk3aHQBA",
  "Write a 500-word reflection on life's purpose": "https://www.youtube.com/shorts/tsR5dvTi1qU",
  "Write a comprehensive life plan aligned with Allah's pleasure": "https://www.youtube.com/shorts/fdc4TLg2yC4",
  "Write a letter to your future self about your purpose": "https://www.youtube.com/shorts/zsJ4pEjrVmE",
  "Write a review of your progress over the last month": "https://www.youtube.com/shorts/Kj-ARSlDido",

};

function generateSuggestedQuests(stat, difficulty, category) {
  const suggestions = {
    strength: {
      Easy: ["Do 10 push-ups", "Do 20 squats", "Finish one task you were about to give up on", "Push through 5 more minutes of a difficult task", "Complete one small thing despite not feeling like it", "Complete a task without complaining about it"],
      Medium: ["Complete 3 sets of 15 push-ups", "Do 30 burpees", "Complete a workout when you really didn't want to", "Complete a full task despite wanting to quit halfway"],
      Hard: ["Do 100 push-ups throughout the day", "Complete a 30-minute bodyweight strength routine", "Do a 300m run", "Complete a challenge that tests both body and mind", "Achieve one significant goal through pure willpower"],
    },
    agility: {
      Easy: ["Do 50 jumping jacks", "Practice quick feet drills for 5 minutes", "Practice adaptability"],
      Medium: ["Complete a 15-minute HIIT workout", "Do 100 mountain climbers"],
      Hard: ["Complete a 30-minute intense agility drill session", "Do 200 high knees"],
    },
    stamina: {
      Easy: ["Jog in place for 10 minutes", "Do 50 jumping jacks", "Spend 5 mins observing the sky/clouds", "Do a task that's difficult for 10 mins without stopping", "Visit a sick person or check on the elderly"],
      Medium: ["Complete a 20-minute home cardio workout", "Do 100 jump ropes", "Wake up early and work on your hardest task first", "Volunteer your time for community service"],
      Hard: ["Complete a 45-minute high-intensity cardio session", "Do a 1-hour indoor cycling session", "Complete a challenge that pushes you to your limit", "Pray Tahajjud nightly for 30 days"],
    },
    intelligence: {
      Easy: ["Read Quran translation for 5 mins with reflection", "Journal one insight from today", "Practice 10 mins of silent reflection", "Observe nature for 10 mins — find one sign", "Identify a lesson learned from a past mistake", "Write down 3 things you're curious about today", "Know yourself — identify one blind spot today", "Learn one new thing outside your comfort zone", "Watch a 10-min educational video on a new subject", "Write down one area where you can improve today", "Practice a new word in Arabic or Yoruba", "Read for 15 mins on a topic you know nothing about", "Read one story of someone who overcame adversity", "Read Quran with meaning for 5 mins", "Recite Ayat-ul-Kursi with reflection", "Read one of the 99 Names and reflect on it", "Read one page from Reminders file", "Reflect on the creation of the heavens and earth", "Read the meaning of Al-Fatihah deeply", "Reflect on Quran 2:286 — Allah does not burden a soul", "Share knowledge that benefits someone", "Reflect on the question 'Why am I here?' for 5 mins", "Reflect on death for 5 mins", "Recite surah Al-Asr and reflect on time", "Reflect on one of Allah's signs in nature", "Read Quran 59:18 — let every soul look to what it sent forth"],
      Medium: ["Reflect on the purpose of your existence for 15 mins", "Study one of the 99 Names deeply", "Draw wisdom from a failure — write the lesson", "Complete a 7-day learning streak on one topic", "Read 20 pages of a self-development book", "Take an online course module and pass its quiz", "Teach someone something you learned recently", "Complete a small project using a new skill", "Write a review of your progress over the last month", "Master one area of your craft deeply", "Identify your 'why' and write it clearly", "Read and reflect on the 99 Names in 1 week", "Learn the tafseer of one full surah", "Study the story of a prophet from the Quran", "Memorize 10 new ayahs with meaning", "Complete a full Juz with translation", "Memorize a new short surah with meaning", "Write a personal mission statement based on your purpose", "Do a full self-accountability (muhasabah) session", "Read and reflect on Surah Al-Mulk (The Sovereignty)", "Plan your ideal life with the Hereafter in mind", "Study the descriptions of Paradise and reflect", "Write a letter to your future self about your purpose"],
      Hard: ["Study a full Surah with 3 different Tafseer sources", "Write a 500-word reflection on life's purpose", "Master a completely new skill in 30 days", "Complete a 30-day growth challenge", "Design and execute a 30-day learning plan independently", "Complete Quran khatm with translation", "Complete full hifdh of Juz Amma (last Juz)", "Study tafseer of 5 full surahs from different Juz", "Complete a full life audit across all domains", "Reflect deeply on purpose every day for 30 days", "Write a comprehensive life plan aligned with Allah's pleasure"],
    },
    willpower: {
      Easy: ["Meditate for 10 minutes", "Resist a small temptation for a day", "Feed your soul - watch one Islamic reminder", "Practice simplicity in one decision today", "Replace 'I can't' with 'I can't yet'", "Do one thing that scares you a little", "Do something for 5 mins that you're bad at", "Finish one task you were about to give up on", "Push through 5 more minutes of a difficult task", "Write down 'Why I won't quit'", "Say 'I will try again' after a failure today", "Respond to a setback with 'I'll try again tomorrow'", "Acknowledge a difficulty, then take one step anyway", "Resist one unnecessary impulse today", "Practice a small act of self-denial", "Choose what you need over what you want", "Practice 'Jihad of silence' for 1 hour", "Stand up for what's right in a small matter", "Identify one thing you can control and take action", "Practice stillness and silence for 5 mins", "Make a decision decisively without overthinking", "Refuse to take offense today", "Help someone with no expectation of return", "Pray 5 daily salah on time", "Make sincere Dua in sujood", "Complete 10 mins of quiet dhikr", "Make istighfar 100 times", "Pray 2 rakats of salah with full khushu", "Send salawat upon the Prophet (PBUH) 10 times", "Make Dua for someone else secretly", "Complete morning and evening adhkar", "Write 3 things you're grateful for today", "Say Alhamdulillah genuinely 100 times", "Acknowledge one blessing you usually take for granted", "Practice contentment with what you have today", "Put your trust in Allah for one worry", "Speak the truth even if it's against yourself", "Avoid gossip/backbiting for a full day", "Respond to an insult with peace", "Help someone without being asked", "Feed someone or contribute to feeding", "Give charity secretly (can be small)", "Be merciful to someone weaker than you", "Ask yourself: 'What do I want Allah to say about me?'"],
      Medium: ["Fast for 16 hours", "Take a cold shower for a week", "Identify and break one limiting belief", "Learn from a criticism without getting defensive", "Complete a full task despite wanting to quit halfway", "Do something uncomfortable every day for a week", "Persist through a difficult conversation without backing down", "Fast from one bad habit for 7 days", "Practice emotional self-control in a triggering situation", "Say no to something you want but don't need", "Practice the art of strategic patience", "Stand firm on a principle despite pressure", "Take responsibility for everything in your life", "Pray Tahajjud (night prayer)", "Make sincere tawbah (repentance) from a specific sin", "Practice tawakkul on a difficult matter", "Give sincere charity (sadaqah) secretly", "Go a full day without complaining about anything", "Be just even toward someone you dislike", "Stand up against an injustice you witness", "Practice graciousness in a difficult situation", "Help an orphan or widow practically", "Perform an act of hidden charity daily for 7 days", "Forgive someone who wronged you", "Identify and eliminate one worldly distraction from your life", "Maintain a gratitude journal for 7 days"],
      Hard: ["Complete a 72-hour fast", "Maintain a strict diet for a month", "Digital Sabbath - no short videos for 24h", "Complete a 30-day grit challenge", "Achieve a goal that took 3+ months of consistent effort", "Complete a 30-day no-complaint challenge", "Achieve one significant goal through pure willpower", "Mentor someone to achieve their goal", "Maintain perfect gratitude for 30 days (no complaints)", "Complete 30 days of constant kindness and service", "Transform one major area of life to align with your purpose"],
    },
    discipline: {
      Easy: ["Wake up 30 minutes earlier than usual", "Stick to a daily to-do list", "Do the hardest thing on your list first", "Resist one unnecessary impulse today", "Complete one daily non-negotiable habit", "Practice a small act of self-denial", "Make your bed immediately after waking", "Choose what you need over what you want", "Complete a task without complaining about it", "Control your tongue — speak only good or stay silent", "Wake up at the same time as planned", "Avoid distractions for 25 mins (Pomodoro)", "Practice 'Jihad of silence' for 1 hour", "Speak truthfully even when it's easier not to", "Do the right thing when no one is watching", "Greet someone with a better greeting", "Practice humility in walking and speaking", "Return a trust/borrowed item today", "Keep a promise you made", "Help someone without being asked", "Smile at someone — it's charity", "Give a sincere compliment today", "Be kind to a neighbor today", "Speak kindly to your parents today", "Visit or call a family member just to check on them", "Listen more than you speak today"],
      Medium: ["Follow a strict study/work schedule for a week", "Practice a skill daily for 30 days", "Complete a full 7-day discipline streak", "Wake up at Fajr every day for 7 days", "Fast from one bad habit for 7 days", "Complete morning routine without phone for 7 days", "Do a digital detox for 24 hours", "Say no to something you want but don't need", "Surround yourself with people who uplift you", "Help two parties reconcile a dispute", "Keep all promises for 7 days straight", "Complete a 7-day discipline streak", "Make peace between two people who are upset", "Treat all people with equal dignity for a week", "Finish a 7-day streak of a difficult habit"],
      Hard: ["Maintain a rigorous daily routine for a month", "Complete a challenging long-term project", "Complete 30-day discipline challenge", "Master a difficult skill through daily practice for 30 days", "Complete a 30-day no-complaint challenge", "Establish a recurring sadaqah (ongoing charity)"],
    },
    spiritual: {
      Easy: ["Recite one page of Quran", "Perform morning/evening Dhikr", "Watch one Islamic reminder on TikTok", "Reflect on a Quran verse for 5 mins"],
      Medium: ["Memorize 5 Quranic words", "Perform Sunday Night Nafilah", "Follow one Islamic TikTok channel for daily reminders", "Study Tafseer of one ayah"],
      Hard: ["Perform Salatu Tasbih", "Complete Istikhara for a major life decision", "Cut social media scrolling for 24 hours - replace with worship", "Memorize a full page of Quran in one week", "Complete 30-day consistent Fajr prayer"],
    },
    marketing: {
      Easy: ["Post 1 affiliate link on Quora", "Research 1 new affiliate site"],
      Medium: ["Set up a niche affiliate website", "Create a content plan for affiliate marketing"],
      Hard: ["Launch a full-scale affiliate marketing campaign", "Achieve first sale through affiliate links"],
    },
    cultivation: {
      Easy: ["Effectiveness Audit (10m)", "Quran Word Memorization (10m)", "Reorganize one digital folder"],
      Medium: ["Deep read 1 chapter of Quran", "Review study goals for the week", "Review your TikTok feed for wasteful time spent"],
      Hard: ["Prepare for exams as if tomorrow", "Complete 4 hours of cultivation study", "30-day digital diet - replace TikTok with learning"],
    },
  };

  const catSuggestions = {
    work: ["Write merge algorithm", "Agentic AI project", "Complete daily report", "Affiliate research", "Upload app to console"],
    health: ["500 pushups", "Posture alignment", "Drink 2L water", "10-min walk", "30-minute workout"],
    learning: ["Learn Kotlin", "Recite Quran page", "Memorize Quran word", "Nahwu study", "Juz Daily", "Read for school", "Watch one educational TikTok daily"],
    personal: ["Effectiveness Audit", "Train brain", "Plan week", "Organize files", "Dua Daily", "Recite Quran", "Digital declutter - unfollow 5 wasteful channels"],
    cultivation: ["Salatu Tasbih", "Perform Nafilah", "Quran recitation", "Study spiritual text", "Morning/Evening Dhikr", "Effectiveness Audit", "Review your social media content diet"]
  };

  const statSugs = (suggestions[stat] && suggestions[stat][difficulty]) ? suggestions[stat][difficulty] : [];
  const catSugs = (category && catSuggestions[category.toLowerCase()]) ? catSuggestions[category.toLowerCase()] : [];

  // Also pull from the excess-quest suggestion pool
  let poolSugs = [];
  if (questSuggestionPool.length > 0) {
    // Show pool suggestions that match the category's general theme
    const cat = (category || 'personal').toLowerCase();
    const catKeywords = {
      work: ['work','project','email','research','code','agent','task','n8n','cyber','expo','dev','full stack','mern','thesis','proposal'],
      health: ['health','pushup','workout','run','agility','posture','cardio','exercise'],
      learning: ['learn','study','read','quran','tafseer','hifz','madina','nahwu','arabic','math','school','memorize','word','names','concentration','review','juz','seerah','khushu','ruh','nafs','mujawwad','yoruba','zad','university','systematic'],
      personal: ['pray','dua','dhikr','fast','sacrifice','willpower','gratitude','observer','silence','temptation','worship','pleasure','allah','desire','loop','voice','softheart','haram','imam','throne','fitna','refinement','think','disregard','sins','people','naww'],
      cultivation: ['effectiveness','audit','organize','folder','quran','memorization'],
      physical: ['pushup','push-ups','posture','run','workout'],
    };
    const keywords = catKeywords[cat] || [];
    poolSugs = questSuggestionPool.filter(function(t) {
      if (!keywords.length) return true;
      return keywords.some(function(kw) { return t.toLowerCase().includes(kw); });
    }).slice(0, 5);
  }

  const all = [...new Set([...statSugs, ...catSugs, ...poolSugs])];
  return all.length > 0 ? all : ["Stay focused", "Keep improving"];
}

function updateSuggestions(stat, difficulty, container) {
  const suggestions = generateSuggestedQuests(stat || 'discipline', difficulty || 'Medium');
  // Prefer suggestions in the provided container, then in the active edit panel, then global
  let suggestionDisplay = null;
  if (container && container.querySelector) suggestionDisplay = container.querySelector('#quest-suggestions');
  if (!suggestionDisplay) suggestionDisplay = document.querySelector('.quest-edit-panel #quest-suggestions') || document.getElementById('quest-suggestions');
  if (suggestionDisplay) {
    suggestionDisplay.innerHTML =
      "<strong>Suggested Quests:</strong><ul>" +
      suggestions.map((s) => `<li>${escapeHtml(s)}</li>`).join("") + 
      "</ul>";
  }
}

// Initialize quest filters (search, category, difficulty, stat, sort)
function initializeQuestFilters(){
  try {
    if (questSearchInput) {
      let searchTimeout;
      questSearchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
          filterQuests();
          const clearBtn = document.getElementById('clear-search-btn');
          if (clearBtn) {
            clearBtn.style.display = questSearchInput.value ? 'block' : 'none';
          }
        }, 150);
      });
    }
    if (categoryFilter) categoryFilter.addEventListener('change', filterQuests);
    if (difficultyFilter) difficultyFilter.addEventListener('change', filterQuests);
    if (statFilter) statFilter.addEventListener('change', filterQuests);

    // Clear search button functionality
    const clearSearchBtn = document.getElementById('clear-search-btn');
    if (clearSearchBtn && questSearchInput) {
      clearSearchBtn.addEventListener('click', () => {
        questSearchInput.value = '';
        clearSearchBtn.style.display = 'none';
        filterQuests();
      });
    }

    if (sortBtn && sortOptions) {
      sortBtn.addEventListener('click', () => {
        sortOptions.classList.toggle('show');
        filterQuests(); // Re-apply current sort when sort button is clicked
      });
      sortOptions.querySelectorAll('.sort-option').forEach(opt => {
        opt.addEventListener('click', () => {
          currentSortBy = opt.dataset.sort || 'title';
          document.querySelectorAll('.sort-option').forEach(o=>o.classList.remove('active'));
          opt.classList.add('active');
          sortOptions.classList.remove('show');
          filterQuests();
        });
      });
    }

    // initial apply
    filterQuests();
  } catch (e){
    console.error('initializeQuestFilters error', e);
  }
}

function filterQuests(){
  try{
    const q = (questSearchInput && questSearchInput.value || '').toLowerCase().trim();
    const category = categoryFilter ? categoryFilter.value : 'all';
    const difficulty = difficultyFilter ? difficultyFilter.value : 'all';
    const stat = statFilter ? statFilter.value : 'all';

    const questNodes = questsElem.children;
    const visible = [];
    const visibleSet = new Set();
    for (let i = 0; i < questNodes.length; i++) {
      const node = questNodes[i];
      if (!node.dataset) continue;
      const title = (node.dataset.title || '').toLowerCase();
      const match = !(q && !title.includes(q)) &&
        (category === 'all' || (node.dataset.category || '').toLowerCase() === category) &&
        (difficulty === 'all' || node.dataset.difficulty === difficulty) &&
        (stat === 'all' || node.dataset.stat === stat);
      if (match) {
        visible.push(node);
        visibleSet.add(node);
      }
    }

    // hide/show using Set for O(1) lookup
    for (let i = 0; i < questNodes.length; i++) {
      questNodes[i].style.display = visibleSet.has(questNodes[i]) ? '' : 'none';
    }

    // sort and batch reorder visible nodes
    if (currentSortBy && visible.length > 1) {
      visible.sort((a,b) => {
        if (currentSortBy === 'title') return (a.dataset.title||'').localeCompare(b.dataset.title||'');
        if (currentSortBy === 'difficulty') return (a.dataset.difficulty||'').localeCompare(b.dataset.difficulty||'');
        if (currentSortBy === 'xp') return Number(b.dataset.xp||0) - Number(a.dataset.xp||0);
        if (currentSortBy === 'category') return (a.dataset.category||'').localeCompare(b.dataset.category||'');
        if (currentSortBy === 'stat') return (a.dataset.stat||'').localeCompare(b.dataset.stat||'');
        return 0;
      });
      const frag = document.createDocumentFragment();
      visible.forEach(n => frag.appendChild(n));
      questsElem.appendChild(frag);
    }

    updateQuestCount();
  } catch (e){
    console.error('filterQuests error', e);
  }
}

function updateQuestCount(){
  try{
    const countEl = document.getElementById('quest-count');
    const total = Array.from(questsElem.children || []).filter(n => n.style.display !== 'none').length;
    if (countEl) countEl.textContent = total;
  } catch (e){
    console.error('updateQuestCount error', e);
  }
}

// Open an edit panel inside the quest element (used by add/edit)
function openQuestEditPanel(quest, questElemToEdit) {
  if (!questElemToEdit) {
    console.error("Quest element not passed for editing.");
    return;
  }
  const questElem = questElemToEdit; // Use the existing element passed for editing

  // Store original content and ensure single edit panel
  const existingPanel = document.querySelector('.quest-edit-panel');
  if (existingPanel && existingPanel !== questElem) {
      existingPanel.className = 'quest';
      existingPanel.innerHTML = existingPanel.dataset.originalContent;
  }

  questElem.dataset.originalContent = questElem.innerHTML;
  questElem.dataset.questId = quest.id;
  questElem.className = 'quest quest-edit-panel';

  const dueDate = quest.dueDate ? new Date(quest.dueDate).toISOString().split('T')[0] : '';
  questElem.innerHTML = `
      <div class="edit-panel-content" onclick="event.stopPropagation()">
          <div class="edit-title-row">
            <input type="text" class="quest-input edit-title-input" value="${escapeHtml(quest.title || '')}" placeholder="Quest title">
            <button type="button" class="suggest-btn" onclick="event.stopPropagation(); toggleSuggestions(this)" title="Suggestions">
              <i class="fas fa-lightbulb"></i>
            </button>
          </div>
          
          <div class="edit-meta-row">
            <div class="edit-category-group">
              ${['Work', 'Health', 'Learning', 'Personal', 'Cultivation'].map(cat => 
                `<button type="button" class="tag-button glow-button ${cat.toLowerCase() === (quest.category || '').toLowerCase() ? 'selected' : ''}" 
                         data-category="${cat}">${cat}</button>`).join('')}
            </div>
          </div>

          <div class="edit-meta-row">
            <div class="edit-diff-group">
              ${['Easy', 'Medium', 'Hard'].map(diff => 
                `<button type="button" class="tag-button tag-sm glow-button ${diff === quest.difficulty ? 'selected' : ''}" 
                         data-difficulty="${diff}">${diff}</button>`).join('')}
            </div>
            <div class="edit-xp-group">
              <label>XP</label>
              <input type="number" class="quest-input xp-input" value="${quest.xp || 2}" min="1" max="10">
            </div>
            <div class="edit-stat-group">
              ${['strength', 'agility', 'intelligence', 'stamina', 'willpower', 'discipline']
                  .map(stat => `<button type="button" class="tag-button tag-sm glow-button ${stat === quest.stat ? 'selected' : ''}" 
                                      data-stat="${stat}">${stat}</button>`).join('')}
            </div>
          </div>

          <div id="quest-suggestion-popup" class="suggestion-popup" style="display: none;">
            <div class="popup-header">Suggested Quests<button onclick="closeSuggestionPopup()">&times;</button></div>
            <div id="quest-suggestions" class="suggestions-container"></div>
          </div>

          <div class="edit-footer-row">
            <div class="edit-date-group">
              <label>Due</label>
              <input type="date" id="due-date-input" class="quest-input" value="${dueDate}">
            </div>
            <div class="edit-comment-group">
              <input type="text" class="quest-input" placeholder="Comment..." value="${quest.comment || ''}">
              <label class="pin-checkbox">
                  <input type="checkbox" ${quest.isPinned ? 'checked' : ''} class="pin-comment">
                  <i class="fas fa-thumbtack"></i>
              </label>
            </div>
            <div class="action-buttons">
              <button type="button" class="save-quest glow-button" onclick="saveQuestEdit(this)">Save</button>
              <button type="button" class="cancel-quest glow-button" onclick="cancelQuestEdit(this.closest('.quest-edit-panel'))">Cancel</button>
            </div>
          </div>
      </div>
  `;

  setupEditPanelListeners(questElem);
}

function setupEditPanelListeners(questElem) {
  const setupToggleGroup = (selector) => {
    questElem.querySelectorAll(selector).forEach(button => {
      button.addEventListener('click', function(e) {
        e.stopPropagation();
        this.parentElement.querySelectorAll(selector).forEach(sib => sib.classList.remove('selected'));
        this.classList.add('selected');

        const isStat = this.closest('.edit-stat-group');
        const isDiff = this.closest('.edit-diff-group');
        if (isDiff || isStat || this.closest('.edit-category-group')) {
          const selectedStat = questElem.querySelector('.edit-stat-group .tag-button.selected')?.dataset.stat;
          const selectedDifficulty = questElem.querySelector('.edit-diff-group .tag-button.selected')?.dataset.difficulty;
          
          if (selectedStat && selectedDifficulty) {
            updateSuggestionsWithClickable(selectedStat, selectedDifficulty, questElem);
          }
          
          const xpInput = questElem.querySelector('.xp-input');
          if (xpInput && selectedDifficulty) {
            if (selectedDifficulty === 'Easy') xpInput.value = 5;
            else if (selectedDifficulty === 'Medium') xpInput.value = 8;
            else if (selectedDifficulty === 'Hard') xpInput.value = 10;
          }
        }
      });
    });
  };

  setupToggleGroup('.edit-category-group > .tag-button');
  setupToggleGroup('.edit-diff-group > .tag-button');
  setupToggleGroup('.edit-stat-group > .tag-button');
}

function toggleSuggestions(btn) {
  const popup = document.getElementById('quest-suggestion-popup');
  if (!popup) return;
  if (popup.style.display === 'block') {
    popup.style.display = 'none';
    btn.classList.remove('active');
    return;
  }
  const questElem = btn.closest('.quest-edit-panel');
  const stat = questElem.querySelector('.edit-stat-group .tag-button.selected')?.dataset.stat || 'discipline';
  const difficulty = questElem.querySelector('.edit-diff-group .tag-button.selected')?.dataset.difficulty || 'Medium';
  updateSuggestionsWithClickable(stat, difficulty, questElem);
  popup.style.display = 'block';
  btn.classList.add('active');
}

function applySuggestion(suggestion, questElem) {
  const titleInput = questElem.querySelector('input[type="text"]');
  if (titleInput) {
    titleInput.value = suggestion;
  }

  const link = SUGGESTION_VIDEO_LINKS[suggestion];
  if (link) {
    const commentInput = questElem.querySelector('input[placeholder="Comment..."]');
    if (commentInput) {
      commentInput.value = link;
    }
    const pinCheckbox = questElem.querySelector('.pin-comment');
    if (pinCheckbox) {
      pinCheckbox.checked = true;
    }
  }

  showNotification(link ? 'Suggestion applied + video link pinned' : 'Suggestion applied');
}

function updateSuggestionsWithClickable(stat, difficulty, questElem) {
  const category = questElem.querySelector('.edit-category-group .tag-button.selected')?.dataset.category;
  const suggestions = generateSuggestedQuests(stat, difficulty, category);
  const suggestionContainer = questElem.querySelector('#quest-suggestions');
  
  if (suggestionContainer) {
    suggestionContainer.innerHTML = suggestions.map(suggestion => `
      <div class="suggested-quest-item glow-button" onclick="applySuggestion('${escapeJsStr(suggestion)}', this.closest('.quest-edit-panel'))">
          ${escapeHtml(suggestion)}
      </div>
    `).join('');
  }
}

// Suggestion Popup management
function closeSuggestionPopup() {
  const popup = document.getElementById('quest-suggestion-popup');
  if (popup) popup.style.display = 'none';
}

function openSuggestionPopup() {
  const popup = document.getElementById('quest-suggestion-popup');
  if (popup) popup.style.display = 'block';
}

// Function to cancel quest editing
function cancelQuestEdit(questElem) {
    if (questElem.dataset.questId === 'new') {
        questElem.remove(); // Remove new quest if cancelled
    } else {
        // Restore original content for existing quest
        questElem.className = 'quest';
        questElem.innerHTML = questElem.dataset.originalContent;
  }
}

let selectedQuests = new Set();

function toggleQuestSelect(id, el) {
  if (selectedQuests.has(id)) {
    selectedQuests.delete(id);
    el.classList.remove('selected');
    el.closest('.quest')?.classList.remove('selected');
  } else {
    selectedQuests.add(id);
    el.classList.add('selected');
    el.closest('.quest')?.classList.add('selected');
  }
  updateBatchBar();
}

function updateBatchBar() {
  const bar = document.getElementById('batch-bar');
  const count = document.getElementById('batch-count');
  if (!bar || !count) return;
  const visibleCount = document.querySelectorAll('#quests .quest:not([style*="display: none"]) .quest-status.quest-selector.selected').length;
  if (visibleCount > 0) {
    bar.style.display = 'flex';
    count.textContent = visibleCount;
  } else {
    bar.style.display = 'none';
  }
}

function selectAllQuests() {
  document.querySelectorAll('#quests .quest:not([style*="display: none"]) .quest-status.quest-selector').forEach(dot => {
    dot.classList.add('selected');
    dot.closest('.quest')?.classList.add('selected');
  });
  updateBatchBar();
}

function deselectAllQuests() {
  document.querySelectorAll('.quest-status.quest-selector').forEach(dot => {
    dot.classList.remove('selected');
    dot.closest('.quest')?.classList.remove('selected');
  });
  selectedQuests.clear();
  updateBatchBar();
}

async function completeSelectedQuests() {
  try {
    showNotification('Completing...', 'info');
    const dots = document.querySelectorAll('#quests .quest:not([style*="display: none"]) .quest-status.quest-selector.selected');
    const ids = [];
    dots.forEach(d => {
      const qid = parseInt(d.dataset.questId);
      if (!isNaN(qid)) ids.push(qid);
    });
    if (ids.length === 0) { showNotification('No quests selected', 'warning'); return; }
    if (sounds && sounds.complete) sounds.complete.play();
    const container = document.getElementById('quests');
    let totalXp = 0;
    let lastStat = null;
    let prevLastActive = null;
    let completedCount = 0;
    for (const id of ids) {
      const el = container?.querySelector(`.quest[data-quest-id="${id}"]`);
      if (!el) continue;
      const quest = await db.quests.get(id);
      if (!quest || quest.status === 'completed') continue;
      const xp = parseInt(el.dataset.xp) || 0;
      const stat = el.dataset.stat;
      const category = el.dataset.category;
      const difficulty = el.dataset.difficulty;
      totalXp += xp;
      lastStat = stat;
      completedCount++;
      quest.status = 'completed';
      quest.completedAt = new Date();
      await db.quests.put(quest);
      const playerStats = await db.playerStats.toArray();
      if (playerStats.length > 0) {
        const s = playerStats[0];
        if (prevLastActive === null) prevLastActive = s.lastActive;
        s.completedQuests = (s.completedQuests || 0) + 1;
        if (category) {
          if (!s.categoriesCompleted) s.categoriesCompleted = [];
          if (!s.categoriesCompleted.includes(category)) s.categoriesCompleted.push(category);
        }
        s.totalXpEarned = (s.totalXpEarned || 0) + xp;
        if (difficulty === 'Hard') s.hardQuestsCompleted = (s.hardQuestsCompleted || 0) + 1;
        else if (difficulty === 'Medium') s.mediumQuestsCompleted = (s.mediumQuestsCompleted || 0) + 1;
        else if (difficulty === 'Easy') s.easyQuestsCompleted = (s.easyQuestsCompleted || 0) + 1;
        if (stat) {
          if (!s.statsCompleted) s.statsCompleted = [];
          if (!s.statsCompleted.includes(stat)) s.statsCompleted.push(stat);
        }
        s.xp = (s.xp || 0) + xp;
        currentXP = s.xp;
        await db.playerStats.put(s);
        if (stat) await increaseStat(stat);
      }
      el.style.opacity = 0;
      setTimeout(() => { el.remove(); updateQuestsEmptyState(); }, 300);
    }
    if (completedCount > 0) {
      if (totalXp > 0) {
        updateXP();
        let levelsGained = 0;
        while (currentXP >= calculateXPForNextLevel(currentLevel)) {
          const xpRequired = calculateXPForNextLevel(currentLevel);
          currentLevel++;
          currentXP -= xpRequired;
          levelsGained++;
        }
        if (levelsGained > 0) {
          const pStats = await db.playerStats.toArray();
          if (pStats.length > 0) {
            pStats[0].level = currentLevel;
            pStats[0].xp = currentXP;
            await db.playerStats.put(pStats[0]);
          }
          if (typeof levelElem !== 'undefined' && levelElem) levelElem.textContent = currentLevel;
          updateXP();
          updateCharacterTitle();
          setTimeout(() => {
            showLevelUpOverlay(currentLevel);
            if (sounds && sounds.levelUp) sounds.levelUp.play();
          }, 500);
        }
        await checkDailyActivity(prevLastActive);
      }
      checkAchievements();
      if (lastStat) displayQuoteByContext(motivationalQuotesSystem.contexts.QUEST_COMPLETE);
      if (totalXp > 0) showXPToast(totalXp, lastStat);
      showNotification(`Completed ${completedCount} quest${completedCount > 1 ? 's' : ''}! +${totalXp} XP`, 'success');
    }
    selectedQuests.clear();
    updateBatchBar();
    updateQuestCount();
    if (typeof updateMainStatsDisplay === 'function') updateMainStatsDisplay();
    renderAchievements();
  } catch (e) {
    console.error('completeSelectedQuests error:', e);
    showNotification('Error completing quests: ' + e.message, 'error');
  }
}

async function deleteSelectedQuests() {
  const ids = [...selectedQuests];
  if (ids.length === 0) return;
  if (!confirm(`Delete ${ids.length} selected quest${ids.length > 1 ? 's' : ''}? This cannot be undone.`)) return;
  const container = document.getElementById('quests');
  for (const id of ids) {
    await db.quests.delete(id);
    const el = container?.querySelector(`.quest[data-quest-id="${id}"]`);
    if (el) { el.remove(); }
  }
  selectedQuests.clear();
  updateBatchBar();
  updateQuestsEmptyState();
  updateQuestCount();
  showNotification(`Deleted ${ids.length} quest${ids.length > 1 ? 's' : ''}.`, 'info');
}

async function saveQuestEdit(buttonElement) {
  const questElem = buttonElement.closest('.quest-edit-panel');
  const questId = questElem.dataset.questId;

  const titleInput = questElem.querySelector('input[type="text"]');
  const categoryBtn = questElem.querySelector('.edit-category-group .tag-button.selected');
  const difficultyBtn = questElem.querySelector('.edit-diff-group .tag-button.selected');
  const xpInput = questElem.querySelector('.xp-input');
  const statBtn = questElem.querySelector('.edit-stat-group .tag-button.selected');
  const commentInput = questElem.querySelector('input[placeholder="Comment..."]');
  const pinCheckbox = questElem.querySelector('.pin-comment');
  const dueDateInput = questElem.querySelector('#due-date-input');

  const updatedQuest = {
    id: questId === 'new' ? undefined : questId,
    title: titleInput ? titleInput.value.trim() : '',
    category: categoryBtn ? categoryBtn.dataset.category : 'Personal',
    difficulty: difficultyBtn ? difficultyBtn.dataset.difficulty : null,
    xp: xpInput ? parseInt(xpInput.value) : 2,
    stat: statBtn ? statBtn.dataset.stat : null,
    comment: commentInput ? commentInput.value.trim() : '',
    isPinned: pinCheckbox ? pinCheckbox.checked : false,
    status: 'inbox',
    dueDate: dueDateInput ? dueDateInput.value : null
  };

  // Validation
  if (!updatedQuest.title) {
    showNotification('Please enter a quest title', 'error');
    return;
  }

  try {
    if (questId === 'new') {
      const existing = await db.quests.where('title').equalsIgnoreCase(updatedQuest.title).first();
      if (existing) {
        showNotification('A quest with this title already exists', 'error');
        return;
      }
      updatedQuest.id = await db.quests.add(updatedQuest);
    } else {
      updatedQuest.id = parseInt(questId);
      // Check title doesn't collide with another quest
      const collision = await db.quests.where('title').equalsIgnoreCase(updatedQuest.title).and(function(q) { return q.id !== updatedQuest.id; }).first();
      if (collision) {
        showNotification('Another quest already has this title', 'error');
        return;
      }
      await db.quests.put(updatedQuest);
    }
    
    const newQuestElem = createQuestElement(updatedQuest);
    questElem.parentNode.replaceChild(newQuestElem, questElem);
    filterQuests();
    updateQuestCount();
    updateQuestsEmptyState();
    showNotification('Quest saved successfully');
    
  } catch (error) {
    console.error('Error saving quest:', error);
    showNotification('Failed to save quest', 'error');
  }
}

// Function to cancel quest creation (no longer needed after implementing saveQuestEdit)
// function closeQuestCreation(questElem) {
// if (questElem) {
// questElem.remove(); // Remove the quest creation element
// }
// }


async function completeQuest(xp, stat, questElem) {
  const questTitle = questElem ? questElem.dataset.title : "a quest";
  try {
    // Prevent event bubbling to avoid edit panel
    if (typeof event !== 'undefined' && event && event.stopPropagation) event.stopPropagation();
    
    // Check if there's an edit panel open and close it
    const existingPanel = document.querySelector('.quest-edit-panel');
    if (existingPanel) {
      existingPanel.className = 'quest';
      existingPanel.innerHTML = existingPanel.dataset.originalContent;
    }

    // Play sound effect
    if (sounds && sounds.complete && typeof sounds.complete.play === 'function') sounds.complete.play();

    // Remove the quest from DOM smoothly
    if (questElem) {
      questElem.style.opacity = 0;
      setTimeout(() => { if (questElem && questElem.parentNode) { questElem.remove(); updateQuestsEmptyState(); } }, 300);
    }

    // Get the quest ID to update in database
    const questId = questElem ? parseInt(questElem.dataset.questId) : null;
    const questCategory = questElem ? questElem.dataset.category : null;
    const questDifficulty = questElem ? questElem.dataset.difficulty : null;
    const questStat = questElem ? questElem.dataset.stat : null;
    
    // Update quest in database
    if (questId) {
      const quest = await db.quests.get(questId);
      if (quest) {
        quest.status = 'completed';
        quest.completedAt = new Date();
        await db.quests.put(quest);
      }
    }

    // Update player stats
    const playerStats = await db.playerStats.toArray();
    if (playerStats.length > 0) {
      const stats = playerStats[0];
      
      // Increase completed quests count
      stats.completedQuests = (stats.completedQuests || 0) + 1;
      
      // Track category completion
      if (questCategory) {
        if (!stats.categoriesCompleted) {
          stats.categoriesCompleted = [];
        }
        if (!stats.categoriesCompleted.includes(questCategory)) {
          stats.categoriesCompleted.push(questCategory);
        }
      }
      
      // Track total XP earned
      stats.totalXpEarned = (stats.totalXpEarned || 0) + xp;
      
      // Track difficulty completions
      if (questDifficulty === 'Hard') {
        stats.hardQuestsCompleted = (stats.hardQuestsCompleted || 0) + 1;
      } else if (questDifficulty === 'Medium') {
        stats.mediumQuestsCompleted = (stats.mediumQuestsCompleted || 0) + 1;
      } else if (questDifficulty === 'Easy') {
        stats.easyQuestsCompleted = (stats.easyQuestsCompleted || 0) + 1;
      }
      
      // Track stat completions
      if (questStat) {
        if (!stats.statsCompleted) stats.statsCompleted = [];
        if (!stats.statsCompleted.includes(questStat)) {
          stats.statsCompleted.push(questStat);
        }
      }
      
      // Preserve previous lastActive for streak checking
      const previousLastActive = stats.lastActive;

      // --- Start of combined XP/Stats update for database ---
      // Update global currentXP first
      currentXP += xp;
      // Update stats.xp from global currentXP
      stats.xp = currentXP;
      // Now save updated stats (XP, completedQuests, categories) to database
      await db.playerStats.put(stats);
      // --- End of combined XP/Stats update for database ---

      // Check for streak using the previous lastActive value (so that same-day updates don't reset streak)
      await checkDailyActivity(previousLastActive);
      
      // Check for achievements
      checkAchievements();
    } // End of if (if (playerStats.length > 0)

    // Update UI for XP
    updateXP(); // This will use the now-correct global currentXP

    // Auto-process level-ups
    let levelsGained = 0;
    while (currentXP >= calculateXPForNextLevel(currentLevel)) {
      const xpRequired = calculateXPForNextLevel(currentLevel);
      currentLevel++;
      currentXP -= xpRequired;
      levelsGained++;
    }
    if (levelsGained > 0) {
      const pStats = await db.playerStats.toArray();
      if (pStats.length > 0) {
        pStats[0].level = currentLevel;
        pStats[0].xp = currentXP;
        await db.playerStats.put(pStats[0]);
      }
      levelElem.textContent = currentLevel;
      updateXP();
      updateCharacterTitle();
      setTimeout(() => {
        showLevelUpOverlay(currentLevel);
        if (sounds && sounds.levelUp) sounds.levelUp.play();
      }, 500);
    }

    // Increase stat
    await increaseStat(stat);

    // Show XP Toast
    showXPToast(xp, stat);

    // Update stat display immediately with animation
    const statElem = document.getElementById(stat);
    if (statElem && currentStats) {
      statElem.textContent = currentStats[stat] || stats[stat];
      statElem.classList.remove('animate');
      statElem.offsetHeight; // Trigger reflow
      statElem.classList.add('animate');
      setTimeout(() => statElem.classList.remove('animate'), 500);
    }

    // Update progress bar with relative increase
    const progressBar = document.getElementById(`${stat}-progress-main`);
    if (progressBar && currentStats) {
      // Calculate percentage based on MAX_STAT (10000), but display as 0-100%
      const pct = Math.min(100, Math.round((currentStats[stat] / MAX_STAT) * 100));
      progressBar.style.width = pct + '%';
      
      // Add increase indicator if there was a recent increase
      if (statIncreases[stat] > 0) {
        progressBar.classList.add('stat-increase');
        // Calculate the increase as a percentage of MAX_STAT
        const increasePct = Math.min(100 - pct, Math.round((statIncreases[stat] / MAX_STAT) * 100));
        progressBar.style.setProperty('--increase-width', `${increasePct}%`);
      } else {
        progressBar.classList.remove('stat-increase');
      }
    }
    
    // Update progress text with relative increase - show actual stat value and next milestone
    const progressText = document.getElementById(`${stat}-progress-text`);
    if (progressText && currentStats) {
      const increaseText = statIncreases[stat] > 0 ? ` (+${statIncreases[stat]})` : '';
      // Show as "current/max" with max being 10000
      progressText.textContent = `${currentStats[stat]}/${MAX_STAT}${increaseText}`;
    }

    // Display a quest completion quote linked to quest category
    displayQuoteByContext(motivationalQuotesSystem.contexts.QUEST_COMPLETE, questCategory);
    
    // Update quest count
    updateQuestCount();
    
    // Refresh all stat displays
    if (typeof updateMainStatsDisplay === 'function') updateMainStatsDisplay();
    
    // Update achievement progress
    renderAchievements();
    
    // Force a final refresh
    setTimeout(() => {
      if (typeof updateMainStatsDisplay === 'function') updateMainStatsDisplay();
    }, 200);
    showNotification(`Quest "${questTitle}" completed!`, "success"); // Show only success notification after all ops succeed
  } catch (error) {
    console.error('Error completing quest:', error);
    // showNotification('Failed to complete quest', 'error'); // Removed to avoid duplicate/conflicting notifications
  }
}
async function deleteQuest(questId, questElem) {
  if (confirm("Are you sure you want to delete this quest? This action cannot be undone.")) {
    try {
      // Remove from database
      await db.quests.delete(questId);

      // Add to deleted list to prevent re-adding defaults
      if (questElem) {
        try {
          const compositeKey = `${questElem.dataset.title}-${questElem.dataset.difficulty}-${questElem.dataset.xp}-${questElem.dataset.stat}-${questElem.dataset.category}`;
          const existing = await db.deletedQuests.where('compositeKey').equals(compositeKey).first();
          if (!existing) {
            await db.deletedQuests.add({ compositeKey });
          }
        } catch (e) {
          console.error('Error recording deleted quest:', e);
        }

        // Remove from DOM
        questElem.style.opacity = 0;
        setTimeout(() => { questElem.remove(); updateQuestsEmptyState(); }, 300);
      }

      showNotification("Quest deleted successfully!", "success");
      updateQuestCount(); // Update the quest count after deletion
    } catch (error) {
      console.error("Error deleting quest:", error);
      showNotification("Failed to delete quest.", "error");
    }
  }
}

async function increaseStat(stat) {
  try {
    const playerStats = await db.playerStats.toArray();
    if (playerStats.length > 0) {
      const stats = playerStats[0];
      
      // Ensure stat exists and is a number
      if (typeof stats[stat] !== 'number') {
        stats[stat] = 1;
      }
      
      // Track old value before increase
      const oldValue = stats[stat] || 1;
      
      // Increase stat by 1
      stats[stat]++;
      
      // Track the increase for visual feedback
      trackStatIncrease(stat, oldValue, stats[stat]);
      
      // Update database
      await db.playerStats.put(stats);
      
      // Update currentStats object for progress bars
      currentStats = {
        strength: stats.strength || 1,
        agility: stats.agility || 1,
        intelligence: stats.intelligence || 1,
        stamina: stats.stamina || 1,
        willpower: stats.willpower || 1,
        discipline: stats.discipline || 1
      };
      
      // Update main stats display immediately
      if (statsElems[stat]) {
        statsElems[stat].textContent = stats[stat];
      }
      
      // Update all stat displays
      updateMainStatsDisplay();
      
      // Update spider chart modal stats if open
      const _spider_el = document.getElementById('spider-chart-modal');
      if (_spider_el && window.getComputedStyle(_spider_el).display !== 'none') {
        updateStatDetails();
      }
      
      // Highlight the stat that was increased
      const progressElem = document.getElementById(`${stat}-progress-main`);
      if (progressElem) {
        progressElem.classList.add('stat-highlight');
        setTimeout(() => {
          progressElem.classList.remove('stat-highlight');
        }, 1500);
      }
      
      // Also highlight the spider chart progress bar
      const spiderProgressElem = document.getElementById(`${stat}-progress`);
      if (spiderProgressElem) {
        spiderProgressElem.classList.add('stat-highlight');
        setTimeout(() => {
          spiderProgressElem.classList.remove('stat-highlight');
        }, 1500);
      }
      
      // Record stat history after an increase
      await recordStatHistory();
      
      // Show stat increase notification
      showNotification(`${stat.charAt(0).toUpperCase() + stat.slice(1)} increased to ${stats[stat]}!`, 'success');
      
      // Force a UI refresh
      setTimeout(() => {
        updateMainStatsDisplay();
      }, 100);
    }
  } catch (error) {
    console.error('Error increasing stat:', error);
    showNotification('Failed to increase stat', 'error');
  }
}

function updateXP() {
  const xpForNextLevel = calculateXPForNextLevel(currentLevel);
  xpElem.textContent = `${currentXP}`;
  xpRequiredElem.textContent = xpForNextLevel;
  xpProgressElem.style.width = `${(currentXP / xpForNextLevel) * 100}%`;

  if (currentXP >= xpForNextLevel) {
    levelUpBtn.style.display = "inline-block";
    
    // Display a level up quote
    displayQuoteByContext(motivationalQuotesSystem.contexts.LEVEL_UP);
  } else {
    levelUpBtn.style.display = "none";
  }
}

// Level Up button functionality
document.getElementById('level-up-btn').addEventListener('click', async () => {
    let levelsGained = 0;
    while (currentXP >= calculateXPForNextLevel(currentLevel)) {
        const xpRequired = calculateXPForNextLevel(currentLevel);
        currentLevel++;
        currentXP -= xpRequired;
        levelsGained++;
    }

    if (levelsGained === 0) {
        showNotification("Not enough XP to level up.");
        return;
    }

    const playerStats = await db.playerStats.toArray();
    const stats = playerStats[0];
    stats.level = currentLevel;
    stats.xp = currentXP;
    await db.playerStats.put(stats);

    levelElem.textContent = currentLevel;
    xpElem.textContent = currentXP;
    xpRequiredElem.textContent = calculateXPForNextLevel(currentLevel);
    updateXP();
    updateCharacterTitle();

    sounds.levelUp.play();

    if (levelsGained === 1) {
        showLevelUpOverlay(currentLevel);
        showNotification("Congratulations! You've leveled up!");
    } else {
        showLevelUpOverlay(currentLevel);
        showNotification(`Multi-level up! Gained ${levelsGained} levels! Now level ${currentLevel}.`);
    }
});

async function checkDailyActivity(prevLastActive = null) {
  const playerStats = await db.playerStats.toArray();
  if (playerStats.length === 0) return;

  const stats = playerStats[0];
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (stats.lastStreakCheck && new Date(stats.lastStreakCheck).getTime() === today.getTime()) {
    return; // Streak already checked today
  }

  let lastActive;
  if (prevLastActive) {
      lastActive = new Date(prevLastActive);
  } else if (stats.lastActive) {
      lastActive = new Date(stats.lastActive);
  } else {
      // If there's no lastActive, this is the first activity
      stats.lastActive = now;
      stats.currentStreak = 1;
      stats.consecutiveDays = 1;
      stats.lastStreakCheck = today;
      await db.playerStats.put(stats);
      updateStreakDisplay();
      return;
  }

  // Reset day streak if more than 1 day has passed since last activity
  if (lastActive && daysBetween(lastActive, now) > 1) {
    if (!isStreakMessageShown) {
      isStreakMessageShown = true;
    }
    stats.currentStreak = 0;
    stats.consecutiveDays = 0;
  }

  // If it's a new day and they've completed at least one activity
  if (lastActive && daysBetween(lastActive, now) === 1) {
    stats.currentStreak = (stats.currentStreak || 0) + 1;
    stats.consecutiveDays = (stats.consecutiveDays || 0) + 1;
    stats.longestStreak = Math.max(stats.longestStreak || 0, stats.currentStreak);
    
    // Play streak sound and show notification
    if (stats.currentStreak > 0 && stats.currentStreak % 3 === 0) {
      sounds.streakUp.play();
      showNotification(`Amazing! You've maintained a ${stats.currentStreak}-day streak!`);
      
      // Display streak milestone quote
      displayQuoteByContext(motivationalQuotesSystem.contexts.STREAK_MILESTONE);
      
      // Check for streak achievements
      checkAchievements();
    }
  }

  // Update last active date and streak check date
  stats.lastActive = now;
  stats.lastStreakCheck = today;
  await db.playerStats.put(stats);
  updateStreakDisplay();
}

// Helper function to calculate days between two dates
function daysBetween(date1, date2) {
  // Convert both dates to UTC midnight to ignore time of day
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  
  // Calculate difference and convert to days
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.floor((utc2 - utc1) / msPerDay);
}

async function updateStats() {
  const statsKeys = [
    "strength",
    "agility",
    "intelligence",
    "stamina",
    "willpower",
    "discipline",
  ];
  
  const playerStats = await db.playerStats.toArray();
  if (playerStats.length > 0) {
    const stats = playerStats[0];
    
    // Update currentStats for consistency
    currentStats = {
      strength: stats.strength || 1,
      agility: stats.agility || 1,
      intelligence: stats.intelligence || 1,
      stamina: stats.stamina || 1,
      willpower: stats.willpower || 1,
      discipline: stats.discipline || 1
    };
    
    // Update stat text values
    for (const stat of statsKeys) {
      if (statsElems[stat]) statsElems[stat].textContent = stats[stat];
    }
    
    // Update progress bars
    updateStatDetails();
    
    // Update main stats display
    updateMainStatsDisplay();
  }
}

// addQuestBtn handler: modal-based (see document-level click at ~line 3954)
// Was previously an inline edit panel handler that silently failed (no quest element passed).

function getRandomQuests(quests, count) {
  const shuffled = quests.sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

async function enterPenaltyZone() {
  const penaltyZoneElem = document.createElement("div");
  penaltyZoneElem.id = "penalty-zone";
  penaltyZoneElem.innerHTML = `
  <h2>Penalty Zone</h2>
  <p>You've missed 3 consecutive days. Complete these extra challenges to return to regular quests:</p>
  <ul id="penalty-quests"></ul>
`;
  document.querySelector(".container").appendChild(penaltyZoneElem);

  const penaltyQuests = [
    { title: "50 push-ups", xp: 5, stat: "strength" },
    { title: "Read 2 chapters of a book", xp: 5, stat: "intelligence" },
    { title: "30-minute intense workout", xp: 5, stat: "stamina" },
  ];

  const penaltyQuestsElem = document.getElementById("penalty-quests");
  penaltyQuests.forEach((quest) => {
    const questElem = document.createElement("li");
    questElem.innerHTML = `
    ${quest.title} (${quest.xp} XP)
    <button onclick="completePenaltyQuest(${quest.xp}, '${quest.stat}')">Complete</button>
  `;
    penaltyQuestsElem.appendChild(questElem);
  });
}

async function completePenaltyQuest(xp, stat) {
  await completeQuest(xp, stat);
  const penaltyQuestsElem = document.getElementById("penalty-quests");
  if (penaltyQuestsElem.children.length === 1) {
    exitPenaltyZone();
  } else {
    penaltyQuestsElem.removeChild(penaltyQuestsElem.firstChild);
  }
}

function exitPenaltyZone() {
  const penaltyZoneElem = document.getElementById("penalty-zone");
  penaltyZoneElem.remove();
  generateDailyQuests();
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add("show");
  }, 100);

  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 500);
  }, 5000);
}

function showXPToast(xp, stat) {
  const toast = document.getElementById('xp-toast');
  if (toast) {
    document.getElementById('xp-gained').textContent = xp;
    document.getElementById('xp-stat-name').textContent = stat ? `${stat.charAt(0).toUpperCase() + stat.slice(1)} +1` : '';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }
}

function showLevelUpOverlay(level) {
  const overlay = document.getElementById('level-up-overlay');
  if (overlay) {
    document.getElementById('new-level-display').textContent = level;
    overlay.classList.add('show');
    setTimeout(() => overlay.classList.remove('show'), 3000);
  }
}

async function editUsername() {
  const newUsername = prompt("Enter your new username:");
  if (newUsername) {
    const playerStats = await db.playerStats.toArray();
    const stats = playerStats[0];
    stats.username = newUsername;
    await db.playerStats.put(stats);
    usernameDisplay.textContent = newUsername;
    showNotification("Username updated successfully");
  }
}

editUsernameBtn.addEventListener("click", editUsername);

// Initialize settings handlers
initSettingsHandlers();

modalClose.addEventListener("click", () => {
  closeSettingsModal();
});

// Close modal when clicking overlay
document.getElementById("modal-overlay").addEventListener("click", () => {
  closeSettingsModal();
  closeQuestModal();
});

document.getElementById('quest-modal').addEventListener('click', (e) => {
  if (e.target === e.currentTarget) closeQuestModal();
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSettingsModal();
    closeQuestModal();
  }
});

function closeSettingsModal() {
  settingsModal.classList.remove("show");
  document.getElementById("modal-overlay").classList.remove("show");
  document.body.style.overflow = ""; // Restore scrolling
}

// Enhanced Load Modal Functionality
document.getElementById("load-btn").addEventListener("click", async () => {
  try {
    const savedGames = await db.savedGames.toArray();
    const savedGamesList = document.getElementById("saved-games-list");
    
    if (savedGames.length === 0) {
      savedGamesList.innerHTML = "<li>No saved games found</li>";
    } else {
      savedGamesList.innerHTML = savedGames
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .map(game => `
          <li class="saved-game-item">
            <div class="saved-game-info">
              <span class="saved-game-date">${new Date(game.timestamp).toLocaleString()}</span>
              <span class="saved-game-level">Level ${game.stats.level || 0}</span>
            </div>
            <button class="load-game-btn" onclick="loadGame('${game.timestamp}')">
              <i class="fas fa-download"></i> Load
            </button>
          </li>
        `).join("");
    }
    
    // Show load modal
    document.getElementById("load-modal").style.display = "block";
    document.getElementById("modal-overlay").classList.add("show");
  } catch (error) {
    console.error("Error loading saved games:", error);
    showNotification("Failed to load saved games", "error");
  }
});

document.getElementById("load-modal-close").addEventListener("click", () => {
  document.getElementById("load-modal").style.display = "none";
  document.getElementById("modal-overlay").classList.remove("show");
});

// Load Game Function
async function loadGame(timestamp) {
  try {
    const savedGame = await db.savedGames
      .where("timestamp")
      .equals(timestamp)
      .first();
    
    if (savedGame) {
      // Restore player stats
      await db.playerStats.clear();
      await db.playerStats.add(savedGame.stats);
      
      // Restore quests
      await db.quests.clear();
      await db.quests.bulkAdd(savedGame.quests);

      // Restore achievements
      await db.achievements.clear();
      if (savedGame.achievements && savedGame.achievements.length > 0) {
        await db.achievements.bulkAdd(savedGame.achievements);
      }
      
      // Restore favoriteQuotes
      await db.favoriteQuotes.clear();
      if (savedGame.favoriteQuotes && savedGame.favoriteQuotes.length > 0) {
        await db.favoriteQuotes.bulkAdd(savedGame.favoriteQuotes);
      }
      
      // Restore statHistory
      await db.statHistory.clear();
      if (savedGame.statHistory && savedGame.statHistory.length > 0) {
        await db.statHistory.bulkAdd(savedGame.statHistory);
      }
      
      // Refresh the game
      location.reload();
    }
  } catch (error) {
    console.error("Error loading game:", error);
    showNotification("Failed to load game", "error");
  }
}

// Save Button
saveBtn.addEventListener("click", async () => {
  try {
    await saveGame();
    showNotification('Game saved successfully!');
  } catch (error) {
    console.error('Error saving game:', error);
    showNotification('Failed to save game', 'error');
  }
});

// restart Button
restartBtn.addEventListener("click", async () => {
  const confirmRestart = confirm("Are you sure you want to restart the game? This will reset all progress and quests.");
  if (confirmRestart) {
    // Clear the quests display in the UI
    document.getElementById('quests').innerHTML = '';

    // Populate suggestion pool with defaults instead of re-adding to grid
    questSuggestionPool = [...new Set(GLOBAL_DEFAULT_QUESTS.map(q => q.title))];
    await db.quests.clear();

    showNotification("Game has been restarted! Default quests moved to suggestions — add what you need."); // Notify the user
    refreshData(); // Refresh UI to show newly added quests
  }
});

// Reset Button (Clear All Quests)
resetBtn.addEventListener("click", async () => {
  if (
    confirm(
      "Are you sure you want to clear all quests? This action cannot be undone."
    )
  ) {
    await db.quests.clear();
    await refreshData();
    showNotification("All quests have been cleared.");
  }
});

// Clear All Game Data Functionality
document.getElementById('clear-all-btn').addEventListener('click', async () => {
  if (confirm('WARNING: This will clear ALL your current game progress (stats, quests, achievements, favorite quotes, and stat history) and reset them to default. Saved games will NOT be affected. Are you sure you want to proceed?')) {
    await clearAllGameData();
    showNotification('All current game data cleared and reset to defaults! Reloading...');
  }
});

// Remove Duplicate Quests Functionality
document.getElementById('remove-duplicates-btn').addEventListener('click', async () => {
  if (confirm('Are you sure you want to remove all duplicate quests? This action will keep only one quest for each unique title and is irreversible.')) {
    await removeExistingDuplicateQuests();
  }
});

tourGuideBtn.addEventListener("click", startTourGuide);



// Function to refresh data
async function refreshData() {
  questsElem.innerHTML = ""; // Clear current quests
  const quests = await db.quests.toArray(); // Fetch updated quests
  const frag = document.createDocumentFragment();
  quests.forEach((quest, i) => {
    const newQuestElem = createQuestElement(quest);
    newQuestElem.style.animationDelay = `${i * 0.05}s`;
    frag.appendChild(newQuestElem);
  });
  questsElem.appendChild(frag);
  updateQuestsEmptyState();

  filterQuests(); // Re-apply current filters
  updateQuestCount(); // Update quest count display
}

// Function to update the UI with player stats
function updateStatsDisplay(stats) {
  statsElems["strength"].textContent = stats.strength;
  statsElems["agility"].textContent = stats.agility;
  statsElems["intelligence"].textContent = stats.intelligence;
  statsElems["stamina"].textContent = stats.stamina;
  statsElems["willpower"].textContent = stats.willpower;
  statsElems["discipline"].textContent = stats.discipline;
}

// Updated restartGame function to add all tasks as new quests
async function restartGame() {
  await initializeGame(); // You might keep your existing initialization logic
  const quests = await db.quests.toArray(); // Fetch all quests from the database

  quests.forEach((quest, i) => {
    const newQuestElem = createQuestElement(quest);
    newQuestElem.style.animationDelay = `${i * 0.05}s`;
    appendQuestWithAnimation(questsElem, newQuestElem);
  });
}

// New resetGame function to remove all stats and quests
async function resetGame() {
  await db.delete(); // Deletes the entire database
  await db.open(); // Reopen the database
  // Re-initialize the player stats
  await db.playerStats.add({
    level: 0,
    xp: 0,
    strength: 0,
    agility: 0,
    intelligence: 0,
    stamina: 0,
    willpower: 0,
    discipline: 0,
    lastActive: new Date().toISOString().split("T")[0],
    consecutiveMissedDays: 0,
    username: "Heavenly_Dev|",
    lastStreakCheck: null
  });

  // Optionally clear the displayed quests from the UI
  questsElem.innerHTML = ""; // Clear current quests
}

// Clear All Game Data Function
async function clearAllGameData() {
  // Clear current player stats, quests, achievements, favorite quotes, and stat history
  await db.playerStats.clear();
  await db.quests.clear();
  await db.achievements.clear();
  await db.favoriteQuotes.clear();
  await db.statHistory.clear();
  
  // Optionally re-initialize game to default state, or reload page
  await initializeGame(); // Re-initializes everything to default after clearing
}

async function removeExistingDuplicateQuests() {
  try {
    const allQuests = await db.quests.toArray();
    const uniqueQuestKeys = new Set(); // Stores composite keys
    const duplicateQuestIds = [];

    for (const quest of allQuests) {
      // Create a composite key from relevant properties
      const compositeKey = `${quest.title}-${quest.difficulty}-${quest.xp}-${quest.stat}-${quest.category}`;

      if (uniqueQuestKeys.has(compositeKey)) {
        duplicateQuestIds.push(quest.id);
      } else {
        uniqueQuestKeys.add(compositeKey);
      }
    }

    if (duplicateQuestIds.length > 0) {
      await db.quests.bulkDelete(duplicateQuestIds);
      showNotification(`Removed ${duplicateQuestIds.length} duplicate quests.`, 'success');
      refreshData();
    } else {
      showNotification('No duplicate quests found based on all properties.', 'info');
    }
  } catch (error) {
    console.error('Error removing duplicate quests:', error);
    showNotification('Failed to remove duplicate quests.', 'error');
  }
}

// Modified Save Game function to store snapshots with timestamps
async function saveGame() {
  const timestamp = new Date().toISOString();
  const playerStats = await db.playerStats.toArray();
  const quests = await db.quests.toArray();
  const achievements = await db.achievements.toArray();
  const favoriteQuotes = await db.favoriteQuotes.toArray();
  const statHistory = await db.statHistory.toArray();

  const snapshot = {
    timestamp,
    stats: playerStats[0],
    quests: quests,
    achievements: achievements,
    favoriteQuotes: favoriteQuotes,
    statHistory: statHistory
  };

  await db.savedGames.add(snapshot);
}

// Export Game Functionality
async function exportGame() {
  try {
    const playerStats = await db.playerStats.toArray();
    const quests = await db.quests.toArray();
    const achievements = await db.achievements.toArray();
    const favoriteQuotes = await db.favoriteQuotes.toArray();
    const statHistory = await db.statHistory.toArray();

    const gameData = {
      playerStats: playerStats.length > 0 ? playerStats[0] : {},
      quests: quests,
      achievements: achievements,
      favoriteQuotes: favoriteQuotes,
      statHistory: statHistory
    };

    const dataStr = JSON.stringify(gameData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sololeveling_backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showNotification('Game data exported successfully!');
  } catch (error) {
    console.error('Error exporting game:', error);
    showNotification('Failed to export game data.', 'error');
  }
}

// Export Game Button Event Listener
document.getElementById('export-game-btn').addEventListener('click', async () => {
  if (confirm('Do you want to export your current game data? This will download a JSON file with your player stats, quests, and achievements.')) {
    await exportGame();
  }
});

// Import Game Functionality
document.getElementById('import-game-btn').addEventListener('click', () => {
  if (confirm('WARNING: Importing game data will OVERWRITE your current player stats, quests, and achievements. Are you sure you want to proceed?')) {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'application/json';
    fileInput.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async (event) => {
          let importedData;
          try {
            importedData = JSON.parse(event.target.result);
          } catch (error) {
            console.error('Error parsing or importing file:', error);
            showNotification('Failed to import game data. Invalid file format.', 'error');
            return;
          }

          try {
            await importGame(importedData);
            // showNotification('Game data imported successfully!'); // Removed to avoid duplicate notification
            // Clear the UI and re-initialize the game
            questsElem.innerHTML = '';
            await initializeGame();
            closeSettingsModal();
            location.reload(); // Added here to align with inspiration
          } catch (error) {
            console.error('Error importing game data:', error);
            showNotification('Failed to import game data. Error: ' + error.message, 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    fileInput.click();
  }
});

async function importGame(importedData) {
  try {
    // Validate imported data structure
    if (!importedData || typeof importedData !== 'object') {
      showNotification('Invalid import data: expected a JSON object.', 'error');
      return;
    }
    if (!importedData.playerStats || typeof importedData.playerStats !== 'object') {
      showNotification('Invalid import data: missing playerStats.', 'error');
      return;
    }
    if (!Array.isArray(importedData.quests)) {
      showNotification('Invalid import data: quests must be an array.', 'error');
      return;
    }
    
    // Clear existing data
    await db.playerStats.clear();
    await db.quests.clear();
    await db.achievements.clear();
    await db.favoriteQuotes.clear();
    await db.statHistory.clear();

    // Add imported data
    await db.playerStats.add(importedData.playerStats);
    if (importedData.quests.length > 0) {
      await db.quests.bulkAdd(importedData.quests);
    }

    if (importedData.achievements && importedData.achievements.length > 0) {
      await db.achievements.bulkAdd(importedData.achievements);
    }
    if (importedData.favoriteQuotes && importedData.favoriteQuotes.length > 0) {
      await db.favoriteQuotes.bulkAdd(importedData.favoriteQuotes);
    }
    if (importedData.statHistory && importedData.statHistory.length > 0) {
      await db.statHistory.bulkAdd(importedData.statHistory);
    }
    
    showNotification('Game data successfully imported!');
  } catch (error) {
    console.error('Error in importGame function:', error);
    showNotification('Failed to import game data. Error: ' + error.message, 'error');
  }
}
// Load Default Quests into current game
document.getElementById('load-default-quests-btn').addEventListener('click', async () => {
  if (confirm('Reload defaults as suggestions? This will clear all current quests from the grid and put every default quest into the suggestion panel for you to pick from.')) {
    await loadDefaultQuestsIntoCurrent();
    closeSettingsModal();
  }
});

async function loadDefaultQuestsIntoCurrent() {
  try {
    const defaultQuests = GLOBAL_DEFAULT_QUESTS;
    const existingQuests = await db.quests.toArray();

    // Populate suggestion pool with ALL default quest titles — replace, don't accumulate
    questSuggestionPool = [...new Set(defaultQuests.map(q => q.title))];

    // Delete ALL existing quests from DB
    const allQuestIds = existingQuests.map(q => q.id);
    if (allQuestIds.length > 0) {
      await db.quests.bulkDelete(allQuestIds);
      showNotification(`Cleared ${allQuestIds.length} quests. All defaults moved to suggestions — add what you need.`, 'info');
    } else {
      showNotification(`Default quests available in suggestions — add what you need.`, 'info');
    }
    
    await refreshData();
    closeSettingsModal();
  } catch (error) {
    console.error('Error loading default quests:', error);
    showNotification('Failed to load default quests.', 'error');
  }
}

// Initialize Quotes and Spider Chart UI
let currentQuote = null;

let currentQuoteAudio = null;

function getVoicePref() {
  // Read voice preference from localStorage cache or default
  try { return localStorage.getItem('voicePref') || 'female'; }
  catch(_) { return 'female'; }
}

function getQuoteAudioMuted() {
  try { return localStorage.getItem('quoteAudioMuted') === 'true'; }
  catch(_) { return false; }
}

function setQuoteAudioMuted(muted) {
  try { localStorage.setItem('quoteAudioMuted', muted ? 'true' : 'false'); }
  catch(_) {}
}

function syncMuteButton() {
  const btn = document.getElementById('mute-quote');
  if (!btn) return;
  const muted = getQuoteAudioMuted();
  btn.classList.toggle('muted', muted);
  const icon = btn.querySelector('i');
  if (icon) icon.className = muted ? 'fas fa-volume-mute' : 'fas fa-volume-up';
}

function speakText(text, quoteId) {
  if (getQuoteAudioMuted()) return;
  // Try pre-generated audio file first
  if (quoteId) {
    const voice = getVoicePref();
    const audioPath = `quotes-audio/${voice}/${quoteId}.mp3`;
    try {
      if (currentQuoteAudio) {
        currentQuoteAudio.pause();
        currentQuoteAudio = null;
      }
      const audio = new Audio(audioPath);
      audio.volume = 0.8;
      currentQuoteAudio = audio;
      unlockAudioOnce();
      audio.play().catch(function(e) {
        console.warn('speakText: play blocked (' + e.message + ') fallback TTS for #' + quoteId);
        if (text && window.speakWithKokoro) window.speakWithKokoro(text);
      });
      audio.onerror = function() {
        console.warn('speakText: load error for ' + audioPath + ', fallback TTS');
        if (text && window.speakWithKokoro) window.speakWithKokoro(text);
      };
      return;
    } catch (e) {
      console.warn('speakText: exception (' + e.message + '), fallback TTS');
    }
  }
  // Fallback: Kokoro TTS
  if (text && window.speakWithKokoro) window.speakWithKokoro(text);
}

function initializeQuotes() {
  try {
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const quoteSource = document.getElementById('quote-source');
    const favBtn = document.getElementById('favorite-quote');
    const newBtn = document.getElementById('new-quote');
    const favoritesGrid = document.getElementById('favorites-grid');
    currentQuote = motivationalQuotesSystem.getRandomQuote();

    function render(q) {
      if (!q) return;
      currentQuote = q;
      if (quoteText) quoteText.textContent = q.text || '';
      if (quoteAuthor) quoteAuthor.textContent = q.author || '';
      if (quoteSource) quoteSource.textContent = q.source || '';
      if (favBtn) {
        db.favoriteQuotes.where('quoteId').equals(q.id).first().then(f => {
          favBtn.classList.toggle('favorited', !!f);
        }).catch(() => favBtn.classList.remove('favorited'));
      }
      speakText(q.text, q.id);
    }

    async function renderFavorites(){
      if (!favoritesGrid) return;
      const favEntries = await db.favoriteQuotes.toArray().catch(()=>[]);
      const favoriteIds = (favEntries||[]).map(f=>f.quoteId);
      const favQuotes = motivationalQuotesSystem.quotes.filter(q=>favoriteIds.includes(q.id));
      if (favQuotes.length === 0){
        favoritesGrid.innerHTML = '<div class="favorites-empty">No favorites yet. Click the <i class="far fa-heart"></i> on a quote to save it!</div>';
        return;
      }
      favoritesGrid.innerHTML = favQuotes.map((q, idx)=>`
        <div class="favorite-quote-item" data-quoteid="${q.id}" style="animation-delay:${idx * 0.05}s">
          <div class="favorite-quote-text">${escapeHtml(q.text)}</div>
          <div class="favorite-quote-author">${escapeHtml(q.author || '')}</div>
          <div class="favorite-quote-meta">
            <div class="favorite-quote-category" data-category="${escapeHtml(q.category || '')}">${escapeHtml(q.category || '')}</div>
            <button class="favorite-quote-remove" data-quoteid="${q.id}"><i class="fas fa-times"></i></button>
          </div>
        </div>
      `).join('');
    }

    render(currentQuote);

    if (newBtn) newBtn.addEventListener('click', () => {
      newBtn.classList.add('spinning');
      setTimeout(() => newBtn.classList.remove('spinning'), 500);
      const q = activeQuoteCategory
        ? motivationalQuotesSystem.getQuoteByCategory(activeQuoteCategory)
        : motivationalQuotesSystem.getRandomQuote();
      render(q);
    });
    if (favBtn) favBtn.addEventListener('click', async () => {
      if (!currentQuote) return;
      const nowFav = await motivationalQuotesSystem.toggleFavorite(currentQuote.id).catch(() => null);
      if (nowFav !== null) {
        favBtn.classList.toggle('favorited', !!nowFav);
        if (sounds && sounds.favorite && typeof sounds.favorite.play === 'function') try{ sounds.favorite.play(); }catch(e){}
      }
      renderFavorites();
    });

    // Mute quote audio toggle
    const muteBtn = document.getElementById('mute-quote');
    if (muteBtn) {
      syncMuteButton();
      muteBtn.addEventListener('click', () => {
        const nowMuted = !getQuoteAudioMuted();
        setQuoteAudioMuted(nowMuted);
        if (nowMuted && currentQuoteAudio) {
          currentQuoteAudio.pause();
          currentQuoteAudio = null;
        }
        syncMuteButton();
      });
    }

    // Remove favorite via event delegation
    if (favoritesGrid) {
      favoritesGrid.addEventListener('click', async (e) => {
        const removeBtn = e.target.closest('.favorite-quote-remove');
        if (!removeBtn) return;
        const qid = parseInt(removeBtn.dataset.quoteid, 10);
        if (!qid) return;
        const item = removeBtn.closest('.favorite-quote-item');
        if (item) {
          item.classList.add('favorite-removing');
          await new Promise(r => setTimeout(r, 280));
        }
        await db.favoriteQuotes.where('quoteId').equals(qid).delete().catch(()=>{});
        renderFavorites();
        // Also update the heart icon if the removed quote is the current one
        if (currentQuote && currentQuote.id === qid && favBtn) favBtn.classList.remove('favorited');
      });
    }

    document.querySelectorAll('.category-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category;
        if (activeQuoteCategory === cat) {
          activeQuoteCategory = null;
          btn.classList.remove('active');
          render(motivationalQuotesSystem.getRandomQuote());
        } else {
          document.querySelectorAll('.category-button').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          activeQuoteCategory = cat;
          render(motivationalQuotesSystem.getQuoteByCategory(cat));
        }
      });
    });

    // wire toggle favorites visibility
    const toggleFav = document.querySelector('.toggle-favorites');
    if (toggleFav && favoritesGrid){
      toggleFav.addEventListener('click', ()=>{
        const isShown = favoritesGrid.classList.toggle('active');
        toggleFav.textContent = isShown ? 'Hide' : 'Show';
      });
    }

    // initial favorites render
    renderFavorites();
  } catch (e) {
    console.error('initializeQuotes error', e);
  }
}

function displayQuoteByContext(context, questCategory) {
  try {
    let cat = activeQuoteCategory;
    if (!cat && questCategory) {
      cat = questToQuoteCategory[questCategory.toLowerCase()] || null;
    }
    const q = cat
      ? motivationalQuotesSystem.getQuoteByCategory(cat)
      : motivationalQuotesSystem.getQuoteByContext(context);
    if (!q) return;
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const quoteSource = document.getElementById('quote-source');
    const container = document.querySelector('.quote-container');
    if (quoteText) quoteText.textContent = q.text || '';
    if (quoteAuthor) quoteAuthor.textContent = q.author || '';
    if (quoteSource) quoteSource.textContent = q.source || '';
    currentQuote = q;
    const favBtn = document.getElementById('favorite-quote');
    if (favBtn) {
      db.favoriteQuotes.where('quoteId').equals(q.id).first().then(f => {
        favBtn.classList.toggle('favorited', !!f);
      }).catch(() => favBtn.classList.remove('favorited'));
    }
    if (container) {
      container.classList.add('quote-pop');
      setTimeout(() => container.classList.remove('quote-pop'), 5000);
    }
    speakText(q.text, q.id);
  } catch (e) {
    console.error('displayQuoteByContext error', e);
  }
}

async function updateStatDetails() {
  try {
    const stats = currentStats || {};
    const statKeys = ['strength','agility','intelligence','stamina','willpower','discipline'];

    // Determine maxStatValue for scaling, considering both current and previous stats if comparing
    let maxVal = 0;
    if (currentChartView === 'compare' && previousStats) {
      maxVal = Math.max(...Object.keys(stats).map(k => Number(stats[k] || 0)), ...Object.keys(previousStats).map(k => Number(previousStats[k] || 0)), 0);
    } else {
      maxVal = Math.max(...Object.keys(stats).map(k => Number(stats[k] || 0)), 0);
    }
    maxVal = Math.max(100, maxVal); // Ensure a minimum max value for scaling

    // Pre-fetch stat changes once (not per-iteration) to avoid 6 parallel queries
    const changes = (currentChartView !== 'compare' || !previousStats) ? await getStatChanges() : null;
    let total = 0;
    statKeys.forEach(stat => {
      const bar = document.getElementById(`${stat}-progress`);
      const valEl = document.getElementById(`${stat}-value`);
      const changeEl = document.getElementById(`${stat}-change`); // Get the change element
      const value = stats[stat] || 0;
      total += value;

      if (bar) {
        const pct = Math.min(100, Math.round((value / maxVal) * 100));
        bar.style.width = pct + '%';
      }
      if (valEl) valEl.textContent = value;
      
      // Update stat changes
      if (changeEl) {
        if (currentChartView === 'compare' && previousStats) {
          const prev = previousStats[stat] || 0;
          const diff = value - prev;
          const pct = prev > 0 ? Math.round((diff / prev) * 100) : (diff > 0 ? 100 : 0);
          changeEl.textContent = `${diff > 0 ? '+' : ''}${diff} (${pct > 0 ? '+' : ''}${pct}%)`;
          changeEl.classList.toggle('positive', diff > 0);
          changeEl.classList.toggle('negative', diff < 0);
        } else {
          if (changes && changes[stat] !== undefined) {
            const change = changes[stat];
            changeEl.textContent = change > 0 ? `+${change}` : (change < 0 ? `${change}` : '0');
            changeEl.classList.toggle('positive', change > 0);
            changeEl.classList.toggle('negative', change < 0);
          } else {
            changeEl.textContent = '0'; // No change or no history
            changeEl.classList.remove('positive', 'negative');
          }
        }
      }
    });

    // Update total and average in header
    const totalEl = document.getElementById('stat-total-value');
    const avgEl = document.getElementById('stat-avg-value');
    if (totalEl) totalEl.textContent = total;
    if (avgEl) avgEl.textContent = Math.round(total / statKeys.length);

    // Render the spider/radar polygon visualization
    try { 
      renderSpiderChart(stats, maxVal); 
      if (currentChartView === 'compare' && previousStats) {
        drawComparisonChart(previousStats, maxVal);
      }
    } catch(e) { /* non-fatal */ }
  } catch (e) {
    console.error('updateStatDetails error', e);
  }
}

// Draw a simple radar/spider chart SVG inside the .stats-chart container
function renderSpiderChart(stats, maxVal) {
  try {
    const container = document.querySelector('.stats-chart');
    if (!container) return;
    const s = stats || currentStats || {};
    const keys = ['strength','agility','intelligence','stamina','willpower','discipline'];
    const size = 200;
    const cx = size/2;
    const cy = size/2;
    const radius = Math.min(size/2 - 10, 90);
    // const maxFromStats = Math.max(...Object.keys(s).map(k => Number(s[k] || 0)), 0);
    // const maxVal = Math.max(100, (typeof MAX_STAT !== 'undefined' ? MAX_STAT : 100), maxFromStats);

    // helper to compute point
    const points = keys.map((k, i) => {
      const pct = Math.max(0, Math.min(1, (Number(s[k]) || 0) / maxVal));
      const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
      const x = cx + Math.cos(angle) * pct * radius;
      const y = cy + Math.sin(angle) * pct * radius;
      return `${x},${y}`;
    }).join(' ');

    // grid polygons (3 rings)
    const rings = [0.25,0.5,0.75,1].map(r => {
      const pts = keys.map((k,i)=>{
        const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
        const x = cx + Math.cos(angle) * r * radius;
        const y = cy + Math.sin(angle) * r * radius;
        return `${x},${y}`;
      }).join(' ');
      return `<polygon points="${pts}" fill="none" stroke="#222" stroke-opacity="${0.08}" stroke-width="1" />`;
    }).join('');

    // axis lines
    const axes = keys.map((k,i)=>{
      const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
      const x = cx + Math.cos(angle) * radius;
      const y = cy + Math.sin(angle) * radius;
      return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="#222" stroke-opacity="0.06" stroke-width="1"/>`;
    }).join('');

    // small labels
    const labels = keys.map((k,i)=>{
      const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
      const x = cx + Math.cos(angle) * (radius + 14);
      const y = cy + Math.sin(angle) * (radius + 14);
      return `<text x="${x}" y="${y}" font-size="10" fill="#ddd" text-anchor="middle" dominant-baseline="middle">${k.charAt(0).toUpperCase()+k.slice(1)}</text>`;
    }).join('');

    // circles at points
    const dots = keys.map((k,i)=>{
      const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
      const pct = Math.max(0, Math.min(1, (Number(s[k])||0)/maxVal));
      const x = cx + Math.cos(angle) * pct * radius;
      const y = cy + Math.sin(angle) * pct * radius;
      return `<circle cx="${x}" cy="${y}" r="3" fill="#4a90e2" />`;
    }).join('');

    const svg = `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0" x2="1">
            <stop offset="0%" stop-color="#4a90e2" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#7ac7ff" stop-opacity="0.4" />
          </linearGradient>
          <linearGradient id="grad-prev" x1="0" x2="1">
            <stop offset="0%" stop-color="#f39c12" stop-opacity="0.6" />
            <stop offset="100%" stop-color="#f1c40f" stop-opacity="0.4" />
          </linearGradient>
        </defs>
        <g class="spider-chart-grid">
          ${rings}
          ${axes}
        </g>
        <g class="spider-chart-current">
          <polygon points="${points}" fill="url(#grad)" stroke="#4a90e2" stroke-width="2" fill-opacity="0.35" />
          ${dots}
        </g>
        <g class="spider-chart-labels">
          ${labels}
        </g>
      </svg>
    `;

    container.innerHTML = svg;
  } catch (e) {
    console.error('renderSpiderChart error', e);
  }
}

// Draw comparison chart polygon on the same SVG
function drawComparisonChart(stats, maxVal) {
  try {
    const container = document.querySelector('.stats-chart');
    if (!container) return;
    const s = stats || {};
    const keys = ['strength','agility','intelligence','stamina','willpower','discipline'];
    const size = 200;
    const cx = size/2;
    const cy = size/2;
    const radius = Math.min(size/2 - 10, 90);

    const points = keys.map((k, i) => {
      const pct = Math.max(0, Math.min(1, (Number(s[k]) || 0) / maxVal));
      const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
      const x = cx + Math.cos(angle) * pct * radius;
      const y = cy + Math.sin(angle) * pct * radius;
      return `${x},${y}`;
    }).join(' ');

    const dots = keys.map((k,i)=>{
      const angle = (Math.PI * 2 * i) / keys.length - Math.PI / 2;
      const pct = Math.max(0, Math.min(1, (Number(s[k])||0)/maxVal));
      const x = cx + Math.cos(angle) * pct * radius;
      const y = cy + Math.sin(angle) * pct * radius;
      return `<circle cx="${x}" cy="${y}" r="3" fill="#f39c12" />`;
    }).join('');

    // Append a new group for the previous stats (before current group so it renders behind)
    const svgElement = container.querySelector('svg');
    if (svgElement) {
      let prevGroup = svgElement.querySelector('.spider-chart-previous');
      if (!prevGroup) {
        prevGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        prevGroup.classList.add('spider-chart-previous');
        // Insert before the current stats group so previous renders behind current
        const currentGroup = svgElement.querySelector('.spider-chart-current');
        if (currentGroup) {
          svgElement.insertBefore(prevGroup, currentGroup);
        } else {
          svgElement.appendChild(prevGroup);
        }
      }
      prevGroup.innerHTML = `
        <polygon points="${points}" fill="url(#grad-prev)" stroke="#f39c12" stroke-width="2" fill-opacity="0.35" />
        ${dots}
      `;
    }
  } catch (e) {
    console.error('drawComparisonChart error', e);
  }
}

// Draw historical stats line chart (SVG)
function drawHistoryChart(historyData) {
  const historyChart = document.getElementById('history-chart');
  if (!historyChart) return;

  if (!historyData || historyData.length === 0) {
    historyChart.innerHTML = '<div class="history-placeholder">No historical data yet. Complete quests to start tracking!</div>';
    return;
  }

  const keys = ['strength','agility','intelligence','stamina','willpower','discipline'];
  const colors = ['#e74c3c','#2ecc71','#3498db','#f39c12','#9b59b6','#1abc9c'];

  const rect = historyChart.getBoundingClientRect();
  const width = Math.max(rect.width || 600, 300);
  const height = 250;
  const pad = { top: 20, right: 20, bottom: 45, left: 45 };
  const cw = width - pad.left - pad.right;
  const ch = height - pad.top - pad.bottom;

  const sorted = [...historyData].sort((a, b) => new Date(a.date) - new Date(b.date));

  let maxVal = 0;
  sorted.forEach(d => keys.forEach(k => { maxVal = Math.max(maxVal, Number(d[k] || 0)); }));
  maxVal = Math.max(100, maxVal);

  const xF = (i) => pad.left + (sorted.length > 1 ? (i / (sorted.length - 1)) * cw : cw / 2);
  const yF = (v) => pad.top + ch - (v / maxVal) * ch;

  const lines = keys.map((key, ki) => {
    const pts = sorted.map((d, i) => `${xF(i)},${yF(Number(d[key] || 0))}`).join(' ');
    return `<polyline points="${pts}" fill="none" stroke="${colors[ki]}" stroke-width="2" opacity="0.85" stroke-linejoin="round" />`;
  }).join('');

  const dots = keys.map((key, ki) => {
    return sorted.map((d, i) => {
      const cx = xF(i), cy = yF(Number(d[key] || 0));
      const isLast = i === sorted.length - 1;
      return `<circle cx="${cx}" cy="${cy}" r="${isLast ? 4 : 2.5}" fill="${colors[ki]}" stroke="#1a1a2e" stroke-width="1" opacity="0.9" />`;
    }).join('');
  }).join('');

  const xLabels = sorted.map((d, i) => {
    const date = new Date(d.date);
    const show = sorted.length <= 14 || i % Math.ceil(sorted.length / 10) === 0 || i === sorted.length - 1;
    return show
      ? `<text x="${xF(i)}" y="${height - pad.bottom + 18}" font-size="9" fill="#999" text-anchor="middle">${date.getMonth()+1}/${date.getDate()}</text>`
      : '';
  }).join('');

  const yLabels = [];
  const steps = 4;
  for (let i = 0; i <= steps; i++) {
    const val = Math.round((maxVal / steps) * i);
    const y = yF(val);
    yLabels.push(`
      <text x="${pad.left - 8}" y="${y + 3}" font-size="9" fill="#999" text-anchor="end">${val}</text>
      <line x1="${pad.left}" y1="${y}" x2="${width - pad.right}" y2="${y}" stroke="#333" stroke-width="0.5" stroke-dasharray="3,3" />
    `);
  }

  const cols = 3;
  const legend = keys.map((key, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const lx = pad.left + col * (cw / cols);
    const ly = height - pad.bottom + 32 + row * 16;
    const lastVal = sorted[sorted.length - 1][key] || 0;
    return `
      <line x1="${lx}" y1="${ly}" x2="${lx + 14}" y2="${ly}" stroke="${colors[i]}" stroke-width="2.5" stroke-linecap="round" />
      <text x="${lx + 18}" y="${ly + 4}" font-size="9" fill="#bbb">${key.charAt(0).toUpperCase() + key.slice(1)}</text>
      <text x="${lx + 18 + key.length * 6 + 4}" y="${ly + 4}" font-size="9" fill="#666">${lastVal}</text>
    `;
  }).join('');

  historyChart.innerHTML = `
    <svg width="100%" height="${height}" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
      <rect x="0" y="0" width="${width}" height="${height}" fill="transparent" />
      ${yLabels.join('')}
      ${lines}
      ${dots}
      ${xLabels}
      ${legend}
    </svg>
  `;
}


// Add these functions to track and store stat history
async function recordStatHistory() {
  const playerStats = await db.playerStats.toArray();
  if (playerStats.length === 0) return;
  
  const stats = playerStats[0];
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Normalize to start of day
  
  // Check if we already have an entry for today
  const existingEntry = await db.statHistory
    .where('date')
    .equals(today.toISOString())
    .first();
  
  if (existingEntry) {
    // Update today's entry
    existingEntry.strength = stats.strength;
    existingEntry.agility = stats.agility;
    existingEntry.intelligence = stats.intelligence;
    existingEntry.stamina = stats.stamina;
    existingEntry.willpower = stats.willpower;
    existingEntry.discipline = stats.discipline;
    await db.statHistory.put(existingEntry);
  } else {
    // Create a new entry for today
    await db.statHistory.add({
      date: today.toISOString(),
      strength: stats.strength,
      agility: stats.agility,
      intelligence: stats.intelligence,
      stamina: stats.stamina,
      willpower: stats.willpower,
      discipline: stats.discipline
    });
  }
}

// Get historical stats for a specific time range
async function getHistoricalStats(range) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let startDate = new Date(today);
  
  switch (range) {
    case 'week':
      startDate.setDate(today.getDate() - 7);
      break;
    case 'month':
      startDate.setMonth(today.getMonth() - 1);
      break;
    case 'alltime':
      startDate = new Date(0); // Beginning of time
      break;
  }
  
  return await db.statHistory
    .where('date')
    .between(startDate.toISOString(), today.toISOString(), true, true)
    .toArray();
}

// Get stat changes since last record
async function getStatChanges() {
  const history = await db.statHistory
    .orderBy('date')
    .reverse()
    .limit(2)
    .toArray();
  
  if (history.length < 2) return null;
  
  const current = history[0];
  const previous = history[1];
  
  return {
    strength: current.strength - previous.strength,
    agility: current.agility - previous.agility,
    intelligence: current.intelligence - previous.intelligence,
    stamina: current.stamina - previous.stamina,
    willpower: current.willpower - previous.willpower,
    discipline: current.discipline - previous.discipline
  };
}

function initializeEnhancedUI() {
  try {
    const avatar = document.querySelector('.avatar');
    const characterTitleStats = document.getElementById('character-title-stats');
    const spiderModal = document.getElementById('spider-chart-modal');
    const spiderClose = document.getElementById('spider-chart-modal-close');
    const overlay = document.getElementById('modal-overlay');

    const chartTabs = document.querySelectorAll('.chart-tab');
    const timeButtons = document.querySelectorAll('.time-button');
    const timeRangeControls = document.getElementById('time-range-controls');
    const statDetailsContainer = document.querySelector('.stat-details-container');
    const historyChartContainer = document.querySelector('.history-chart-container');
    const previousConnectionElem = document.querySelector('.stats-connection.previous');
    const chartLegendElem = document.querySelector('.chart-legend');

    async function openSpider(e) {
      if (e && e.preventDefault) e.preventDefault();
      if (!spiderModal) return;
      spiderModal.style.display = 'flex';
      if (overlay) overlay.classList.add('show');
      document.body.style.overflow = 'hidden';

      const content = spiderModal.querySelector('.spider-chart-content');
      if (content) {
        content.classList.remove('modal-enter');
        void content.offsetWidth;
        content.classList.add('modal-enter');
      }

      await recordStatHistory(); // Record current stats when opening the chart
      await switchChartView('current'); // Set default view (calls updateStatDetails internally)
    }
    function closeSpider() {
      if (!spiderModal) return;
      spiderModal.style.display = 'none';
      if (overlay) overlay.classList.remove('show');
      document.body.style.overflow = '';
    }

    // Primary click targets
    if (avatar) avatar.addEventListener('click', openSpider);
    if (characterTitleStats) characterTitleStats.addEventListener('click', openSpider);

    // Also allow clicking the stats container, individual stat cards, or the user-profile
    const statsContainer = document.querySelector('.stats');
    const statsGrid = document.querySelector('.stats-grid');
    const statCards = document.querySelectorAll('.stat-card');
    const userProfile = document.querySelector('.user-profile');

    if (statsContainer) statsContainer.addEventListener('click', openSpider);
    if (statsGrid) statsGrid.addEventListener('click', openSpider);
    if (userProfile) userProfile.addEventListener('click', openSpider);
    statCards.forEach(card => {
      // avoid interfering with nested controls like buttons
      card.addEventListener('click', (ev) => {
        const targetIsControl = ev.target.closest('button, a, input, .quest-check');
        if (!targetIsControl) openSpider(ev);
      });
    });

    if (spiderClose) spiderClose.addEventListener('click', closeSpider);

    // Ensure overlay click closes spider modal when open
    if (overlay) {
      overlay.addEventListener('click', () => {
        if (spiderModal && spiderModal.style.display === 'flex') closeSpider();
      });
    }

    // Escape key closes the modal
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && spiderModal && spiderModal.style.display === 'flex') closeSpider();
    });

    // Chart tab handling
    chartTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        chartTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const view = tab.id.replace('view-', '');
        switchChartView(view);
      });
    });

    // Time range button handling
    timeButtons.forEach(button => {
      button.addEventListener('click', () => {
        timeButtons.forEach(b => b.classList.remove('active'));
        button.classList.add('active');
        timeRange = button.dataset.range;
        if (currentChartView === 'history') {
          getHistoricalStats(timeRange).then(historyData => {
            if (currentChartView !== 'history') return; // guard: view may have changed
            drawHistoryChart(historyData);
          });
        }
      });
    });

    // wire view toggle (existing functionality)
    try{ if (typeof initializeViewToggle === 'function') initializeViewToggle(); }catch(e){}

  } catch (e) {
    console.error('initializeEnhancedUI error', e);
  }
}

// Function to switch between chart views
async function switchChartView(view) {
  currentChartView = view;
  
  // Hide/show elements based on view
  const connElem = document.querySelector('.stats-connection.previous');
  if (connElem) connElem.style.display = 'none';
  if (chartLegendElem) chartLegendElem.style.display = 'none';
  if (timeRangeControls) timeRangeControls.style.display = 'none';
  if (statDetailsContainer) statDetailsContainer.style.display = 'none';
  if (historyChartContainer) historyChartContainer.style.display = 'none';

  switch (view) {
      case 'current':
          if (statDetailsContainer) statDetailsContainer.style.display = 'block';
          await updateStatDetails();
          break;
      case 'history':
          if (timeRangeControls) timeRangeControls.style.display = 'flex';
          if (historyChartContainer) historyChartContainer.style.display = 'block';
          // Load and display history data
          const historyData = await getHistoricalStats(timeRange);
          drawHistoryChart(historyData);
          break;
      case 'compare':
          // Get previous stats for comparison
          db.statHistory
              .orderBy('date')
              .reverse()
              .offset(1) // Skip current day
              .limit(1)
              .first()
              .then(async (prevStats) => {
                  // Guard: user might have switched views while the query was running
                  if (currentChartView !== 'compare') return;
                  if (prevStats) {
                      previousStats = {
                          strength: prevStats.strength,
                          agility: prevStats.agility,
                          intelligence: prevStats.intelligence,
                          stamina: prevStats.stamina,
                          willpower: prevStats.willpower,
                          discipline: prevStats.discipline
                      };
                      const connElem2 = document.querySelector('.stats-connection.previous');
                      if (connElem2) connElem2.style.display = 'block';
                      if (chartLegendElem) chartLegendElem.style.display = 'flex';
                      if (statDetailsContainer) statDetailsContainer.style.display = 'block';
                      await updateStatDetails(); // Will call drawComparisonChart internally
                  } else {
                      showNotification("No previous data available for comparison.");
                      switchChartView('current');
                  }
              });
          break;
  }
}

// Highlight a specific stat when clicked (placeholder, can be enhanced for SVG interaction)
function highlightStat(stat) {
  // This function would typically highlight an SVG element
  // For now, it could highlight the stat detail card
  document.querySelectorAll('.stat-detail').forEach(elem => {
      elem.classList.remove('highlighted');
  });
  const statDetail = document.querySelector(`.stat-detail[data-stat="${stat}"]`);
  if (statDetail) {
      statDetail.classList.add('highlighted');
      statDetail.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
}


function applyView(view) {
  const containerEl = document.querySelector('.container');
  const questsEl = document.getElementById('quests');
  const statsEl = document.querySelector('.stats');
  if (!containerEl) return;
  containerEl.classList.remove('dashboard-view', 'detailed-view', 'compact-view');
  containerEl.classList.add(`${view}-view`);
  if (questsEl) {
    questsEl.classList.remove('view-detailed', 'view-compact', 'view-dashboard');
    questsEl.classList.add(`view-${view}`);
  }
  if (statsEl) {
    statsEl.classList.remove('view-detailed', 'view-compact', 'view-dashboard');
    statsEl.classList.add(`view-${view}`);
  }
  try { localStorage.setItem('preferredView', view); } catch (e) { /* private browsing */ }
  // Dispatch event so other components can react
  document.dispatchEvent(new CustomEvent('viewchange', { detail: { view } }));
}

function initializeViewToggle(){
  try{
    const btns = document.querySelectorAll('.view-btn');
    const savedView = localStorage.getItem('preferredView') || 'dashboard';
    // Refresh streak display when view changes (detailed view shows day dates)
    document.addEventListener('viewchange', () => updateStreakDisplay());
    // Activate saved view button
    const targetBtn = document.querySelector(`.view-btn[data-view="${savedView}"]`);
    if (targetBtn) {
      btns.forEach(b => b.classList.remove('active'));
      targetBtn.classList.add('active');
    }
    applyView(savedView);
    btns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        btns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        applyView(btn.dataset.view);
      });
    });
  }catch(e){console.error('initializeViewToggle error',e);} 
}

(function(){
  // Global error overlay for easier debugging in-browser
  function showErrorOverlay(msg){
    try {
      let el = document.getElementById('error-log-overlay');
      if (!el) {
        el = document.createElement('div');
        el.id = 'error-log-overlay';
        el.style.position = 'fixed';
        el.style.right = '10px';
        el.style.bottom = '10px';
        el.style.maxWidth = '480px';
        el.style.background = 'rgba(17,17,17,0.95)';
        el.style.color = '#fff';
        el.style.padding = '12px';
        el.style.borderRadius = '8px';
        el.style.zIndex = '9999';
        el.style.fontFamily = 'monospace';
        el.style.fontSize = '12px';
        el.style.whiteSpace = 'pre-wrap';
        el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.6)';
        el.style.display = 'none';
        document.body.appendChild(el);
      }
      el.textContent = (new Date()).toISOString() + '\n' + msg;
      el.style.display = 'block';
    } catch (err) {
      // swallow
      console.warn('showErrorOverlay failed', err);
    }
  }

  window.addEventListener('error', function(e){
    try {
      const msg = (e.error && e.error.stack) ? e.error.stack : (e.message || String(e));
      console.error('Captured error', msg);
      showErrorOverlay(msg);
    } catch (err) {}
  });
  window.addEventListener('unhandledrejection', function(e){
    try {
      const msg = (e.reason && e.reason.stack) ? e.reason.stack : String(e.reason);
      console.error('Unhandled rejection', msg);
      showErrorOverlay(msg);
    } catch (err) {}
  });
})();

// Theme Initialization
function initializeTheme() {
  const themeButton = document.getElementById('theme-button'); // Get the toggle button
  const themeIcon = themeButton ? themeButton.querySelector('i') : null; // Get the icon within the button

  const applyTheme = (theme) => {
    document.body.classList.remove('theme-light'); // Always remove theme-light first
    if (theme === 'light') {
      document.body.classList.add('theme-light');
      if (themeIcon) {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
      }
    } else { // 'dark' theme
      if (themeIcon) {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
      }
    }
    try { localStorage.setItem('theme', theme); } catch (e) { /* private browsing */ }
  };

  // Set initial theme based on localStorage or default to dark
  let initialTheme = 'dark';
  try { initialTheme = localStorage.getItem('theme') || 'dark'; } catch (e) { /* private browsing */ }
  applyTheme(initialTheme); // Apply initial theme and set icon

  // Add event listener for the theme toggle button
  if (themeButton) {
    themeButton.addEventListener('click', () => {
      let currentTheme = 'dark';
      try { currentTheme = localStorage.getItem('theme') || 'dark'; } catch (e) { /* private browsing */ }
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
}
function startTourGuide() {
  closeSettingsModal();

  // --- Tour abort mechanism ---
  if (window._tourActive) return; // prevent double tour
  window._tourActive = true;

  function abortTour() {
    endTour();
  }

  document.addEventListener('keydown', _tourEscHandler = function(e) {
    if (e.key === 'Escape') abortTour();
  });

  // Click outside highlighted element -> dismiss (but not on tooltip buttons)
  document.addEventListener('click', _tourOutsideHandler = function(e) {
    if (!window._tourActive) return;
    if (e.target.closest('.tour-tooltip') || e.target.closest('.tour-buttons')) return;
    const hl = document.querySelector('.tour-highlight');
    if (hl && !hl.contains(e.target)) abortTour();
  });

  const steps = [
    {
      element: ".user-profile",
      title: "Welcome, Hunter!",
      content:
        "Your profile — display name and cultivation title appear here. " +
        "Progress through the ranks by maintaining your daily streak. " +
        "Click your avatar to open the spider stat chart!",
      position: "bottom",
    },
    {
      element: ".level-up",
      title: "Level & XP",
      content:
        "Your overall level and experience points. Complete quests to earn XP. " +
        "Each level-up increases your power. The bar shows progress to the next level.",
      position: "bottom",
    },
    {
      element: ".streak-container",
      title: "Daily Streak",
      content:
        "Complete at least one quest each day to maintain your streak. " +
        "Longer streaks unlock higher cultivation titles — from Mortal to Dao Ancestor! " +
        "The week bar shows which days you've been active.",
      position: "bottom",
    },
    {
      element: ".stats",
      title: "Character Stats",
      content:
        "Six core stats: Strength, Agility, Intelligence, Stamina, Willpower, and Discipline. " +
        "Each grows as you complete quests tagged with that stat. " +
        "Click any stat card or your avatar for a full spider radar chart with history!",
      position: "top",
    },
    {
      element: ".quests",
      title: "Quests",
      content:
        "Your quest list. Each quest has a difficulty (Easy / Medium / Hard), XP reward, and stat type. " +
        "Click the checkbox to complete it. Right-click (or long-press on mobile) a quest to edit or delete it. " +
        "Use the toolbar above to search, filter by category/difficulty/stat, sort, or batch-select multiple quests.",
      position: "top",
    },
    {
      element: "#add-quest-btn",
      title: "Creating Quests",
      content:
        "Click 'Add New Quest' to open the quest editor. Set a title, category (Work/Health/etc), " +
        "difficulty, XP reward, stat type, due date, and optional comment with pin. " +
        "Click the lightbulb icon for AI-powered quest suggestions based on your incomplete achievements!",
      position: "top",
    },
    {
      element: ".quote-container",
      title: "Daily Quote & Audio",
      content:
        "A daily motivational quote — click the quote text to hear it spoken aloud (TTS). " +
        "Use the ♥ button to save to your favorites. The ↻ button fetches a random quote. " +
        "Use the category buttons (Power/Wisdom/Discipline/Growth/Perseverance/Faith) to filter. " +
        "The speaker icon toggles audio on/off.",
      position: "top",
    },
    {
      element: ".timer-controls",
      title: "Pomodoro Timer",
      content:
        "A built-in focus timer. Switch between Work (25min), Break (5min), and Long Break (15min) modes. " +
        "Use Play, Pause, and Reset to control the timer. Completing pomodoro sessions earns achievements!",
      position: "top",
    },
    {
      element: ".achievements-container",
      title: "Achievements",
      content:
        "35 achievements across categories: Quests, Streaks, Stats, Leveling, and Pomodoro. " +
        "Filter by All/Unlocked/Locked status or by category tab. " +
        "Completing achievements is tracked and displayed as progress!",
      position: "top",
    },
    {
      element: ".favorites-container",
      title: "Favorite Quotes",
      content:
        "Your saved favorite quotes live here. Click the Hide/Show toggle to collapse or expand the list. " +
        "Save a quote by clicking the ♥ button on any daily quote.",
      position: "top",
    },
    {
      element: "#settings-icon",
      title: "Settings & Data",
      content:
        "Open settings to: choose Male/Female quote voice, edit your display name, " +
        "save/load game states (multiple slots), export/import game data as JSON, " +
        "load default quests, save custom defaults, remove duplicate quests, " +
        "or sign in with Google for cloud-backed progress across devices!",
      position: "right",
    },
    {
      element: ".view-toggle",
      title: "View Modes",
      content:
        "Switch between Dashboard, Detailed, and Compact view modes. " +
        "Each changes how your stats, quests, streak bar, and pomodoro timer are displayed — " +
        "try them all! The theme toggle (moon/sun icon at the top) switches between Dark and Light mode.",
      position: "right",
    },
  ].filter(s => {
    if (!document.querySelector(s.element)) {
      console.warn(`Tour: skipping "${s.title}" — element "${s.element}" not found`);
      return false;
    }
    return true;
  });

  if (steps.length === 0) {
    window._tourActive = false;
    return;
  }

  let currentStep = 0;

  function showStep(step) {
    hideStep();

    const element = document.querySelector(step.element);
    if (!element) { nextStep(); return; }

    element.scrollIntoView({ behavior: 'smooth', block: 'center' });

    setTimeout(() => {
      if (!window._tourActive) return;
      element.classList.add("tour-highlight");

      const tooltip = document.createElement("div");
      tooltip.className = `tour-tooltip ${step.position}`;
      const isLast = currentStep >= steps.length - 1;
      // Build dot indicators (clickable)
      const dotsHtml = steps.map((_, i) =>
        `<span class="tour-dot${i === currentStep ? ' active' : ''}" data-step="${i}"></span>`
      ).join('');
      tooltip.innerHTML = `
        <button class="tour-dismiss" title="Dismiss tour" aria-label="End tour">✕</button>
        <h3>${escapeHtml(step.title)}</h3>
        <p>${escapeHtml(step.content)}</p>
        <div class="tour-buttons">
          <button class="tour-end-silent">End Tour</button>
          <span style="flex:1"></span>
          ${currentStep > 0 ? '<button class="tour-prev">← Back</button>' : ''}
          ${!isLast
            ? '<button class="tour-next">Next →</button>'
            : '<button class="tour-end">Finish</button>'}
        </div>
        <div class="tour-pagination">
          <span class="tour-step-indicator">${currentStep + 1} / ${steps.length}</span>
          <div class="tour-dots">${dotsHtml}</div>
        </div>
      `;

      document.body.appendChild(tooltip);
      positionTooltip(element, tooltip, step.position);

      tooltip.querySelector(".tour-dismiss")?.addEventListener("click", (e) => { e.stopPropagation(); abortTour(); });
      tooltip.querySelector(".tour-end-silent")?.addEventListener("click", (e) => { e.stopPropagation(); abortTour(); });
      tooltip.querySelector(".tour-prev")?.addEventListener("click", (e) => { e.stopPropagation(); previousStep(); });
      tooltip.querySelector(".tour-next")?.addEventListener("click", (e) => { e.stopPropagation(); nextStep(); });
      tooltip.querySelector(".tour-end")?.addEventListener("click", (e) => { e.stopPropagation(); abortTour(); });
      // Clickable dot pagination
      tooltip.querySelectorAll(".tour-dot").forEach(dot => {
        dot.addEventListener("click", (e) => {
          e.stopPropagation();
          const idx = parseInt(dot.dataset.step);
          if (!isNaN(idx) && idx >= 0 && idx < steps.length) goToStep(idx);
        });
      });
    }, 350);
  }

  function positionTooltip(element, tooltip, position) {
    const elementRect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const viewportH = window.innerHeight;
    let top, left;
    const gap = 16;

    switch (position) {
      case "top":
        top = elementRect.top - tooltipRect.height - gap;
        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = elementRect.bottom + gap;
        left = elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.left - tooltipRect.width - gap;
        break;
      case "right":
        top = elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.right + gap;
        break;
    }

    // Clamp inside viewport with opposite-side fallback
    const pad = 10;
    if (left < pad) left = pad;
    if (top < pad) top = pad;
    if (left + tooltipRect.width > viewportW - pad) {
      left = viewportW - tooltipRect.width - pad;
    }
    if (top + tooltipRect.height > viewportH - pad) {
      if (position === "bottom") top = elementRect.top - tooltipRect.height - gap;
      else if (position === "top") top = elementRect.bottom + gap;
      else top = viewportH - tooltipRect.height - pad;
    }

    tooltip.style.top = `${top + window.scrollY}px`;
    tooltip.style.left = `${left + window.scrollX}px`;
  }

  function hideStep() {
    document.querySelectorAll(".tour-highlight").forEach(el => el.classList.remove("tour-highlight"));
    document.querySelectorAll(".tour-tooltip").forEach(t => { if (t && t.parentNode) t.remove(); });
  }

  function nextStep() {
    currentStep++;
    if (currentStep < steps.length) showStep(steps[currentStep]);
    else abortTour();
  }

  function previousStep() {
    currentStep = Math.max(0, currentStep - 1);
    showStep(steps[currentStep]);
  }

  function goToStep(index) {
    if (index < 0 || index >= steps.length) return;
    currentStep = index;
    showStep(steps[currentStep]);
  }

  function endTour() {
    // Remove all tour state
    window._tourActive = false;
    hideStep();
    currentStep = 0;
    document.getElementById("modal-overlay")?.classList.remove("show");
    // Clean up global listeners
    if (window._tourEscHandler) { document.removeEventListener('keydown', window._tourEscHandler); window._tourEscHandler = null; }
    if (window._tourOutsideHandler) { document.removeEventListener('click', window._tourOutsideHandler); window._tourOutsideHandler = null; }
  }

  // Start
  showStep(steps[currentStep]);
}

// Initialize stats helper
async function initializeStats(){
  try{
    const ps = await db.playerStats.toArray().catch(()=>[]);
    const s = ps[0] || {};
    currentLevel = s.level || 0;
    currentXP = s.xp || 0;
    currentStats = { // Initialize currentStats here
      strength: s.strength || 1,
      agility: s.agility || 1,
      intelligence: s.intelligence || 1,
      stamina: s.stamina || 1,
      willpower: s.willpower || 1,
      discipline: s.discipline || 1
    };
    if (levelElem) levelElem.textContent = currentLevel;
    if (xpElem) xpElem.textContent = currentXP;
    updateXP();
    updateStats();
    updateCharacterTitle();
  }catch(e){console.error('initializeStats error',e);} 
}

function updateMainStatsDisplay(){
  try{
    if (levelElem) levelElem.textContent = currentLevel;
    if (xpElem) xpElem.textContent = currentXP;
    const next = calculateXPForNextLevel(currentLevel);
    if (xpRequiredElem) xpRequiredElem.textContent = next;
    if (xpProgressElem) xpProgressElem.style.width = `${(currentXP / next) * 100}%`;
    
    // update main stat elements - use rolling 100-point buckets for visible progress
    if (currentStats){
      const bucketSize = 100; // Each 100 points fills one bar completely
      Object.keys(currentStats).forEach(stat=>{
        const el = statsElems[stat];
        if (el) el.textContent = currentStats[stat];
        const mainBar = document.getElementById(`${stat}-progress-main`);
        if (mainBar){
          // Show progress within current 100-point bucket (0-100 → 0-100%)
          const progressInBucket = currentStats[stat] % bucketSize;
          const pct = Math.min(100, Math.round((progressInBucket / bucketSize) * 100));
          mainBar.style.width = pct + '%';
          
          // Add increase indicator if there was a recent increase
          if (statIncreases[stat] > 0) {
            mainBar.classList.add('stat-increase');
            // Force reflow to restart animation
            void mainBar.offsetWidth;
          } else {
            mainBar.classList.remove('stat-increase');
          }
        }
        const progressText = document.getElementById(`${stat}-progress-text`);
        if (progressText) {
          // Show: current/total [bucket] with increase if any
          const currentBucket = Math.floor(currentStats[stat] / bucketSize) + 1;
          const increaseText = statIncreases[stat] > 0 ? ` (+${statIncreases[stat]})` : '';
          progressText.textContent = `${currentStats[stat]}/${MAX_STAT} [${currentBucket}00s]${increaseText}`;
        }
      });
    }
  }catch(e){console.error('updateMainStatsDisplay error',e);} 
}

// Pomodoro initialization
function initializePomodoro() {
  try {
    let interval = null;
    let endTime = 0;
    // Read initial mode from DOM (if a .timer-mode has .active, use its data-time)
    const activeMode = document.querySelector('.timer-mode.active');
    let modeSeconds = (activeMode ? Number(activeMode.dataset.time) : 25) * 60;
    let remaining = modeSeconds;

    function updateDisplay() {
      const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
      const secs = Math.floor(remaining % 60).toString().padStart(2, '0');
      if (minutesElem) minutesElem.textContent = mins;
      if (secondsElem) secondsElem.textContent = secs;
    }

    function start() {
      if (interval) return; // already running
      if (remaining <= 0) return; // already completed, must switch mode or reset
      unlockAudioOnce();
      endTime = Date.now() + remaining * 1000;
      interval = setInterval(() => {
        remaining = Math.round((endTime - Date.now()) / 1000);
        if (remaining <= 0) {
          remaining = 0;
          clearInterval(interval);
          interval = null;
          if (sounds && sounds.itIsTime && typeof sounds.itIsTime.play === 'function') {
            try {
              sounds.itIsTime.play();
            } catch (e) {
              console.error('Error playing sound:', e);
            }
          }
          // record pomodoro
          db.playerStats.toArray().then(arr => {
            if (!arr[0]) return;
            const s = arr[0];
            s.pomodoroCompleted = (s.pomodoroCompleted || 0) + 1;
            db.playerStats.put(s);
            checkAchievements();
          }).catch(() => {});
        }
        updateDisplay();
      }, 1000);
    }

    function pause() {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    }

    function reset() {
      pause();
      remaining = modeSeconds;
      updateDisplay();
      if (sounds && sounds.itIsTime && typeof sounds.itIsTime.stop === 'function') {
        try {
          sounds.itIsTime.stop();
        } catch (e) {}
      }
    }

    if (startTimerBtn) startTimerBtn.addEventListener('click', start);
    if (pauseTimerBtn) pauseTimerBtn.addEventListener('click', pause);
    if (resetTimerBtn) resetTimerBtn.addEventListener('click', reset);

    document.querySelectorAll('.timer-mode').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.timer-mode').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        modeSeconds = Number(btn.dataset.time || 25) * 60;
        reset();
      });
    });

    updateDisplay();
  } catch (e) {
    console.error('initializePomodoro error', e);
  }
}

// Achievements initialization and checks
async function initializeAchievements(){
  try{
    const achs = await db.achievements.toArray().catch(()=>[]);
    if (!achs || achs.length === 0){
      const toAdd = achievementDefinitions.map(({condition,...rest})=>({...rest, unlocked:false, unlockedAt:null}));
      await db.achievements.bulkAdd(toAdd).catch(()=>{});
    }

    document.querySelectorAll('.achievement-category').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.achievement-category').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        achievementCategory = btn.dataset.category;
        renderAchievements();
      });
    });

    document.querySelectorAll('.achievement-status-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.achievement-status-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        achievementStatus = btn.dataset.status;
        renderAchievements();
      });
    });

    renderAchievements();
  }catch(e){console.error('initializeAchievements error',e);}
}

async function renderAchievements(){
  try{
    const [items, statsArr] = await Promise.all([
      db.achievements.toArray().catch(()=>[]),
      db.playerStats.toArray().catch(()=>[])
    ]);
    const stats = statsArr[0] || {};
    const grid = document.getElementById('achievements-grid');
    const countEl = document.querySelector('.achievement-count');
    const total = items.length || achievementDefinitions.length;
    const unlockedCount = items.filter(i=>i.unlocked).length;
    if (countEl) countEl.textContent = unlockedCount;
    const fill = document.getElementById('achievement-progress-fill');
    if (fill) fill.style.width = `${Math.round((unlockedCount/total)*100)}%`;

    if (!grid) return;

    const now = Date.now();
    const FIVE_MIN = 5 * 60 * 1000;

    let filtered = items || [];

    if (achievementCategory !== 'all') {
      filtered = filtered.filter(it => it.category === achievementCategory);
    }
    if (achievementStatus === 'unlocked') {
      filtered = filtered.filter(it => it.unlocked);
    } else if (achievementStatus === 'locked') {
      filtered = filtered.filter(it => !it.unlocked);
    }

    const progressMap = {};
    achievementDefinitions.forEach(def => { progressMap[def.id] = computeAchievementProgress(def, stats); });

    grid.innerHTML = filtered.map((it, idx) => {
      const prog = progressMap[it.id] || {};
      const recently = it.unlocked && it.unlockedAt && (now - new Date(it.unlockedAt).getTime()) < FIVE_MIN;
      return `<div class="achievement-card ${it.unlocked ? 'unlocked' : 'locked'}${recently ? ' unlock-flash' : ''}" style="animation-delay:${idx * 0.04}s">
        ${recently ? '<span class="achievement-new-badge">NEW</span>' : ''}
        <div class="achievement-icon"><i class="${it.icon}"></i></div>
        <div class="achievement-info">
          <div class="achievement-title">${escapeHtml(it.title)}</div>
          <div class="achievement-desc">${escapeHtml(it.description)}</div>
          ${prog.text ? `<div class="achievement-progress-text">${escapeHtml(prog.text)}</div>` : ''}
          ${!it.unlocked && prog.condition ? `<div class="achievement-condition">${escapeHtml(prog.condition)}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  }catch(e){console.error('renderAchievements error',e);}
}

function computeAchievementProgress(def, stats) {
  switch (def.id) {
    case 1: return { text: `${stats.completedQuests || 0}/1 quest completed`, condition: 'Complete 1 quest' };
    case 2: return { text: `${stats.completedQuests || 0}/50 quests completed`, condition: 'Complete 50 quests' };
    case 3: return { text: `Level ${stats.level || 0}/10`, condition: 'Reach level 10' };
    case 4: {
      const m = Math.min(stats.strength || 0, stats.agility || 0, stats.intelligence || 0, stats.stamina || 0, stats.willpower || 0, stats.discipline || 0);
      return { text: `All stats \u2265 ${m}/5`, condition: 'Get all stats to 5' };
    }
    case 5: {
      const m = Math.max(stats.strength || 0, stats.agility || 0, stats.intelligence || 0, stats.stamina || 0, stats.willpower || 0, stats.discipline || 0);
      return { text: `Highest stat ${m}/10`, condition: 'Get any stat to 10' };
    }
    case 6: return { text: `Streak: ${stats.currentStreak || 0}/3 days`, condition: 'Maintain a 3-day streak' };
    case 7: return { text: `Streak: ${stats.currentStreak || 0}/7 days`, condition: 'Maintain a 7-day streak' };
    case 8: return { text: `Streak: ${stats.currentStreak || 0}/30 days`, condition: 'Maintain a 30-day streak' };
    case 9: return { text: `${stats.pomodoroCompleted || 0}/10 sessions`, condition: 'Complete 10 pomodoro sessions' };
    case 10: {
      const c = (stats.categoriesCompleted && stats.categoriesCompleted.length) || 0;
      return { text: `${c}/4 categories`, condition: 'Complete 1 quest in each category' };
    }
    case 11: return { text: `${stats.completedQuests || 0}/25 quests completed`, condition: 'Complete 25 quests' };
    case 12: return { text: `${stats.completedQuests || 0}/100 quests completed`, condition: 'Complete 100 quests' };
    case 13: return { text: `${stats.completedQuests || 0}/250 quests completed`, condition: 'Complete 250 quests' };
    case 14: {
      const c = (stats.categoriesCompleted && stats.categoriesCompleted.length) || 0;
      return { text: `${c}/6 categories`, condition: 'Complete 1 quest in each category' };
    }
    case 15: return { text: `Level ${stats.level || 0}/5`, condition: 'Reach level 5' };
    case 16: return { text: `Level ${stats.level || 0}/25`, condition: 'Reach level 25' };
    case 17: return { text: `Level ${stats.level || 0}/50`, condition: 'Reach level 50' };
    case 18: return { text: `Level ${stats.level || 0}/100`, condition: 'Reach level 100' };
    case 19: {
      const m = Math.min(stats.strength || 0, stats.agility || 0, stats.intelligence || 0, stats.stamina || 0, stats.willpower || 0, stats.discipline || 0);
      return { text: `All stats \u2265 ${m}/10`, condition: 'Get all stats to 10' };
    }
    case 20: {
      const m = Math.max(stats.strength || 0, stats.agility || 0, stats.intelligence || 0, stats.stamina || 0, stats.willpower || 0, stats.discipline || 0);
      return { text: `Highest stat ${m}/25`, condition: 'Get any stat to 25' };
    }
    case 21: {
      const m = Math.max(stats.strength || 0, stats.agility || 0, stats.intelligence || 0, stats.stamina || 0, stats.willpower || 0, stats.discipline || 0);
      return { text: `Highest stat ${m}/50`, condition: 'Get any stat to 50' };
    }
    case 22: return { text: `Streak: ${stats.currentStreak || 0}/14 days`, condition: 'Maintain a 14-day streak' };
    case 23: return { text: `Streak: ${stats.currentStreak || 0}/100 days`, condition: 'Maintain a 100-day streak' };
    case 24: return { text: `Streak: ${stats.currentStreak || 0}/365 days`, condition: 'Maintain a 365-day streak' };
    case 25: return { text: `${stats.pomodoroCompleted || 0}/1 session`, condition: 'Complete 1 pomodoro session' };
    case 26: return { text: `${stats.pomodoroCompleted || 0}/25 sessions`, condition: 'Complete 25 pomodoro sessions' };
    case 27: return { text: `${stats.pomodoroCompleted || 0}/100 sessions`, condition: 'Complete 100 pomodoro sessions' };
    case 28: return { text: `${(stats.totalXpEarned || 0).toLocaleString()}/1,000 XP`, condition: 'Earn 1,000 XP from quests' };
    case 29: return { text: `${(stats.totalXpEarned || 0).toLocaleString()}/10,000 XP`, condition: 'Earn 10,000 XP from quests' };
    case 30: return { text: `${(stats.totalXpEarned || 0).toLocaleString()}/100,000 XP`, condition: 'Earn 100,000 XP from quests' };
    case 31: return { text: `${stats.hardQuestsCompleted || 0}/1 Hard quest`, condition: 'Complete 1 Hard quest' };
    case 32: return { text: `${stats.hardQuestsCompleted || 0}/50 Hard quests`, condition: 'Complete 50 Hard quests' };
    case 33: return { text: `${stats.easyQuestsCompleted || 0}/100 Easy quests`, condition: 'Complete 100 Easy quests' };
    case 34: {
      const c = (stats.statsCompleted && stats.statsCompleted.length) || 0;
      return { text: `${c}/6 stats`, condition: 'Complete quests for all 6 stats' };
    }
    case 35: {
      const e = stats.easyQuestsCompleted || 0;
      const m = stats.mediumQuestsCompleted || 0;
      const h = stats.hardQuestsCompleted || 0;
      return { text: `E:${e} M:${m} H:${h}`, condition: 'Complete 1 quest of each difficulty' };
    }
    case 36: {
      const c = (stats.categoriesCompleted && stats.categoriesCompleted.length) || 0;
      return { text: `${c} categories explored`, condition: 'Complete 1 spiritual quest' };
    }
    case 37: return { text: `Willpower: ${stats.willpower || 0}/3`, condition: 'Get willpower to level 3' };
    case 38: return { text: `Intelligence: ${stats.intelligence || 0}/5`, condition: 'Get intelligence to level 5' };
    case 39: {
      const c = (stats.categoriesCompleted && stats.categoriesCompleted.length) || 0;
      return { text: `${c} categories explored`, condition: 'Complete spiritual + personal quests' };
    }
    case 40: return { text: `Discipline: ${stats.discipline || 0}/7`, condition: 'Get discipline to level 7' };
    default: return {};
  }
}

async function checkAchievements(){
  try{
    const statsArr = await db.playerStats.toArray().catch(()=>[]);
    const stats = statsArr[0] || {};
    const achs = await db.achievements.toArray().catch(()=>[]);
    for (const def of achievementDefinitions){
      const existing = achs.find(a=>a.id === def.id);
      const meets = def.condition ? def.condition(stats) : false;
      if (meets && existing && !existing.unlocked){
        existing.unlocked = true; existing.unlockedAt = new Date(); await db.achievements.put(existing);
        // play sound and notify
        if (sounds && sounds.achievement && typeof sounds.achievement.play === 'function') try{ sounds.achievement.play(); }catch(e){}
        showNotification(`Achievement unlocked: ${existing.title}`);
      }
    }
    renderAchievements();
  }catch(e){console.error('checkAchievements error',e);} 
}

// ===== Due Date Reminder System =====
let reminderQueue = [];
let isReminderShowing = false;

async function checkDueDateReminders() {
  try {
    const quests = await db.quests.toArray();
    const now = new Date();
    const reminders = [];

    for (const quest of quests) {
      if (!quest.dueDate || quest.status === 'completed') continue;

      const dueDate = quest.dueDate.includes('T') ? new Date(quest.dueDate) : new Date(quest.dueDate + 'T23:59:59Z');
      const diffTime = dueDate.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays <= 3 && diffDays >= 0) {
        reminders.push({ quest, diffDays, urgency: diffDays <= 0 ? 'urgent' : diffDays === 1 ? 'due-soon' : 'upcoming' });
      } else if (diffDays < 0) {
        reminders.push({ quest, diffDays, urgency: 'urgent' });
      }
    }

    reminders.sort((a, b) => a.diffDays - b.diffDays);

    if (reminders.length > 0) {
      reminderQueue = reminders;
      showNextReminder();
    }
  } catch (e) {
    console.error('Error checking due date reminders:', e);
  }
}

function showNextReminder() {
  if (isReminderShowing || reminderQueue.length === 0) return;
  const reminder = reminderQueue.shift();
  showDueDateReminder(reminder);
}

function showDueDateReminder(reminder) {
  isReminderShowing = true;
  const el = document.getElementById('due-date-reminder');
  if (!el) return;

  const icon = el.querySelector('.due-date-reminder-icon i');
  const iconWrap = el.querySelector('.due-date-reminder-icon');
  const title = el.querySelector('.due-date-reminder-title');
  const msg = document.getElementById('due-date-message');
  const count = document.getElementById('due-date-count');
  const progress = document.getElementById('due-date-progress');

  icon.className = 'fas';
  iconWrap.className = 'due-date-reminder-icon';
  title.className = 'due-date-reminder-title';
  count.className = 'due-date-reminder-count';
  progress.className = 'due-date-reminder-progress';

  const diffDays = reminder.diffDays;

  if (diffDays < 0) {
    icon.className = 'fas fa-exclamation-triangle';
    iconWrap.classList.add('urgent');
    title.textContent = 'Quest Overdue!';
    title.classList.add('urgent');
    msg.textContent = reminder.quest.title;
    count.textContent = `${Math.abs(diffDays)}d`;
    count.classList.add('urgent');
    progress.classList.add('urgent');
  } else if (diffDays === 0) {
    icon.className = 'fas fa-hourglass-end';
    iconWrap.classList.add('urgent');
    title.textContent = 'Due Today!';
    title.classList.add('urgent');
    msg.textContent = reminder.quest.title;
    count.textContent = 'Now';
    count.classList.add('urgent');
    progress.classList.add('urgent');
  } else if (diffDays === 1) {
    icon.className = 'fas fa-clock';
    iconWrap.classList.add('due-soon');
    title.textContent = 'Due Tomorrow';
    title.classList.add('due-soon');
    msg.textContent = reminder.quest.title;
    count.textContent = '1d';
    count.classList.add('due-soon');
    progress.classList.add('due-soon');
  } else {
    icon.className = 'fas fa-hourglass-half';
    iconWrap.classList.add('due-soon');
    title.textContent = `${diffDays} Days Left`;
    title.classList.add('due-soon');
    msg.textContent = reminder.quest.title;
    count.textContent = `${diffDays}d`;
    count.classList.add('due-soon');
    progress.classList.add('due-soon');
  }

  el.classList.remove('hide');
  el.classList.add('show');

  setTimeout(() => {
    el.classList.remove('show');
    el.classList.add('hide');
    isReminderShowing = false;
    setTimeout(() => showNextReminder(), 400);
  }, 6000);
}

function initializeDueDateReminders() {
  setTimeout(checkDueDateReminders, 2000);
  setInterval(checkDueDateReminders, 300000);
}

// Export Game Functionality
// Save Default Quests to File
var saveDefaultsBtn = document.getElementById('save-default-quests-btn');
if (saveDefaultsBtn) {
  saveDefaultsBtn.addEventListener('click', async () => {
    if (confirm('Are you sure you want to save the current default quests to file? This will overwrite the existing defaults.')) {
      await saveDefaultQuestsToFile();
    }
  });
}

async function saveDefaultQuestsToFile() {
  try {
    showNotification("This feature is not fully implemented yet.", "info");
  } catch (error) {
    console.error('Error saving default quests:', error);
    showNotification('Failed to save default quests.', 'error');
  }
}
