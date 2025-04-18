const db = new Dexie("SoloLevelingDB");
db.version(3).stores({
  playerStats:
    "++id, level, xp, strength, agility, intelligence, stamina, willpower, discipline, lastActive, consecutiveMissedDays, username",
  quests: "++id, title, difficulty, xp, stat, status",
  savedGames: "++id, timestamp, stats, quests"
});

const motivationQuotes = [
  "Great power comes with great benefits. - Fang Yuan",
  "The strong prey on the weak; this is the law of nature. - Fang Yuan",
  "In the face of benefits, there are no eternal enemies or friends. - Fang Yuan",
  "Knowledge is power, and power is everything! - Leylin Farlier",
  "The strong do as they please, while the weak suffer what they must. - Leylin Farlier",
  "There's no such thing as a free lunch in this world. - Leylin Farlier",
  "Strength is the only truth in this world. - Fang Yuan",
  "Only those who are willing to sacrifice can truly gain power. - Fang Yuan",
  "Weakness is a sin. - Leylin Farlier",
  "Power is a means, not an end. - Leylin Farlier",
  "Survival is for the fittest, everything else is an illusion. - Fang Yuan",
  "Morality is a tool used by the weak to bind the strong. - Fang Yuan",
  "In a world of cultivation, only absolute power can guarantee freedom. - Leylin Farlier",
  "The path to greatness is paved with the bones of those who couldn't walk it. - Fang Yuan",
  "He who controls resources controls destiny. - Leylin Farlier",
  "Only by controlling everything can one be free of fate. - Fang Yuan",
  "Cunning is a weapon more powerful than any blade. - Leylin Farlier",
  "True immortality is achieved through power, not time. - Fang Yuan",
  "The weak fall, the strong rise. Such is the way of the world. - Leylin Farlier",
  "Fear is the currency of control. - Fang Yuan",
  "Trust is a luxury only fools can afford. - Leylin Farlier",
  "Victory goes to the one who dares to take risks. - Fang Yuan",
  "In the end, strength is the only thing that matters. - Fang Yuan",
  "A mind without ambition is a body without a soul. - Leylin Farlier",
  "To rise above all, you must be willing to stand alone. - Fang Yuan",
];

let currentLevel = 0;
let currentXP = 0;
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
const usernameDisplay = document.getElementById("username-display");
const xpRequiredElem = document.getElementById("xp-required");

const motivationQuoteElem = document.getElementById("motivation-quote");

const settingsIcon = document.getElementById("settings-icon");
const settingsModal = document.getElementById("settings-modal");
const modalClose = document.getElementById("modal-close");
const saveBtn = document.getElementById("save-btn");
const restartBtn = document.getElementById("restart-btn");
const resetBtn = document.getElementById("reset-btn");
const editUsernameBtn = document.getElementById("edit-username-btn");
const tourGuideBtn = document.getElementById("tour-guide-btn");

const sounds = {
  complete: new Howl({
    src: ["sounds/complete.mp3"],
  }),
  levelUp: new Howl({
    src: ["sounds/level-up.mp3"],
  }),
};

function calculateXPForNextLevel(level) {
  return Math.floor(10 * Math.pow(1.5, level));
}

async function initializeGame() {
  // Define default quests
  const defaultQuests = [
    { title: "MERN FULL STACK || At least 15mins", difficulty: "Hard", xp: 3, stat: "intelligence" },
    { title: "MPhil Proposal Research work || At least 1 Slide", difficulty: "Hard", xp: 3, stat: "intelligence" },
    { title: "Systematic Review || At least 15 mins", difficulty: "Medium", xp: 2, stat: "intelligence" },
    { title: "Zad University", difficulty: "Medium", xp: 2, stat: "intelligence" },
    { title: "Workout", difficulty: "Medium", xp: 2, stat: "strength" },
    { title: "Health", difficulty: "Easy", xp: 1, stat: "stamina" },
    { title: "Money Research || At least 1 Idea", difficulty: "Medium", xp: 2, stat: "intelligence" },
    { title: "Starting Prayer", difficulty: "Easy", xp: 1, stat: "willpower" },
    { title: "Pimsleur Arabic || At least 1 Line || 10mins/1 vid", difficulty: "Medium", xp: 2, stat: "intelligence" },
    { title: "109 Words", difficulty: "Easy", xp: 1, stat: "discipline" },
    { title: "ARLOOPA", difficulty: "Medium", xp: 2, stat: "intelligence" },
    { title: "Email", difficulty: "Easy", xp: 1, stat: "discipline" },
    { title: "Revise students Quran with AudioBook || At least 1 page", difficulty: "Medium", xp: 2, stat: "discipline" },
  ];

  // Load existing quests from the database
  const existingQuests = await db.quests.toArray();
  const existingTitles = existingQuests.map(quest => quest.title); // Get titles of existing quests

  // Filter out quests that already exist
  const questsToAdd = defaultQuests.filter(quest => !existingTitles.includes(quest.title));

  // Add only new quests to the database
  if (questsToAdd.length > 0) {
    await db.quests.bulkAdd(questsToAdd);
  }

  // Load all quests from the database
  const quests = await db.quests.toArray();
  quests.forEach(quest => {
    const questElement = createQuestElement(quest);
    document.getElementById('quests').appendChild(questElement);
  });

  // Hide the loading spinner after data loads
  document.getElementById("loading-spinner").style.display = "none";
}

