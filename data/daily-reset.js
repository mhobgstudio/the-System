/* ═══════════════════════════════════════════════
 * Solo Leveling System — Daily Quest Reset
 * Automatically resets repeatable daily quests
 * on page load and at midnight
 * ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  const RESET_KEY = 'sl_last_daily_reset';
  const CHECK_INTERVAL = 60000; // Check every 60 seconds

  function getTodayDate() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function isNewDay() {
    const last = localStorage.getItem(RESET_KEY);
    return last !== getTodayDate();
  }

  function markResetDone() {
    localStorage.setItem(RESET_KEY, getTodayDate());
  }

  function startOfToday() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  function startOfThisWeek() {
    const today = startOfToday();
    const day = today.getDay(); // 0=Sun .. 6=Sat
    const daysSinceMonday = (day + 6) % 7;
    const monday = new Date(today);
    monday.setDate(monday.getDate() - daysSinceMonday);
    return monday;
  }

  function startOfThisMonth() {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  }

  // Returns the reset window start for a quest's frequency (or null if never)
  // Undefined frequency on a repeatable quest defaults to daily, matching the
  // 'resets tomorrow' hint shown when re-clicking a completed quest.
  function getFrequencyWindow(frequency) {
    switch (frequency || 'daily') {
      case 'daily':   return startOfToday();
      case 'weekly':  return startOfThisWeek();
      case 'monthly': return startOfThisMonth();
      default:        return null; // 'once' quests stay completed forever
    }
  }

  async function resetDailyQuests() {
    try {
      const quests = await db.quests.toArray();
      let resetCount = 0;

      for (const quest of quests) {
        // Only reset completed repeatable quests whose window has passed
        if (quest.status !== 'completed' || !quest.repeatable) continue;
        const completedAt = quest.completedAt ? new Date(quest.completedAt) : null;
        if (!completedAt) continue;

        const windowStart = getFrequencyWindow(quest.frequency);
        if (!windowStart) continue;

        if (completedAt < windowStart) {
          quest.status = 'inbox';
          quest.completedAt = null;
          await db.quests.put(quest);
          resetCount++;
        }
      }

      if (resetCount > 0) {
        console.log(`[DailyReset] Reset ${resetCount} repeatable quests`);
        // Trigger re-render if the render function exists
        if (typeof renderQuests === 'function') renderQuests();
      }
    } catch (e) {
      console.warn('[DailyReset] Error:', e);
    }
  }

  async function autoReset() {
    if (!isNewDay()) return;
    await resetDailyQuests();
    markResetDone();
  }

  // Check every 60 seconds if the day has changed
  function initDailyReset() {
    // Run on page load
    autoReset();

    // Check periodically for day change
    setInterval(() => {
      autoReset();
    }, CHECK_INTERVAL);

    // Listen for visibility changes (tab becoming active)
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) autoReset();
    });
  }

  // Initialize when DB is ready
  if (typeof db !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initDailyReset);
    } else {
      initDailyReset();
    }
  } else {
    // Wait for db to be available
    let waitCount = 0;
    const waitInterval = setInterval(() => {
      if (typeof db !== 'undefined') {
        clearInterval(waitInterval);
        initDailyReset();
      }
      if (++waitCount > 20) clearInterval(waitInterval); // Give up after ~10s
    }, 500);
  }

})();
