/* ──────────────────────────────────────────────
 * Solo Leveling System — Default Quests
 * ────────────────────────────────────────────── */

const RAW_DEFAULT_QUESTS = [
  // ETERNAL QUEST — sacrifice
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
  // MEDIUM
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
  // HARD
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
  for (const quest of RAW_DEFAULT_QUESTS) {
    const key = `${quest.title}-${quest.difficulty}-${quest.xp}-${quest.stat}-${quest.category}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueQuests.push(quest);
    }
  }
  return uniqueQuests;
})();

let questSuggestionPool = [];