// Call the initialize function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  // Ensure initializeGame is called only once
  initializeGame();
});

async function checkDailyReset() {
  const now = new Date();
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
  motivationQuoteElem.textContent = "";
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
  
  questElem.innerHTML = `
  <span class="quest-status status-${quest.status || 'inbox'}"></span>
  <span class="quest-check" onclick="event.stopPropagation(); completeQuest(${quest.xp}, '${quest.stat}', this.parentElement)">
      <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
          <path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z" fill="#4a90e2"></path>
      </svg>
  </span>
  <span class="quest-title">${quest.title}</span>
  <span class="quest-difficulty">${quest.difficulty}</span>
  <span class="quest-xp">${quest.xp} XP</span>
  <span class="quest-stat">${quest.stat}</span>
  ${quest.comment && quest.isPinned ? `<div class="pinned-comment">${quest.comment}</div>` : ''}
`;

  // Add click event listener with proper event handling
  questElem.addEventListener("click", (e) => {
      // Don't trigger edit if already in edit mode or clicking checkbox
      if (e.target.closest('.quest-edit-panel') || e.target.closest('.quest-check')) {
          e.stopPropagation();
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

  return questElem;
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

  return suggestions[stat][difficulty];
}

function editQuest(id, questElem) {
  if (!questElem) {
    console.error("Quest element is null");
    return;
  }

  const titleElem = questElem.querySelector(".quest-title");
  const difficultyElem = questElem.querySelector(".quest-difficulty");
  const xpElem = questElem.querySelector(".quest-xp");
  const statElem = questElem.querySelector(".quest-stat");

  const quest = titleElem ? titleElem.textContent : "New Quest";
  const currentDifficulty = difficultyElem
    ? difficultyElem.textContent
    : "Medium";
  const xp = xpElem ? xpElem.textContent.split(" ")[0] : "1";
  const currentStat = statElem ? statElem.textContent : "strength";
  const currentStatus =
    questElem.querySelector(".quest-status").classList[1] || "inbox";

  const stats = [
    "strength",
    "agility",
    "intelligence",
    "stamina",
    "willpower",
    "discipline",
  ];
  const statButtons = stats
    .map(
      (stat) =>
        `<button class="stat-tag ${
          stat === currentStat ? "selected" : ""
        }" data-stat="${stat}">${stat}</button>`
    )
    .join("");

  const difficulties = ["Easy", "Medium", "Hard"];
  const difficultyButtons = difficulties
    .map(
      (diff) =>
        `<button class="difficulty-tag ${
          diff === currentDifficulty ? "selected" : ""
        }" data-difficulty="${diff}">${diff}</button>`
    )
    .join("");

  questElem.innerHTML = `
  <input type="text" class="quest-input" value="${quest}" placeholder="Quest title">
  <div class="difficulty-tags">
    ${difficultyButtons}
  </div>
  <input type="number" class="quest-input" value="${xp}" placeholder="XP">
  <div class="stat-tags">
    ${statButtons}
  </div>
  <div class="status-tags">
    ${statusButtons}
  </div>
  <div id="quest-suggestions"></div>
  <button class="save-quest" onclick="saveQuest(${id})">Save</button>
  <button class="close-quest" onclick="closeQuest()">Close</button>

`;

  const suggestionDisplay = questElem.querySelector("#quest-suggestions");
  if (suggestionDisplay) {
    updateSuggestions(currentStat, currentDifficulty);
  } else {
    alert(
      "Unable to find suggestions display. Please try refreshing the page."
    );
  }

  questElem.addEventListener("click", function (event) {
    if (event.target.classList.contains("stat-tag")) {
      questElem
        .querySelectorAll(".stat-tag")
        .forEach((btn) => btn.classList.remove("selected"));
      event.target.classList.add("selected");
      updateSuggestions(
        event.target.dataset.stat,
        questElem.querySelector(".difficulty-tag.selected").dataset
          .difficulty
      );
    } else if (event.target.classList.contains("difficulty-tag")) {
      questElem
        .querySelectorAll(".difficulty-tag")
        .forEach((btn) => btn.classList.remove("selected"));
      event.target.classList.add("selected");
      updateSuggestions(
        questElem.querySelector(".stat-tag.selected").dataset.stat,
        event.target.dataset.difficulty
      );
    }
  });

  questElem.querySelectorAll(".status-tag").forEach((button) => {
    button.addEventListener("click", function () {
      questElem
        .querySelectorAll(".status-tag")
        .forEach((btn) => btn.classList.remove("selected"));
      this.classList.add("selected");
    });
  });

  const initialStat =
    questElem.querySelector(".stat-tag.selected").dataset.stat;
  updateSuggestions(initialStat);
}

function updateSuggestions(stat, difficulty) {
  const suggestions = generateSuggestedQuests(stat, difficulty);
  const suggestionDisplay = document.getElementById("quest-suggestions");
  if (suggestionDisplay) {
    suggestionDisplay.innerHTML =
      "<strong>Suggested Quests:</strong><ul>" +
      suggestions.map((s) => `<li>${s}</li>`).join("") +
      "</ul>";
  }
}

async function saveQuest(id) {
  let questElem;
  if (id === "new") {
    questElem = questsElem.lastElementChild;
  } else {
    questElem = Array.from(questsElem.children).find((elem) => {
      const saveButton = elem.querySelector(".save-quest");
      return (
        saveButton &&
        saveButton.getAttribute("onclick") === `saveQuest(${id})`
      );
    });
  }

  if (!questElem) {
    console.error("Quest element not found");
    return;
  }

  const titleInput = questElem.querySelector('input[type="text"]');
  const xpInput = questElem.querySelector('input[type="number"]');
  const selectedStat = questElem.querySelector(".stat-tag.selected");
  const selectedDifficulty = questElem.querySelector(
    ".difficulty-tag.selected"
  );
  const selectedStatus = questElem.querySelector(".status-tag.selected");

  if (!titleInput || !xpInput || !selectedStat || !selectedDifficulty) {
    console.error("Required elements not found");
    return;
  }

  const updatedQuest = {
    title: titleInput.value,
    difficulty: selectedDifficulty.dataset.difficulty,
    xp: parseInt(xpInput.value) || 0,
    stat: selectedStat.dataset.stat,
    status: selectedStatus ? selectedStatus.dataset.status : "inbox",
  };

  try {
    if (id === "new") {
      const newId = await db.quests.add(updatedQuest);
      updatedQuest.id = newId;
      const newQuestElem = createQuestElement(updatedQuest);
      questsElem.insertBefore(newQuestElem, questsElem.lastElementChild);
      questsElem.removeChild(questElem);
    } else {
      updatedQuest.id = id;
      await db.quests.put(updatedQuest);
      const updatedQuestElem = createQuestElement(updatedQuest);
      questElem.parentNode.replaceChild(updatedQuestElem, questElem);
    }

    showNotification("Quest saved successfully");
  } catch (error) {
    console.error("Error saving quest:", error);
    showNotification("Failed to save quest. Please try again.");
  }
}

function closeQuestCreation(questElem) {
if (questElem) {
questElem.remove(); // Remove the quest creation element
}
}


async function completeQuest(xp, stat, questElem) {
  currentXP += xp;
  updateXP();
  await increaseStat(stat);
  sounds.complete.play();

  const playerStats = await db.playerStats.toArray();
  const stats = playerStats[0];
  stats.consecutiveMissedDays = 0;
  stats.lastActive = new Date().toISOString().split("T")[0];
  stats.xp = currentXP;
  await db.playerStats.put(stats);

  const randomQuote =
    motivationQuotes[Math.floor(Math.random() * motivationQuotes.length)];
  motivationQuoteElem.textContent = randomQuote;

  questElem.style.transition = "opacity 0.5s, transform 0.5s";
  questElem.style.opacity = "0";
  questElem.style.transform = "scale(0.8)";
  setTimeout(() => {
    questElem.remove();
  }, 500);
}

async function increaseStat(stat) {
  const playerStats = await db.playerStats.toArray();
  const stats = playerStats[0];
  stats[stat]++;
  await db.playerStats.put(stats);
  statsElems[stat].textContent = stats[stat];
}

function updateXP() {
  const xpForNextLevel = calculateXPForNextLevel(currentLevel);
  xpElem.textContent = `${currentXP}`;
  xpRequiredElem.textContent = xpForNextLevel;
  xpProgressElem.style.width = `${(currentXP / xpForNextLevel) * 100}%`;

  if (currentXP >= xpForNextLevel) {
    levelUpBtn.style.display = "inline-block";
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

        // Play level-up sound
        sounds.levelUp.play();

        // Notify the user
        showNotification("Congratulations! You've leveled up!");
    } else {
        showNotification("Not enough XP to level up.");
    }
});

async function checkDailyActivity() {
  const playerStats = await db.playerStats.toArray();
  const stats = playerStats[0];
  const today = new Date().toISOString().split("T")[0];

  if (stats.lastActive !== today) {
    stats.consecutiveMissedDays++;
    stats.willpower = Math.max(0, stats.willpower - 1);

    if (stats.consecutiveMissedDays >= 3) {
      enterPenaltyZone();
    }

    stats.lastActive = today;
    await db.playerStats.put(stats);
    updateStats();
  }
}

function updateStats() {
  const stats = [
    "strength",
    "agility",
    "intelligence",
    "stamina",
    "willpower",
    "discipline",
  ];
  stats.forEach(async (stat) => {
    const value = await db.playerStats.get(1);
    statsElems[stat].textContent = value[stat];
  });
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

function showNotification(message) {
  const notification = document.createElement("div");
  notification.className = "notification";
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

settingsIcon.addEventListener("click", () => {
  settingsModal.style.display = "block";
});

modalClose.addEventListener("click", () => {
  settingsModal.style.display = "none";
});

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
  const confirmRestart = confirm("Are you sure you want to restart the game? This will reset all progress.");
  if (confirmRestart) {
    // Define default quests
    const defaultQuests = [
      { title: "MERN FULL STACK || At least 15mins", difficulty: "Hard", xp: 3, stat: "intelligence" },
      { title: "MPhil Proposal Research work || At least 1 Slide", difficulty: "Hard", xp: 3, stat: "intelligence" },
      { title: "Systematic Review || At least 15 mins", difficulty: "Medium", xp: 2, stat: "intelligence" },
      { title: "Zad University", difficulty: "Medium", xp: 2, stat: "intelligence" },
      { title: "Workout", difficulty: "Medium", xp: 2, stat: "strength" },
      { title: "Health", difficulty: "Easy", xp: 1, stat: "stamina" },
      { title: "Money Research || At least 1 Idea", difficulty: "Medium", xp: 2, stat: "intelligence" },
      { title: "Starting Prayer", difficulty: "Easy", xp: 1, stat: "willpower" },
      { title: "Pimsleur Arabic || At least 1 Line || 10mins/1 vid", difficulty: "Medium", xp: 2, stat: "intelligence" },
      { title: "109 Words", difficulty: "Easy", xp: 1, stat: "discipline" },
      { title: "ARLOOPA", difficulty: "Medium", xp: 2, stat: "intelligence" },
      { title: "Email", difficulty: "Easy", xp: 1, stat: "discipline" },
      { title: "Revise students Quran with AudioBook || At least 1 page", difficulty: "Medium", xp: 2, stat: "discipline" },
    ];

    // Load existing quests from the database
    const existingQuests = await db.quests.toArray();
    const existingTitles = existingQuests.map(quest => quest.title); // Get titles of existing quests

    // Filter out quests that already exist
    const questsToAdd = defaultQuests.filter(quest => !existingTitles.includes(quest.title));

    // Add only new quests to the database
    if (questsToAdd.length > 0) {
      await db.quests.bulkAdd(questsToAdd);
    }

    // Clear the quests display in the UI
    document.getElementById('quests').innerHTML = '';

    // Load all quests from the database and display them
    const quests = await db.quests.toArray();
    quests.forEach(quest => {
      const questElement = createQuestElement(quest);
      document.getElementById('quests').appendChild(questElement);
    });

    showNotification("Game has been restarted! Non-existing quests have been added."); // Notify the user
  }
});

// Reset Button
resetBtn.addEventListener("click", async () => {
  if (
    confirm(
      "Are you sure you want to reset the game? All progress will be lost."
    )
  ) {
    await resetGame();
    showNotification("Game reset successfully");
  }
});

// Save Game function to serialize current quests and stats
async function saveGame() {
  const timestamp = new Date().toISOString();
  const playerStats = await db.playerStats.toArray();
  const quests = await db.quests.toArray();

  const snapshot = {
    timestamp,
    stats: playerStats[0],
    quests: quests
  };

  await db.savedGames.add(snapshot);
  showNotification(`Game saved successfully at ${new Date(timestamp).toLocaleString()}`);
}

// Function to refresh data
async function refreshData() {
  questsElem.innerHTML = ""; // Clear current quests
  const quests = await db.quests.toArray(); // Fetch updated quests
  quests.forEach((quest) => {
    const newQuestElem = createQuestElement(quest); // Create the quest element
    questsElem.appendChild(newQuestElem); // Add it to the UI
  });

  const playerStats = await db.playerStats.toArray(); // Fetch updated player stats
  updateStatsDisplay(playerStats[0]); // Assuming you have a function to update UI with player stats
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
  });

  // Optionally clear the displayed quests from the UI
  questsElem.innerHTML = ""; // Clear current quests
}

