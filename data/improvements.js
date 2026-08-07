/* ═══════════════════════════════════════════════
 * Solo Leveling System — Improvements Module
 * Auto-save ┃ Keyboard shortcuts ┃ Debounced search
 * Data validation ┃ XSS-safe rendering
 * ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  /* ─── 1. AUTO-SAVE (every 60s) ─── */
  function initAutoSave() {
    if (typeof saveGame !== 'function') return;
    setInterval(() => {
      try { saveGame(); } catch(e) { console.warn('[AutoSave]', e); }
    }, (SL_CONFIG && SL_CONFIG.AUTO_SAVE_INTERVAL) || 60000);
    window.addEventListener('beforeunload', () => { try { saveGame(); } catch(e) {} });
  }

  /* ─── 2. KEYBOARD SHORTCUTS ─── */
  function initKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      switch (e.key) {
        case 'n': case 'N':
          e.preventDefault();
          if (typeof openQuestModal === 'function') openQuestModal();
          break;
        case '/':
          e.preventDefault();
          const si = document.getElementById('quest-search');
          if (si) { si.focus(); si.select(); }
          break;
        case 'Escape':
          ['settings-modal','load-modal','spider-chart-modal','quest-modal'].forEach(id => {
            const el = document.getElementById(id);
            if (!el || el.style.display === 'none') return;
            if (id === 'quest-modal' && typeof closeQuestModal === 'function') closeQuestModal();
            else el.style.display = 'none';
          });
          const ov = document.getElementById('modal-overlay');
          if (ov) ov.classList.remove('show');
          break;
        case 's': case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (typeof saveGame === 'function') {
              saveGame().then(() => {
                const n = document.getElementById('xp-toast');
                if (n) { n.textContent = 'Game saved!'; n.classList.add('show'); setTimeout(() => n.classList.remove('show'), 2000); }
              });
            }
          }
          break;
      }
    });
  }

  /* ─── 3. DEBOUNCED SEARCH ─── */
  function initDebouncedSearch() {
    const si = document.getElementById('quest-search');
    if (!si) return;
    const df = debounce(function() {
      const cb = document.getElementById('clear-search-btn');
      if (cb) cb.style.display = si.value.trim() ? 'inline-block' : 'none';
      if (typeof renderQuests === 'function') renderQuests();
    });
    si.addEventListener('input', df);
    const cb = document.getElementById('clear-search-btn');
    if (cb) cb.addEventListener('click', function() {
      si.value = ''; this.style.display = 'none';
      if (typeof renderQuests === 'function') renderQuests();
      si.focus();
    });
  }

  /* ─── 4. DATA VALIDATION ─── */
  function initQuestValidation() {
    const ti = document.getElementById('quest-modal-title');
    const xi = document.getElementById('quest-modal-xp');
    const sb = document.querySelector('.save-quest');
    if (!ti) return;
    function check() {
      const err = (typeof validateQuestInputs === 'function')
        ? validateQuestInputs(ti.value, xi ? xi.value : 0)
        : '';
      ti.style.borderColor = err ? 'var(--accent-quaternary)' : 'rgba(78,205,196,0.3)';
      if (sb) sb.style.opacity = err ? '0.5' : '1';
    }
    ti.addEventListener('input', check);
    if (xi) xi.addEventListener('input', check);
  }

  /* ─── INIT ─── */
  function init() {
    initAutoSave();
    initKeyboardShortcuts();
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => { initDebouncedSearch(); initQuestValidation(); });
    } else {
      initDebouncedSearch();
      initQuestValidation();
    }
  }
  /* Wait for SL_CONFIG, then init */
  if (typeof SL_CONFIG !== 'undefined') init();
  else setTimeout(() => { if (typeof SL_CONFIG !== 'undefined') init(); }, 500);
})();
