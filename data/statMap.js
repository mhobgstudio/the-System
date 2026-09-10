const statMap = {
  // Spiritual/Ibadah
  "Sacrifice Your Desires (Eternal)": "willpower",
  "Daily Adhkar & Dua": "willpower",
  "Daily Istighfar & Salawat": "willpower",
  "All Actions as Worship": "willpower",
  "Silence Fast & Self-Observation": "willpower",
  "Night Prayer (Tahajjud)": "willpower",
  "Control Your Nafs": "willpower",
  "Give Sadaqah": "willpower",
  "Sleeping Prayer/Wird": "willpower",
  "Ask Allah in Sujood": "willpower",
  "Nafilah (Optional Salat)": "willpower",
  "Salatu Tasbih": "willpower",
  "Istikhara": "willpower",
  "The 3 Quls (Protection)": "willpower",

  // Learning/Academic/Quran/Arabic
  "Quran Reading (1pg min)": "intelligence",
  "Systematic Review (15min)": "intelligence",
  "99 Names of Allah": "intelligence",
  "Read 10 Pages": "intelligence",
  "Quran Memorization (Hifz)": "intelligence",
  "Mujawwad Recitation & Teaching": "intelligence",
  "Quran Deep Study": "intelligence",
  "Word4Word Quran": "intelligence",
  "Madina Arabic & Grammar": "intelligence",
  "Arabic Conversation (Pimsleur)": "intelligence",
  "Nahwu (Arabic Grammar)": "intelligence",
  "Academic Research & Thesis": "intelligence",
  "Yoruba Language Practice": "intelligence",
  "Seerah & Spiritual Knowledge": "intelligence",
  "Study & Exams": "intelligence",
  "CyberExpo Development": "intelligence",
  "Zad University": "intelligence",
  "Extras Research": "intelligence",
  "Mobile App Development": "intelligence",
  "Money & Finance Research": "intelligence",
  "Advanced Tech Practice": "intelligence",
  "Daily Cultivation (4hrs)": "intelligence",
  "Creative Session (30min)": "intelligence",

  // Fitness
  "50 Push-ups (Punishment)": "strength",
  "Daily Workout": "strength",
  "Agility Training": "agility",
  "5x25 Push-ups": "strength",
  "100 Push-ups": "strength",
  "300m Run": "agility",
  "Monthly Workout Streak": "strength",

  // Other/Disciplined work
  "Journal & Gratitude": "discipline",
  "Digital Detox (1hr)": "willpower",
  "Be an Observer": "willpower",
  "Break the Loop": "willpower",
  "Choose Allah's Pleasure": "willpower",
  "Effectiveness Audit": "discipline",
  "Train Your Brain": "willpower",
  "Balance: Screen vs Sleep": "stamina",
  "Daily Health Essentials": "stamina",
  "Posture Alignment": "stamina",
  "Fast Monday/Thursday": "willpower",
  "Email & Comms": "discipline",
  "Call/Text Family": "discipline",
  "Help Someone Today": "discipline",
  "Track Expenses": "discipline",
  "Write 100 Words": "intelligence",
  "Deep Conversation": "discipline",
  "Budget Review": "discipline",
  "Affiliate Marketing": "discipline",
  "Deep Work Block (1hr+)": "discipline"
};

// Process quests based on statMap
const updateQuests = (quests) => {
  return quests.map(q => {
    if (statMap[q.title]) {
      return { ...q, stat: statMap[q.title] };
    }
    return q;
  });
};
