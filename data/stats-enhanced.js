/* ═══════════════════════════════════════════════
 * Solo Leveling System — Stats Enhancement Module
 * Level-up perks, streak bonuses, stat milestones, 
 * stat decay, class system, animated stat bars
 * ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── LEVEL-UP PERKS ───

  const LEVEL_PERKS = [
    { level: 1, title: 'Novice Hunter', perk: 'Unlocked quest suggestions' },
    { level: 3, title: 'Awakened', perk: 'Pomodoro session stats' },
    { level: 5, title: 'Initiate', perk: 'Custom themes unlocked' },
    { level: 7, title: 'Apprentice', perk: 'XP boost: +10% on all quests' },
    { level: 10, title: 'Soldier', perk: 'Streak freeze item (1/week)' },
    { level: 13, title: 'Elite', perk: 'Stat milestone titles visible' },
    { level: 15, title: 'Knight', perk: 'Class specialization unlocked' },
    { level: 18, title: 'Berserker', perk: 'XP boost: +25% on all quests' },
    { level: 20, title: 'Mage', perk: 'Custom background images' },
    { level: 25, title: 'Assassin', perk: 'Stat decay disabled permanently' },
    { level: 30, title: 'Tank', perk: 'XP boost: +50% on all quests' },
    { level: 40, title: 'Lord', perk: 'Forge: create custom chains' },
    { level: 50, title: 'King', perk: 'Double XP weekends unlocked' },
    { level: 75, title: 'Emperor', perk: 'All stat caps increased to 99999' },
    { level: 100, title: 'Transcendent', perk: 'Title customizer unlocked' },
  ];

  function getPerksForLevel(level) {
    return LEVEL_PERKS.filter(p => level >= p.level);
  }

  function getNextPerk(level) {
    return LEVEL_PERKS.find(p => p.level > level) || null;
  }

  function getXPBoost(level) {
    if (level >= 30) return 1.5;
    if (level >= 18) return 1.25;
    if (level >= 10) return 1.15;
    if (level >= 7) return 1.1;
    return 1.0;
  }

  // ─── STAT MILESTONE TITLES ───

  const STAT_MILESTONES = [
    { value: 1, title: 'Novice', color: '#9898b0' },
    { value: 5, title: 'Learner', color: '#4ecdc4' },
    { value: 10, title: 'Practitioner', color: '#4a90e2' },
    { value: 25, title: 'Expert', color: '#b388ff' },
    { value: 50, title: 'Master', color: '#ffd166' },
    { value: 100, title: 'Grandmaster', color: '#ff922b' },
    { value: 250, title: 'Legendary', color: '#ff4961' },
    { value: 500, title: 'Mythic', color: '#ff6b6b' },
    { value: 1000, title: 'Divine', color: '#ffd700' },
  ];

  function getStatTitle(value) {
    let result = STAT_MILESTONES[0];
    for (const ms of STAT_MILESTONES) {
      if (value >= ms.value) result = ms;
    }
    return result;
  }

  function getStatTitleFor(statName, playerStats) {
    if (!playerStats) return getStatTitle(1);
    return getStatTitle(playerStats[statName] || 1);
  }

  // ─── STREAK STAT BONUSES ───

  function getStreakStatBonus(streakDays) {
    // At 7 days: +5% to all stats
    // At 30 days: +15%
    // At 100 days: +30%
    // At 365 days: +50%
    if (streakDays >= 365) return 1.5;
    if (streakDays >= 100) return 1.3;
    if (streakDays >= 30) return 1.15;
    if (streakDays >= 14) return 1.08;
    if (streakDays >= 7) return 1.05;
    return 1.0;
  }

  function getDisplayStatBonus(streakDays) {
    const bonus = getStreakStatBonus(streakDays);
    return Math.round((bonus - 1) * 100);
  }

  // ─── CLASS / SPECIALIZATION SYSTEM ───

  const CLASSES = [
    {
      id: 'warrior',
      name: 'Warrior',
      icon: 'fa-shield-halved',
      description: 'Focus on physical strength and endurance',
      bonuses: { strength: 1.2, stamina: 1.15, agility: 1.05 },
      color: '#ff4961',
    },
    {
      id: 'scholar',
      name: 'Scholar',
      icon: 'fa-graduation-cap',
      description: 'Focus on knowledge and wisdom',
      bonuses: { intelligence: 1.2, discipline: 1.1, willpower: 1.05 },
      color: '#b388ff',
    },
    {
      id: 'sage',
      name: 'Sage',
      icon: 'fa-brain',
      description: 'Focus on spiritual strength and wisdom',
      bonuses: { willpower: 1.2, intelligence: 1.15, discipline: 1.05 },
      color: '#4ecdc4',
    },
    {
      id: 'rogue',
      name: 'Rogue',
      icon: 'fa-feather-pointed',
      description: 'Focus on agility and creative thinking',
      bonuses: { agility: 1.2, discipline: 1.1, intelligence: 1.05 },
      color: '#ff922b',
    },
    {
      id: 'paladin',
      name: 'Paladin',
      icon: 'fa-cross',
      description: 'Balanced growth across all stats',
      bonuses: { strength: 1.1, willpower: 1.1, stamina: 1.1, discipline: 1.1, intelligence: 1.05, agility: 1.05 },
      color: '#4a90e2',
    },
  ];

  const CLASS_STORAGE_KEY = 'sl_chosen_class';

  function getChosenClass() {
    const id = localStorage.getItem(CLASS_STORAGE_KEY);
    return CLASSES.find(c => c.id === id) || null;
  }

  function setChosenClass(classId) {
    const level = parseInt(document.getElementById('current-level')?.textContent || '0');
    if (level < 15) return;
    localStorage.setItem(CLASS_STORAGE_KEY, classId);
  }

  function clearChosenClass() {
    localStorage.removeItem(CLASS_STORAGE_KEY);
  }

  function getClassBonuses(classObj, playerLevel) {
    if (!classObj) return {};
    // Bonuses scale with level (capped at 2x)
    const scale = Math.min(1 + (playerLevel || 0) * 0.02, 2.0);
    const result = {};
    for (const [stat, bonus] of Object.entries(classObj.bonuses)) {
      result[stat] = 1 + (bonus - 1) * scale;
    }
    return result;
  }

  // ─── STAT DECAY ───

  const DECAY_STORAGE_KEY = 'sl_last_stat_decay';
  const DECAY_DAYS = 3; // After 3 days of no activity in a category, decay starts
  const DECAY_AMOUNT = 1; // Lose 1 point per day of inactivity

  async function applyStatDecay() {
    if (typeof db === 'undefined') return;
    try {
      const stats = await db.playerStats.toArray();
      if (!stats.length) return;
      const player = stats[0];

      // Check when last active
      const lastActive = player.lastActive ? new Date(player.lastActive) : new Date();
      const daysSinceActive = Math.floor((Date.now() - lastActive.getTime()) / 86400000);

      if (daysSinceActive < DECAY_DAYS) return;

      // Apply decay to all stats
      const STATS = ['strength', 'agility', 'intelligence', 'stamina', 'willpower', 'discipline'];
      let decayed = false;
      for (const stat of STATS) {
        if (player[stat] > 1) {
          player[stat] = Math.max(1, player[stat] - DECAY_AMOUNT);
          decayed = true;
        }
      }

      if (decayed) {
        player.lastActive = new Date();
        await db.playerStats.put(player);
        if (typeof showNotification === 'function') {
          showNotification('⚡ Stats decayed from inactivity. Keep questing!', 'warning');
        }
        if (typeof renderQuests === 'function') renderQuests();
      }
    } catch (e) {
      console.warn('[StatsEnhanced] Decay error:', e);
    }
  }

  // ─── ANIMATED STAT BARS ───

  function animateStatBar(statName, newValue) {
    const maxStat = (typeof SL_CONFIG !== 'undefined' && SL_CONFIG.MAX_STAT) || 10000;
    const progressFill = document.getElementById(`${statName}-progress-main`);
    const progressText = document.getElementById(`${statName}-progress-text`);
    const valueDisplay = document.getElementById(statName);

    if (!progressFill) return;

    // Animate the bar (percentage of max stat)
    const pct = Math.min(100, (newValue / maxStat) * 100);
    progressFill.style.transition = 'width 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
    progressFill.style.width = `${pct}%`;

    if (progressText) {
      progressText.textContent = `${newValue}/${maxStat}`;
      progressText.style.transition = 'color 0.3s ease';
      progressText.style.color = '#ffd700';
      setTimeout(() => { progressText.style.color = ''; }, 1500);
    }

    if (valueDisplay) {
      valueDisplay.textContent = newValue;
      valueDisplay.classList.add('animate');
      setTimeout(() => valueDisplay.classList.remove('animate'), 500);
    }
  }

  // ─── UI COMPONENTS ───

  function addClassSelectionToSettings() {
    const settingsContent = document.querySelector('.settings-modal .modal-content');
    if (!settingsContent || document.getElementById('class-settings-section')) return;

    const playerLevel = parseInt(document.getElementById('current-level')?.textContent || '0');
    const classUnlocked = playerLevel >= 15;
    const currentClass = getChosenClass();

    const section = document.createElement('div');
    section.id = 'class-settings-section';
    section.style.cssText = `margin: 12px 0; padding: 12px 16px; 
      background: rgba(179,136,255,0.08); border-radius: 10px; 
      border: 1px solid rgba(179,136,255,0.15);`;

    section.innerHTML = `
      <h3 style="margin: 0 0 10px 0; font-size: 0.95rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-hat-wizard" style="color: #b388ff;"></i> Class Specialization
        ${classUnlocked ? '' : '<span style="font-size:0.7rem;color:var(--text-secondary);font-weight:normal;">(Unlocks at level 15)</span>'}
      </h3>
      ${classUnlocked ? `
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${CLASSES.map(c => `
          <button class="class-select-btn" data-class="${c.id}" 
            style="flex:1;min-width:120px;padding:8px 10px;border-radius:8px;cursor:pointer;
            background: ${currentClass?.id === c.id ? `${c.color}33` : 'rgba(40,40,50,0.5)'};
            border: 2px solid ${currentClass?.id === c.id ? c.color : 'rgba(255,255,255,0.1)'};
            color: var(--text-primary);font-family:inherit;font-size:0.82rem;
            transition:all 0.2s ease;text-align:center;">
            <i class="fas ${c.icon}" style="color:${c.color};display:block;font-size:1.2rem;margin-bottom:4px;"></i>
            <strong>${c.name}</strong>
            <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:2px;">${c.description}</div>
          </button>
        `).join('')}
      </div>
      ${currentClass ? `<button id="clear-class-btn" style="margin-top:8px;padding:4px 12px;font-size:0.75rem;
        background:rgba(255,73,97,0.1);border:1px solid rgba(255,73,97,0.2);border-radius:5px;
        color:var(--accent-quaternary);cursor:pointer;font-family:inherit;">
        <i class="fas fa-undo"></i> Remove Class
      </button>` : ''}
      ` : '<p style="text-align:center;color:var(--text-secondary);font-size:0.8rem;margin:0;">Reach level 15 to unlock class specialization</p>'}
    `;

    settingsContent.appendChild(section);

    // Event listeners
    section.querySelectorAll('.class-select-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setChosenClass(btn.dataset.class);
        showNotification ? showNotification(`Class set to ${btn.textContent.trim()}!`, 'success') : null;
        // Refresh section
        section.remove();
        addClassSelectionToSettings();
      });
    });

    const clearBtn = document.getElementById('clear-class-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        clearChosenClass();
        showNotification ? showNotification('Class removed', 'info') : null;
        section.remove();
        addClassSelectionToSettings();
      });
    }
  }

  function addStatTitlesToStats() {
    // Add stat milestone titles below each stat card
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach(card => {
      const statName = card.dataset.stat;
      if (!statName) return;

      // Check if already added
      if (card.querySelector('.stat-milestone-title')) return;

      const valueEl = document.getElementById(statName);
      if (!valueEl) return;

      const value = parseInt(valueEl.textContent) || 1;
      const titleInfo = getStatTitle(value);

      const titleEl = document.createElement('div');
      titleEl.className = 'stat-milestone-title';
      titleEl.style.cssText = `
        font-size: 0.7rem; color: ${titleInfo.color}; margin-top: 4px;
        font-weight: 600; text-align: center; opacity: 0.8;
        transition: all 0.3s ease;
      `;
      titleEl.textContent = `⚡ ${titleInfo.title}`;

      card.appendChild(titleEl);

      // Update when stat changes
      const observer = new MutationObserver(() => {
        const newVal = parseInt(valueEl.textContent) || 1;
        const newTitle = getStatTitle(newVal);
        titleEl.textContent = `⚡ ${newTitle.title}`;
        titleEl.style.color = newTitle.color;
      });
      observer.observe(valueEl, { childList: true, characterData: true, subtree: true });
    });
  }

  function addLevelPerksDisplay() {
    const levelUpSection = document.querySelector('.level-up');
    if (!levelUpSection || document.getElementById('level-perks')) return;

    const level = parseInt(document.getElementById('current-level')?.textContent || '0');
    const perks = getPerksForLevel(level);
    const nextPerk = getNextPerk(level);

    const perksEl = document.createElement('div');
    perksEl.id = 'level-perks';
    perksEl.style.cssText = 'margin-top: 10px; padding: 8px 12px; background: rgba(74,144,226,0.05); border-radius: 8px;';

    if (perks.length > 0) {
      const unlocked = perks.filter(p => p.perk);
      if (unlocked.length > 0) {
        perksEl.innerHTML = `
          <div style="font-size:0.72rem;color:var(--text-secondary);margin-bottom:4px;">Unlocked Perks:</div>
          <div style="display:flex;flex-wrap:wrap;gap:4px;">
            ${unlocked.map(p => `
              <span style="font-size:0.7rem;padding:2px 8px;background:rgba(74,144,226,0.12);
                border-radius:10px;color:var(--accent-primary);">
                <i class="fas fa-check-circle" style="font-size:0.6rem;"></i> ${p.perk}
              </span>
            `).join('')}
          </div>
        `;
      }
    }

    if (nextPerk) {
      perksEl.innerHTML += `
        <div style="font-size:0.7rem;color:var(--text-secondary);margin-top:6px;">
          Next at level ${nextPerk.level}: <span style="color:var(--accent-tertiary);">${nextPerk.title}</span> — ${nextPerk.perk}
        </div>
      `;
    }

    levelUpSection.appendChild(perksEl);
  }

  function addStreakBonusDisplay() {
    const streakContainer = document.querySelector('.streak-container');
    if (!streakContainer || document.getElementById('streak-bonus-display')) return;

    const streak = parseInt(document.getElementById('current-streak')?.textContent || '0');
    const bonus = getStreakStatBonus(streak);

    if (bonus <= 1.0) return;

    const bonusEl = document.createElement('div');
    bonusEl.id = 'streak-bonus-display';
    bonusEl.style.cssText = `
      margin-top: 8px; padding: 6px 12px; 
      background: linear-gradient(135deg, rgba(255,209,102,0.08), rgba(255,146,43,0.08));
      border-radius: 8px; border: 1px solid rgba(255,209,102,0.15);
      font-size: 0.78rem; color: var(--accent-tertiary);
      display: flex; align-items: center; gap: 8px;
    `;
    bonusEl.innerHTML = `
      <i class="fas fa-chart-line"></i>
      Streak Bonus: <strong>+${getDisplayStatBonus(streak)}%</strong> to all stats
    `;

    streakContainer.appendChild(bonusEl);
  }

  // ─── INIT ───

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        addStatTitlesToStats();
        addLevelPerksDisplay();
        addStreakBonusDisplay();
        // Class selection in settings - wait for settings modal
        setTimeout(addClassSelectionToSettings, 3000);
        
        // Apply stat decay on load
        applyStatDecay();
      });
    } else {
      addStatTitlesToStats();
      addLevelPerksDisplay();
      addStreakBonusDisplay();
      setTimeout(addClassSelectionToSettings, 3000);
      applyStatDecay();
    }
  }

  // ─── EXPORTS ───

  window.StatsEnhanced = {
    LEVEL_PERKS,
    STAT_MILESTONES,
    CLASSES,
    getPerksForLevel,
    getNextPerk,
    getXPBoost,
    getStatTitle,
    getStatTitleFor,
    getStreakStatBonus,
    getDisplayStatBonus,
    getChosenClass,
    setChosenClass,
    clearChosenClass,
    getClassBonuses,
    animateStatBar,
    applyStatDecay,
  };

  init();
  console.log('[StatsEnhanced] Level-up perks, stat milestones, classes, and streak bonuses loaded');

})();