window.addEventListener("restart", checkDailyActivity);

tourGuideBtn.addEventListener("click", startTourGuide);

function startTourGuide() {
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
    {
      element: ".settings-icon",
      title: "Settings",
      content:
        "Access game settings, save/restart your progress, or reset the game.",
      position: "left",
    },
  ];

  let currentStep = 0;

  function showStep(step) {
    const element = document.querySelector(step.element);
    element.classList.add("tour-highlight");

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

    if (prevBtn) prevBtn.addEventListener("click", previousStep);
    if (nextBtn) nextBtn.addEventListener("click", nextStep);
    if (endBtn) endBtn.addEventListener("click", endTour);
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

    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
  }

  function nextStep() {
    clearStep();
    currentStep++;
    if (currentStep < steps.length) {
      showStep(steps[currentStep]);
    } else {
      endTour();
    }
  }

  function previousStep() {
    clearStep();
    currentStep--;
    if (currentStep >= 0) {
      showStep(steps[currentStep]);
    } else {
      currentStep = 0;
    }
  }

  function clearStep() {
    const highlightedElement = document.querySelector(".tour-highlight");
    if (highlightedElement) {
      highlightedElement.classList.remove("tour-highlight");
    }

    const tooltip = document.querySelector(".tour-tooltip");
    if (tooltip) {
      tooltip.remove();
    }
  }

  function endTour() {
    clearStep();
    currentStep = 0;
  }

  showStep(steps[currentStep]);
}

