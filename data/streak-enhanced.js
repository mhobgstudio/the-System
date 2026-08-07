/* ═══════════════════════════════════════════════
 * Solo Leveling System — Streak Enhancement Module
 * Streak freezes, milestone rewards, weekly challenges,
 * streak journal, and expanded cultivation titles
 * ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── EXPANDED STREAK TITLES (finer gradations) ───

  const EXPANDED_STREAK_TITLES = [
    { days: 0, title: 'Mortal', bonus: 0 },
    { days: 1, title: 'Qi Condensation (练气期)', bonus: 0 },
    { days: 2, title: 'Qi Refining', bonus: 0 },
    { days: 3, title: 'Quasi Apprentice', bonus: 5 },
    { days: 4, title: 'Spirit Awakening', bonus: 0 },
    { days: 5, title: 'Foundation Establishment (筑基期)', bonus: 10 },
    { days: 7, title: 'Apprentice', bonus: 25 },
    { days: 10, title: 'Core Formation (金丹期)', bonus: 50 },
    { days: 14, title: 'Quasi Student', bonus: 75 },
    { days: 18, title: 'Nascent Soul (元婴期)', bonus: 100 },
    { days: 21, title: 'Student', bonus: 150 },
    { days: 25, title: 'Spirit Transformation (化神期)', bonus: 200 },
    { days: 30, title: 'Quasi Master', bonus: 300 },
    { days: 45, title: 'Void Refinement (炼虚期)', bonus: 500 },
    { days: 60, title: 'Master', bonus: 750 },
    { days: 75, title: 'Body Integration (合体期)', bonus: 1000 },
    { days: 90, title: 'Quasi Grand Master', bonus: 1500 },
    { days: 105, title: 'Mahayana (大乘期)', bonus: 2000 },
    { days: 120, title: 'Grand Master', bonus: 2500 },
    { days: 135, title: 'Tribulation Transcendence (渡劫期)', bonus: 3000 },
    { days: 150, title: 'Quasi Great Grand Master', bonus: 4000 },
    { days: 180, title: 'Great Grand Master', bonus: 5000 },
    { days: 210, title: 'True Immortal (真仙)', bonus: 7500 },
    { days: 250, title: 'Golden Immortal (金仙)', bonus: 10000 },
    { days: 280, title: 'Taiyi Jade Immortal (太乙玉仙)', bonus: 15000 },
    { days: 310, title: 'Daluo Golden Immortal (大罗金仙)', bonus: 20000 },
    { days: 330, title: 'Immortal', bonus: 25000 },
    { days: 350, title: 'Half-Step Dao', bonus: 30000 },
    { days: 365, title: 'Dao Ancestor (道祖)', bonus: 50000 },
  ];

  function getStreakTitleAndBonus(streak) {
    let current = EXPANDED_STREAK_TITLES[0];
    for (const t of EXPANDED_STREAK_TITLES) {
      if (streak >= t.days) current = t;
    }
    return current;
  }

  // ─── STREAK FREEZES ───

  const FREEZE_STORAGE = 'sl_streak_freezes';
  const FREEZE_WEEK_KEY = 'sl_freeze_week';

  function getFreezeCount() {
    return parseInt(localStorage.getItem(FREEZE_STORAGE) || '1'); // Start with 1 freeze
  }

  function setFreezeCount(n) {
    localStorage.setItem(FREEZE_STORAGE, String(n));
  }

  function getFreezeWeek() {
    return parseInt(localStorage.getItem(FREEZE_WEEK_KEY) || '0');
  }

  function getCurrentWeek() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const diff = now.getTime() - start.getTime();
    return Math.ceil(diff / 604800000); // Week number
  }

  function refreshFreezeIfNewWeek() {
    const currentWeek = getCurrentWeek();
    const lastWeek = getFreezeWeek();
    if (currentWeek !== lastWeek) {
      setFreezeCount(1); // Refresh 1 freeze per week
      localStorage.setItem(FREEZE_WEEK_KEY, String(currentWeek));
    }
  }

  function useFreeze() {
    const count = getFreezeCount();
    if (count <= 0) return false;
    setFreezeCount(count - 1);
    return true;
  }

  // ─── MILESTONE REWARD BONUSES ───

  const MILESTONE_REWARDS = [
    { days: 3, xp: 25, label: '3-day Streak: +25 XP' },
    { days: 7, xp: 100, label: '7-day Streak: +100 XP' },
    { days: 14, xp: 250, label: '14-day Streak: +250 XP' },
    { days: 21, xp: 500, label: '21-day Streak: +500 XP' },
    { days: 30, xp: 1000, label: '30-day Streak: +1000 XP' },
    { days: 50, xp: 2500, label: '50-day Streak: +2500 XP' },
    { days: 100, xp: 5000, label: '100-day Streak: +5000 XP' },
    { days: 180, xp: 10000, label: '180-day Streak: +10000 XP' },
    { days: 365, xp: 50000, label: '365-day Streak: +50000 XP 🏆' },
  ];

  const MILESTONE_CLAIM_KEY = 'sl_milestone_claimed';

  function getClaimedMilestones() {
    try { return JSON.parse(localStorage.getItem(MILESTONE_CLAIM_KEY) || '[]'); }
    catch { return []; }
  }

  function claimMilestone(days) {
    const claimed = getClaimedMilestones();
    if (claimed.includes(days)) return null;
    const reward = MILESTONE_REWARDS.find(r => r.days === days);
    if (!reward) return null;
    claimed.push(days);
    localStorage.setItem(MILESTONE_CLAIM_KEY, JSON.stringify(claimed));
    return reward;
  }

  function getAvailableMilestones(streak) {
    return MILESTONE_REWARDS.filter(r => streak >= r.days && !getClaimedMilestones().includes(r.days));
  }

  // ─── WEEKLY CHALLENGES ───

  const WEEKLY_CHALLENGE_KEY = 'sl_weekly_challenge';

  const WEEKLY_CHALLENGES = [
    { id: 'spiritual-7', title: 'Spiritual Devotion', desc: 'Complete 7 spiritual quests this week', category: 'spiritual', count: 7, rewardXp: 1000 },
    { id: 'fitness-5', title: 'Iron Body', desc: 'Complete 5 fitness quests this week', category: 'fitness', count: 5, rewardXp: 1000 },
    { id: 'learning-7', title: 'Knowledge Seeker', desc: 'Complete 7 learning quests this week', category: 'learning', count: 7, rewardXp: 1000 },
    { id: 'work-5', title: 'Grind Mode', desc: 'Complete 5 work quests this week', category: 'work', count: 5, rewardXp: 1000 },
    { id: 'health-5', title: 'Vitality', desc: 'Complete 5 health quests this week', category: 'health', count: 5, rewardXp: 1000 },
    { id: 'total-20', title: 'Workhorse', desc: 'Complete 20 total quests this week', category: 'any', count: 20, rewardXp: 2000 },
    { id: 'streak-7', title: 'Unbroken', desc: 'Maintain your streak all week', category: 'any', count: 7, rewardXp: 1500 },
  ];

  function getWeeklyChallenge() {
    const week = getCurrentWeek();
    const stored = localStorage.getItem(WEEKLY_CHALLENGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.week === week) return parsed;
      } catch {}
    }

    // Generate new challenge for this week
    const challenge = WEEKLY_CHALLENGES[week % WEEKLY_CHALLENGES.length];
    const weeklyChallenge = {
      week,
      ...challenge,
      progress: 0,
      completed: false,
      claimed: false,
    };
    localStorage.setItem(WEEKLY_CHALLENGE_KEY, JSON.stringify(weeklyChallenge));
    return weeklyChallenge;
  }

  function updateWeeklyChallengeProgress(category) {
    const challenge = getWeeklyChallenge();
    if (challenge.completed || challenge.claimed) return challenge;

    if (challenge.category === 'any' || challenge.category === category) {
      challenge.progress = (challenge.progress || 0) + 1;
      if (challenge.progress >= challenge.count) {
        challenge.completed = true;
      }
      localStorage.setItem(WEEKLY_CHALLENGE_KEY, JSON.stringify(challenge));
    }
    return challenge;
  }

  function claimWeeklyReward() {
    const challenge = getWeeklyChallenge();
    if (!challenge.completed || challenge.claimed) return null;
    challenge.claimed = true;
    localStorage.setItem(WEEKLY_CHALLENGE_KEY, JSON.stringify(challenge));
    return challenge.rewardXp;
  }

  // ─── STREAK JOURNAL ───

  const JOURNAL_KEY = 'sl_streak_journal';

  function getStreakJournal() {
    try { return JSON.parse(localStorage.getItem(JOURNAL_KEY) || '[]'); }
    catch { return []; }
  }

  function addJournalEntry(streakDay, completedQuests, categories) {
    const journal = getStreakJournal();
    const today = new Date().toISOString().split('T')[0];
    const existing = journal.find(e => e.date === today);
    if (existing) {
      // Merge into today's entry — keep the latest daily totals accurate
      existing.streakDay = streakDay;
      existing.completed = completedQuests;
      existing.categories = [...new Set([...(existing.categories || []), ...(categories || [])])];
      localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
      return;
    }
    journal.unshift({
      date: today,
      streakDay,
      completed: completedQuests,
      categories: categories || [],
    });
    // Keep last 365 entries
    if (journal.length > 365) journal.length = 365;
    localStorage.setItem(JOURNAL_KEY, JSON.stringify(journal));
  }

  // ─── UI COMPONENTS ───

  function addStreakFreezeUI() {
    const streakContainer = document.querySelector('.streak-container');
    if (!streakContainer || document.getElementById('streak-freeze-btn')) return;

    refreshFreezeIfNewWeek();
    const freezes = getFreezeCount();

    const freezeEl = document.createElement('div');
    freezeEl.id = 'streak-freeze-btn';
    freezeEl.style.cssText = `
      margin-top: 6px; display: flex; align-items: center; gap: 8px;
      padding: 4px 10px; background: rgba(78,205,196,0.08);
      border-radius: 6px; cursor: pointer; transition: all 0.2s ease;
      font-size: 0.78rem;
    `;
    freezeEl.innerHTML = `
      <i class="fas fa-snowflake" style="color:var(--accent-secondary);"></i>
      <span>Streak Freezes: <strong id="freeze-count">${freezes}</strong></span>
      <span style="font-size:0.65rem;color:var(--text-secondary);opacity:0.7;">(refreshes weekly)</span>
    `;
    freezeEl.title = freezes > 0 ? 'Click to use a freeze (preserves streak if you miss a day)' : 'No freezes available. Refreshes weekly.';

    freezeEl.addEventListener('click', () => {
      if (getFreezeCount() > 0) {
        if (confirm('Use a streak freeze? This will protect your streak if you miss today.')) {
          useFreeze();
          document.getElementById('freeze-count').textContent = getFreezeCount();
          showNotification ? showNotification('❄️ Streak freeze activated for today!', 'success') : null;
        }
      } else {
        showNotification ? showNotification('No freezes left. Check back next week!', 'info') : null;
      }
    });

    streakContainer.appendChild(freezeEl);
  }

  function addMilestoneRewardsUI() {
    const streakContainer = document.querySelector('.streak-container');
    if (!streakContainer || document.getElementById('milestone-rewards-section')) return;

    const streak = parseInt(document.getElementById('current-streak')?.textContent || '0');
    const available = getAvailableMilestones(streak);

    if (available.length === 0) return;

    const section = document.createElement('div');
    section.id = 'milestone-rewards-section';
    section.style.cssText = `
      margin-top: 8px; padding: 8px 12px;
      background: linear-gradient(135deg, rgba(255,209,102,0.06), rgba(255,146,43,0.06));
      border-radius: 8px; border: 1px solid rgba(255,209,102,0.12);
    `;

    section.innerHTML = `
      <div style="font-size:0.72rem;color:var(--accent-tertiary);margin-bottom:6px;font-weight:600;">
        <i class="fas fa-gift"></i> Milestone Rewards Available
      </div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${available.map(r => `
          <button class="claim-milestone-btn" data-days="${r.days}"
            style="padding:4px 10px;background:rgba(255,209,102,0.1);border:1px solid rgba(255,209,102,0.2);
            border-radius:6px;cursor:pointer;color:var(--text-primary);font-family:inherit;
            font-size:0.75rem;transition:all 0.2s ease;">
            <i class="fas fa-star" style="color:var(--accent-tertiary);"></i> ${r.label}
          </button>
        `).join('')}
      </div>
    `;

    streakContainer.appendChild(section);

    section.querySelectorAll('.claim-milestone-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const days = parseInt(btn.dataset.days);
        const reward = claimMilestone(days);
        if (reward && typeof db !== 'undefined') {
          // Add XP to player — must update the shared currentXP global or the
          // next quest completion will overwrite stats.xp and silently lose the reward.
          const stats = await db.playerStats.toArray();
          if (stats.length) {
            currentXP = (typeof currentXP === 'number' ? currentXP : (stats[0].xp || 0)) + reward.xp;
            stats[0].xp = currentXP;
            await db.playerStats.put(stats[0]);
            if (typeof updateXP === 'function') updateXP();
            if (typeof checkAchievements === 'function') checkAchievements();
            if (typeof renderAchievements === 'function') renderAchievements();
            if (typeof renderQuests === 'function') renderQuests();
          }
          showNotification ? showNotification(`🏆 ${reward.label} claimed!`, 'success') : null;
          btn.disabled = true;
          btn.style.opacity = '0.5';
          btn.textContent = '✓ Claimed';
        }
      });
    });
  }

  function addWeeklyChallengeUI() {
    const pomodoroContainer = document.querySelector('.pomodoro-container');
    if (!pomodoroContainer || document.getElementById('weekly-challenge-box')) return;

    const challenge = getWeeklyChallenge();
    const progress = challenge.progress || 0;
    const pct = Math.min(100, (progress / challenge.count) * 100);

    const box = document.createElement('div');
    box.id = 'weekly-challenge-box';
    box.style.cssText = `
      margin-top: 12px; padding: 12px 16px;
      background: rgba(179,136,255,0.06); border: 1px solid rgba(179,136,255,0.15);
      border-radius: 10px;
    `;

    box.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
        <div>
          <div style="font-size:0.8rem;font-weight:600;color:var(--accent-quinary);">
            <i class="fas fa-calendar-week"></i> Weekly Challenge
          </div>
          <div style="font-size:0.72rem;color:var(--text-secondary);margin-top:2px;">
            ${challenge.desc}
          </div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:1rem;font-weight:700;color:${challenge.completed ? 'var(--accent-green)' : 'var(--accent-quinary)'}">
            ${progress}/${challenge.count}
          </div>
          <div style="font-size:0.65rem;color:var(--text-secondary);">${pct}%</div>
        </div>
      </div>
      <div style="height:4px;background:rgba(255,255,255,0.06);border-radius:2px;overflow:hidden;">
        <div style="height:100%;width:${pct}%;background:linear-gradient(90deg,var(--accent-quinary),var(--accent-primary));border-radius:2px;transition:width 0.5s ease;"></div>
      </div>
      ${challenge.completed && !challenge.claimed ? `
        <button id="claim-weekly-btn"
          style="margin-top:8px;padding:6px 14px;width:100%;background:linear-gradient(135deg,var(--accent-quinary),var(--accent-primary));
          border:none;border-radius:8px;color:white;cursor:pointer;font-family:inherit;font-size:0.82rem;font-weight:600;">
          <i class="fas fa-gift"></i> Claim Reward (${challenge.rewardXp} XP)
        </button>
      ` : challenge.claimed ? `
        <div style="margin-top:8px;text-align:center;font-size:0.72rem;color:var(--accent-green);">
          <i class="fas fa-check-circle"></i> Reward claimed!
        </div>
      ` : ''}
    `;

    // Insert after pomodoro container
    pomodoroContainer.parentNode.insertBefore(box, pomodoroContainer.nextSibling);

    const claimBtn = document.getElementById('claim-weekly-btn');
    if (claimBtn) {
      claimBtn.addEventListener('click', async () => {
        const xp = claimWeeklyReward();
        if (xp && typeof db !== 'undefined') {
          const stats = await db.playerStats.toArray();
          if (stats.length) {
            currentXP = (typeof currentXP === 'number' ? currentXP : (stats[0].xp || 0)) + xp;
            stats[0].xp = currentXP;
            await db.playerStats.put(stats[0]);
            if (typeof updateXP === 'function') updateXP();
            if (typeof checkAchievements === 'function') checkAchievements();
            if (typeof renderAchievements === 'function') renderAchievements();
            if (typeof renderQuests === 'function') renderQuests();
          }
          showNotification ? showNotification(`🏆 Weekly reward claimed: +${xp} XP!`, 'success') : null;
          box.remove();
          addWeeklyChallengeUI();
        }
      });
    }
  }

  function updateWeeklyProgress(category) {
    const challenge = updateWeeklyChallengeProgress(category);
    // Re-render the weekly challenge UI if visible
    const existing = document.getElementById('weekly-challenge-box');
    if (existing) {
      existing.remove();
      addWeeklyChallengeUI();
    }
  }

  // ─── INTEGRATION ───

  // Hook into daily streak check to apply freezes
  async function checkStreakWithFreeze() {
    if (typeof db === 'undefined') return;
    try {
      const stats = await db.playerStats.toArray();
      if (!stats.length) return;
      const player = stats[0];
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // Check if streak was about to break
      const lastActive = player.lastActive ? new Date(player.lastActive) : null;
      if (!lastActive) return;

      const daysSince = Math.floor((today.getTime() - new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate()).getTime()) / 86400000);

      if (daysSince >= 1 && player.currentStreak > 0) {
        // Streak might break! Check for freeze
        refreshFreezeIfNewWeek();
        if (getFreezeCount() > 0) {
          useFreeze();
          // Preserve streak by faking activity
          player.lastActive = now;
          await db.playerStats.put(player);
          if (typeof showNotification === 'function') {
            showNotification('❄️ Streak freeze used! Your streak is preserved.', 'success');
          }
        }
      }
    } catch (e) {
      console.warn('[StreakEnhanced] Freeze check error:', e);
    }
  }

  async function logStreakJournalEntry() {
    if (typeof db === 'undefined') return;
    try {
      const allQuests = await db.quests.toArray();
      const completedToday = allQuests.filter(q => {
        if (!q.completedAt) return false;
        const completedDate = new Date(q.completedAt).toISOString().split('T')[0];
        return completedDate === new Date().toISOString().split('T')[0];
      });
      const stats = await db.playerStats.toArray();
      const streak = stats[0]?.currentStreak || 0;
      const categories = [...new Set(completedToday.map(q => q.category).filter(Boolean))];
      addJournalEntry(streak, completedToday.length, categories);
    } catch (e) {}
  }

  function updateEliteStreakTitle() {
    const titleEl = document.getElementById('streak-title');
    const cs = document.getElementById('current-streak');
    if (!titleEl || !cs) return;

    const val = parseInt(cs.textContent) || 0;
    const info = getStreakTitleAndBonus(val);
    titleEl.textContent = `(${info.title})`;
    titleEl.title = info.bonus > 0 ? `+${info.bonus} XP bonus at this rank` : info.title;
  }

  // Override the inline index.html observer by taking control
  function overrideStreakTitleObserver() {
    const cs = document.getElementById('current-streak');
    if (!cs) return;
    // Disconnect any existing observers by replacing the element
    // Use our own simpler approach: poll on changes
    let lastVal = parseInt(cs.textContent) || 0;
    setInterval(() => {
      const newVal = parseInt(cs.textContent) || 0;
      if (newVal !== lastVal) {
        lastVal = newVal;
        updateEliteStreakTitle();
      }
    }, 1000);
  }

  // ─── INIT ───

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        // Override streak title with our expanded version
        overrideStreakTitleObserver();

        // Auto-check streak freeze on load (before app.js streak check runs)
        checkStreakWithFreeze();

        // Add UIs
        setTimeout(addStreakFreezeUI, 500);
        setTimeout(addMilestoneRewardsUI, 1000);
        setTimeout(addWeeklyChallengeUI, 1500);
      });
    } else {
      overrideStreakTitleObserver();
      checkStreakWithFreeze();
      setTimeout(addStreakFreezeUI, 500);
      setTimeout(addMilestoneRewardsUI, 1000);
      setTimeout(addWeeklyChallengeUI, 1500);
    }

    console.log('[StreakEnhanced] Freezes, milestones, challenges, journal, and expanded titles loaded');
  }

  // ─── EXPORTS ───

  window.StreakEnhanced = {
    EXPANDED_STREAK_TITLES,
    getStreakTitleAndBonus,
    getFreezeCount,
    useFreeze,
    refreshFreezeIfNewWeek,
    getAvailableMilestones,
    claimMilestone,
    getWeeklyChallenge,
    updateWeeklyChallengeProgress,
    claimWeeklyReward,
    updateWeeklyProgress,
    getStreakJournal,
    addJournalEntry,
    checkStreakWithFreeze,
    logStreakJournalEntry,
  };

  init();

})();
