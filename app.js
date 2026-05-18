let activeQuoteCategory = null;

const questToQuoteCategory = {
  work: "discipline",
  health: "perseverance",
  learning: "wisdom",
  personal: "growth",
  faith: "faith",
  discipline: "discipline",
  power: "power"
};

function linkify(text) {
  if (!text) return '';
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
  { title: "SACREFICE UR DESIRES", difficulty: "Easy", xp: 99999999, stat: "willpower", category: "personal" },   
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
  { title: "LOCK IN: Be to Allah what fang yuan is to u PLTARM", difficulty: "Easy", xp: 3315, stat: "willpower", category: "personal" },
  { title: "Always Choose the Pleasure of Allah", difficulty: "Easy", xp: 3315, stat: "willpower", category: "personal", isPinned: true },
  { title: "Aura Farming With Allah", difficulty: "Easy", xp: 3310, stat: "willpower", category: "personal", isPinned: true },
  { title: "Selective fast (Jihad of silence): be like salah", difficulty: "Easy", xp: 3310, stat: "willpower", category: "personal", comment: "Be on the me app, ask Allah for help for your soul", isPinned: true },
  { title: "Don't Disregard Allah in times of sin_softHeart", difficulty: "Easy", xp: 3310, stat: "willpower", category: "personal" },
  { title: "Nawwafi_Murájá", difficulty: "Easy", xp: 3310, stat: "willpower", category: "personal", comment: "1/3 of page per raka; Deep", isPinned: true },
  { title: "Take Haram Seriously, it's a big deal in GodSight.", difficulty: "Easy", xp: 3310, stat: "willpower", category: "personal" },
  { title: "Resurrection Spell", difficulty: "Easy", xp: 338, stat: "intelligence", category: "learning", comment: "the 3 Quls", isPinned: true },      
  { title: "99 Names", difficulty: "Easy", xp: 338, stat: "discipline", category: "learning", comment: "https://drive.google.com/file/d/1OOfWSArPLilmJHmeOtrLgGhfaHmqMTY4/view?usp=sharing", isPinned: true },
  { title: "English Tafseer 1pg/Quran", difficulty: "Easy", xp: 338, stat: "intelligence", category: "learning" },
  { title: "Liquid Drop concentration", difficulty: "Easy", xp: 338, stat: "intelligence", category: "learning" },
  { title: "There is more to life than your desires", difficulty: "Easy", xp: 338, stat: "discipline", category: "personal" },
  { title: "people doing what u don't want to do", difficulty: "Easy", xp: 338, stat: "discipline", category: "personal" },
  { title: "Systematic Review || At least 15 mins", difficulty: "Easy", xp: 338, stat: "intelligence", category: "learning" },
  { title: "Effectiveness Audit", difficulty: "Easy", xp: 500, stat: "discipline", category: "cultivation" },
  { title: "Quran Word Memorization", difficulty: "Easy", xp: 500, stat: "intelligence", category: "cultivation" },
  { title: "Posture Alignment", difficulty: "Easy", xp: 300, stat: "stamina", category: "physical" },
  { title: "50 Push-ups (Punishment)", difficulty: "Easy", xp: 500, stat: "strength", category: "physical" },
  
  
  // MEDIUM - Moderate effort tasks (10 XP Islamic, 8 XP others)
  { title: "SACREFICE UR DESIRES", difficulty: "Medium", xp: 99999999, stat: "willpower", category: "personal" },
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
  { title: "SACREFICE UR DESIRES", difficulty: "Hard", xp: 99999999, stat: "willpower", category: "personal" },
  { title: "Real Maths", difficulty: "Hard", xp: 1310, stat: "intelligence", category: "learning" },
  { title: "Quantum Code", difficulty: "Hard", xp: 1310, stat: "intelligence", category: "learning" },
  { title: "Thesis Project NoteBookLM", difficulty: "Hard", xp: 1310, stat: "intelligence", category: "work" },
  { title: "Complete 5 sets of 25 push-ups", difficulty: "Hard", xp: 1310, stat: "strength", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true },
  { title: "Complete a 30-minute intense agility drill session", difficulty: "Hard", xp: 1310, stat: "agility", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true },
  { title: "Maintain a rigorous daily workout routine for a month", difficulty: "Hard", xp: 1310, stat: "strength", category: "personal", comment: "GAME: Tele", isPinned: true },
  { title: "MERN FULL STACK || At least 15mins", difficulty: "Hard", xp: 1310, stat: "intelligence", category: "learning" },
  { title: "MPhil Proposal Research work || At least 1 Slide", difficulty: "Hard", xp: 1310, stat: "intelligence", category: "learning" },
  { title: "Do 100 push-ups throughout the day", difficulty: "Hard", xp: 1310, stat: "strength", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true },
  { title: "Do a 300m run", difficulty: "Hard", xp: 1310, stat: "agility", category: "personal", comment: "EBOOK/PLAYLIST", isPinned: true }
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
      id: 76,
      text: "The Divine Seal Altar's 33 steps. One day, if I am to step onto the peak of martial arts, then let this be the beginning of my journey!",
      author: "Lin Ming",
      source: "Reverend Insanity",
      category: "growth",
      contexts: ["levelUp", "questComplete"],
      favorite: false
    },
    {
      id: 77,
      text: "The road of martial arts means to live a lonely and desolate life... suffering in silence.",
      author: "Lin Ming",
      source: "Reverend Insanity",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 78,
      text: "I love money, but I'm my own master. I'll never let material things control me!",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "discipline",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 79,
      text: "Chess pieces are pieces because they were meant to be used, they were also meant to be discarded when necessary.",
      author: "Fang Yuan",
      source: "Reverend Insanity",
      category: "wisdom",
      contexts: ["questComplete", "daily"],
      favorite: false
    },
    {
      id: 80,
      text: "My goal for all eternity will be to exceed myself! To constantly exceed myself, to continually break through my own barriers!",
      author: "Meng Hao",
      source: "Reverend Insanity",
      category: "growth",
      contexts: ["levelUp", "achievementUnlocked"],
      favorite: false
    },
    {
      id: 81,
      text: "Freedom! Independence! No cares or worries! What I want, the Heavens shall NOT lack! What I don't want, had BETTER not exist in the Heavens!",
      author: "Meng Hao",
      source: "Reverend Insanity",
      category: "power",
      contexts: ["levelUp", "daily"],
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
      text: "As long as u haven't fallen yet, there is still a chance to turn everything around.",
      author: "Unknown",
      source: "Motivation",
      category: "perseverance",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 90,
      text: "Don't Disappoint Allah n Surely He Shall Not Let Down Ur Expectations.",
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
      text: "Don't waste ur potential.",
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
      text: "Challenge ur limits again and again and again.",
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
      text: "BE PROACTIVE IN UR AFFAIRS.",
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
      text: "No matter how ruthless the devil is, u can be more ruthless.",
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
      text: "He always thought it right to keep improving instead of having fun so that you wouldn't be regretful when u found yourself in trouble yet lacked strength.",
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
      text: "Everytime u wake up to reality is a new day.",
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
      text: "The faster u act on ur dreams the more successful u will be.",
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
      text: "It is merely another version of ur self that has exceeded ur current limits.",
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
      text: "Increase ur Rank in the sight of ALLAH.",
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
      text: "No matter who u are, u do not truly know what kind of man u'v become...Until u reach the very end.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "perseverance",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 142,
      text: "Deceiving ur self to believe u hav not been deceived.",
      author: "Unknown",
      source: "Life Wisdom",
      category: "wisdom",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 143,
      text: "If u don't Trust ALLAH, then trust ur self experience.",
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
      text: "Oh young Muslim, those of old sacrificed much for Islam, what have u sacrificed.",
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
      text: "Even if this increase wad very little, a little progress every day would accumulate to a terrifying amount after several days.",
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
      text: "What is ur purpose.",
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
      text: "Stop being destracted, the world will chase u when u chase Allah.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 156,
      text: "When ur Salah is crooked, ur life is crooked.",
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
      text: "Before obtaining the greatest strength at the apex, do not plan to slow ur footsteps.",
      author: "Unknown",
      source: "Cultivation Wisdom",
      category: "discipline",
      contexts: ["daily", "levelUp"],
      favorite: false
    },
    {
      id: 162,
      text: "Know that ur words n actions shackle u.",
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
      text: "If u were not this challenging, how then would u be worthy of my effort.",
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
      text: "As long as u haven't fallen, there is a chance to turn everything around.",
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
      text: "Every time u wake up to reality is a new day.",
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
      text: "U will stay like this till the end if u do not make the 1st move",
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
      text: "Allah takes away somethings in other for u to return, if u do not wish 4 it to be taken away...never leave in the first place.",
      author: "Unknown",
      source: "Faith Reflection",
      category: "faith",
      contexts: ["daily"],
      favorite: false
    },
    {
      id: 187,
      text: "Don't Disappoint Allah n Surely He Shall Not Let Down Ur Expectations.",
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
      text: "If u don't Trust ur self, then at least TRUST ALLAH.",
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
const addQuestBtn = document.getElementById("add-quest-btn");

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

  db.quests.add(newQuest).then(() => {
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
    renderQuests();
    showNotification('New quest added', 'info');
  }).catch(e => {
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
    return { play: () => {} };
  }
}
let audioUnlocked = false;

function unlockAudioOnce() {
  if (audioUnlocked) return;
  const silent = new Howl({ src: ['data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA'], volume: 0 });
  silent.play();
  audioUnlocked = true;
}

document.addEventListener('click', unlockAudioOnce, { once: true });

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
    if (stats.currentStreak === undefined) {
      stats.currentStreak = 0;
      stats.longestStreak = 0;
      stats.consecutiveDays = 0;
      stats.completedQuests = 0;
      stats.categoriesCompleted = [];
      stats.pomodoroCompleted = 0;
    }
    if (stats.totalXpEarned === undefined) {
      stats.totalXpEarned = 0;
      stats.hardQuestsCompleted = 0;
      stats.mediumQuestsCompleted = 0;
      stats.easyQuestsCompleted = 0;
      stats.statsCompleted = [];
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
  
  // Initialize due date reminders
  initializeDueDateReminders();
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
        <span class="quest-status status-${quest.status || 'inbox'} quest-selector" data-quest-id="${quest.id}"></span>
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
    // .quest-status.quest-selector is handled by delegated listener on #quests —
    // let the event bubble, but don't open the edit panel
    if (e.target.closest(".quest-status.quest-selector")) {
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

function generateSuggestedQuests(stat, difficulty, category) {
  const suggestions = {
    strength: {
      Easy: ["Do 10 push-ups", "Do 20 squats"],
      Medium: ["Complete 3 sets of 15 push-ups", "Do 30 burpees"],
      Hard: ["Do 100 push-ups throughout the day", "Complete a 30-minute bodyweight strength routine"],
    },
    agility: {
      Easy: ["Do 50 jumping jacks", "Practice quick feet drills for 5 minutes"],
      Medium: ["Complete a 15-minute HIIT workout", "Do 100 mountain climbers"],
      Hard: ["Complete a 30-minute intense agility drill session", "Do 200 high knees"],
    },
    stamina: {
      Easy: ["Jog in place for 10 minutes", "Do 50 jumping jacks"],
      Medium: ["Complete a 20-minute home cardio workout", "Do 100 jump ropes"],
      Hard: ["Complete a 45-minute high-intensity cardio session", "Do a 1-hour indoor cycling session"],
    },
    willpower: {
      Easy: ["Meditate for 10 minutes", "Resist a small temptation for a day"],
      Medium: ["Fast for 16 hours", "Take a cold shower for a week"],
      Hard: ["Complete a 72-hour fast", "Maintain a strict diet for a month"],
    },
    discipline: {
      Easy: ["Wake up 30 minutes earlier than usual", "Stick to a daily to-do list"],
      Medium: ["Follow a strict study/work schedule for a week", "Practice a skill daily for 30 days"],
      Hard: ["Maintain a rigorous daily routine for a month", "Complete a challenging long-term project"],
    },
    spiritual: {
      Easy: ["Recite one page of Quran", "Perform morning/evening Dhikr"],
      Medium: ["Memorize 5 Quranic words", "Perform Sunday Night Nafilah"],
      Hard: ["Perform Salatu Tasbih", "Complete Istikhara for a major life decision"],
    },
    marketing: {
      Easy: ["Post 1 affiliate link on Quora", "Research 1 new affiliate site"],
      Medium: ["Set up a niche affiliate website", "Create a content plan for affiliate marketing"],
      Hard: ["Launch a full-scale affiliate marketing campaign", "Achieve first sale through affiliate links"],
    },
    cultivation: {
      Easy: ["Effectiveness Audit (10m)", "Quran Word Memorization (10m)"],
      Medium: ["Deep read 1 chapter of Quran", "Review study goals for the week"],
      Hard: ["Prepare for exams as if tomorrow", "Complete 4 hours of cultivation study"],
    }
  };

  const catSuggestions = {
    work: ["Write merge algorithm", "Agentic AI project", "Complete daily report", "Affiliate research", "Upload app to console"],
    health: ["500 pushups", "Posture alignment", "Drink 2L water", "10-min walk", "30-minute workout"],
    learning: ["Learn Kotlin", "Recite Quran page", "Memorize Quran word", "Nahwu study", "Juz Daily", "Read for school"],
    personal: ["Effectiveness Audit", "Train brain", "Plan week", "Organize files", "Dua Daily", "Recite Quran"],
    cultivation: ["Salatu Tasbih", "Perform Nafilah", "Quran recitation", "Study spiritual text", "Morning/Evening Dhikr", "Effectiveness Audit"]
  };

  const statSugs = (suggestions[stat] && suggestions[stat][difficulty]) ? suggestions[stat][difficulty] : [];
  const catSugs = (category && catSuggestions[category.toLowerCase()]) ? catSuggestions[category.toLowerCase()] : [];
  
  const all = [...new Set([...statSugs, ...catSugs])];
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
        (category === 'all' || node.dataset.category === category) &&
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
            <input type="text" class="quest-input edit-title-input" value="${quest.title || ''}" placeholder="Quest title">
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
    showNotification('Suggestion applied');
  }
}

function updateSuggestionsWithClickable(stat, difficulty, questElem) {
  const category = questElem.querySelector('.edit-category-group .tag-button.selected')?.dataset.category;
  const suggestions = generateSuggestedQuests(stat, difficulty, category);
  const suggestionContainer = questElem.querySelector('#quest-suggestions');
  
  if (suggestionContainer) {
    suggestionContainer.innerHTML = suggestions.map(suggestion => `
      <div class="suggested-quest-item glow-button" onclick="applySuggestion('${suggestion}', this.closest('.quest-edit-panel'))">
          ${suggestion}
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

document.getElementById('quests')?.addEventListener('click', (e) => {
  try {
  const dot = e.target.closest('.quest-status.quest-selector');
  if (!dot) return;
  const id = parseInt(dot.dataset.questId);
  if (selectedQuests.has(id)) {
    selectedQuests.delete(id);
    dot.classList.remove('selected');
    dot.closest('.quest')?.classList.remove('selected');
  } else {
    selectedQuests.add(id);
    dot.classList.add('selected');
    dot.closest('.quest')?.classList.add('selected');
  }
  updateBatchBar();
  } catch (e) { console.error('quest selector error', e); }
});

function updateBatchBar() {
  const bar = document.getElementById('batch-bar');
  const count = document.getElementById('batch-count');
  if (!bar || !count) return;
  const shown = new Set();
  document.querySelectorAll('#quests .quest:not([style*="display: none"]) .quest-status.quest-selector.selected').forEach(dot => {
    shown.add(parseInt(dot.dataset.questId));
  });
  selectedQuests = shown;
  if (selectedQuests.size > 0) {
    bar.style.display = 'flex';
    count.textContent = selectedQuests.size;
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
  const ids = [...selectedQuests];
  if (ids.length === 0) { showNotification('No quests selected', 'warning'); return; }
  if (!sounds || !sounds.complete) {} else sounds.complete.play();
  const container = document.getElementById('quests');
  let totalXp = 0;
  let lastStat = null;
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
    quest.status = 'completed';
    quest.completedAt = new Date();
    await db.quests.put(quest);
    const playerStats = await db.playerStats.toArray();
    if (playerStats.length > 0) {
      const s = playerStats[0];
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
      await db.playerStats.put(s);
      if (stat) await increaseStat(stat);
    }
    el.style.opacity = 0;
    setTimeout(() => { el.remove(); updateQuestsEmptyState(); }, 300);
  }
  if (totalXp > 0) {
    currentXP += totalXp;
    updateXP();
    const playerStats = await db.playerStats.toArray();
    if (playerStats.length > 0) {
      const s = playerStats[0];
      s.xp = currentXP;
      const prevLevel = s.level;
      await db.playerStats.put(s);
      checkAchievements();
      const newLevel = s.level;
      if (newLevel > prevLevel) {
        setTimeout(() => {
          showLevelUpOverlay(newLevel);
          if (sounds && sounds.levelUp) sounds.levelUp.play();
        }, 500);
      }
      if (lastStat) displayQuoteByContext(motivationalQuotesSystem.contexts.QUEST_COMPLETE);
    }
    showNotification(`Completed ${ids.length} quest${ids.length > 1 ? 's' : ''}! +${totalXp} XP`, 'success');
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

  const updatedQuest = {
    id: questId === 'new' ? undefined : questId,
    title: questElem.querySelector('input[type="text"]').value.trim(),
    category: questElem.querySelector('.category-tags .tag-button.selected')?.dataset.category || 'Personal',
    difficulty: questElem.querySelector('.difficulty-tags .tag-button.selected')?.dataset.difficulty,
    xp: parseInt(questElem.querySelector('.xp-input').value),
    stat: questElem.querySelector('.stat-tags .tag-button.selected')?.dataset.stat,
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
let currentQuote = null;

function speakText(text) {
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
      speakText(q.text);
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

    let total = 0;
    statKeys.forEach(async stat => { // Made async to await getStatChanges
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
    let remaining = 25 * 60;
    let modeSeconds = 25 * 60;

    function updateDisplay() {
      const mins = Math.floor(remaining / 60).toString().padStart(2, '0');
      const secs = Math.floor(remaining % 60).toString().padStart(2, '0');
      if (minutesElem) minutesElem.textContent = mins;
      if (secondsElem) secondsElem.textContent = secs;
    }

    function start() {
      if (interval) return; // already running
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

// Re-initialize small features
initializePomodoro();

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
