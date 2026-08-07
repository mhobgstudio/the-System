/* ═══════════════════════════════════════════════
 * Solo Leveling System — Enhanced Pomodoro Module
 * Custom durations, stats, auto-break, distraction log, session counter
 * ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  const POM_STORAGE = {
    CUSTOM_WORK: 'sl_pom_custom_work',
    CUSTOM_BREAK: 'sl_pom_custom_break',
    STATS: 'sl_pom_stats',
    DAILY: 'sl_pom_daily',
  };

  // ─── CUSTOM DURATIONS ───

  function getCustomWork() {
    return parseInt(localStorage.getItem(POM_STORAGE.CUSTOM_WORK) || '25');
  }

  function getCustomBreak() {
    return parseInt(localStorage.getItem(POM_STORAGE.CUSTOM_BREAK) || '5');
  }

  function setCustomWork(min) {
    localStorage.setItem(POM_STORAGE.CUSTOM_WORK, String(Math.max(1, Math.min(120, min))));
  }

  function setCustomBreak(min) {
    localStorage.setItem(POM_STORAGE.CUSTOM_BREAK, String(Math.max(1, Math.min(60, min))));
  }

  // ─── POMODORO STATISTICS ───

  function getStats() {
    try {
      return JSON.parse(localStorage.getItem(POM_STORAGE.STATS) || '{}');
    } catch { return {}; }
  }

  function saveStats(stats) {
    localStorage.setItem(POM_STORAGE.STATS, JSON.stringify(stats));
  }

  function getTodayKey() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  }

  function getDailyStats() {
    try {
      return JSON.parse(localStorage.getItem(POM_STORAGE.DAILY) || '{}');
    } catch { return {}; }
  }

  function saveDailyStats(daily) {
    localStorage.setItem(POM_STORAGE.DAILY, JSON.stringify(daily));
  }

  function recordSession(mode, duration) {
    // Update global stats
    const stats = getStats();
    stats.totalSessions = (stats.totalSessions || 0) + 1;
    stats.totalMinutes = (stats.totalMinutes || 0) + duration;
    const today = getTodayKey();
    stats.lastSession = today;
    saveStats(stats);

    // Update daily stats
    const daily = getDailyStats();
    daily[today] = daily[today] || { sessions: 0, minutes: 0 };
    daily[today].sessions++;
    daily[today].minutes += duration;
    saveDailyStats(daily);

    // Note: the base timer (initializePomodoro) already increments
    // playerStats.pomodoroCompleted on completion — we must NOT double-count it.
  }

  function getTodaySessions() {
    const daily = getDailyStats();
    const today = getTodayKey();
    return daily[today]?.sessions || 0;
  }

  function getTodayMinutes() {
    const daily = getDailyStats();
    const today = getTodayKey();
    return daily[today]?.minutes || 0;
  }

  function getSessionStats() {
    const stats = getStats();
    return {
      total: stats.totalSessions || 0,
      minutes: stats.totalMinutes || 0,
      lastSession: stats.lastSession || null,
      today: getTodaySessions(),
      todayMinutes: getTodayMinutes(),
    };
  }

  // ─── DISTRACTION LOG ───

  function logDistraction(reason) {
    if (!reason || !reason.trim()) return;
    try {
      const logs = JSON.parse(localStorage.getItem('sl_distractions') || '[]');
      logs.push({
        timestamp: new Date().toISOString(),
        reason: reason.trim(),
      });
      // Keep last 50
      if (logs.length > 50) logs.splice(0, logs.length - 50);
      localStorage.setItem('sl_distractions', JSON.stringify(logs));
    } catch (e) {}
  }

  function getDistractionLogs() {
    try {
      return JSON.parse(localStorage.getItem('sl_distractions') || '[]');
    } catch { return []; }
  }

  // ─── AUTO-START BREAK ───

  let autoStartTimer = null;

  function scheduleAutoStart(delayMs = 3000) {
    clearTimeout(autoStartTimer);
    autoStartTimer = setTimeout(() => {
      // Click the break mode button to start the break (works with custom durations too)
      const breakBtn = [...document.querySelectorAll('.timer-mode')]
        .find(b => /^break/i.test((b.textContent || '').trim()))
        || document.querySelector('.timer-mode[data-time="5"]');
      if (breakBtn) {
        breakBtn.click();
        const startBtn = document.getElementById('start-timer');
        if (startBtn) startBtn.click();
      }
    }, delayMs);
  }

  function cancelAutoStart() {
    clearTimeout(autoStartTimer);
  }

  // ─── UI INTEGRATION ───

  function addCustomDurationUI() {
    const container = document.querySelector('.pomodoro-container');
    if (!container) return;

    // Avoid duplicates
    if (document.getElementById('pom-custom-section')) return;

    const customSection = document.createElement('div');
    customSection.id = 'pom-custom-section';
    customSection.style.cssText = `
      margin-top: 10px; padding: 8px 12px;
      background: rgba(40,40,50,0.4); border-radius: 8px;
      display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
    `;

    customSection.innerHTML = `
      <button id="pom-custom-btn" class="timer-mode" data-custom="true"
        style="font-size:0.78rem;padding:3px 10px;">
        <i class="fas fa-sliders-h"></i> Custom
      </button>
      <div id="pom-custom-controls" style="display:none;flex:1;gap:8px;align-items:center;flex-wrap:wrap;">
        <label style="font-size:0.75rem;color:var(--text-secondary);">Work:</label>
        <input type="number" id="pom-custom-work" min="1" max="120" value="${getCustomWork()}"
          style="width:50px;padding:3px 6px;border-radius:4px;border:1px solid rgba(78,205,196,0.2);
          background:rgba(40,40,50,0.7);color:var(--text-primary);font-size:0.8rem;">
        <span style="font-size:0.7rem;color:var(--text-secondary);">min</span>
        <label style="font-size:0.75rem;color:var(--text-secondary);">Break:</label>
        <input type="number" id="pom-custom-break" min="1" max="60" value="${getCustomBreak()}"
          style="width:50px;padding:3px 6px;border-radius:4px;border:1px solid rgba(78,205,196,0.2);
          background:rgba(40,40,50,0.7);color:var(--text-primary);font-size:0.8rem;">
        <span style="font-size:0.7rem;color:var(--text-secondary);">min</span>
        <button id="pom-custom-apply" class="glow-button"
          style="padding:3px 10px;font-size:0.72rem;background:rgba(74,144,226,0.15);border:1px solid rgba(74,144,226,0.3);
          border-radius:5px;cursor:pointer;color:var(--text-primary);font-family:inherit;">Apply</button>
      </div>
    `;

    container.appendChild(customSection);

    // Event listeners
    const customBtn = document.getElementById('pom-custom-btn');
    const controls = document.getElementById('pom-custom-controls');

    customBtn?.addEventListener('click', () => {
      controls.style.display = controls.style.display === 'none' ? 'flex' : 'none';
      customBtn.classList.toggle('active');
    });

    const applyBtn = document.getElementById('pom-custom-apply');
    applyBtn?.addEventListener('click', () => {
      const work = parseInt(document.getElementById('pom-custom-work').value) || 25;
      const breakT = parseInt(document.getElementById('pom-custom-break').value) || 5;
      setCustomWork(work);
      setCustomBreak(breakT);

      // Click the work mode button to set the timer
      const workBtn = document.querySelector('.timer-mode[data-time="25"]');
      if (workBtn) {
        workBtn.dataset.time = String(work);
        workBtn.textContent = `Work (${work}m)`;
        workBtn.click();
      }

      // Update break mode button
      const breakBtn = document.querySelector('.timer-mode[data-time="5"]');
      if (breakBtn) {
        breakBtn.dataset.time = String(breakT);
        breakBtn.textContent = `Break (${breakT}m)`;
      }

      controls.style.display = 'none';
      customBtn.classList.remove('active');
      showNotification ? showNotification(`Timer set: ${work}min work / ${breakT}min break`, 'success') : null;
    });
  }

  function addSessionCounterUI() {
    // Add session counter near the timer display
    const timerDisplay = document.querySelector('.timer-display');
    if (!timerDisplay) return;

    // Check if already exists
    if (document.getElementById('pom-session-counter')) return;

    const counter = document.createElement('div');
    counter.id = 'pom-session-counter';
    counter.style.cssText = `
      display: flex; align-items: center; justify-content: center; gap: 16px;
      margin-top: 6px; font-size: 0.78rem; color: var(--text-secondary);
    `;

    const stats = getSessionStats();
    counter.innerHTML = `
      <span><i class="fas fa-clock"></i> Today: <strong id="pom-today-count">${stats.today}</strong> sessions</span>
      <span><i class="fas fa-hourglass-half"></i> <strong id="pom-today-minutes">${stats.todayMinutes}</strong> min</span>
      <span><i class="fas fa-history"></i> Total: <strong>${stats.total}</strong></span>
    `;

    timerDisplay.parentNode.insertBefore(counter, timerDisplay.nextSibling);
  }

  function addDistractionLogUI() {
    // Create a distraction popup that appears when pausing during work
    const popup = document.createElement('div');
    popup.id = 'pom-distraction-popup';
    popup.style.cssText = `
      display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%);
      background: rgba(16,18,28,0.96); border: 1px solid rgba(255,73,97,0.3);
      border-radius: 12px; padding: 20px; z-index: 10002;
      min-width: 300px; box-shadow: 0 20px 60px rgba(0,0,0,0.8);
      backdrop-filter: blur(12px);
    `;
    popup.innerHTML = `
      <div style="margin-bottom:12px;">
        <h4 style="margin:0 0 4px 0;color:var(--accent-quaternary);font-size:0.95rem;">
          <i class="fas fa-comment-slash"></i> What distracted you?
        </h4>
        <p style="margin:0;color:var(--text-secondary);font-size:0.78rem;">
          Logging distractions helps you identify patterns
        </p>
      </div>
      <input type="text" id="pom-distraction-input" class="quest-input"
        placeholder="e.g., phone notification, email, noise..."
        style="width:100%;box-sizing:border-box;margin-bottom:10px;">
      <div style="display:flex;gap:8px;justify-content:flex-end;">
        <button id="pom-distraction-skip" class="glow-button"
          style="padding:6px 14px;font-size:0.8rem;background:rgba(255,255,255,0.1);border:1px solid rgba(255,255,255,0.1);
          border-radius:6px;cursor:pointer;color:var(--text-secondary);font-family:inherit;">Skip</button>
        <button id="pom-distraction-log" class="glow-button"
          style="padding:6px 14px;font-size:0.8rem;background:rgba(255,73,97,0.2);border:1px solid rgba(255,73,97,0.3);
          border-radius:6px;cursor:pointer;color:var(--accent-quaternary);font-family:inherit;">Log It</button>
      </div>
    `;
    document.body.appendChild(popup);

    // Hook into pause button
    const pauseBtn = document.getElementById('pause-timer');
    if (pauseBtn && !pauseBtn.dataset.hooked) {
      pauseBtn.dataset.hooked = 'true';
      pauseBtn.addEventListener('click', () => {
        // Respect the distraction-log setting (settings modal toggle)
        if (localStorage.getItem('sl_pom_distraction_log') === 'false') return;
        // Only show distraction log if we're in work mode
        const isWork = parseInt(document.querySelector('.timer-mode.active')?.dataset?.time || '25') >= 15;
        if (isWork) {
          showDistractionPopup();
        }
      });
    }
  }

  function showDistractionPopup() {
    const popup = document.getElementById('pom-distraction-popup');
    const input = document.getElementById('pom-distraction-input');
    if (!popup) return;
    popup.style.display = 'block';
    if (input) { input.value = ''; setTimeout(() => input.focus(), 100); }
  }

  function hideDistractionPopup() {
    const popup = document.getElementById('pom-distraction-popup');
    if (popup) popup.style.display = 'none';
  }

  function initDistractionUI() {
    const skipBtn = document.getElementById('pom-distraction-skip');
    const logBtn = document.getElementById('pom-distraction-log');
    const input = document.getElementById('pom-distraction-input');

    skipBtn?.addEventListener('click', hideDistractionPopup);
    logBtn?.addEventListener('click', () => {
      const reason = input?.value || '';
      logDistraction(reason || 'unspecified');
      hideDistractionPopup();
      showNotification ? showNotification('Distraction logged', 'info') : null;
    });
    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') logBtn?.click();
      if (e.key === 'Escape') hideDistractionPopup();
    });
  }

  // ─── AUTO-START HOOK INTO TIMER COMPLETION ───

  // The base timer (initializePomodoro) doesn't show any completion toast, so the
  // old MutationObserver (which watched for a 'Pomodoro' toast) never fired and the
  // enhanced stats + auto-break were dead. Detect finished sessions by watching the
  // pomodoroCompleted counter instead.
  function hookTimerCompletion() {
    if (window.__pomTimerPoll) return;
    window.__pomTimerPoll = true;

    let lastCount = -1; // -1 = not yet baselined
    setInterval(async () => {
      try {
        const arr = await db.playerStats.toArray();
        if (!arr.length) return;
        const count = arr[0].pomodoroCompleted || 0;
        if (lastCount === -1) { lastCount = count; return; } // baseline on first poll
        if (count > lastCount) {
          lastCount = count;
          const activeMode = document.querySelector('.timer-mode.active');
          const mins = parseInt(activeMode?.dataset?.time || '25');
          const isWork = mins >= 15;
          recordSession(isWork ? 'work' : 'break', mins);
          if (isWork) {
            setTimeout(() => {
              if (confirmAutoStart()) {
                showNotification ? showNotification('Break starting in 3...', 'info') : null;
                scheduleAutoStart(3000);
              }
            }, 1000);
          }
          updateSessionCounter();
        } else {
          lastCount = count;
        }
      } catch (e) { /* ignore */ }
    }, 1500);
  }

  function confirmAutoStart() {
    // Check if auto-start is enabled (stored preference)
    return localStorage.getItem('sl_pom_auto_break') !== 'false';
  }

  function updateSessionCounter() {
    const countEl = document.getElementById('pom-today-count');
    const minEl = document.getElementById('pom-today-minutes');
    if (countEl) countEl.textContent = getTodaySessions();
    if (minEl) minEl.textContent = getTodayMinutes();
  }

  // ─── SETTINGS UI FOR POMODORO ───

  function addPomSettings() {
    const settingsContent = document.querySelector('.settings-modal .modal-content');
    if (!settingsContent || document.getElementById('pom-settings-section')) return;

    const section = document.createElement('div');
    section.id = 'pom-settings-section';
    section.style.cssText = 'margin: 12px 0; padding: 12px 16px; background: rgba(78,205,196,0.08); border-radius: 10px; border: 1px solid rgba(78,205,196,0.15);';

    const autoBreak = confirmAutoStart();
    const showDistractions = localStorage.getItem('sl_pom_distraction_log') !== 'false';

    section.innerHTML = `
      <h3 style="margin: 0 0 10px 0; font-size: 0.95rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-clock" style="color: var(--accent-secondary);"></i> Pomodoro Settings
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--text-secondary); font-size: 0.85rem;">
          <input type="checkbox" id="pom-auto-break" ${autoBreak ? 'checked' : ''}>
          Auto-start break after work session
        </label>
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer; color: var(--text-secondary); font-size: 0.85rem;">
          <input type="checkbox" id="pom-distraction-log-toggle" ${showDistractions ? 'checked' : ''}>
          Show distraction log on pause
        </label>
      </div>
    `;

    const authSection = settingsContent.querySelector('.auth-section') || settingsContent.querySelector('#webhook-settings-section');
    if (authSection) {
      authSection.after(section);
    } else {
      settingsContent.appendChild(section);
    }

    document.getElementById('pom-auto-break')?.addEventListener('change', (e) => {
      localStorage.setItem('sl_pom_auto_break', e.target.checked ? 'true' : 'false');
    });
    document.getElementById('pom-distraction-log-toggle')?.addEventListener('change', (e) => {
      localStorage.setItem('sl_pom_distraction_log', e.target.checked ? 'true' : 'false');
    });
  }

  // ─── INIT ───

  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        addCustomDurationUI();
        addSessionCounterUI();
        addDistractionLogUI();
        initDistractionUI();
        hookTimerCompletion();
        setTimeout(addPomSettings, 2000);
      });
    } else {
      addCustomDurationUI();
      addSessionCounterUI();
      addDistractionLogUI();
      initDistractionUI();
      hookTimerCompletion();
      setTimeout(addPomSettings, 2000);
    }
  }

  // ─── EXPORTS ───

  window.PomodoroEnhanced = {
    getCustomWork,
    getCustomBreak,
    setCustomWork,
    setCustomBreak,
    recordSession,
    getSessionStats,
    getTodaySessions,
    getTodayMinutes,
    logDistraction,
    getDistractionLogs,
  };

  init();
  console.log('[Pomodoro] Enhanced module loaded');

})();