function openQuestEditPanel(quest) {
  // Create a new quest element
  const questElem = document.createElement("div");
  questElem.className = "quest";
  questsElem.appendChild(questElem);

  // Store original content and ensure single edit panel
  const existingPanel = document.querySelector('.quest-edit-panel');
  if (existingPanel && existingPanel !== questElem) {
      existingPanel.className = 'quest';
      existingPanel.innerHTML = existingPanel.dataset.originalContent;
  }

  questElem.dataset.originalContent = questElem.innerHTML;
  questElem.dataset.questId = quest.id;
  questElem.className = 'quest quest-edit-panel';

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
      if (selectedDifficulty === 'Easy') xpInput.value = 1;
      if (selectedDifficulty === 'Medium') xpInput.value = 2;
      if (selectedDifficulty === 'Hard') xpInput.value = 3;
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
    status: 'inbox'
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

// Add these styles
const styles = `
.quest-edit-panel {
    background-color: rgba(30, 30, 40, 0.95);
    border-radius: 10px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.3);
}

.suggested-quest-item {
    padding: 0.8rem;
    margin: 0.5rem 0;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s ease;
    background-color: rgba(40, 40, 50, 0.7);
    border: 1px solid rgba(78, 205, 196, 0.3);
}

.suggested-quest-item:hover {
    background-color: rgba(78, 205, 196, 0.2);
    border-color: rgba(78, 205, 196, 0.8);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(78, 205, 196, 0.2);
}

.xp-input {
    width: 80px !important;
    text-align: center;
}

.action-buttons {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
}

.action-buttons button {
    flex: 1;
    padding: 0.8rem;
}

.error-notification {
    background-color: rgba(255, 87, 87, 0.9);
}
`;

const loadBtn = document.getElementById("load-btn");
const loadModal = document.getElementById("load-modal");
const loadModalClose = document.getElementById("load-modal-close");
const savedGamesList = document.getElementById("saved-games-list");

// Show Load Modal
loadBtn.addEventListener("click", async () => {
  loadModal.style.display = "block";
  await displaySavedGames();
});

// Close Load Modal
loadModalClose.addEventListener("click", () => {
  loadModal.style.display = "none";
});

// Display Saved Games List
async function displaySavedGames() {
  savedGamesList.innerHTML = ""; // Clear existing list
  const savedGames = await db.playerStats.toArray();

  savedGames.forEach((game, index) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Save ${index + 1} - Level ${game.level}`;
    listItem.className = "save-item";
    listItem.addEventListener("click", () => loadGame(game.id));
    savedGamesList.appendChild(listItem);
  });
}

// Load Selected Game
async function loadGame(id) {
  const savedGame = await db.playerStats.get(id);

  // Restore game stats from the selected saved game
  currentLevel = savedGame.level;
  currentXP = savedGame.xp;

  Object.keys(statsElems).forEach(stat => {
    statsElems[stat].textContent = savedGame[stat];
  });

  levelElem.textContent = currentLevel;
  xpRequiredElem.textContent = calculateXPForNextLevel(currentLevel);
  updateXP();
  usernameDisplay.textContent = savedGame.username || "Anonymous";

  // Close Load Modal after loading game
  loadModal.style.display = "none";
  showNotification("Game loaded successfully!");
}

// Modified Save Game function to store snapshots with timestamps
async function saveGame() {
  const timestamp = new Date().toISOString();
  const playerStats = await db.playerStats.toArray();
  const quests = await db.quests.toArray();

  const snapshot = {
    timestamp,
    stats: playerStats[0],
    quests: quests
  };

  await db.savedGames.add(snapshot);
  showNotification(`Game saved successfully at ${new Date(timestamp).toLocaleString()}`);
}

// Show Load Modal
loadBtn.addEventListener("click", async () => {
  loadModal.style.display = "block";
  await displaySavedGames(); // Display list of saved games with timestamps
});

// Close Load Modal
loadModalClose.addEventListener("click", () => {
  loadModal.style.display = "none";
});

// Display Saved Games List with timestamps
async function displaySavedGames() {
  savedGamesList.innerHTML = ""; // Clear existing list
  const savedGames = await db.savedGames.toArray(); // Get saved game snapshots

  savedGames.forEach((game) => {
    const listItem = document.createElement("li");
    listItem.textContent = `Saved at: ${game.timestamp}`;
    listItem.className = "save-item";
    listItem.addEventListener("click", () => loadGame(game.timestamp)); // Pass timestamp as identifier
    savedGamesList.appendChild(listItem);
  });
}

// Load Selected Game based on timestamp
async function loadGame(timestamp) {
  try {
    const savedGame = await db.savedGames.where("timestamp").equals(timestamp).first();
    
    if (!savedGame) {
      throw new Error("Save not found");
    }

    // Restore player stats
    const stats = savedGame.stats;
    currentLevel = stats.level;
    currentXP = stats.xp;
    
    // Update UI
    Object.keys(statsElems).forEach(stat => {
      statsElems[stat].textContent = stats[stat];
    });
    
    levelElem.textContent = currentLevel;
    xpRequiredElem.textContent = calculateXPForNextLevel(currentLevel);
    updateXP();
    usernameDisplay.textContent = stats.username || "Anonymous";

    // Restore quests
    questsElem.innerHTML = "";
    savedGame.quests.forEach((quest) => {
      const questElem = createQuestElement(quest);
      questsElem.appendChild(questElem);
    });

    loadModal.style.display = "none";
    showNotification(`Game loaded from ${timestamp}`);
    
  } catch (error) {
    console.error("Load game error:", error);
    showNotification("Failed to load game: " + error.message, "error");
  }
}

document.addEventListener('DOMContentLoaded', () => {
    // Save button functionality
    document.getElementById('save-btn').addEventListener('click', async () => {
        try {
            await saveGame();
            showNotification('Game saved successfully!');
        } catch (error) {
            console.error('Error saving game:', error);
            showNotification('Failed to save game', 'error');
        }
    });

    // Settings modal functionality
    document.getElementById('settings-icon').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'block';
    });

    document.getElementById('modal-close').addEventListener('click', () => {
        document.getElementById('settings-modal').style.display = 'none';
    });
});

// Add this function to create and display the spider chart
function drawSpiderChart() {
    const stats = ['strength', 'agility', 'intelligence', 'stamina', 'willpower', 'discipline'];
    const maxStatValue = Math.max(...stats.map(stat => parseInt(statsElems[stat].textContent))); // Calculate the maximum value from the current stats
    const angleStep = (Math.PI * 2) / stats.length;
    const values = stats.map(stat => parseInt(statsElems[stat].textContent));

    const chartContainer = document.querySelector('.stats-chart');
    const connectionContainer = document.querySelector('.stats-connection');
    chartContainer.innerHTML = ''; // Clear previous chart
    connectionContainer.style.clipPath = 'polygon('; // Start defining the polygon

    // Adjust the scaling factor to reduce the overall size of the chart
    const scalingFactor = 0.5; // Reduced from 0.8 to 0.5 for a smaller chart

    // Normalize values to ensure they stay within the axis limits
    const normalizedValues = values.map(value => {
        const clampedValue = Math.min(value, maxStatValue);
        return (clampedValue / maxStatValue) * 100 * scalingFactor; // Scale to 0-100
    });

    // Create axes and values
    stats.forEach((stat, index) => {
        const angle = angleStep * index;
        const radius = normalizedValues[index]; // Use normalized values

        // Create axis
        const axis = document.createElement('div');
        axis.className = 'stats-axis';
        axis.style.transform = `rotate(${angle}rad)`;
        chartContainer.appendChild(axis);

        // Create value point
        const valuePoint = document.createElement('div');
        valuePoint.className = 'stats-value';
        valuePoint.style.left = `${50 + radius * Math.cos(angle)}%`;
        valuePoint.style.top = `${50 - radius * Math.sin(angle)}%`;
        chartContainer.appendChild(valuePoint);

        // Add to connection polygon
        connectionContainer.style.clipPath += `${50 + radius * Math.cos(angle)}% ${50 - radius * Math.sin(angle)}%, `;

        // Create and position label
        const label = document.createElement('div');
        label.className = 'stats-label';
        label.textContent = stat.charAt(0).toUpperCase() + stat.slice(1);
        label.style.left = `${50 + (radius + 5) * Math.cos(angle)}%`; // Adjusted offset for better visibility
        label.style.top = `${50 - (radius + 5) * Math.sin(angle)}%`; // Adjusted offset for better visibility
        chartContainer.appendChild(label);
    });

    // Close the polygon definition
    connectionContainer.style.clipPath = connectionContainer.style.clipPath.slice(0, -2) + ')'; // Remove last comma and space
}

// Call drawSpiderChart whenever stats are updated
async function updateStats() {
    const stats = [
        "strength",
        "agility",
        "intelligence",
        "stamina",
        "willpower",
        "discipline",
    ];
    for (const stat of stats) {
        const value = await db.playerStats.get(1);
        statsElems[stat].textContent = value[stat];
    }
    drawSpiderChart(); // Update the spider chart
}

// Add this code to show the spider chart modal
const spiderChartModal = document.getElementById("spider-chart-modal");
const spiderChartModalClose = document.getElementById("spider-chart-modal-close");

// Function to open the spider chart modal
function openSpiderChart() {
    spiderChartModal.style.display = "flex"; // Show the modal
    drawSpiderChart(); // Draw the spider chart
}

// Function to close the spider chart modal
function closeSpiderChart() {
    spiderChartModal.style.display = "none"; // Hide the modal
}

// Add event listeners
document.querySelector('.stats').addEventListener('click', openSpiderChart);
spiderChartModalClose.addEventListener('click', closeSpiderChart);

// Close the modal when clicking outside of the modal content
spiderChartModal.addEventListener('click', (event) => {
    if (event.target === spiderChartModal) {
        closeSpiderChart();
    }
});
