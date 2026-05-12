# Website Button Analysis - My System1
## Detailed Instruction Manual for Implementing Similar Functionality

This document provides comprehensive implementation details for every button and interactive element in the Solo Leveling-themed website. Use this as a reference to implement the same features in a similar website.

---

## Table of Contents
1. [Database Setup](#1-database-setup)
2. [Header / Navigation](#2-header--navigation)
3. [View Toggle Buttons](#3-view-toggle-buttons)
4. [Quest Control Section](#4-quest-control-section)
5. [Quote Section Buttons](#5-quote-section-buttons)
6. [Quest Buttons](#6-quest-buttons)
7. [Pomodoro Timer Section](#7-pomodoro-timer-section)
8. [Achievements Section](#8-achievements-section)
9. [Settings Modal Buttons](#9-settings-modal-buttons)
10. [Spider Chart Modal](#10-spider-chart-modal)
11. [Core JavaScript Functions](#11-core-javascript-functions)
12. [CSS Theming System](#12-css-theming-system)

---

## 1. Database Setup

### Dexie.js Database Schema
```javascript
// Define database with Dexie.js
const db = new Dexie("SoloLevelingDB");
db.version(8).stores({
  playerStats: "++id, level, xp, strength, agility, intelligence, stamina, willpower, discipline, lastActive, consecutiveDays, currentStreak, longestStreak, username, lastStreakCheck",
  quests: "++id, title, difficulty, xp, stat, status, category, createdAt, completedAt, dueDate",
  savedGames: "++id, timestamp, stats, quests",
  achievements: "++id, title, description, unlocked, unlockedAt, icon, category",
  favoriteQuotes: "++id, quoteId, dateAdded",
  statHistory: "++id, date, strength, agility, intelligence, stamina, willpower, discipline",
  deletedQuests: '++id,compositeKey'
});
```

### Required CDN Dependencies
```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/howler/2.2.3/howler.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/dexie/3.2.2/dexie.min.js"></script>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
```

---

## 2. Header / Navigation

### 2.1 Theme Toggle Button

**HTML Structure:**
```html
<div class="theme-toggle">
  <button id="theme-button">
    <i class="fas fa-moon"></i>
  </button>
</div>
```

**CSS Styling:**
```css
.theme-toggle {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 1000;
}

.theme-toggle button {
  background-color: transparent;
  border: none;
  color: var(--accent-primary);
  font-size: 1.5rem;
  cursor: pointer;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.3s ease, transform 0.3s ease;
  backdrop-filter: blur(5px);
  background-color: rgba(30, 30, 40, 0.5);
}

.theme-dark .theme-toggle button i { color: #f1c40f; }
.theme-light .theme-toggle button i { color: #3498db; }
```

**JavaScript Implementation:**
```javascript
function initializeTheme() {
  const themeButton = document.getElementById('theme-button');
  const body = document.body;
  
  // Load saved theme preference
  const savedTheme = localStorage.getItem('theme') || 'dark';
  body.classList.add(`theme-${savedTheme}`);
  updateThemeIcon(savedTheme);
  
  themeButton.addEventListener('click', () => {
    const isDark = body.classList.contains('theme-dark');
    body.classList.remove('theme-dark', 'theme-light');
    body.classList.add(isDark ? 'theme-light' : 'theme-dark');
    localStorage.setItem('theme', isDark ? 'light' : 'dark');
    updateThemeIcon(isDark ? 'light' : 'dark');
  });
}

function updateThemeIcon(theme) {
  const icon = document.querySelector('#theme-button i');
  icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun';
}
```

**Theme CSS Variables:**
```css
/* Dark Theme (Default) */
:root {
  --bg-main: #0a0a0a;
  --bg-card: rgba(30, 30, 40, 0.9);
  --bg-card-dark: rgba(20, 20, 30, 0.7);
  --text-primary: #e0e0e0;
  --text-secondary: #aaaaaa;
  --accent-primary: #4a90e2;
  --accent-secondary: #4ecdc4;
}

/* Light Theme */
.theme-light {
  --bg-main: #f0f0f5;
  --bg-card: rgba(255, 255, 255, 0.9);
  --text-primary: #222222;
  --text-secondary: #555555;
  --accent-primary: #2970c3;
}
```

---

## 3. View Toggle Buttons

**HTML Structure:**
```html
<div class="view-toggle-container">
  <div class="view-toggle">
    <button class="view-btn active" data-view="dashboard">
      <i class="fas fa-tachometer-alt"></i> Dashboard
    </button>
    <button class="view-btn" data-view="detailed">
      <i class="fas fa-chart-line"></i> Detailed
    </button>
    <button class="view-btn" data-view="compact">
      <i class="fas fa-compress-alt"></i> Compact
    </button>
  </div>
</div>
```

**JavaScript Implementation:**
```javascript
function initializeViewToggle() {
  const viewButtons = document.querySelectorAll('.view-btn');
  const container = document.querySelector('.container');
  
  viewButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Remove active class from all buttons
      viewButtons.forEach(b => b.classList.remove('active'));
      // Add active class to clicked button
      btn.classList.add('active');
      
      // Update container class for view layout
      container.classList.remove('dashboard-view', 'detailed-view', 'compact-view');
      container.classList.add(`${btn.dataset.view}-view`);
      
      // Save preference
      localStorage.setItem('preferredView', btn.dataset.view);
    });
  });
  
  // Load saved preference
  const savedView = localStorage.getItem('preferredView') || 'dashboard';
  document.querySelector(`[data-view="${savedView}"]`)?.click();
}
```

**CSS for Different Views:**
```css
/* Dashboard View (Default) */
.dashboard-view .stats-grid { grid-template-columns: repeat(3, 1fr); }
.dashboard-view .quest { padding: 1.2rem; }

/* Detailed View */
.detailed-view .stats-grid { grid-template-columns: repeat(2, 1fr); }
.detailed-view .quest { padding: 1.5rem; }

/* Compact View */
.compact-view .stats-grid { grid-template-columns: repeat(6, 1fr); }
.compact-view .quest { padding: 0.5rem; font-size: 0.9rem; }
```

---

## 4. Quest Control Section

### 4.1 Search Controls

**HTML Structure:**
```html
<div class="search-container">
  <div class="search-wrapper">
    <i class="fas fa-search search-icon"></i>
    <input type="text" id="quest-search" placeholder="Search quests..." class="quest-input">
    <button id="clear-search-btn" class="clear-search-btn" style="display: none;">
      <i class="fas fa-times"></i>
    </button>
    <button id="search-btn" class="search-btn">
      <i class="fas fa-search"></i>
    </button>
  </div>
</div>
```

**JavaScript Implementation:**
```javascript
// Filter and Search Function
function filterQuests() {
  const query = (questSearchInput?.value || '').toLowerCase().trim();
  const category = categoryFilter?.value || 'all';
  const difficulty = difficultyFilter?.value || 'all';
  const stat = statFilter?.value || 'all';
  
  const questNodes = Array.from(questsElem.children || []);
  let visible = questNodes.filter(node => {
    if (!node.dataset) return false;
    const title = (node.dataset.title || '').toLowerCase();
    if (query && !title.includes(query)) return false;
    if (category !== 'all' && node.dataset.category !== category) return false;
    if (difficulty !== 'all' && node.dataset.difficulty !== difficulty) return false;
    if (stat !== 'all' && node.dataset.stat !== stat) return false;
    return true;
  });
  
  // Hide/show quests
  questNodes.forEach(n => n.style.display = visible.includes(n) ? '' : 'none');
  
  // Sort if needed
  if (currentSortBy && visible.length > 1) {
    visible.sort((a, b) => {
      if (currentSortBy === 'title') return (a.dataset.title||'').localeCompare(b.dataset.title||'');
      if (currentSortBy === 'difficulty') return (a.dataset.difficulty||'').localeCompare(b.dataset.difficulty||'');
      if (currentSortBy === 'xp') return Number(b.dataset.xp||0) - Number(a.dataset.xp||0);
      if (currentSortBy === 'category') return (a.dataset.category||'').localeCompare(b.dataset.category||'');
      if (currentSortBy === 'stat') return (a.dataset.stat||'').localeCompare(b.dataset.stat||'');
      return 0;
    });
    visible.forEach(n => questsElem.appendChild(n));
  }
  
  updateQuestCount();
}

function initializeQuestFilters() {
  if (searchBtn) searchBtn.addEventListener('click', filterQuests);
  if (questSearchInput) {
    questSearchInput.addEventListener('input', () => {
      filterQuests();
      const clearBtn = document.getElementById('clear-search-btn');
      if (clearBtn) clearBtn.style.display = questSearchInput.value ? 'block' : 'none';
    });
  }
  if (categoryFilter) categoryFilter.addEventListener('change', filterQuests);
  if (difficultyFilter) difficultyFilter.addEventListener('change', filterQuests);
  if (statFilter) statFilter.addEventListener('change', filterQuests);
  
  // Clear search button
  const clearSearchBtn = document.getElementById('clear-search-btn');
  if (clearSearchBtn && questSearchInput) {
    clearSearchBtn.addEventListener('click', () => {
      questSearchInput.value = '';
      clearSearchBtn.style.display = 'none';
      filterQuests();
    });
  }
  
  // Sort functionality
  if (sortBtn && sortOptions) {
    sortBtn.addEventListener('click', () => sortOptions.classList.toggle('show'));
    sortOptions.querySelectorAll('.sort-option').forEach(opt => {
      opt.addEventListener('click', () => {
        currentSortBy = opt.dataset.sort || 'title';
        sortOptions.classList.remove('show');
        filterQuests();
      });
    });
  }
}
```

### 4.2 Filter Dropdowns

**HTML Structure:**
```html
<div class="filter-container">
  <div class="filter-group">
    <label>Category:</label>
    <select id="category-filter" class="quest-input">
      <option value="all">All Categories</option>
      <option value="work">Work</option>
      <option value="health">Health</option>
      <option value="learning">Learning</option>
      <option value="personal">Personal</option>
      <option value="cultivation">Cultivation</option>
    </select>
  </div>
  
  <div class="filter-group">
    <label>Difficulty:</label>
    <select id="difficulty-filter" class="quest-input">
      <option value="all">All Difficulties</option>
      <option value="Easy">Easy</option>
      <option value="Medium">Medium</option>
      <option value="Hard">Hard</option>
    </select>
  </div>
  
  <div class="filter-group">
    <label>Stat:</label>
    <select id="stat-filter" class="quest-input">
      <option value="all">All Stats</option>
      <option value="strength">Strength</option>
      <option value="agility">Agility</option>
      <option value="intelligence">Intelligence</option>
      <option value="stamina">Stamina</option>
      <option value="willpower">Willpower</option>
      <option value="discipline">Discipline</option>
    </select>
  </div>
  
  <div class="filter-actions">
    <button id="sort-btn" class="sort-btn">
      <i class="fas fa-sort"></i> Sort
    </button>
    <div id="sort-options" class="sort-options">
      <div data-sort="title" class="sort-option"><i class="fas fa-font"></i> Title</div>
      <div data-sort="difficulty" class="sort-option"><i class="fas fa-star"></i> Difficulty</div>
      <div data-sort="xp" class="sort-option"><i class="fas fa-bolt"></i> XP</div>
      <div data-sort="category" class="sort-option"><i class="fas fa-tags"></i> Category</div>
      <div data-sort="stat" class="sort-option"><i class="fas fa-flask"></i> Stat</div>
    </div>
  </div>
</div>
```

---

## 5. Quote Section Buttons

### 5.1 Quote System Data Structure
```javascript
const motivationalQuotesSystem = {
  categories: {
    POWER: "power",
    WISDOM: "wisdom",
    DISCIPLINE: "discipline",
    GROWTH: "growth",
    PERSEVERANCE: "perseverance",
    FAITH: "faith"
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
    // ... more quotes
  ],
  
  getRandomQuote: function() {
    return this.quotes[Math.floor(Math.random() * this.quotes.length)];
  },
  
  getQuoteByCategory: function(category) {
    const categoryQuotes = this.quotes.filter(quote => quote.category === category);
    return categoryQuotes.length > 0 
      ? categoryQuotes[Math.floor(Math.random() * categoryQuotes.length)]
      : this.getRandomQuote();
  },
  
  getFavoriteQuotes: function() {
    return db.favoriteQuotes.toArray()
      .then(favorites => this.quotes.filter(quote => 
        favorites.some(fav => fav.quoteId === quote.id)
      ));
  },
  
  toggleFavorite: function(quoteId) {
    return db.favoriteQuotes.where('quoteId').equals(quoteId).first()
      .then(existingFavorite => {
        if (existingFavorite) {
          return db.favoriteQuotes.delete(existingFavorite.id).then(() => false);
        } else {
          return db.favoriteQuotes.add({ quoteId, dateAdded: new Date() }).then(() => true);
        }
      });
  }
};
```

### 5.2 HTML Structure
```html
<div class="quote-container">
  <div class="quote-content">
    <div class="quote-text" id="quote-text"></div>
    <div class="quote-author">
      <span id="quote-author"></span>
      <span class="quote-source" id="quote-source"></span>
    </div>
  </div>
  <div class="quote-actions">
    <button id="favorite-quote" class="quote-button">
      <i class="far fa-heart"></i>
    </button>
    <button id="new-quote" class="quote-button">
      <i class="fas fa-sync-alt"></i>
    </button>
    <div class="quote-categories">
      <button data-category="power" class="category-button">Power</button>
      <button data-category="wisdom" class="category-button">Wisdom</button>
      <button data-category="discipline" class="category-button">Discipline</button>
      <button data-category="growth" class="category-button">Growth</button>
      <button data-category="perseverance" class="category-button">Perseverance</button>
      <button data-category="faith" class="category-button">Faith</button>
    </div>
  </div>
</div>
```

### 5.3 JavaScript Implementation
```javascript
let currentQuote = null;

function initializeQuotes() {
  // Display initial random quote
  displayRandomQuote();
  
  // New quote button
  document.getElementById('new-quote')?.addEventListener('click', displayRandomQuote);
  
  // Favorite quote button
  document.getElementById('favorite-quote')?.addEventListener('click', async () => {
    if (currentQuote) {
      const isFavorited = await motivationalQuotesSystem.toggleFavorite(currentQuote.id);
      const btn = document.getElementById('favorite-quote');
      btn.innerHTML = `<i class="${isFavorited ? 'fas' : 'far'} fa-heart"></i>`;
      showNotification(isFavorited ? 'Quote added to favorites' : 'Quote removed from favorites');
    }
  });
  
  // Category buttons
  document.querySelectorAll('.category-button').forEach(btn => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category;
      const quote = motivationalQuotesSystem.getQuoteByCategory(category);
      displayQuote(quote);
    });
  });
  
  // Load favorites
  loadFavoriteQuotes();
}

function displayRandomQuote() {
  const quote = motivationalQuotesSystem.getRandomQuote();
  displayQuote(quote);
}

function displayQuote(quote) {
  currentQuote = quote;
  document.getElementById('quote-text').textContent = `"${quote.text}"`;
  document.getElementById('quote-author').textContent = `- ${quote.author}`;
  document.getElementById('quote-source').textContent = quote.source ? `, ${quote.source}` : '';
  
  // Update favorite button state
  db.favoriteQuotes.where('quoteId').equals(quote.id).first()
    .then(fav => {
      const btn = document.getElementById('favorite-quote');
      btn.innerHTML = `<i class="${fav ? 'fas' : 'far'} fa-heart"></i>`;
    });
}

async function loadFavoriteQuotes() {
  const favorites = await motivationalQuotesSystem.getFavoriteQuotes();
  const grid = document.getElementById('favorites-grid');
  if (!favorites.length) {
    grid.innerHTML = '<p class="no-favorites">No favorite quotes yet</p>';
    return;
  }
  grid.innerHTML = favorites.map(fav => `
    <div class="favorite-quote-item">
      <div class="favorite-quote-text">"${fav.text}"</div>
      <div class="favorite-quote-author">- ${fav.author}</div>
      <button class="favorite-quote-remove" data-id="${fav.id}">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `).join('');
}
```

---

## 6. Quest Buttons

### 6.1 Add New Quest Button

**HTML:**
```html
<button id="add-quest-btn">Add New Quest</button>
```

**JavaScript:**
```javascript
function initializeAddQuestButton() {
  const addQuestBtn = document.getElementById('add-quest-btn');
  addQuestBtn?.addEventListener('click', () => {
    const existingPanel = document.querySelector('.quest-edit-panel');
    if (existingPanel) existingPanel.remove();
    
    const newQuestElem = document.createElement('div');
    newQuestElem.className = 'quest';
    document.getElementById('quests').appendChild(newQuestElem);
    
    const newQuestObj = {
      id: 'new',
      title: '',
      difficulty: 'Medium',
      xp: 2,
      stat: 'discipline',
      status: 'inbox',
      comment: '',
      isPinned: false
    };
    
    openQuestEditPanel(newQuestObj, newQuestElem);
  });
}
```

### 6.2 Complete Quest Button

**HTML (generated dynamically):**
```html
<span class="quest-check" onclick="completeQuest(${quest.xp}, '${quest.stat}', this.closest('.quest'))">
  <svg class="check-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
    <path d="M9 16.2l-3.5-3.5 1.4-1.4L9 13.4l7.1-7.1 1.4 1.4z" fill="#4a90e2"></path>
  </svg>
</span>
```

**JavaScript:**
```javascript
async function completeQuest(xp, stat, questElem) {
  const questTitle = questElem?.dataset.title || "a quest";
  
  // Play completion sound
  if (sounds?.complete) sounds.complete.play();
  
  // Visual feedback - fade out quest
  questElem.style.opacity = 0;
  setTimeout(() => questElem?.remove(), 300);
  
  // Update database
  const questId = parseInt(questElem?.dataset.questId);
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
    stats.completedQuests = (stats.completedQuests || 0) + 1;
    currentXP += xp;
    stats.xp = currentXP;
    await db.playerStats.put(stats);
    
    // Check for streak
    await checkDailyActivity(stats.lastActive);
    checkAchievements();
  }
  
  // Update XP display
  updateXP();
  
  // Check for level up
  const newLevel = playerStats[0]?.level || 0;
  if (newLevel > currentLevel) {
    setTimeout(() => {
      showLevelUpOverlay(newLevel);
      sounds?.levelUp?.play();
    }, 500);
  }
  
  // Increase stat
  await increaseStat(stat);
  
  // Show XP toast notification
  showXPToast(xp, stat);
  
  updateQuestCount();
  showNotification(`Quest "${questTitle}" completed!`, "success");
}
```

### 6.3 Delete Quest Button

**JavaScript:**
```javascript
async function deleteQuest(questId, questElem) {
  if (!confirm("Are you sure you want to delete this quest? This action cannot be undone.")) {
    return;
  }
  
  try {
    // Delete from database
    await db.quests.delete(questId);
    
    // Record deleted quest to prevent re-adding defaults
    const compositeKey = `${questElem.dataset.title}-${questElem.dataset.difficulty}-${questElem.dataset.xp}-${questElem.dataset.stat}-${questElem.dataset.category}`;
    const existing = await db.deletedQuests.where('compositeKey').equals(compositeKey).first();
    if (!existing) {
      await db.deletedQuests.add({ compositeKey });
    }
    
    // Remove from DOM
    questElem.style.opacity = 0;
    setTimeout(() => questElem.remove(), 300);
    
    showNotification("Quest deleted successfully!", "success");
    updateQuestCount();
  } catch (error) {
    console.error("Error deleting quest:", error);
    showNotification("Failed to delete quest.", "error");
  }
}
```

### 6.4 Quest Edit Panel (Save/Cancel/Category/Difficulty/Stat buttons)

**JavaScript - Opening Edit Panel:**
```javascript
function openQuestEditPanel(quest, questElemToEdit) {
  if (!questElemToEdit) return;
  
  // Close any existing edit panel
  const existingPanel = document.querySelector('.quest-edit-panel');
  if (existingPanel && existingPanel !== questElemToEdit) {
    existingPanel.className = 'quest';
    existingPanel.innerHTML = existingPanel.dataset.originalContent;
  }
  
  questElemToEdit.dataset.originalContent = questElemToEdit.innerHTML;
  questElemToEdit.dataset.questId = quest.id;
  questElemToEdit.className = 'quest quest-edit-panel';
  
  const dueDate = quest.dueDate ? new Date(quest.dueDate).toISOString().split('T')[0] : '';
  
  questElemToEdit.innerHTML = `
    <div class="edit-panel-content" onclick="event.stopPropagation()">
      <input type="text" class="quest-input" value="${quest.title || ''}" placeholder="Quest title">
      
      <div class="panel-section">
        <label>Category</label>
        <div class="category-tags">
          ${['Work', 'Health', 'Learning', 'Personal', 'Cultivation'].map(cat => 
            `<button type="button" class="tag-button glow-button ${cat.toLowerCase() === (quest.category || '').toLowerCase() ? 'selected' : ''}" 
                     data-category="${cat}">${cat}</button>`).join('')}
        </div>
      </div>
      
      <div class="panel-section">
        <label>Difficulty & XP</label>
        <div class="difficulty-tags">
          ${['Easy', 'Medium', 'Hard'].map(diff => 
            `<button type="button" class="tag-button glow-button ${diff === quest.difficulty ? 'selected' : ''}" 
                     data-difficulty="${diff}">${diff}</button>`).join('')}
        </div>
        <input type="number" class="quest-input xp-input" value="${quest.xp || 2}" min="1" max="1000" placeholder="XP">
      </div>
      
      <div class="panel-section">
        <label>Focus Stat</label>
        <div class="stat-tags">
          ${['strength', 'agility', 'intelligence', 'stamina', 'willpower', 'discipline']
              .map(stat => `<button type="button" class="tag-button glow-button ${stat === quest.stat ? 'selected' : ''}" 
                                  data-stat="${stat}">${stat}</button>`).join('')}
        </div>
      </div>
      
      <div class="panel-section">
        <label>Due Date</label>
        <input type="date" id="due-date-input" class="quest-input" value="${dueDate}">
      </div>
      
      <div class="comment-section">
        <textarea class="quest-input" placeholder="Add a comment...">${quest.comment || ''}</textarea>
        <label class="pin-checkbox">
          <input type="checkbox" ${quest.isPinned ? 'checked' : ''} class="pin-comment">
          Pin Comment
        </label>
      </div>
      
      <div class="action-buttons">
        <button type="button" class="save-quest glow-button" onclick="saveQuestEdit(this)">Save</button>
        <button type="button" class="cancel-quest glow-button" onclick="cancelQuestEdit(this.closest('.quest-edit-panel'))">Cancel</button>
      </div>
    </div>
  `;
  
  setupEditPanelListeners(questElemToEdit);
}
```

**Save Function:**
```javascript
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
  
  if (!updatedQuest.title) {
    showNotification('Please enter a quest title', 'error');
    return;
  }
  
  try {
    if (questId === 'new') {
      updatedQuest.id = await db.quests.add(updatedQuest);
    } else {
      updatedQuest.id = parseInt(questId);
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
```

**Cancel Function:**
```javascript
function cancelQuestEdit(questElem) {
  if (questElem.dataset.questId === 'new') {
    questElem.remove();
  } else {
    questElem.className = 'quest';
    questElem.innerHTML = questElem.dataset.originalContent;
  }
}
```

### 6.5 Toggle Default (Heart Icon)

**JavaScript:**
```javascript
async function toggleDefaultQuest(questTitle, heartIcon) {
  const questIndex = GLOBAL_DEFAULT_QUESTS.findIndex(
    (quest) => quest.title === questTitle
  );
  
  if (questIndex > -1) {
    GLOBAL_DEFAULT_QUESTS.splice(questIndex, 1);
    heartIcon.classList.remove("favorited");
    showNotification("Quest removed from default quests.");
  } else {
    const quest = await db.quests.where("title").equals(questTitle).first();
    if (quest) {
      GLOBAL_DEFAULT_QUESTS.push(quest);
      heartIcon.classList.add("favorited");
      showNotification("Quest added to default quests.");
    }
  }
}
```

---

## 7. Pomodoro Timer Section

### 7.1 HTML Structure
```html
<div class="pomodoro-container">
  <h3>Pomodoro Timer</h3>
  <div class="timer-display">
    <span id="minutes">25</span>:<span id="seconds">00</span>
  </div>
  <div class="timer-controls">
    <button id="start-timer"><i class="fas fa-play"></i></button>
    <button id="pause-timer"><i class="fas fa-pause"></i></button>
    <button id="reset-timer"><i class="fas fa-redo"></i></button>
  </div>
  <div class="timer-modes">
    <button class="timer-mode active" data-time="25">Work</button>
    <button class="timer-mode" data-time="5">Break</button>
    <button class="timer-mode" data-time="15">Long Break</button>
  </div>
</div>
```

### 7.2 JavaScript Implementation
```javascript
let timerInterval = null;
let remainingSeconds = 25 * 60;
let isRunning = false;

function initializePomodoro() {
  const startBtn = document.getElementById('start-timer');
  const pauseBtn = document.getElementById('pause-timer');
  const resetBtn = document.getElementById('reset-timer');
  const timerModes = document.querySelectorAll('.timer-mode');
  
  startBtn?.addEventListener('click', startTimer);
  pauseBtn?.addEventListener('click', pauseTimer);
  resetBtn?.addEventListener('click', resetTimer);
  
  timerModes.forEach(mode => {
    mode.addEventListener('click', () => {
      timerModes.forEach(m => m.classList.remove('active'));
      mode.classList.add('active');
      remainingSeconds = parseInt(mode.dataset.time) * 60;
      updateTimerDisplay();
      isRunning = false;
      clearInterval(timerInterval);
    });
  });
}

function startTimer() {
  if (isRunning) return;
  isRunning = true;
  
  timerInterval = setInterval(() => {
    remainingSeconds--;
    updateTimerDisplay();
    
    if (remainingSeconds <= 0) {
      clearInterval(timerInterval);
      isRunning = false;
      sounds?.timerComplete?.play();
      showNotification('Pomodoro session complete!', 'success');
      
      // Track completed pomodoro
      db.playerStats.toArray().then(stats => {
        if (stats.length > 0) {
          stats[0].pomodoroCompleted = (stats[0].pomodoroCompleted || 0) + 1;
          db.playerStats.put(stats[0]);
          checkAchievements();
        }
      });
    }
  }, 1000);
}

function pauseTimer() {
  isRunning = false;
  clearInterval(timerInterval);
}

function resetTimer() {
  isRunning = false;
  clearInterval(timerInterval);
  const activeMode = document.querySelector('.timer-mode.active');
  remainingSeconds = parseInt(activeMode?.dataset.time || 25) * 60;
  updateTimerDisplay();
}

function updateTimerDisplay() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  document.getElementById('minutes').textContent = minutes;
  document.getElementById('seconds').textContent = seconds.toString().padStart(2, '0');
}
```

---

## 8. Achievements Section

### 8.1 Achievement Definitions
```javascript
const achievementDefinitions = [
  { id: 1, title: "First Steps", description: "Complete your first quest", icon: "fa-solid fa-shoe-prints", category: "quests", condition: (stats) => stats.completedQuests >= 1 },
  { id: 2, title: "Quest Master", description: "Complete 50 quests", icon: "fa-solid fa-trophy", category: "quests", condition: (stats) => stats.completedQuests >= 50 },
  { id: 3, title: "Level 10", description: "Reach level 10", icon: "fa-solid fa-award", category: "level", condition: (stats) => stats.level >= 10 },
  { id: 4, title: "Balanced", description: "Get all stats to level 5", icon: "fa-solid fa-scale-balanced", category: "stats", condition: (stats) => Object.keys(statsElems).every(stat => stats[stat] >= 5) },
  { id: 5, title: "Specialist", description: "Get any stat to level 10", icon: "fa-solid fa-user-graduate", category: "stats", condition: (stats) => Object.keys(statsElems).some(stat => stats[stat] >= 10) },
  { id: 6, title: "Consistent", description: "Maintain a 3-day streak", icon: "fa-solid fa-calendar-check", category: "streak", condition: (stats) => stats.currentStreak >= 3 },
  { id: 7, title: "Dedicated", description: "Maintain a 7-day streak", icon: "fa-solid fa-fire", category: "streak", condition: (stats) => stats.currentStreak >= 7 },
  { id: 8, title: "Unstoppable", description: "Maintain a 30-day streak", icon: "fa-solid fa-fire-flame-curved", category: "streak", condition: (stats) => stats.currentStreak >= 30 },
  { id: 9, title: "Pomodoro Master", description: "Complete 10 pomodoro sessions", icon: "fa-solid fa-clock", category: "pomodoro", condition: (stats) => stats.pomodoroCompleted >= 10 },
  { id: 10, title: "All-Rounder", description: "Complete at least one quest in each category", icon: "fa-solid fa-circle-check", category: "quests", condition: (stats) => stats.categoriesCompleted?.length >= 4 }
];
```

### 8.2 JavaScript Implementation
```javascript
async function initializeAchievements() {
  // Initialize achievements in database if empty
  const existingAchievements = await db.achievements.toArray();
  
  if (existingAchievements.length === 0) {
    const achievementsToAdd = achievementDefinitions.map(({ condition, ...rest }) => ({
      ...rest, unlocked: false, unlockedAt: null
    }));
    await db.achievements.bulkAdd(achievementsToAdd);
  }
  
  // Setup category filter buttons
  document.querySelectorAll('.achievement-category').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.achievement-category').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterAchievements(btn.dataset.category);
    });
  });
  
  updateAchievementProgress();
}

async function filterAchievements(category) {
  const achievements = await db.achievements.toArray();
  const grid = document.getElementById('achievements-grid');
  
  const filtered = category === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === category);
  
  grid.innerHTML = filtered.map(ach => `
    <div class="achievement-card ${ach.unlocked ? 'unlocked' : ''}">
      <div class="achievement-icon"><i class="${ach.icon}"></i></div>
      <div class="achievement-details">
        <div class="achievement-title">${ach.title}</div>
        <div class="achievement-description">${ach.description}</div>
      </div>
    </div>
  `).join('');
  
  updateAchievementCount(filtered.filter(a => a.unlocked).length, filtered.length);
}

function checkAchievements() {
  db.playerStats.toArray().then(async stats => {
    if (!stats.length) return;
    const playerStats = stats[0];
    const achievements = await db.achievements.toArray();
    
    for (const achievement of achievements) {
      if (!achievement.unlocked && achievementDefinitions.find(d => d.id === achievement.id)?.condition(playerStats)) {
        achievement.unlocked = true;
        achievement.unlockedAt = new Date();
        await db.achievements.put(achievement);
        
        sounds?.achievement?.play();
        showNotification(`Achievement Unlocked: ${achievement.title}!`, 'success');
        displayQuoteByContext(motivationalQuotesSystem.contexts.ACHIEVEMENT_UNLOCKED);
      }
    }
    
    updateAchievementProgress();
  });
}

function updateAchievementProgress() {
  db.achievements.toArray().then(achievements => {
    const unlocked = achievements.filter(a => a.unlocked).length;
    const total = achievementDefinitions.length;
    document.getElementById('achievement-count').textContent = unlocked;
    document.querySelector('.achievement-total').textContent = total;
    document.getElementById('achievement-progress-fill').style.width = `${(unlocked/total)*100}%`;
  });
}
```

---

## 9. Settings Modal Buttons

### 9.1 HTML Structure
```html
<div class="settings-icon" id="settings-icon">⚙️</div>

<div class="modal-overlay" id="modal-overlay"></div>

<div class="settings-modal" id="settings-modal">
  <span class="modal-close" id="modal-close">&times;</span>
  <h2>Settings</h2>
  <div class="modal-content">
    <button id="edit-username-btn"><i class="fas fa-user-edit"></i> Edit Username</button>
    <button id="save-btn"><i class="fas fa-save"></i> Save Game</button>
    <button id="load-btn"><i class="fas fa-folder-open"></i> Load Game</button>
    <button id="restart-btn"><i class="fas fa-redo"></i> Restart Quests</button>
    <button id="reset-btn"><i class="fas fa-trash"></i> Clear All Quests</button>
    <button id="load-default-quests-btn"><i class="fas fa-scroll"></i> Load Default Quests</button>
    <button id="export-game-btn"><i class="fas fa-file-export"></i> Export Game</button>
    <button id="import-game-btn"><i class="fas fa-file-import"></i> Import Game</button>
    <button id="remove-duplicates-btn"><i class="fas fa-unlink"></i> Remove Duplicate Quests</button>
    <button id="clear-all-btn"><i class="fas fa-broom"></i> Clear All Game Data</button>
    <button id="tour-guide-btn"><i class="fas fa-question-circle"></i> How to Use (Tour Guide)</button>
    <button id="save-default-quests-btn"><i class="fas fa-save"></i> Save Default Quests</button>
  </div>
</div>
```

### 9.2 JavaScript - All Settings Functions

```javascript
// Open/Close Modal
function initSettingsHandlers() {
  document.getElementById('settings-icon')?.addEventListener('click', () => {
    document.getElementById('settings-modal').classList.add('show');
    document.getElementById('modal-overlay').classList.add('show');
    document.body.style.overflow = 'hidden';
  });
  
  document.getElementById('modal-close')?.addEventListener('click', closeSettingsModal);
  document.getElementById('modal-overlay')?.addEventListener('click', closeSettingsModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeSettingsModal();
  });
}

function closeSettingsModal() {
  document.getElementById('settings-modal').classList.remove('show');
  document.getElementById('modal-overlay').classList.remove('show');
  document.body.style.overflow = '';
}

// Edit Username
async function editUsername() {
  const newUsername = prompt("Enter your new username:");
  if (newUsername) {
    const playerStats = await db.playerStats.toArray();
    playerStats[0].username = newUsername;
    await db.playerStats.put(playerStats[0]);
    document.getElementById('username-display').textContent = newUsername;
    showNotification("Username updated successfully");
  }
}
document.getElementById('edit-username-btn')?.addEventListener('click', editUsername);

// Save Game
document.getElementById('save-btn')?.addEventListener('click', async () => {
  const playerStats = await db.playerStats.toArray();
  const quests = await db.quests.toArray();
  
  await db.savedGames.add({
    timestamp: new Date(),
    stats: playerStats[0],
    quests: quests
  });
  
  showNotification("Game saved successfully!");
});

// Load Game
document.getElementById('load-btn')?.addEventListener('click', async () => {
  const savedGames = await db.savedGames.toArray();
  const savedGamesList = document.getElementById('saved-games-list');
  
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
      `).join('');
  }
  
  document.getElementById('load-modal').style.display = 'block';
  document.getElementById('modal-overlay').classList.add('show');
});

// Export Game
document.getElementById('export-game-btn')?.addEventListener('click', async () => {
  const playerStats = await db.playerStats.toArray();
  const quests = await db.quests.toArray();
  const achievements = await db.achievements.toArray();
  
  const exportData = {
    version: 1,
    exportDate: new Date().toISOString(),
    playerStats: playerStats[0],
    quests: quests,
    achievements: achievements
  };
  
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `solo-leveling-save-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  
  showNotification("Game exported successfully!");
});

// Import Game
document.getElementById('import-game-btn')?.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const importData = JSON.parse(event.target.result);
        
        if (importData.playerStats) {
          await db.playerStats.clear();
          await db.playerStats.add(importData.playerStats);
        }
        if (importData.quests) {
          await db.quests.clear();
          await db.quests.bulkAdd(importData.quests);
        }
        if (importData.achievements) {
          await db.achievements.clear();
          await db.achievements.bulkAdd(importData.achievements);
        }
        
        showNotification("Game imported successfully! Refresh to see changes.");
      } catch (error) {
        showNotification("Failed to import game: " + error.message, "error");
      }
    };
    reader.readAsText(file);
  };
  input.click();
});

// Restart Quests
document.getElementById('restart-btn')?.addEventListener('click', async () => {
  if (confirm("Are you sure you want to restart all quests? All progress will be lost.")) {
    const quests = await db.quests.toArray();
    for (const quest of quests) {
      quest.status = 'inbox';
      quest.completedAt = null;
      await db.quests.put(quest);
    }
    showNotification("All quests have been restarted!");
    location.reload();
  }
});

// Clear All Quests
document.getElementById('reset-btn')?.addEventListener('click', async () => {
  if (confirm("Are you sure you want to delete ALL quests? This cannot be undone.")) {
    await db.quests.clear();
    showNotification("All quests have been deleted!");
    location.reload();
  }
});

// Load Default Quests
document.getElementById('load-default-quests-btn')?.addEventListener('click', async () => {
  await db.quests.clear();
  await db.deletedQuests.clear();
  
  const questsToAdd = GLOBAL_DEFAULT_QUESTS.map(q => ({...q, status: 'inbox'}));
  await db.quests.bulkAdd(questsToAdd);
  
  showNotification("Default quests loaded!");
  location.reload();
});

// Remove Duplicates
document.getElementById('remove-duplicates-btn')?.addEventListener('click', async () => {
  const quests = await db.quests.toArray();
  const seen = new Set();
  let removed = 0;
  
  for (const quest of quests) {
    const key = `${quest.title}-${quest.difficulty}-${quest.xp}-${quest.stat}-${quest.category}`;
    if (seen.has(key)) {
      await db.quests.delete(quest.id);
      removed++;
    } else {
      seen.add(key);
    }
  }
  
  showNotification(`Removed ${removed} duplicate quests!`);
});

// Clear All Game Data
document.getElementById('clear-all-btn')?.addEventListener('click', async () => {
  if (confirm("Are you sure you want to clear ALL game data? This will reset everything!")) {
    await db.playerStats.clear();
    await db.quests.clear();
    await db.achievements.clear();
    await db.savedGames.clear();
    await db.favoriteQuotes.clear();
    await db.statHistory.clear();
    await db.deletedQuests.clear();
    
    showNotification("All game data cleared. Refresh to start fresh!");
    setTimeout(() => location.reload(), 1500);
  }
});

// Save Default Quests
document.getElementById('save-default-quests-btn')?.addEventListener('click', async () => {
  localStorage.setItem('customDefaultQuests', JSON.stringify(GLOBAL_DEFAULT_QUESTS));
  showNotification("Default quests saved!");
});
```

---

## 10. Spider Chart Modal

### 10.1 HTML Structure
```html
<div class="spider-chart-modal" id="spider-chart-modal">
  <div class="modal-content spider-chart-content">
    <span class="modal-close" id="spider-chart-modal-close">&times;</span>
    <h2>Character Stats Visualization</h2>
    
    <div class="chart-controls">
      <div class="chart-toggle">
        <button id="view-current" class="chart-tab active">Current Stats</button>
        <button id="view-history" class="chart-tab">History</button>
        <button id="view-compare" class="chart-tab">Compare</button>
      </div>
      <div class="time-range" id="time-range-controls" style="display: none;">
        <button data-range="week" class="time-button active">Week</button>
        <button data-range="month" class="time-button">Month</button>
        <button data-range="alltime" class="time-button">All Time</button>
      </div>
    </div>
    
    <!-- Stat Details Section -->
    <div class="stat-details-container">
      <h3>Stat Details</h3>
      <div class="stat-details">
        <div class="stat-detail" data-stat="strength">
          <div class="stat-name">Strength</div>
          <div class="stat-bar"><div class="stat-progress" id="strength-progress"></div></div>
          <div class="stat-info">
            <span class="stat-value-display" id="strength-value">1</span>
            <span class="stat-change" id="strength-change">+0</span>
          </div>
        </div>
        <!-- Repeat for all 6 stats -->
      </div>
    </div>
  </div>
</div>
```

### 10.2 JavaScript Implementation
```javascript
let currentChartView = 'current';
let timeRange = 'week';

function initializeSpiderChart() {
  // View toggle buttons
  document.getElementById('view-current')?.addEventListener('click', () => setChartView('current'));
  document.getElementById('view-history')?.addEventListener('click', () => setChartView('history'));
  document.getElementById('view-compare')?.addEventListener('click', () => setChartView('compare'));
  
  // Time range buttons
  document.querySelectorAll('.time-button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.time-button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      timeRange = btn.dataset.range;
      updateStatDetails();
    });
  });
  
  // Close button
  document.getElementById('spider-chart-modal-close')?.addEventListener('click', () => {
    document.getElementById('spider-chart-modal').style.display = 'none';
  });
  
  // Make stat cards clickable to open modal
  document.querySelectorAll('.stat-card').forEach(card => {
    card.addEventListener('click', () => {
      document.getElementById('spider-chart-modal').style.display = 'flex';
      updateStatDetails();
    });
  });
}

function setChartView(view) {
  currentChartView = view;
  document.querySelectorAll('.chart-tab').forEach(tab => tab.classList.remove('active'));
  document.getElementById(`view-${view}`).classList.add('active');
  
  const timeControls = document.getElementById('time-range-controls');
  timeControls.style.display = view === 'history' || view === 'compare' ? 'flex' : 'none';
  
  updateStatDetails();
}

function updateStatDetails() {
  db.playerStats.toArray().then(stats => {
    if (!stats.length) return;
    const current = stats[0];
    const statsKeys = ['strength', 'agility', 'intelligence', 'stamina', 'willpower', 'discipline'];
    
    statsKeys.forEach(stat => {
      const value = current[stat] || 1;
      document.getElementById(`${stat}-value`).textContent = value;
      document.getElementById(`${stat}-progress`).style.width = `${Math.min(100, value)}%`;
    });
  });
}
```

---

## 11. Core JavaScript Functions

### 11.1 Initialize Game Function
```javascript
async function initializeGame() {
  // Initialize DOM references
  initializeDOMReferences();
  initializeAddQuestButton();
  
  // Initialize default quests
  const existingQuests = await db.quests.toArray();
  // ... quest loading logic
  
  // Initialize achievements
  const existingAchievements = await db.achievements.toArray();
  if (existingAchievements.length === 0) {
    const achievementsToAdd = achievementDefinitions.map(({ condition, ...rest }) => ({
      ...rest, unlocked: false, unlockedAt: null
    }));
    await db.achievements.bulkAdd(achievementsToAdd);
  }
  
  // Initialize player stats
  const playerStats = await db.playerStats.toArray();
  if (playerStats.length === 0) {
    await db.playerStats.add({
      level: 0, xp: 0,
      strength: 1, agility: 1, intelligence: 1,
      stamina: 1, willpower: 1, discipline: 1,
      lastActive: new Date(), consecutiveDays: 0,
      currentStreak: 0, longestStreak: 0,
      username: "Anonymous", completedQuests: 0,
      categoriesCompleted: [], pomodoroCompleted: 0
    });
  }
  
  // Load quests from database
  const quests = await db.quests.toArray();
  quests.forEach(quest => {
    const questElement = createQuestElement(quest);
    document.getElementById('quests').appendChild(questElement);
  });
  
  // Initialize all systems
  initializeQuestFilters();
  initializePomodoro();
  initializeQuotes();
  initializeEnhancedUI();
  initializeTheme();
  updateStreakDisplay();
  initializeAchievements();
  updateMainStatsDisplay();
  await initializeStats();
}

document.addEventListener('DOMContentLoaded', initializeGame);
```

### 11.2 Stat Increase Function
```javascript
async function increaseStat(stat) {
  const playerStats = await db.playerStats.toArray();
  if (playerStats.length > 0) {
    const stats = playerStats[0];
    const oldValue = stats[stat] || 1;
    stats[stat]++;
    await db.playerStats.put(stats);
    
    // Update currentStats
    currentStats = {
      strength: stats.strength, agility: stats.agility,
      intelligence: stats.intelligence, stamina: stats.stamina,
      willpower: stats.willpower, discipline: stats.discipline
    };
    
    // Update UI
    document.getElementById(stat).textContent = stats[stat];
    updateMainStatsDisplay();
    
    // Record history
    await recordStatHistory();
    
    showNotification(`${stat.charAt(0).toUpperCase() + stat.slice(1)} increased to ${stats[stat]}!`, 'success');
  }
}
```

### 11.3 XP and Level Up System
```javascript
function calculateXPForNextLevel(level) {
  return Math.floor(10 * Math.pow(1.5, level));
}

function updateXP() {
  const xpForNextLevel = calculateXPForNextLevel(currentLevel);
  document.getElementById('current-xp').textContent = currentXP;
  document.getElementById('xp-required').textContent = xpForNextLevel;
  document.getElementById('xp-progress').style.width = `${(currentXP / xpForNextLevel) * 100}%`;
  
  const levelUpBtn = document.getElementById('level-up-btn');
  if (currentXP >= xpForNextLevel) {
    levelUpBtn.style.display = 'inline-block';
  } else {
    levelUpBtn.style.display = 'none';
  }
}

document.getElementById('level-up-btn').addEventListener('click', async () => {
  const xpRequired = calculateXPForNextLevel(currentLevel);
  if (currentXP >= xpRequired) {
    currentLevel++;
    currentXP -= xpRequired;
    
    const playerStats = await db.playerStats.toArray();
    playerStats[0].level = currentLevel;
    playerStats[0].xp = currentXP;
    await db.playerStats.put(playerStats[0]);
    
    document.getElementById('current-level').textContent = currentLevel;
    updateXP();
    updateCharacterTitle();
    
    sounds?.levelUp?.play();
    showNotification("Congratulations! You've leveled up!");
  }
});
```

### 11.4 Streak System
```javascript
async function checkDailyActivity(prevLastActive = null) {
  const playerStats = await db.playerStats.toArray();
  if (playerStats.length === 0) return;
  
  const stats = playerStats[0];
  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (stats.lastStreakCheck && new Date(stats.lastStreakCheck).getTime() === today.getTime()) {
    return;
  }
  
  let lastActive;
  if (prevLastActive) {
    lastActive = new Date(prevLastActive);
  } else if (stats.lastActive) {
    lastActive = new Date(stats.lastActive);
  } else {
    stats.lastActive = now;
    stats.currentStreak = 1;
    stats.lastStreakCheck = today;
    await db.playerStats.put(stats);
    updateStreakDisplay();
    return;
  }
  
  if (lastActive && daysBetween(lastActive, now) > 1) {
    stats.currentStreak = 0;
    stats.consecutiveDays = 0;
  }
  
  if (lastActive && daysBetween(lastActive, now) === 1) {
    stats.currentStreak = (stats.currentStreak || 0) + 1;
    stats.consecutiveDays = (stats.consecutiveDays || 0) + 1;
    stats.longestStreak = Math.max(stats.longestStreak || 0, stats.currentStreak);
    
    if (stats.currentStreak > 0 && stats.currentStreak % 3 === 0) {
      sounds?.streakUp?.play();
      showNotification(`Amazing! You've maintained a ${stats.currentStreak}-day streak!`);
    }
  }
  
  stats.lastActive = now;
  stats.lastStreakCheck = today;
  await db.playerStats.put(stats);
  updateStreakDisplay();
}

function daysBetween(date1, date2) {
  const utc1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const utc2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return Math.floor((utc2 - utc1) / (1000 * 60 * 60 * 24));
}
```

---

## 12. CSS Theming System

### Theme Variables
```css
:root {
  --bg-main: #0a0a0a;
  --bg-card: rgba(30, 30, 40, 0.9);
  --bg-card-dark: rgba(20, 20, 30, 0.7);
  --bg-card-darker: rgba(15, 15, 25, 0.8);
  --bg-element: rgba(40, 40, 50, 0.7);
  --text-primary: #e0e0e0;
  --text-secondary: #aaaaaa;
  --accent-primary: #4a90e2;
  --accent-secondary: #4ecdc4;
  --accent-tertiary: #ffd166;
  --accent-quaternary: #ff4961;
  --border-light: rgba(100, 100, 255, 0.3);
  --shadow-color: rgba(0, 0, 0, 0.7);
  --transition-speed: 0.3s;
  --border-radius-sm: 5px;
  --border-radius-md: 10px;
  --border-radius-lg: 15px;
  --box-shadow: 0 0 30px rgba(0, 0, 0, 0.7);
  --font-family: 'Poppins', sans-serif;
}

.theme-light {
  --bg-main: #f0f0f5;
  --bg-card: rgba(255, 255, 255, 0.9);
  --bg-card-dark: rgba(240, 240, 245, 0.8);
  --text-primary: #222222;
  --text-secondary: #555555;
  --accent-primary: #2970c3;
  --accent-secondary: #3aaa9c;
  --border-light: rgba(70, 70, 200, 0.15);
}
```

### CSS Animations
```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 10px var(--accent-primary); }
  50% { box-shadow: 0 0 20px var(--accent-primary); }
  100% { box-shadow: 0 0 10px var(--accent-primary); }
}

@keyframes glow {
  from { text-shadow: 0 0 5px var(--accent-primary), 0 0 10px var(--accent-primary); }
  to { text-shadow: 0 0 10px var(--accent-primary), 0 0 20px var(--accent-primary), 0 0 30px var(--accent-primary); }
}
```

---

## Summary

This implementation includes **60+ button functionalities** organized into:

1. **Theme System** - Dark/light mode toggle with CSS variables
2. **View Layouts** - Dashboard, detailed, compact views
3. **Quest Management** - Full CRUD operations with filtering/sorting
4. **Quote System** - Random quotes with favorites and categories
5. **Pomodoro Timer** - 25/5/15 minute timer with controls
6. **Achievements** - 10 unlockable achievements with conditions
7. **Settings** - Save/load/export/import/restart functionality
8. **Spider Chart** - Visual stat representation with history
9. **XP/Leveling** - Exponential XP curve with level progression
10. **Streak System** - Daily tracking with titles

### Key Technical Requirements:
- **Dexie.js** for IndexedDB wrapper (database)
- **Howler.js** for sound effects
- **Font Awesome** for icons
- **Google Fonts (Poppins)** for typography
- LocalStorage for preferences persistence

Use this document as a complete reference to implement similar gamified task management features in any web application.

---

*Generated from analysis of index.html, app.js, and styles.css*
*Last Updated: Analysis of My System1 implementation*