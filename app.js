const db = new Dexie("SoloLevelingDB");
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

const MAX_STAT = 10000;

const rawDefaultQuests = [
  // EASY - Quick daily spiritual tasks (5 XP)
  { title: "Dua Daily", difficulty: "Easy", xp: 5, stat: "willpower", category: "personal" },
  { title: "Quiet Dhikr", difficulty: "Easy", xp: 5, stat: "willpower", category: "personal" },
  { title: "Sleeping Prayer", difficulty: "Easy", xp: 5, stat: "willpower", category: "personal" },
  { title: "Pray b4 Sleep then Quran Buffs", difficulty: "Easy", xp: 5, stat: "willpower", category: "personal" },
  { title: "Please ask for help from Allah in each sujuud", difficulty: "Easy", xp: 5, stat: "willpower", category: "personal" },
  { title: "think of imam abroad, Allah's is better", difficulty: "Easy", xp: 5, stat: "willpower", category: "personal" },
  { title: "After all, you asked to be close to the throne", difficulty: "Easy", xp: 5, stat: "willpower", category: "personal" },
  { title: "Email", difficulty: "Easy", xp: 3, stat: "discipline", category: "work" },
  { title: "watch teleGratitude", difficulty: "Easy", xp: 3, stat: "discipline", category: "personal" },
  { title: "Poetry", difficulty: "Easy", xp: 3, stat: "discipline", category: "personal" },
  { title: "HealthCheck", difficulty: "Easy", xp: 3, stat: "stamina", category: "health" },

  // MEDIUM - Moderate effort tasks (10 XP Islamic, 8 XP others)
  { title: "Always Choose the Pleasure of Allah", difficulty: "Medium", xp: 10, stat: "willpower", category: "personal", isPinned: true },
  { title: "Aura Farming With Allah", difficulty: "Medium", xp: 10, stat: "willpower", category: "personal", isPinned: true },
  { title: "Selective fast (Jihad of silence): be like salah", difficulty: "Medium", xp: 10, stat: "willpower", category: "personal", comment: "Be on the me app, ask Allah for help for your soul", isPinned: true },
  { title: "Be the Observer", difficulty: "Medium", xp: 10, stat: "willpower", category: "personal" },
  { title: "Don't Disregard Allah in times of sin_softHeart", difficulty: "Medium", xp: 10, stat: "willpower", category: "personal" },
  { title: "Nawwafi_Murájá", difficulty: "Medium", xp: 10, stat: "willpower", category: "personal", comment: "1/3 of page per raka; Deep", isPinned: true },
  { title: "Give up something for Allah -Fitna is Refinement", difficulty: "Medium", xp: 10, stat: "willpower", category: "personal" },
  { title: "Take Haram Seriously, it's a big deal in GodSight.", difficulty: "Medium", xp: 10, stat: "willpower", category: "personal" },
  { title: "Resurrection Spell", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning", comment: "the 3 Quls", isPinned: true },
  { title: "99 Names", difficulty: "Medium", xp: 8, stat: "discipline", category: "learning", comment: "https://drive.google.com/file/d/1OOfWSArPLilmJHmeOtrLgGhfaHmqMTY4/view?usp=sharing", isPinned: true },
  { title: "English Tafseer 1pg/Quran", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning" },
  { title: "Liquid Drop concentration", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning" },
  { title: "There is more to life than your desires", difficulty: "Medium", xp: 8, stat: "discipline", category: "personal" },
  { title: "people doing what u don't want to do", difficulty: "Medium", xp: 8, stat: "discipline", category: "personal" },
  { title: "Systematic Review || At least 15 mins", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning" },
  { title: "Grad school", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning", comment: "EBOOK/PLAYLIST", isPinned: true },
  { title: "Teach Quran", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning" },
  { title: "Nahwu", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning" },
  { title: "Agentic Ai", difficulty: "Medium", xp: 8, stat: "discipline", category: "work" },
  { title: "Word4word Quran", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning" },
  { title: "Madina series", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning" },
  { title: "Juz Daily - get 1pg/min of each juz pg", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning", comment: "EBOOK", isPinned: true },
  { title: "extras Research", difficulty: "Medium", xp: 8, stat: "intelligence", category: "work", comment: "https://floor796.com/", isPinned: true },
  { title: "Project", difficulty: "Medium", xp: 8, stat: "intelligence", category: "work" },
  { title: "n8n tasks", difficulty: "Medium", xp: 8, stat: "discipline", category: "work" },
  { title: "Seerah / Khushu of the Ruh and Nafs", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning" },
  { title: "Revise students Quran with AudioBook || At least 1 page", difficulty: "Medium", xp: 8, stat: "discipline", category: "learning" },
  { title: "Money Research || At least 1 Idea", difficulty: "Medium", xp: 8, stat: "intelligence", category: "personal" },
  { title: "MUJAWWAD .5P", difficulty: "Medium", xp: 8, stat: "discipline", category: "personal" },
  { title: "MultiTask => Brain =< Sleep", difficulty: "Medium", xp: 8, stat: "stamina", category: "health" },
  { title: "CyberExpo_Dev", difficulty: "Medium", xp: 8, stat: "intelligence", category: "work" },
  { title: "Pimsleur Arabic || At least 1 Line || 10mins/1 vid", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning", comment: "https://floor796.com/", isPinned: true },
  { title: "Hifz revision", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning" },
  { title: "Yoruba perfection", difficulty: "Medium", xp: 8, stat: "intelligence", category: "learning" },
  { title: "Zad University", difficulty: "Medium", xp: 8, stat: "intelligence", category: "work", comment: "GAME: 2048", isPinned: true },
  { title: "Workout", difficulty: "Medium", xp: 8, stat: "strength", category: "health" },

  // HARD - High effort, high reward tasks (15 XP Islamic, 10 XP others)
  { title: "Be an Observer", difficulty: "Hard", xp: 15, stat: "willpower", category: "personal", isPinned: true },
  { title: "Dont get stuck in a 1hr+ loop", difficulty: "Hard", xp: 15, stat: "willpower", category: "personal", comment: "code, short videos", isPinned: true },
  { title: "I WILL NOT LET THE VOICES IN MY HEAD CONTROL ME", difficulty: "Hard", xp: 15, stat: "willpower", category: "personal" },
  { title: "LOCK IN: Be to Allah what fang yuan is to u PLTARM", difficulty: "Hard", xp: 15, stat: "willpower", category: "personal" },
  { title: "Always Choose the Pleasure of Allah", difficulty: "Hard", xp: 15, stat: "willpower", category: "personal", isPinned: true },
  { title: "Real Maths", difficulty: "Hard", xp: 10, stat: "intelligence", category: "learning" },
  { title: "Quantum Code", difficulty: "Hard", xp: 10, stat: "intelligence", category: "learning" },
  { title: "Thesis Project NoteBookLM", difficulty: "Hard", xp: 10, stat: "intelligence", category: "work" },
  { title: "Complete 5 sets of 25 push-ups", difficulty: "Hard", xp: 10, stat: "strength", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true },
  { title: "Complete a 30-minute intense agility drill session", difficulty: "Hard", xp: 10, stat: "agility", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true },
  { title: "Maintain a rigorous daily workout routine for a month", difficulty: "Hard", xp: 10, stat: "strength", category: "personal", comment: "GAME: Tele", isPinned: true },
  { title: "MERN FULL STACK || At least 15mins", difficulty: "Hard", xp: 10, stat: "intelligence", category: "learning" },
  { title: "MPhil Proposal Research work || At least 1 Slide", difficulty: "Hard", xp: 10, stat: "intelligence", category: "learning" },
  { title: "Do 100 push-ups throughout the day", difficulty: "Hard", xp: 10, stat: "strength", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true },
  { title: "Do a 300m run", difficulty: "Hard", xp: 10, stat: "agility", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true }
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

// Enhanced motivational quotes with categories and sources
const motivationalQuotesSystem = {
  categories: {
    POWER: "power",
    WISDOM: "wisdom",
    DISCIPLINE: "discipline",
    GROWTH: "growth",
    PERSEVERANCE: "perseverance"
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
      id: 1,
      text: "Great power comes with great benefits.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "power",
      contexts: ["questComplete", "levelUp"],
      favorite: false
    },
    {
      id: 2,
      text: "The strong prey on the weak; this is the law of nature.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "power",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 3,
      text: "In the face of benefits, there are no eternal enemies or friends.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
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
      id: 7,
      text: "Strength is the only truth in this world.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "power",
      contexts: ["levelUp"],
      favorite: false
    },
    {
      id: 8,
      text: "Only those who are willing to sacrifice can truly gain power.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "discipline",
      contexts: ["streakMilestone"],
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
      id: 11,
      text: "Survival is for the fittest, everything else is an illusion.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "power",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 12,
      text: "Morality is a tool used by the weak to bind the strong.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "wisdom",
      contexts: ["daily"],
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
      id: 14,
      text: "The path to greatness is paved with the bones of those who couldn't walk it.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "perseverance",
      contexts: ["streakMilestone"],
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
      id: 16,
      text: "Only by controlling everything can one be free of fate.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "power",
      contexts: ["levelUp"],
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
      id: 18,
      text: "True immortality is achieved through power, not time.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "power",
      contexts: ["achievementUnlocked"],
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
      id: 20,
      text: "Fear is the currency of control.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
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
      id: 22,
      text: "Victory goes to the one who dares to take risks.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "growth",
      contexts: ["questComplete"],
      favorite: false
    },
    {
      id: 23,
      text: "In the end, strength is the only thing that matters.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "power",
      contexts: ["levelUp"],
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
      id: 25,
      text: "To rise above all, you must be willing to stand alone.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "perseverance",
      contexts: ["streakMilestone"],
      favorite: false
    },
    {
      id: 26,
      text: "To rise above all, you must be willing to stand alone.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "perseverance",
      contexts: ["streakMilestone"],
      favorite: false
    },
    {
      id: 27,
      text: "To rise above all, you must be willing to stand alone.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "perseverance",
      contexts: ["streakMilestone"],
      favorite: false
    },
    {
      id: 28,
      text: "To rise above all, you must be willing to stand alone.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "perseverance",
      contexts: ["streakMilestone"],
      favorite: false
    },
    {
      id: 29,
      text: "To rise above all, you must be willing to stand alone.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "perseverance",
      contexts: ["streakMilestone"],
      favorite: false
    },
    {
      id: 30,
      text: "To rise above all, you must be willing to stand alone.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "perseverance",
      contexts: ["streakMilestone"],
      favorite: false
    }
  ],
  
  // Get a random quote
  getRandomQuote: function() {
    return this.quotes[Math.floor(Math.random() * this.quotes.length)];
  },
  
  // Get a random quote by context
  getQuoteByContext: function(context) {
    const contextQuotes = this.quotes.filter(quote => 
      quote.contexts.includes(context)
    );
    return contextQuotes.length > 0 
      ? contextQuotes[Math.floor(Math.random() * contextQuotes.length)]
      : this.getRandomQuote();
  },
  
  // Get a random quote by category
  getQuoteByCategory: function(category) {
    const categoryQuotes = this.quotes.filter(quote => 
      quote.category === category
    );
    return categoryQuotes.length > 0 
      ? categoryQuotes[Math.floor(Math.random() * contextQuotes.length)]
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
  }
];

let currentLevel = 0;
let currentXP = 0;

// Add these variables for spider chart tracking
let previousStats = null;
let currentStats = null;
let statHistory = [];
let currentChartView = 'current'; // 'current', 'history', or 'compare'
let timeRange = 'week'; // 'week', 'month', or 'alltime'

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
const addQuestBtn = document.getElementById("add-quest-btn");

// Open an edit panel to create a new quest when Add Quest button is clicked
addQuestBtn.addEventListener('click', () => {
  // Close existing edit panel
  const existingPanel = document.querySelector('.quest-edit-panel');
  if (existingPanel) existingPanel.remove();

  // Create a placeholder quest element and open the standard edit panel for it
  const newQuestElem = document.createElement('div');
  newQuestElem.className = 'quest';
  questsElem.appendChild(newQuestElem);

  const newQuestObj = {
    id: 'new',
    title: '',
    difficulty: 'Medium',
    xp: 2,
    stat: 'discipline',
    status: 'inbox',
    comment: '',
    isPinned: true
  };

  // Reuse the existing edit panel renderer to get the full dynamic UI
  openQuestEditPanel(newQuestObj, newQuestElem);
});
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

// Settings modal functionality - wrapped in DOMContentLoaded for safety
function initSettingsHandlers() {
  if (settingsIcon) {
    settingsIcon.addEventListener("click", () => {
      settingsModal.classList.add("show");
      document.getElementById("modal-overlay").classList.add("show");
      document.body.style.overflow = "hidden";
    });
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
  { days: 1, title: "Quasi Apprentice" },
  { days: 3, title: "Apprentice" },
  { days: 7, title: "Quasi Student" },
  { days: 14, title: "Student" },
  { days: 21, title: "Quasi Master" },
  { days: 30, title: "Master" },
  { days: 45, title: "Quasi Grand Master" },
  { days: 60, title: "Grand Master" },
  { days: 90, title: "Quasi Great Grand Master" },
  { days: 120, title: "Great Grand Master" },
  { days: 150, title: "Legendary Grand Master" },
  { days: 210, title: "Demi-Immortal" },
  { days: 300, title: "Ascendant" },
  { days: 365, title: "Immortal" },
];

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
    characterTitleElem.textContent = currentTitle;
    if (characterTitleStatsElem) characterTitleStatsElem.textContent = currentTitle;

    let today = new Date().getDay(); // 0 for Sunday, 1 for Monday, etc.
    // Adjust to match data-day mapping (0 for Monday, 6 for Sunday)
    if (today === 0) { // If today is Sunday
        today = 6; // Map to data-day="6" for Sunday
    } else {
        today = today - 1; // Monday=1 becomes 0, Tuesday=2 becomes 1, etc.
    }

    streakDayElems.forEach((dayElem, index) => {
      if (parseInt(dayElem.dataset.day) === today) {
        dayElem.classList.add("active");
      } else {
        dayElem.classList.remove("active");
      }
    });
  }
}


// Quest filter references
const questSearchInput = document.getElementById("quest-search");
const searchBtn = document.getElementById("search-btn");
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

const sounds = {
  complete: new Howl({
    src: ["sounds/complete.mp3"],
  }),
  levelUp: new Howl({
    src: ["sounds/level-up.mp3"],
  }),
  achievement: new Howl({
    src: ["sounds/achievement.mp3"], 
  }),
  streakUp: new Howl({
    src: ["sounds/streak.mp3"],
  }),
  timerComplete: new Howl({
    src: ["sounds/timer-complete.mp3"],
  }),
  favorite: new Howl({
    src: ["sounds/favorite.mp3"],
  }),
  itIsTime: new Howl({
    src: ["it_is_time.mp3"],
  })
};

function calculateXPForNextLevel(level) {
  return Math.floor(10 * Math.pow(1.5, level));
}

async function initializeGame() {
  try {
    const defaultQuests = GLOBAL_DEFAULT_QUESTS;
    const existingQuests = await db.quests.toArray();
  const existingQuestsMap = new Map(); // Map compositeKey to existingQuest

  for (const quest of existingQuests) {
    const compositeKey = `${quest.title}-${quest.difficulty}-${quest.xp}-${quest.stat}-${quest.category}`;
    existingQuestsMap.set(compositeKey, quest);
  }

  // Load deleted default quests so we don't re-add them
  const deletedEntries = await db.deletedQuests.toArray().catch(() => []);
  const deletedSet = new Set((deletedEntries || []).map(d => d.compositeKey));

  const questsToUpdate = [];
  const questsToAdd = [];

  for (const defaultQuest of defaultQuests) {
    const compositeKey = `${defaultQuest.title}-${defaultQuest.difficulty}-${defaultQuest.xp}-${defaultQuest.stat}-${defaultQuest.category}`;
    const existingQuest = existingQuestsMap.get(compositeKey);

    if (existingQuest) {
      // Merge: Update existing quest properties from default, preserve user state
      let changed = false;
      if (existingQuest.title !== defaultQuest.title) { existingQuest.title = defaultQuest.title; changed = true; }
      if (existingQuest.difficulty !== defaultQuest.difficulty) { existingQuest.difficulty = defaultQuest.difficulty; changed = true; }
      if (existingQuest.xp !== defaultQuest.xp) { existingQuest.xp = defaultQuest.xp; changed = true; }
      if (existingQuest.stat !== defaultQuest.stat) { existingQuest.stat = defaultQuest.stat; changed = true; }
      if (existingQuest.category !== defaultQuest.category) { existingQuest.category = defaultQuest.category; changed = true; }

      // Optionally, add missing properties if defaultQuest has new ones not present in existingQuest
      // For example, if defaultQuest has a 'comment' field that existingQuest doesn't:
      // if (defaultQuest.comment !== undefined && existingQuest.comment === undefined) { existingQuest.comment = defaultQuest.comment; changed = true; }
      
      if (changed) {
        questsToUpdate.push(db.quests.put(existingQuest));
      }
    } else {
      // Add: No existing quest found, add as new unless user previously deleted this default
      if (!deletedSet.has(compositeKey)) {
        questsToAdd.push({...defaultQuest, status: 'inbox'});
      } else {
        console.log(`Skipping default quest (previously deleted): ${compositeKey}`);
      }
    }
  }

  // Perform updates and additions
  if (questsToUpdate.length > 0) {
    await Promise.all(questsToUpdate);
    console.log(`Updated ${questsToUpdate.length} existing quests with default definitions.`);
  }
  if (questsToAdd.length > 0) {
    await db.quests.bulkAdd(questsToAdd);
    console.log(`Added ${questsToAdd.length} new default quests.`);
  }

  // No longer needed as merge logic handles categories

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
      username: "HeavenlyDev|",
      completedQuests: 0,
      categoriesCompleted: [],
      pomodoroCompleted: 0,
      lastStreakCheck: null
    });
  } else {
    // Update existing player stats with new fields if they're missing
    const stats = playerStats[0];
    if (stats.currentStreak === undefined) {
      stats.currentStreak = 0;
      stats.longestStreak = 0;
      stats.consecutiveDays = 0;
      stats.completedQuests = 0;
      stats.categoriesCompleted = [];
      stats.pomodoroCompleted = 0;
      await db.playerStats.put(stats);
    }
  }

  // Load all quests from the database
  const quests = await db.quests.toArray();
  quests.forEach(quest => {
    const questElement = createQuestElement(quest);
    document.getElementById('quests').appendChild(questElement);
  });

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
  } catch (error) {
    console.error("Error during game initialization:", error);
    showErrorOverlay("Game Initialization Error: " + (error.message || error));
  }
}
// Call the initialize function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Ensure initializeGame is called only once
  initializeGame();
});

async function checkDailyReset() {
  const now = new Date();
  isStreakMessageShown = false; // Reset the flag every day
  if (now.getHours() === 0 && now.getMinutes() === 0) {
    const unfinishedQuests = document.querySelectorAll(".quest").length;
    if (unfinishedQuests > 0) {
      const playerStats = await db.playerStats.toArray();
      const stats = playerStats[0];
      stats.willpower = Math.max(0, stats.willpower - unfinishedQuests);
      await db.playerStats.put(stats);
      updateStats();
      showNotification(
        `Lost ${unfinishedQuests} willpower due to unfinished quests.`
      );
    }
    generateDailyQuests(await db.quests.toArray());
  }
}

setInterval(checkDailyReset, 60000); // Check every minute

async function generateDailyQuests(quests) {
  questsElem.innerHTML = "";
  const dailyQuests = getRandomQuests(quests, 31);
  dailyQuests.forEach((quest) => {
    const questElem = createQuestElement(quest);
    questsElem.appendChild(questElem);
  });
}

function createQuestElement(quest) {
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
    const dueDate = new Date(quest.dueDate + 'T23:59:59Z');
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
        <span class="quest-status status-${quest.status || 'inbox'}"></span>
        <span class="quest-check" onclick="event.stopPropagation(); completeQuest(${quest.xp}, '${quest.stat}', this.closest('.quest'))">
          <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
            <path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z" fill="#4a90e2"></path>
          </svg>
        </span>
        <span class="quest-title">${quest.title}</span>
        <button class="delete-quest-btn" onclick="event.stopPropagation(); deleteQuest(${quest.id}, this.closest('.quest'))">
          <i class="fas fa-trash"></i>
        </button>
        <button class="default-quest-btn ${ isDefault ? "favorited" : "" }" onclick="event.stopPropagation(); toggleDefaultQuest('${quest.title}', this)">
          <i class="fas fa-heart"></i>
        </button>
      </div>
      <div class="quest-tags">
        <span class="quest-difficulty difficulty-${quest.difficulty.toLowerCase()}">${ quest.difficulty }</span>
        <span class="quest-xp">${quest.xp} XP</span>
        <span class="quest-stat stat-${quest.stat}">${quest.stat}</span>
        <span class="quest-category category-${quest.category || 'personal'}">${ quest.category || 'personal' }</span>
        ${countdownHTML}
      </div>
      ${ quest.comment ? `<div class="pinned-comment">${quest.comment}</div>` : '' }
    </div>
  `;

  // Add click event listener with proper event handling
  questElem.addEventListener("click", (e) => {
    // Don't trigger edit if clicking checkbox or if already in edit mode
    if (
      e.target.closest(".quest-check") ||
      questElem.classList.contains("quest-edit-panel")
    ) {
      e.stopPropagation();
      return;
    }

    // Check if another edit panel is open
    const existingPanel = document.querySelector(".quest-edit-panel");
    if (existingPanel && existingPanel !== questElem) {
      existingPanel.className = "quest";
      existingPanel.innerHTML = existingPanel.dataset.originalContent;
    }

    openQuestEditPanel(quest, questElem);
  });

  return questElem;
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

function generateSuggestedQuests(stat, difficulty) {
  const suggestions = {
    strength: {
      Easy: ["Do 10 push-ups", "Do 20 squats"],
      Medium: ["Complete 3 sets of 15 push-ups", "Do 30 burpees"],
      Hard: [
        "Do 100 push-ups throughout the day",
        "Complete a 30-minute bodyweight strength routine",
      ],
    },
    agility: {
      Easy: [
        "Do 50 jumping jacks",
        "Practice quick feet drills for 5 minutes",
      ],
      Medium: [
        "Complete a 15-minute HIIT workout",
        "Do 100 mountain climbers",
      ],
      Hard: [
        "Complete a 30-minute intense agility drill session",
        "Do 200 high knees",
      ],
    },
    stamina: {
      Easy: ["Jog in place for 10 minutes", "Do 50 jumping jacks"],
      Medium: [
        "Complete a 20-minute home cardio workout",
        "Do 100 jump ropes",
      ],
      Hard: [
        "Complete a 45-minute high-intensity cardio session",
        "Do a 1-hour indoor cycling session",
      ],
    },
    willpower: {
      Easy: [
        "Meditate for 10 minutes",
        "Resist a small temptation for a day",
      ],
      Medium: ["Fast for 16 hours", "Take a cold shower for a week"],
      Hard: [
        "Complete a 72-hour fast",
        "Maintain a strict diet for a month",
      ],
    },
    discipline: {
      Easy: [
        "Wake up 30 minutes earlier than usual",
        "Stick to a daily to-do list",
      ],
      Medium: [
        "Follow a strict study/work schedule for a week",
        "Practice a skill daily for 30 days",
      ],
      Hard: [
        "Maintain a rigorous daily routine for a month",
        "Complete a challenging long-term project",
      ],
    },
    intelligence: {
      Easy: [
        "Read a chapter of a challenging book",
        "Solve a logic puzzle",
      ],
      Medium: [
        "Study a new language for 30 minutes",
        "Learn and apply a new mental model",
      ],
      Hard: [
        "Write an essay on a complex topic",
        "Teach someone a difficult concept you've mastered",
      ],
    },
  };

  // Safely return suggestions; fallback to an empty array when not found
  if (!suggestions[stat] || !suggestions[stat][difficulty]) return [];
  return suggestions[stat][difficulty];
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
    if (searchBtn) searchBtn.addEventListener('click', filterQuests);
    if (questSearchInput) questSearchInput.addEventListener('input', filterQuests);
    if (categoryFilter) categoryFilter.addEventListener('change', filterQuests);
    if (difficultyFilter) difficultyFilter.addEventListener('change', filterQuests);
    if (statFilter) statFilter.addEventListener('change', filterQuests);

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

    const questNodes = Array.from(questsElem.children || []);
    let visible = questNodes.filter(node => {
      if (!node.dataset) return false;
      const title = (node.dataset.title || '').toLowerCase();
      if (q && !title.includes(q)) return false;
      if (category !== 'all' && node.dataset.category !== category) return false;
      if (difficulty !== 'all' && node.dataset.difficulty !== difficulty) return false;
      if (stat !== 'all' && node.dataset.stat !== stat) return false;
      return true;
    });

    // hide/show
    questNodes.forEach(n => n.style.display = visible.includes(n) ? '' : 'none');

    // sort visible nodes if needed
    if (currentSortBy && visible.length > 1) {
      visible.sort((a,b) => {
        if (currentSortBy === 'title') return (a.dataset.title||'').localeCompare(b.dataset.title||'');
        if (currentSortBy === 'difficulty') return (a.dataset.difficulty||'').localeCompare(b.dataset.difficulty||'');
        if (currentSortBy === 'xp') return Number(b.dataset.xp||0) - Number(a.dataset.xp||0);
        if (currentSortBy === 'category') return (a.dataset.category||'').localeCompare(b.dataset.category||'');
        if (currentSortBy === 'stat') return (a.dataset.stat||'').localeCompare(b.dataset.stat||'');
        return 0;
      });
      // re-append in order
      visible.forEach(n => questsElem.appendChild(n));
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
          <input type="text" class="quest-input" value="${quest.title || ''}" placeholder="Quest title">
          
          <div class="difficulty-tags">
              <button class="difficulty-tag glow-button ${quest.difficulty === 'Easy' ? 'selected' : ''}" data-difficulty="Easy">Easy</button>
              <button class="difficulty-tag glow-button ${quest.difficulty === 'Medium' ? 'selected' : ''}" data-difficulty="Medium">Medium</button>
              <button class="difficulty-tag glow-button ${quest.difficulty === 'Hard' ? 'selected' : ''}" data-difficulty="Hard">Hard</button>
          </div>
          
          <input type="number" class="quest-input xp-input" value="${quest.xp || 2}" min="1" max="5">
          
          <div class="stat-tags">
              ${['strength', 'agility', 'intelligence', 'stamina', 'willpower', 'discipline']
                  .map(stat => `<button class="stat-tag glow-button ${stat === quest.stat ? 'selected' : ''}" 
                                      data-stat="${stat}">${stat}</button>`).join('')}
          </div>

          <div class="due-date-section">
              <label for="due-date-input">Due Date:</label>
              <input type="date" id="due-date-input" class="quest-input" value="${dueDate}">
          </div>
          
          <div class="comment-section">
              <textarea class="quest-input" placeholder="Add a comment...">${quest.comment || ''}</textarea>
              <label class="pin-checkbox">
                  <input type="checkbox" ${quest.isPinned ? 'checked' : ''} class="pin-comment">
                  Pin Comment
              </label>
          </div>
          
          <div class="suggested-quests">
              <h4>Suggested Quests:</h4>
              <div id="quest-suggestions" class="suggestions-container"></div>
          </div>
          
          <div class="action-buttons">
              <button class="save-quest glow-button" onclick="saveQuestEdit(this)">Save</button>
              <button class="cancel-quest glow-button" onclick="cancelQuestEdit(this.closest('.quest-edit-panel'))">Cancel</button>
          </div>
      </div>
  `;

  setupEditPanelListeners(questElem);
  updateSuggestionsWithClickable(quest.stat || 'discipline', quest.difficulty || 'Medium', questElem);
}

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
          <input type="text" class="quest-input" value="${quest.title || ''}" placeholder="Quest title">
          
          <div class="difficulty-tags">
              <button class="difficulty-tag glow-button ${quest.difficulty === 'Easy' ? 'selected' : ''}" data-difficulty="Easy">Easy</button>
              <button class="difficulty-tag glow-button ${quest.difficulty === 'Medium' ? 'selected' : ''}" data-difficulty="Medium">Medium</button>
              <button class="difficulty-tag glow-button ${quest.difficulty === 'Hard' ? 'selected' : ''}" data-difficulty="Hard">Hard</button>
          </div>
          
          <input type="number" class="quest-input xp-input" value="${quest.xp || 2}" min="1" max="5">
          
          <div class="stat-tags">
              ${['strength', 'agility', 'intelligence', 'stamina', 'willpower', 'discipline']
                  .map(stat => `<button class="stat-tag glow-button ${stat === quest.stat ? 'selected' : ''}" 
                                      data-stat="${stat}">${stat}</button>`).join('')}
          </div>

          <div class="due-date-section">
              <label for="due-date-input">Due Date:</label>
              <input type="date" id="due-date-input" class="quest-input" value="${dueDate}">
          </div>
          
          <div class="comment-section">
              <textarea class="quest-input" placeholder="Add a comment...">${quest.comment || ''}</textarea>
              <label class="pin-checkbox">
                  <input type="checkbox" ${quest.isPinned ? 'checked' : ''} class="pin-comment">
                  Pin Comment
              </label>
          </div>
          
          <div class="suggested-quests">
              <h4>Suggested Quests:</h4>
              <div id="quest-suggestions" class="suggestions-container"></div>
          </div>
          
          <div class="action-buttons">
              <button class="save-quest glow-button" onclick="saveQuestEdit(this)">Save</button>
              <button class="cancel-quest glow-button" onclick="cancelQuestEdit(this.closest('.quest-edit-panel'))">Cancel</button>
          </div>
      </div>
  `;

  setupEditPanelListeners(questElem);
  updateSuggestionsWithClickable(quest.stat || 'discipline', quest.difficulty || 'Medium', questElem);
}

function setupEditPanelListeners(questElem) {
  questElem.querySelectorAll('.difficulty-tag, .stat-tag').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const siblings = this.parentElement.querySelectorAll('button');
      siblings.forEach(sib => sib.classList.remove('selected'));
      this.classList.add('selected');
      
      const selectedStat = questElem.querySelector('.stat-tag.selected').dataset.stat;
      const selectedDifficulty = questElem.querySelector('.difficulty-tag.selected').dataset.difficulty;
      updateSuggestionsWithClickable(selectedStat, selectedDifficulty, questElem);
      
      // Update XP based on difficulty
      const xpInput = questElem.querySelector('.xp-input');
      if (selectedDifficulty === 'Easy') xpInput.value = 5;
      if (selectedDifficulty === 'Medium') xpInput.value = 8;
      if (selectedDifficulty === 'Hard') xpInput.value = 10;
    });
  });
}

function applySuggestion(suggestion, questElem) {
  const titleInput = questElem.querySelector('input[type="text"]');
  if (titleInput) {
    titleInput.value = suggestion;
    showNotification('Suggestion applied');
  }
}

function updateSuggestionsWithClickable(stat, difficulty, questElem) {
  const suggestions = generateSuggestedQuests(stat, difficulty);
  const suggestionContainer = questElem.querySelector('#quest-suggestions');
  
  if (suggestionContainer) {
    suggestionContainer.innerHTML = suggestions.map(suggestion => `
      <div class="suggested-quest-item glow-button" onclick="applySuggestion('${suggestion}', this.closest('.quest-edit-panel'))">
          ${suggestion}
      </div>
    `).join('');
  }
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

async function saveQuestEdit(buttonElement) {
  const questElem = buttonElement.closest('.quest-edit-panel');
  const questId = questElem.dataset.questId;

  const updatedQuest = {
    id: questId === 'new' ? undefined : questId,
    title: questElem.querySelector('input[type="text"]').value.trim(),
    difficulty: questElem.querySelector('.difficulty-tag.selected').dataset.difficulty,
    xp: parseInt(questElem.querySelector('.xp-input').value),
    stat: questElem.querySelector('.stat-tag.selected').dataset.stat,
    comment: questElem.querySelector('textarea').value.trim(),
    isPinned: questElem.querySelector('.pin-comment').checked,
    status: 'inbox',
    dueDate: questElem.querySelector('#due-date-input').value || null
  };

  // Validation
  if (!updatedQuest.title) {
    showNotification('Please enter a quest title', 'error');
    return;
  }

  try {
    if (questId === 'new') {
      updatedQuest.id = await db.quests.add(updatedQuest);
    } else {
      updatedQuest.id = parseInt(questId); // Correctly use questId for existing quests
      await db.quests.put(updatedQuest);
    }
    
    const newQuestElem = createQuestElement(updatedQuest);
    questElem.parentNode.replaceChild(newQuestElem, questElem);
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
      setTimeout(() => { if (questElem && questElem.parentNode) questElem.remove(); }, 300);
    }

    // Get the quest ID to update in database
    const questId = questElem ? parseInt(questElem.dataset.questId) : null;
    const questCategory = questElem ? questElem.dataset.category : null;
    
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
    const previousLevel = playerStats.length > 0 ? playerStats[0].level : 0;
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
    } // End of if (playerStats.length > 0)

    // Update UI for XP
    updateXP(); // This will use the now-correct global currentXP

    // Check for level up
    const newLevel = playerStats.length > 0 ? playerStats[0].level : 0;
    if (newLevel > previousLevel) {
      setTimeout(() => {
        showLevelUpOverlay(newLevel);
        if (sounds && sounds.levelUp) sounds.levelUp.play();
      }, 500);
    }

    // Increase stat
    await increaseStat(stat);

    // Show XP Toast
    showXPToast(xp, stat);

    // Display a quest completion quote
    displayQuoteByContext(motivationalQuotesSystem.contexts.QUEST_COMPLETE);
    
    // Update quest count
    updateQuestCount();
    
    // Refresh all stat displays
    await refreshAllStatDisplays();
    
    // Update achievement progress
    updateAchievementProgress();
    
    // Force a final refresh
    setTimeout(() => {
      refreshAllStatDisplays();
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
        setTimeout(() => questElem.remove(), 300);
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
      
      // Increase stat by 1
      stats[stat]++;
      
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
    // Calculate XP required for the next level
    const xpRequired = calculateXPForNextLevel(currentLevel);
    
    // Check if the player has enough XP to level up
    if (currentXP >= xpRequired) {
        // Increase the player's level
        currentLevel++;
        currentXP -= xpRequired; // Deduct the required XP for leveling up

        // Update player stats in the database
        const playerStats = await db.playerStats.toArray();
        const stats = playerStats[0];
        stats.level = currentLevel;
        stats.xp = currentXP;
        await db.playerStats.put(stats);

        // Update UI elements
        levelElem.textContent = currentLevel;
        xpElem.textContent = currentXP;
        xpRequiredElem.textContent = calculateXPForNextLevel(currentLevel);
        updateXP(); // Re-render XP bar after level up

        // Play level-up sound
        sounds.levelUp.play();

        // Notify the user
        showNotification("Congratulations! You've leveled up!");
    } else {
        showNotification("Not enough XP to level up.");
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
    
    // Update stat text values
    for (const stat of statsKeys) {
      statsElems[stat].textContent = stats[stat];
    }
    
    // Update currentStats object for progress bars
    currentStats = {
      strength: stats.strength,
      agility: stats.agility,
      intelligence: stats.intelligence,
      stamina: stats.stamina,
      willpower: stats.willpower,
      discipline: stats.discipline
    };
    
    // Update progress bars
    updateStatDetails();
  }
}

addQuestBtn.addEventListener("click", async () => {
    // Open the edit panel for a new quest
    openQuestEditPanel({
        id: 'new', // Mark as a new quest
        title: '',
        difficulty: 'Medium',
        xp: 2,
        stat: 'discipline',
        status: 'inbox',
        comment: '',
        isPinned: false
    });
});

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
});

// Close modal with Escape key
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeSettingsModal();
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

    // Re-add default quests using the global constant
    await db.quests.clear();
    await db.quests.bulkAdd(GLOBAL_DEFAULT_QUESTS);

    showNotification("Game has been restarted! Non-existing quests have been added."); // Notify the user
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
  quests.forEach((quest) => {
    const newQuestElem = createQuestElement(quest); // Create the quest element
    questsElem.appendChild(newQuestElem); // Add it to the UI
  });

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

  quests.forEach((quest) => {
    const newQuestElem = createQuestElement(quest); // Create the quest element
    questsElem.appendChild(newQuestElem); // Add it to the UI
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
    username: "Anonymous",
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
  const achievements = await db.achievements.toArray(); // Added achievements

  const snapshot = {
    timestamp,
    stats: playerStats[0],
    quests: quests,
    achievements: achievements // Added achievements
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
    // Clear existing data
    await db.playerStats.clear();
    await db.quests.clear();
    // await db.achievements.clear(); // Commented out to allow merging
    await db.favoriteQuotes.clear();
    await db.statHistory.clear();

    // Add imported data
    if (importedData.playerStats) {
      await db.playerStats.add(importedData.playerStats);
    }
    if (importedData.quests && importedData.quests.length > 0) {
      await db.quests.bulkAdd(importedData.quests);
    }

    if (importedData.favoriteQuotes && importedData.favoriteQuotes.length > 0) {
      await db.favoriteQuotes.bulkAdd(importedData.favoriteQuotes);
    }
    if (importedData.statHistory && importedData.statHistory.length > 0) {
      await db.statHistory.bulkAdd(importedData.statHistory);
    }
    
    showNotification('Game data successfully imported!'); // Added success notification

    // location.reload(); // Removed to align with inspiration's event listener handling
  } catch (error) {
    console.error('Error in importGame function:', error);
    showNotification('Failed to import game data. Error: ' + error.message, 'error'); // Aligned with inspiration
  }
}
// Load Default Quests into current game
document.getElementById('load-default-quests-btn').addEventListener('click', async () => {
  if (confirm('Are you sure you want to load default quests? This will add any missing default quests to your current quest list.')) {
    await loadDefaultQuestsIntoCurrent();
    showNotification('Default quests loaded!');
    closeSettingsModal(); // Close the settings modal after action
  }
});

async function loadDefaultQuestsIntoCurrent() {
  try {
    const defaultQuests = GLOBAL_DEFAULT_QUESTS;
    const existingQuests = await db.quests.toArray();
    const existingQuestsMap = new Map(); // Map compositeKey to existingQuest

    for (const quest of existingQuests) {
      const compositeKey = `${quest.title}-${quest.difficulty}-${quest.xp}-${quest.stat}-${quest.category}`;
      existingQuestsMap.set(compositeKey, quest);
    }

    const questsToUpdate = [];
    const questsToAdd = [];

    for (const defaultQuest of defaultQuests) {
      const compositeKey = `${defaultQuest.title}-${defaultQuest.difficulty}-${defaultQuest.xp}-${defaultQuest.stat}-${defaultQuest.category}`;
      const existingQuest = existingQuestsMap.get(compositeKey);

      if (existingQuest) {
        // Merge: Update existing quest properties from default, preserve user state
        let changed = false;
        if (existingQuest.title !== defaultQuest.title) { existingQuest.title = defaultQuest.title; changed = true; }
        if (existingQuest.difficulty !== defaultQuest.difficulty) { existingQuest.difficulty = defaultQuest.difficulty; changed = true; }
        if (existingQuest.xp !== defaultQuest.xp) { existingQuest.xp = defaultQuest.xp; changed = true; }
        if (existingQuest.stat !== defaultQuest.stat) { existingQuest.stat = defaultQuest.stat; changed = true; }
        if (existingQuest.category !== defaultQuest.category) { existingQuest.category = defaultQuest.category; changed = true; }
        
        if (changed) {
          questsToUpdate.push(db.quests.put(existingQuest));
        }
      } else {
        // Add: No existing quest found
        questsToAdd.push({...defaultQuest, status: 'inbox'});
      }
    }

    // Perform updates and additions
    if (questsToUpdate.length > 0) {
      await Promise.all(questsToUpdate);
      showNotification(`Updated ${questsToUpdate.length} existing quests with default definitions.`, 'success');
    }
    if (questsToAdd.length > 0) {
      await db.quests.bulkAdd(questsToAdd);
      showNotification(`Added ${questsToAdd.length} new default quests.`, 'success');
    } else if (questsToUpdate.length === 0) {
      showNotification('No new or updated default quests.', 'info');
    }
    
    await refreshData();
    closeSettingsModal();
  } catch (error) {
    console.error('Error loading default quests:', error);
    showNotification('Failed to load default quests.', 'error');
  }
}

// Initialize Quotes and Spider Chart UI
function initializeQuotes() {
  try {
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const quoteSource = document.getElementById('quote-source');
    const favBtn = document.getElementById('favorite-quote');
    const newBtn = document.getElementById('new-quote');
    const favoritesGrid = document.getElementById('favorites-grid');
    let currentQuote = motivationalQuotesSystem.getRandomQuote();

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
    }

    async function renderFavorites(){
      if (!favoritesGrid) return;
      const favEntries = await db.favoriteQuotes.toArray().catch(()=>[]);
      const favoriteIds = (favEntries||[]).map(f=>f.quoteId);
      const favQuotes = motivationalQuotesSystem.quotes.filter(q=>favoriteIds.includes(q.id));
      favoritesGrid.innerHTML = favQuotes.map(q=>`
        <div class="favorite-quote-item" data-quoteid="${q.id}">
          <div class="favorite-quote-text">${escapeHtml(q.text)}</div>
          <div class="favorite-quote-author">${escapeHtml(q.author || '')}</div>
          <div class="favorite-quote-category">${escapeHtml(q.category || '')}</div>
        </div>
      `).join('') || '<div>No favorites yet</div>';
    }

    render(currentQuote);

    if (newBtn) newBtn.addEventListener('click', () => render(motivationalQuotesSystem.getRandomQuote()));
    if (favBtn) favBtn.addEventListener('click', async () => {
      if (!currentQuote) return;
      const nowFav = await motivationalQuotesSystem.toggleFavorite(currentQuote.id).catch(() => null);
      if (nowFav !== null) favBtn.classList.toggle('favorited', !!nowFav);
      renderFavorites();
    });

    document.querySelectorAll('.category-button').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.dataset.category;
        render(motivationalQuotesSystem.getQuoteByCategory(cat));
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

function displayQuoteByContext(context) {
  try {
    const q = motivationalQuotesSystem.getQuoteByContext(context);
    if (!q) return;
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const quoteSource = document.getElementById('quote-source');
    const container = document.querySelector('.quote-container');
    if (quoteText) quoteText.textContent = q.text || '';
    if (quoteAuthor) quoteAuthor.textContent = q.author || '';
    if (quoteSource) quoteSource.textContent = q.source || '';
    if (container) {
      container.classList.add('quote-pop');
      setTimeout(() => container.classList.remove('quote-pop'), 5000);
    }
  } catch (e) {
    console.error('displayQuoteByContext error', e);
  }
}

function updateStatDetails() {
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

    statKeys.forEach(async stat => { // Made async to await getStatChanges
      const bar = document.getElementById(`${stat}-progress`);
      const valEl = document.getElementById(`${stat}-value`);
      const changeEl = document.getElementById(`${stat}-change`); // Get the change element
      const value = stats[stat] || 0;

      if (bar) {
        const pct = Math.min(100, Math.round((value / maxVal) * 100));
        bar.style.width = pct + '%';
      }
      if (valEl) valEl.textContent = value;
      
      // Update stat changes
      if (changeEl) {
        const changes = await getStatChanges(); // Await the changes
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
    });

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

    // Append a new group for the previous stats
    const svgElement = container.querySelector('svg');
    if (svgElement) {
      let prevGroup = svgElement.querySelector('.spider-chart-previous');
      if (!prevGroup) {
        prevGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        prevGroup.classList.add('spider-chart-previous');
        svgElement.appendChild(prevGroup);
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

// Draw historical stats line chart (placeholder for now)
function drawHistoryChart(historyData) {
  const historyChart = document.getElementById('history-chart');
  if (!historyChart) return;

  historyChart.innerHTML = ''; // Clear previous chart content

  // Display a placeholder message
  const placeholder = document.createElement('div');
  placeholder.className = 'history-placeholder';
  placeholder.textContent = 'Historical stat tracking is coming soon!';
  historyChart.appendChild(placeholder);

  // In a full implementation, you would use a charting library or SVG to draw the historical data here.
  // The 'historyData' array contains objects with date and stat values.
  // Example: historyData = [{ date: "...", strength: 5, agility: 7, ... }]
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

      await recordStatHistory(); // Record current stats when opening the chart
      switchChartView('current'); // Set default view

      updateStatDetails();
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
  if (previousConnectionElem) previousConnectionElem.style.display = 'none';
  if (chartLegendElem) chartLegendElem.style.display = 'none';
  if (timeRangeControls) timeRangeControls.style.display = 'none';
  if (statDetailsContainer) statDetailsContainer.style.display = 'none';
  if (historyChartContainer) historyChartContainer.style.display = 'none';

  switch (view) {
      case 'current':
          if (statDetailsContainer) statDetailsContainer.style.display = 'block';
          updateStatDetails();
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
              .then(prevStats => {
                  if (prevStats) {
                      previousStats = {
                          strength: prevStats.strength,
                          agility: prevStats.agility,
                          intelligence: prevStats.intelligence,
                          stamina: prevStats.stamina,
                          willpower: prevStats.willpower,
                          discipline: prevStats.discipline
                      };
                      if (previousConnectionElem) previousConnectionElem.style.display = 'block';
                      if (chartLegendElem) chartLegendElem.style.display = 'flex';
                      if (statDetailsContainer) statDetailsContainer.style.display = 'block';
                      updateStatDetails(); // Will call drawComparisonChart internally
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


function initializeViewToggle(){
  try{
    const btns = document.querySelectorAll('.view-btn');
    const containerEl = document.querySelector('.container');
    btns.forEach(btn=>{
      btn.addEventListener('click', ()=>{
        btns.forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        const view = btn.dataset.view;
        if (!containerEl) return;
        containerEl.classList.remove('dashboard-view', 'detailed-view', 'compact-view');
        if (view === 'dashboard') containerEl.classList.add('dashboard-view');
        else if (view === 'detailed') containerEl.classList.add('detailed-view');
        else if (view === 'compact') containerEl.classList.add('compact-view');
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
    localStorage.setItem('theme', theme); // Save 'dark' or 'light'
  };

  // Set initial theme based on localStorage or default to dark
  let initialTheme = localStorage.getItem('theme');
  if (!initialTheme) {
    initialTheme = 'dark'; // Default theme
  }
  applyTheme(initialTheme); // Apply initial theme and set icon

  // Add event listener for the theme toggle button
  if (themeButton) {
    themeButton.addEventListener('click', () => {
      const currentTheme = localStorage.getItem('theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
    });
  }
}
function startTourGuide() {
  closeSettingsModal(); // Automatically close settings panel when tour starts
  const steps = [
    {
      element: ".level-up",
      title: "Level and XP",
      content:
        "This section shows your current level and XP progress. Complete quests to gain XP and level up!",
      position: "bottom",
    },
    {
      element: ".stats",
      title: "Character Stats",
      content:
        "These are your character stats. They increase as you complete related quests.",
      position: "top",
    },
    {
      element: ".quests",
      title: "Daily Quests",
      content:
        "Here you can see and complete your daily quests. Click the checkmark to complete a quest.",
      position: "top",
    },
    {
      element: "#add-quest-btn",
      title: "Add New Quest",
      content: "Click this button to add a custom quest.",
      position: "top",
    },
  ];

  let currentStep = 0;

  // Handler for random clicks to advance tour
  const bodyClickHandler = (e) => {
    // Only advance if click target is not a tour button
    if (e.target.closest('.tour-buttons button')) {
      return;
    }
    nextStep();
  };

  function showStep(step) {
    // Before showing new step, clean up previous
    hideStep();

    const element = document.querySelector(step.element);
    if (!element) {
        console.warn(`Tour guide element not found: ${step.element}`);
        return; // Skip this step if element is missing
    }
    element.classList.add("tour-highlight");
    element.scrollIntoView({ behavior: 'smooth', block: 'center' }); // Scroll to element

    const tooltip = document.createElement("div");
    tooltip.className = `tour-tooltip ${step.position}`;
    tooltip.innerHTML = `
    <h3>${step.title}</h3>
    <p>${step.content}</p>
    <div class="tour-buttons">
      ${ 
        currentStep > 0
          ? '<button class="tour-prev">Previous</button>'
          : ""
      }
      ${ 
        currentStep < steps.length - 1
          ? '<button class="tour-next">Next</button>'
          : '<button class="tour-end">End Tour</button>'
      }
    </div>
  `;

    document.body.appendChild(tooltip);

    positionTooltip(element, tooltip, step.position);

    const prevBtn = tooltip.querySelector(".tour-prev");
    const nextBtn = tooltip.querySelector(".tour-next");
    const endBtn = tooltip.querySelector(".tour-end");

    if (prevBtn) prevBtn.addEventListener("click", (e) => { e.stopPropagation(); previousStep(); });
    if (nextBtn) nextBtn.addEventListener("click", (e) => { e.stopPropagation(); nextStep(); });
    if (endBtn) endBtn.addEventListener("click", (e) => { e.stopPropagation(); endTour(); });
  }

  function positionTooltip(element, tooltip, position) {
    const elementRect = element.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();

    let top, left;

    switch (position) {
      case "top":
        top = elementRect.top - tooltipRect.height - 20;
        left =
          elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        break;
      case "bottom":
        top = elementRect.bottom + 20;
        left =
          elementRect.left + (elementRect.width - tooltipRect.width) / 2;
        break;
      case "left":
        top =
          elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.left - tooltipRect.width - 20;
        break;
      case "right":
        top =
          elementRect.top + (elementRect.height - tooltipRect.height) / 2;
        left = elementRect.right + 20;
        break;
    }

    tooltip.style.top = `${top + window.scrollY}px`;
    tooltip.style.left = `${left + window.scrollX}px`;
  }

  function hideStep() {
    const highlightedElements = document.querySelectorAll(".tour-highlight");
    highlightedElements.forEach(el => el.classList.remove("tour-highlight"));

    const tooltips = document.querySelectorAll(".tour-tooltip");
    tooltips.forEach(tooltip => {
      if (tooltip && tooltip.parentNode) {
        tooltip.remove();
      }
    });
  }

  function nextStep() {
    currentStep++; // Advance currentStep before showing next step
    if (currentStep < steps.length) {
      showStep(steps[currentStep]);
    } else {
      endTour();
    }
  }

  function previousStep() {
    currentStep--; // Decrement currentStep before showing previous step
    if (currentStep >= 0) {
      showStep(steps[currentStep]);
    } else {
      currentStep = 0; // Prevent going below first step
      showStep(steps[currentStep]);
    }
  }

  function endTour() {
    hideStep();
    currentStep = 0; // Reset for next time
    document.body.removeEventListener('click', bodyClickHandler); // Remove global click listener
    document.getElementById("modal-overlay").classList.remove("show"); // Hide the overlay
  }

  // Start the tour by calling showStep for the first time
  document.body.addEventListener('click', bodyClickHandler); // Attach global click listener
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
  }catch(e){console.error('initializeStats error',e);} 
}

function updateMainStatsDisplay(){
  try{
    if (levelElem) levelElem.textContent = currentLevel;
    if (xpElem) xpElem.textContent = currentXP;
    const next = calculateXPForNextLevel(currentLevel);
    if (xpRequiredElem) xpRequiredElem.textContent = next;
    if (xpProgressElem) xpProgressElem.style.width = `${(currentXP / next) * 100}%`;

    // update main stat elements
    if (currentStats){
      Object.keys(currentStats).forEach(stat=>{
        const el = statsElems[stat];
        if (el) el.textContent = currentStats[stat];
        const mainBar = document.getElementById(`${stat}-progress-main`);
        if (mainBar){
          const pct = Math.min(100, Math.round((currentStats[stat] / (typeof MAX_STAT !== 'undefined'? MAX_STAT:100)) * 100));
          mainBar.style.width = pct + '%';
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
    let remaining = 25 * 60;
    let modeSeconds = 25 * 60;
    let audioUnlocked = false;

    function unlockAudio() {
      if (audioUnlocked) return;
      // Play and immediately pause a silent sound to unlock audio
      const silentSound = new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'], volume: 0 });
      silentSound.play();
      audioUnlocked = true;
    }

    function updateDisplay() {
      const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
      const secs = Math.floor(remaining % 60).toString().padStart(2, '0');
      if (minutesElem) minutesElem.textContent = mins;
      if (secondsElem) secondsElem.textContent = secs;
    }

    function start() {
      if (interval) return; // already running
      unlockAudio();
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
    // If db has entries, render them; otherwise seed from definitions
    if (!achs || achs.length === 0){
      const toAdd = achievementDefinitions.map(({condition,...rest})=>({...rest, unlocked:false, unlockedAt:null}));
      await db.achievements.bulkAdd(toAdd).catch(()=>{});
    }
    renderAchievements();
  }catch(e){console.error('initializeAchievements error',e);} 
}

async function renderAchievements(){
  try{
    const items = await db.achievements.toArray().catch(()=>[]);
    const grid = document.getElementById('achievements-grid');
    const countEl = document.querySelector('.achievement-count');
    const total = items.length || achievementDefinitions.length;
    const unlockedCount = items.filter(i=>i.unlocked).length;
    if (countEl) countEl.textContent = unlockedCount;
    const fill = document.getElementById('achievement-progress-fill');
    if (fill) fill.style.width = `${Math.round((unlockedCount/total)*100)}%`;

    if (grid){
      grid.innerHTML = (items || []).map(it=>`<div class="achievement-card ${it.unlocked? 'unlocked':''}"><div class="achievement-icon"><i class="${it.icon}"></i></div><div class="achievement-info"><div class="achievement-title">${escapeHtml(it.title)}</div><div class="achievement-desc">${escapeHtml(it.description)}</div></div></div>`).join('');
    }
  }catch(e){console.error('renderAchievements error',e);} 
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

// Re-initialize small features
initializePomodoro();
initializeAchievements();

// Export Game Functionality
// Save Default Quests to File
document.getElementById('save-default-quests-btn').addEventListener('click', async () => {
  if (confirm('Are you sure you want to save the current default quests to file? This will overwrite the existing defaults.')) {
    await saveDefaultQuestsToFile();
  }
});

async function saveDefaultQuestsToFile() {
  try {
    showNotification("This feature is not fully implemented yet.", "info");
  } catch (error) {
    console.error('Error saving default quests:', error);
    showNotification('Failed to save default quests.', 'error');
  }
}
