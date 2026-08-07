/* ═══════════════════════════════════════════════
 * Solo Leveling System — Default Quests (Merged & Enriched)
 * Single source of truth.
 *
 * Every duplicate/overlapping quest from previous versions was merged into
 * ONE quest carrying the full detail (subtasks, tags, description).
 * New quests were added from the Notes/TASKS files (Nafilah, Salatu Tasbih,
 * Istikhara, Affiliate Marketing, Mobile App Development, Study & Exams,
 * Train Your Brain, Daily Cultivation).
 *
 * ═══════════════════════════════════════════════
 * XP SYSTEM: Easy 150-500 | Medium 500-1200 | Hard 1500-3000
 * Repeatable quests get ×0.33 (daily) / ×0.66 (weekly)
 * Level formula: 10 × 1.5^level → Lv10~577, Lv20~33k
 * ═══════════════════════════════════════════════
 * NOTE: Titles referenced by data/quest-chains.js must stay exact:
 *   Night Prayer (Tahajjud), Daily Adhkar & Dua, Quran Reading (1pg min),
 *   Daily Health Essentials, Email & Comms, The 3 Quls (Protection),
 *   Quran Memorization (Hifz), Quran Deep Study, Mujawwad Recitation & Teaching,
 *   Madina Arabic & Grammar, Arabic Conversation (Pimsleur), Nahwu (Arabic Grammar),
 *   Word4Word Quran, Control Your Nafs, Digital Detox (1hr),
 *   Silence Fast & Self-Observation, Be an Observer, Effectiveness Audit,
 *   50 Push-ups (Punishment), 5x25 Push-ups, 100 Push-ups,
 *   Monthly Workout Streak, Daily Workout, Agility Training, 300m Run
 * ═══════════════════════════════════════════════ */

const rawDefaultQuests = [
  // ═══════════════════════════════════════════════════════════
  // ETERNAL QUEST (was: 3× "SACRIFICE YOUR DESIRES" @ 99,999,999 XP)
  // Merged into ONE quest with sane XP + escalating subtasks.
  // ═══════════════════════════════════════════════════════════
  { title: "Sacrifice Your Desires (Eternal)", difficulty: "Hard", xp: 2000, stat: "willpower", category: "spiritual",
    description: "Renounce a desire or give up a comfort for Allah. Escalate daily: Easy (skip a treat) → Medium (quit a habit) → Hard (major sacrifice). Give up something significant and hold it the whole day. Fitna is refinement — this is the eternal quest of self-mastery. (Merged: Give up for Allah)",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["islamic", "core", "sacrifice", "eternal"],
    subtasks: ["Identify a desire to renounce", "Make the intention for Allah", "Act on the sacrifice", "Hold the sacrifice the whole day", "Reflect on what you gained"] },

  // ═══════════════════════════════════════════════════════════
  // EASY QUESTS
  // ═══════════════════════════════════════════════════════════

  // ─── EASY: SPIRITUAL ───
  { title: "Daily Adhkar & Dua", difficulty: "Easy", xp: 300, stat: "willpower", category: "spiritual",
    description: "Morning/evening adhkar, heartfelt dua, and quiet dhikr throughout the day. (Merged: Dua Daily, Quiet Dhikr)",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["islamic", "daily"],
    subtasks: ["Morning adhkar", "Evening adhkar", "Make dua — pour your heart out", "Quiet dhikr throughout the day"] },

  { title: "Daily Istighfar & Salawat", difficulty: "Easy", xp: 350, stat: "discipline", category: "spiritual",
    description: "Astaghfirullah 100× + Salawat 100× + sincere tawbah + tasbih (Allah 1000×). (Added: tasbih from the Book of Tasks)",
    repeatable: true, frequency: "daily",
    tags: ["islamic", "daily"],
    subtasks: ["Istighfar 100×", "Salawat 100×", "Sincere tawbah", "Tasbih — 'Allah' 1000×"] },

  { title: "All Actions as Worship", difficulty: "Easy", xp: 300, stat: "discipline", category: "spiritual",
    description: "Set the intention for every action as ibadah — work, eating, resting, studying.",
    repeatable: true, frequency: "daily",
    tags: ["islamic", "daily", "mindset"],
    subtasks: ["Set niyyah before each task", "Do the task excellently", "Turn it in to Allah"] },

  { title: "Silence Fast & Self-Observation", difficulty: "Easy", xp: 350, stat: "willpower", category: "spiritual",
    description: "Practice voluntary silence + observe your thoughts without reacting. Be like salah — selective silence and self-restraint. (Merged: Selective Silence Fast)",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["islamic", "daily", "restraint"],
    subtasks: ["Practice voluntary silence", "Observe thoughts without reacting", "Be like salah — selective restraint"] },

  { title: "Night Prayer (Tahajjud)", difficulty: "Easy", xp: 350, stat: "willpower", category: "spiritual",
    description: "Wake for 1/3 page per raka — deep nawafil. Pray at least 2 rak'ats in the last third of the night.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["islamic", "daily"],
    subtasks: ["Wake for Tahajjud", "Pray 2+ rak'ats", "Recite Quran in prayer"] },

  { title: "Control Your Nafs", difficulty: "Easy", xp: 400, stat: "willpower", category: "spiritual",
    description: "Don't forget Allah in sin + resist whispers + choose halal over haram.",
    repeatable: true, frequency: "daily",
    tags: ["islamic", "daily", "mindset"],
    subtasks: ["Don't forget Allah in sin", "Resist the whispers", "Choose halal over haram"] },

  { title: "Give Sadaqah", difficulty: "Easy", xp: 300, stat: "discipline", category: "spiritual",
    description: "Give charity — even a smile counts as sadaqah. Prefer hidden charity (sadaqah sirr).",
    repeatable: true, frequency: "weekly",
    tags: ["islamic", "charity", "weekly"],
    subtasks: ["Give charity", "Even a smile counts", "Prefer hidden sadaqah"] },

  { title: "Sleeping Prayer/Wird", difficulty: "Easy", xp: 335, stat: "willpower", category: "spiritual",
    description: "Pray before sleep, then recite Quran as protection — Ayat-ul-Kursi and the 3 Quls.",
    repeatable: true, frequency: "daily",
    tags: ["islamic", "daily"],
    subtasks: ["Pray before sleep", "Recite protection ayahs", "Sleep on a good intention"] },

  { title: "Ask Allah in Sujood", difficulty: "Easy", xp: 400, stat: "willpower", category: "spiritual",
    description: "Please ask for help from Allah in each sujood — the closest a servant is to his Lord. Reflect on sujood, the Hereafter, and your goal of closeness to Allah. (Merged: Heart Reflection)",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["islamic", "daily", "mindset"],
    subtasks: ["Make dua in sujood", "Ask Allah's help earnestly", "Reflect on sujood — closeness to Allah", "Reflect on the Hereafter", "Thank Him for one blessing"] },

  { title: "The 3 Quls (Protection)", difficulty: "Easy", xp: 200, stat: "intelligence", category: "spiritual",
    description: "Recite Surahs 112–114 (Ikhlas, Falaq, Nas) for protection — morning and evening.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["islamic", "quran", "daily"],
    subtasks: ["Recite Surah Ikhlas", "Recite Surah Falaq", "Recite Surah Nas"] },

  // ─── EASY: LEARNING ───
  { title: "Quran Reading (1pg min)", difficulty: "Easy", xp: 250, stat: "intelligence", category: "learning",
    description: "Read at least 1 page of Quran with reflection — recite one page or chapter daily.",
    repeatable: true, frequency: "daily",
    tags: ["islamic", "quran", "daily"],
    subtasks: ["Read 1 page of Quran", "Reflect on the meaning", "Recite with tajweed"] },

  { title: "Systematic Review (15min)", difficulty: "Easy", xp: 300, stat: "intelligence", category: "learning",
    description: "15 min of systematic review on any topic + effectiveness audit.",
    repeatable: true, frequency: "daily",
    tags: ["learning", "daily"],
    subtasks: ["15 min systematic review", "Effectiveness audit", "Note one improvement"] },

  { title: "99 Names of Allah", difficulty: "Easy", xp: 338, stat: "discipline", category: "learning",
    description: "Study the 99 Names of Allah — learn the meaning and call upon Him by them.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["islamic", "learning", "daily"],
    subtasks: ["Study one Name", "Reflect on its meaning", "Use it in dua"] },

  { title: "Read 10 Pages", difficulty: "Easy", xp: 250, stat: "intelligence", category: "learning",
    description: "Read 10 pages of any book. Suggested: Reverend Insanity, Pursuit of the Truth, Warlock of the Magus World, Solo Leveling, I Shall Seal the Heavens...",
    repeatable: true, frequency: "daily",
    tags: ["reading", "daily"],
    subtasks: ["Read 10 pages", "Note one lesson or line", "Apply or reflect on it"] },

  // ─── EASY: PERSONAL ───
  { title: "Journal & Gratitude", difficulty: "Easy", xp: 250, stat: "discipline", category: "personal",
    description: "Write a journal entry + log 3 things you're grateful for + watch something that inspires gratitude. (Merged: watch teleGratitude)",
    repeatable: true, frequency: "daily",
    tags: ["reflection", "daily"],
    subtasks: ["Write journal entry", "Log 3 gratitudes", "Say Alhamdulillah genuinely"] },

  { title: "Digital Detox (1hr)", difficulty: "Easy", xp: 250, stat: "willpower", category: "personal",
    description: "Spend 1 hour away from screens/phone. Escalation schedule: 2 weeks @ 0.5h → 4 weeks @ 1h → 1 week @ 3h → 2 weeks @ 4h.",
    repeatable: true, frequency: "daily",
    tags: ["detox", "daily"],
    subtasks: ["1hr away from screens", "Do something physical/real", "Notice the difference"] },

  { title: "Be an Observer", difficulty: "Easy", xp: 315, stat: "willpower", category: "personal",
    description: "Step back and observe your thoughts without attachment — watch the mind like a machine.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["mindset", "daily"],
    subtasks: ["Observe thoughts without attachment", "Don't react to every impulse", "Note one pattern"] },

  { title: "Break the Loop", difficulty: "Easy", xp: 315, stat: "willpower", category: "personal",
    description: "Don't get stuck in a 1hr+ loop (code, short videos, scrolling). Set a timer; walk away.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["focus", "daily"],
    subtasks: ["Set a loop timer", "Walk away at the limit", "Replace with something useful"] },

  { title: "Choose Allah's Pleasure", difficulty: "Easy", xp: 315, stat: "willpower", category: "personal",
    description: "Always choose the pleasure of Allah over your desires — in every small decision.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["islamic", "daily"],
    subtasks: ["Notice a desire vs duty moment", "Choose Allah's pleasure", "Reflect on the outcome"] },

  { title: "Effectiveness Audit", difficulty: "Easy", xp: 500, stat: "discipline", category: "personal",
    description: "Audit your daily effectiveness. Ask 'What works?' instead of 'More work.' Play back the tapes of performance at day's end.",
    repeatable: true, frequency: "daily",
    tags: ["productivity", "daily"],
    subtasks: ["Ask 'What works?' not 'More work'", "Play back the tapes of performance", "Log wins & losses", "Plan one fix for tomorrow"] },

  { title: "Train Your Brain", difficulty: "Easy", xp: 400, stat: "willpower", category: "personal",
    description: "Train your brain: envision thoughts as a cold machine; cut off distractions at the source. Practice the liquid-drop concentration technique — single-point focus drills. (Merged: Liquid Drop Focus)",
    repeatable: true, frequency: "daily",
    tags: ["mindset", "focus", "daily"],
    subtasks: ["Visualize thoughts as a machine", "One-point focus drill (liquid drop)", "Catch distractions early", "Cut off one distraction", "Redirect to the task"] },

  // ─── EASY: HEALTH ───
  { title: "Balance: Screen vs Sleep", difficulty: "Easy", xp: 250, stat: "stamina", category: "health",
    description: "Ensure screen time and multitasking never cut into sleep. (Merged: MultiTask => Brain =< Sleep)",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["health", "sleep", "daily"],
    subtasks: ["No screens 30min before bed", "No multitasking into sleep time", "Consistent sleep window"] },

  { title: "Daily Health Essentials", difficulty: "Easy", xp: 400, stat: "stamina", category: "health",
    description: "7+ hrs sleep + 2L water + posture check + hydration + daily energy & mood check — catch issues early. (Merged: Health Check)",
    repeatable: true, frequency: "daily",
    tags: ["health", "daily"],
    subtasks: ["Sleep 7+ hrs", "Drink 2L water", "Posture check", "Hydration", "Energy level check", "Mood & stress check"] },

  { title: "Posture Alignment", difficulty: "Easy", xp: 300, stat: "stamina", category: "health",
    description: "Maintain correct posture throughout the day — posture supports a powerful state of mind.",
    repeatable: true, frequency: "daily",
    tags: ["health", "daily"],
    subtasks: ["Posture check each hour", "Shoulders back, chin level", "Stretch breaks"] },

  // ─── EASY: FASTING ───
  { title: "Fast Monday/Thursday", difficulty: "Easy", xp: 300, stat: "willpower", category: "spiritual",
    description: "Voluntary sunnah fast on Monday or Thursday.",
    repeatable: true, frequency: "weekly",
    tags: ["islamic", "health", "weekly"],
    subtasks: ["Suhoor intention", "Fast sunrise→sunset", "Break with dua"] },

  // ─── EASY: WORK ───
  { title: "Email & Comms", difficulty: "Easy", xp: 150, stat: "discipline", category: "work",
    description: "Clear inbox, respond to messages, stay on top of communication.",
    repeatable: true, frequency: "daily",
    tags: ["work", "daily"],
    subtasks: ["Clear inbox", "Respond to messages", "Inbox zero or near-zero"] },

  // ─── EASY: SOCIAL ───
  { title: "Call/Text Family", difficulty: "Easy", xp: 200, stat: "discipline", category: "social",
    description: "Reach out to a family member — check in, ask how they are, listen.",
    repeatable: true, frequency: "daily",
    tags: ["social", "daily"],
    subtasks: ["Pick one family member", "Reach out — call or text", "Ask how they're really doing"] },

  { title: "Help Someone Today", difficulty: "Easy", xp: 250, stat: "discipline", category: "social",
    description: "Do something kind for someone — even small acts count as sadaqah.",
    repeatable: true, frequency: "daily",
    tags: ["social", "sadaqah", "daily"],
    subtasks: ["Find one person to help", "Act without being asked", "Expect nothing in return"] },

  // ─── EASY: FINANCE ───
  { title: "Track Expenses", difficulty: "Easy", xp: 200, stat: "discipline", category: "finance",
    description: "Log today's expenses — know where your money goes.",
    repeatable: true, frequency: "daily",
    tags: ["finance", "daily"],
    subtasks: ["Log every expense", "Categorize spending", "Spot one leak"] },

  // ─── EASY: CREATIVE ───
  { title: "Write 100 Words", difficulty: "Easy", xp: 200, stat: "intelligence", category: "creative",
    description: "Write anything — journal, story, thoughts, ideas. Momentum over perfection.",
    repeatable: true, frequency: "daily",
    tags: ["creative", "daily"],
    subtasks: ["Write 100 words", "No editing while writing", "Save the draft"] },

  // ─── EASY: FITNESS ───
  { title: "50 Push-ups (Punishment)", difficulty: "Easy", xp: 500, stat: "strength", category: "fitness",
    description: "Do 50 push-ups as penalty for missed goals — don't outrun responsibilities.",
    repeatable: true, frequency: "daily",
    tags: ["exercise", "punishment", "daily"],
    subtasks: ["50 push-ups", "Straight form", "Own the miss — fix the cause"] },

  // ═══════════════════════════════════════════════════════════
  // MEDIUM QUESTS
  // ═══════════════════════════════════════════════════════════

  // ─── MEDIUM: SPIRITUAL ───

  { title: "Nafilah (Optional Salat)", difficulty: "Medium", xp: 700, stat: "willpower", category: "spiritual",
    description: "Follow the day's prescribed Nafilah schedule — day + night rak'ats with their set surahs and post-salat dhikr (from the Book of Nawafil).",
    repeatable: true, frequency: "weekly", isPinned: true,
    tags: ["islamic", "prayer", "weekly"],
    subtasks: ["Check today's schedule", "Pray day Nafilah", "Pray night Nafilah", "Post-Salat dhikr (100× istighfar etc.)"] },

  // ─── MEDIUM: LEARNING / QURAN ───
  { title: "Quran Memorization (Hifz)", difficulty: "Medium", xp: 800, stat: "intelligence", category: "learning",
    description: "Memorize new ayahs and revise previously memorized portions. (Merged: Hifz Revision)",
    repeatable: true, frequency: "daily",
    tags: ["islamic", "quran", "memorization", "daily"],
    subtasks: ["Memorize new ayahs", "Revise memorized portions", "Recite aloud with tajweed"] },

  { title: "Mujawwad Recitation & Teaching", difficulty: "Medium", xp: 700, stat: "discipline", category: "spiritual",
    description: "Recite with Tajweed + revise students' Quran + teach. (Merged: Teach Quran, Revise Students' Quran)",
    repeatable: true, frequency: "daily",
    tags: ["islamic", "quran", "teaching", "daily"],
    subtasks: ["Recite with Tajweed (0.5pg+)", "Revise students' Quran (1pg)", "Teach a student"] },

  { title: "Quran Deep Study", difficulty: "Medium", xp: 700, stat: "intelligence", category: "learning",
    description: "English tafseer + word-for-word + juz scan — understand the Quran deeper. (Merged: English Tafseer (1pg), Juz Daily Scan)",
    repeatable: true, frequency: "daily",
    tags: ["islamic", "quran", "learning", "daily"],
    subtasks: ["Tafseer 1pg (English)", "Word-for-word study", "Juz daily scan", "Reflect on one ayah"] },

  { title: "Word4Word Quran", difficulty: "Medium", xp: 600, stat: "intelligence", category: "learning",
    description: "Study the Quran word-for-word and memorize Quranic vocabulary. (Merged: Quran Word Memorization)",
    repeatable: true, frequency: "daily",
    tags: ["islamic", "quran", "daily"],
    subtasks: ["Study one page word-for-word", "Memorize 5 Quranic words", "Note root/grammar patterns"] },

  // ─── MEDIUM: LEARNING / ARABIC ───
  { title: "Madina Arabic & Grammar", difficulty: "Medium", xp: 600, stat: "intelligence", category: "learning",
    description: "Continue Madina Arabic textbook + study grammar rules. (Merged: Madina Series)",
    repeatable: true, frequency: "daily",
    tags: ["language", "arabic", "daily"],
    subtasks: ["Madina textbook lesson", "Study grammar rules", "Practice sentences"] },

  { title: "Arabic Conversation (Pimsleur)", difficulty: "Medium", xp: 600, stat: "intelligence", category: "learning",
    description: "Pimsleur Arabic — at least 1 line / 10min video.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["language", "arabic", "daily"],
    subtasks: ["Pimsleur — 1 line / 10min", "Repeat aloud", "Use a new phrase in context"] },

  { title: "Nahwu (Arabic Grammar)", difficulty: "Medium", xp: 600, stat: "intelligence", category: "learning",
    description: "Study Arabic grammar (Nahwu) — the engine of Arabic comprehension.",
    repeatable: true, frequency: "daily",
    tags: ["language", "arabic", "grammar", "daily"],
    subtasks: ["Grammar lesson", "Parse one sentence", "Diagram a Quranic phrase"] },

  // ─── MEDIUM: LEARNING / ACADEMIC ───
  { title: "Academic Research & Thesis", difficulty: "Medium", xp: 800, stat: "intelligence", category: "learning",
    description: "Grad school / MPhil / thesis work — at least 1 slide/page. (Merged: Thesis Project)",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["academic", "research", "daily"],
    subtasks: ["Research task", "1 slide/page of thesis", "MPhil proposal work"] },

  { title: "Yoruba Language Practice", difficulty: "Medium", xp: 600, stat: "intelligence", category: "learning",
    description: "Practice Yoruba language skills — vocabulary, phrases, conversation.",
    repeatable: true, frequency: "daily",
    tags: ["language", "yoruba", "daily"],
    subtasks: ["Learn 5 new words", "Use them in a sentence", "Listen/speak practice"] },

  { title: "Seerah & Spiritual Knowledge", difficulty: "Medium", xp: 600, stat: "intelligence", category: "learning",
    description: "Study Seerah / Khushu of the Ruh and Nafs — grow in knowledge of the Deen.",
    repeatable: true, frequency: "daily",
    tags: ["islamic", "learning", "daily"],
    subtasks: ["Seerah reading", "Khushu of Ruh & Nafs study", "Note one lesson to apply"] },

  { title: "Study & Exams", difficulty: "Medium", xp: 600, stat: "intelligence", category: "learning",
    description: "School work — see it as lost knowledge of the cultivation world. Read at least one paragraph for school daily; prepare for exams as if they are tomorrow.",
    repeatable: true, frequency: "daily",
    tags: ["school", "education", "daily"],
    subtasks: ["Read 1 paragraph for school", "Study for exams — as if tomorrow", "Aim to out-prepare your peers"] },

  // ─── MEDIUM: WORK ───
  { title: "AI & Automation Work", difficulty: "Medium", xp: 600, stat: "discipline", category: "work",
    description: "n8n automation flows + agentic AI research. (Merged: n8n Tasks)",
    repeatable: true, frequency: "daily",
    tags: ["work", "ai", "daily"],
    subtasks: ["n8n tasks", "Agentic AI study", "Automation flows"] },

  { title: "CyberExpo Development", difficulty: "Medium", xp: 600, stat: "intelligence", category: "work",
    description: "Work on the CyberExpo project — main development tasks. (Merged: Project Work)",
    repeatable: true, frequency: "daily",
    tags: ["work", "development", "daily"],
    subtasks: ["Feature/build task", "Commit progress", "Note next step"] },

  { title: "Zad University", difficulty: "Medium", xp: 600, stat: "intelligence", category: "work",
    description: "Continue Zad University coursework (game: 2048).",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["work", "education", "daily"],
    subtasks: ["Coursework session", "Review notes", "Advance one topic"] },

  { title: "Extras Research", difficulty: "Medium", xp: 600, stat: "intelligence", category: "work",
    description: "Explore extra research topics (floor796, etc.).",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["research", "daily"],
    subtasks: ["Pick one topic", "Research 30+ min", "Save key findings"] },

  { title: "Mobile App Development", difficulty: "Medium", xp: 800, stat: "intelligence", category: "work",
    description: "Build and ship apps — Learn Kotlin thoroughly, create an app within a week, get copyright-free apps, upload to consoles (Google Play + alternates).",
    repeatable: true, frequency: "daily",
    tags: ["work", "app", "coding", "daily"],
    subtasks: ["Learn Kotlin", "Build an app feature", "Test & fix", "Prepare for store upload"] },

  // ─── MEDIUM: FITNESS ───
  { title: "Daily Workout", difficulty: "Medium", xp: 700, stat: "strength", category: "fitness",
    description: "Complete a full workout session — push-ups, cardio, or strength. (Merged: Workout)",
    repeatable: true, frequency: "daily",
    tags: ["exercise", "daily"],
    subtasks: ["Warm-up", "Main workout", "Cool-down"] },

  // ─── MEDIUM: SOCIAL ───
  { title: "Deep Conversation", difficulty: "Medium", xp: 500, stat: "discipline", category: "social",
    description: "Have a meaningful conversation — ask deeper questions, listen actively.",
    repeatable: true, frequency: "weekly",
    tags: ["social", "weekly"],
    subtasks: ["Start a deep conversation", "Ask one deeper question", "Listen more than you speak"] },

  // ─── MEDIUM: CREATIVE ───
  { title: "Creative Session (30min)", difficulty: "Medium", xp: 500, stat: "intelligence", category: "creative",
    description: "Draw, sketch, write, or create something — 30 min of creative work.",
    repeatable: true, frequency: "daily",
    tags: ["creative", "daily"],
    subtasks: ["30 min creative work", "No self-criticism", "Produce, don't consume"] },

  // ─── MEDIUM: FINANCE ───
  { title: "Money & Finance Research", difficulty: "Medium", xp: 500, stat: "intelligence", category: "finance",
    description: "Research at least 1 money/investment idea.",
    repeatable: true, frequency: "daily",
    tags: ["finance", "learning", "daily"],
    subtasks: ["Research 1 money idea", "Note one action to take", "Wealth answers to action takers"] },

  { title: "Budget Review", difficulty: "Medium", xp: 500, stat: "discipline", category: "finance",
    description: "Review weekly budget — income vs expenses.",
    repeatable: true, frequency: "weekly",
    tags: ["finance", "weekly"],
    subtasks: ["Compare income vs expenses", "Adjust next week's plan", "Save/invest the surplus"] },

  { title: "Affiliate Marketing", difficulty: "Medium", xp: 600, stat: "intelligence", category: "finance",
    description: "Build affiliate income — research best sites (Digistore24, PLR, Quora), create content, share tracked links (Bitly), focus on producing rather than consuming.",
    repeatable: true, frequency: "weekly",
    tags: ["finance", "marketing", "weekly"],
    subtasks: ["Research best affiliate sites", "Create & post content with link", "Track clicks with Bitly", "Produce, don't consume"] },

  // ─── MEDIUM: IBADAH ───
  { title: "Istikhara", difficulty: "Medium", xp: 600, stat: "willpower", category: "spiritual",
    description: "Perform Istikhara for a decision: 2 rak'ats Nafila, then the dua — mention your need at 'hadha (mention your need)'.",
    repeatable: true, frequency: "weekly",
    tags: ["islamic", "prayer", "dua", "weekly"],
    subtasks: ["Pray 2 rak'ats Nafila", "Recite Istikhara dua", "Mention your need ('hadha')", "Trust Allah's choice"] },

  // ═══════════════════════════════════════════════════════════
  // HARD QUESTS
  // ═══════════════════════════════════════════════════════════

  // ─── HARD: FITNESS ───
  { title: "Agility Training", difficulty: "Hard", xp: 1500, stat: "agility", category: "fitness",
    description: "30-min intense agility drill OR 300m run.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["exercise", "daily"],
    subtasks: ["30-min agility drill OR 300m run", "Maximum effort", "Track your time"] },

  { title: "5x25 Push-ups", difficulty: "Hard", xp: 1500, stat: "strength", category: "fitness",
    description: "Complete 5 sets of 25 push-ups throughout the day.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["exercise", "daily"],
    subtasks: ["5×25 push-ups", "Rest 60s between sets", "Full range of motion"] },

  { title: "100 Push-ups", difficulty: "Hard", xp: 1500, stat: "strength", category: "fitness",
    description: "Do 100 push-ups throughout the day.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["exercise", "daily"],
    subtasks: ["100 push-ups total", "Break into sets", "Maintain form"] },

  { title: "300m Run", difficulty: "Hard", xp: 1500, stat: "agility", category: "fitness",
    description: "Do a 300m run for agility and conditioning.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["exercise", "running", "daily"],
    subtasks: ["300m run", "Sprint with good form", "Log your time"] },

  { title: "Monthly Workout Streak", difficulty: "Hard", xp: 3000, stat: "strength", category: "fitness",
    description: "Maintain a rigorous daily workout routine for a full month.",
    repeatable: false, frequency: "once", isPinned: true,
    tags: ["exercise", "milestone"],
    subtasks: ["Workout every day for 30 days", "Log each session", "Never miss twice"] },

  // ─── HARD: WORK ───
  { title: "Deep Work Block (1hr+)", difficulty: "Hard", xp: 1500, stat: "discipline", category: "work",
    description: "Complete a focused deep work session on a priority project.",
    repeatable: true, frequency: "daily",
    tags: ["work", "productivity", "daily"],
    subtasks: ["Pick ONE priority project", "1hr+ focused block", "Phone in another room", "No context switching"] },

  // ─── HARD: LEARNING ───
  { title: "Advanced Tech Practice", difficulty: "Hard", xp: 1500, stat: "intelligence", category: "learning",
    description: "Deep technical work — MERN full stack, quantum code, real mathematics. (Merged: Real Maths, Quantum Code, MERN Full Stack)",
    repeatable: true, frequency: "daily",
    tags: ["tech", "coding", "daily"],
    subtasks: ["MERN practice", "Quantum code", "Real maths", "Deep technical work"] },

  { title: "Salatu Tasbih", difficulty: "Hard", xp: 1500, stat: "willpower", category: "spiritual",
    description: "Salatu Tasbih — 4 rak'ats with 300 tasbihs: 15 after surah, 10 in ruku, 10 standing, 10 in each sujud, 10 between sujuds, 10 in tashahhud.",
    repeatable: true, frequency: "weekly", isPinned: true,
    tags: ["islamic", "prayer", "weekly"],
    subtasks: ["Pray 4 rak'ats", "300 tasbihs total", "Tasbih in every posture", "With full khushu"] },

  { title: "Daily Cultivation (4hrs)", difficulty: "Hard", xp: 2000, stat: "intelligence", category: "learning",
    description: "Spend at least four hours daily on cultivation — learning/practice. The journey awaits.",
    repeatable: true, frequency: "daily", isPinned: true,
    tags: ["cultivation", "learning", "daily"],
    subtasks: ["4 hours of learning/practice", "Split into deep blocks", "Log what was cultivated"] },
];

const GLOBAL_DEFAULT_QUESTS = (() => {
  const uniqueQuests = [];
  const seenKeys = new Set();
  for (const quest of rawDefaultQuests) {
    // Guard against sparse-array holes from partial edits — a missing quest
    // must never crash the app (previously broke GLOBAL_DEFAULT_QUESTS).
    if (!quest || typeof quest.title !== 'string') continue;
    const key = `${quest.title}-${quest.difficulty}-${quest.xp}-${quest.stat}-${quest.category}`;
    if (!seenKeys.has(key)) {
      seenKeys.add(key);
      uniqueQuests.push(quest);
    }
  }
  return uniqueQuests;
})();

let questSuggestionPool = [];
