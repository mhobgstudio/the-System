/* ═══════════════════════════════════════════════
 * Solo Leveling System — Keyboard Shortcut Hints
 * Press ? to toggle the shortcuts overlay
 * ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  const SHORTCUTS = [
    { key: 'N', desc: 'New Quest' },
    { key: '/', desc: 'Search Quests' },
    { key: 'S', desc: 'Save Game (Ctrl+S)' },
    { key: '?', desc: 'Toggle Shortcuts' },
    { key: 'Esc', desc: 'Close Modals' },
    { key: '1-4', desc: 'Quick Filter: All/Easy/Medium/Hard' },
  ];

  let shortcutsOverlay = null;

  function createOverlay() {
    if (shortcutsOverlay) return;

    shortcutsOverlay = document.createElement('div');
    shortcutsOverlay.id = 'shortcuts-overlay';
    shortcutsOverlay.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(0.9);
      background: rgba(16, 18, 28, 0.96);
      border: 1px solid rgba(74, 144, 226, 0.3);
      border-radius: 15px;
      padding: 24px 32px;
      z-index: 10001;
      min-width: 320px;
      max-width: 420px;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(74, 144, 226, 0.1);
      backdrop-filter: blur(12px);
      opacity: 0;
      visibility: hidden;
      transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    `;

    shortcutsOverlay.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(74, 144, 226, 0.15);">
        <h3 style="margin: 0; color: var(--accent-primary, #4a90e2); font-size: 1.1rem; font-weight: 600;">
          <i class="fas fa-keyboard"></i> Keyboard Shortcuts
        </h3>
        <span style="color: var(--text-secondary, #9898b0); font-size: 0.75rem; opacity: 0.6;">Press ? to close</span>
      </div>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        ${SHORTCUTS.map(s => `
          <div style="display: flex; align-items: center; justify-content: space-between; padding: 6px 0;">
            <span style="color: var(--text-secondary, #9898b0); font-size: 0.88rem;">${s.desc}</span>
            <kbd style="display: inline-block; padding: 3px 10px; font-size: 0.78rem; font-family: 'Poppins', sans-serif; 
                       background: rgba(74, 144, 226, 0.12); border: 1px solid rgba(74, 144, 226, 0.25); 
                       border-radius: 5px; color: var(--accent-primary, #4a90e2); font-weight: 600;
                       min-width: 28px; text-align: center;">${s.key}</kbd>
          </div>
        `).join('')}
      </div>
      <div style="margin-top: 16px; padding-top: 12px; border-top: 1px solid rgba(74, 144, 226, 0.1); text-align: center;">
        <p style="margin: 0; color: var(--text-secondary, #9898b0); font-size: 0.78rem; opacity: 0.7;">
          Click anywhere outside to close
        </p>
      </div>
    `;

    document.body.appendChild(shortcutsOverlay);

    // Close on outside click
    shortcutsOverlay.addEventListener('click', (e) => {
      if (e.target === shortcutsOverlay) hideShortcuts();
    });
  }

  function showShortcuts() {
    createOverlay();
    if (!shortcutsOverlay) return;
    shortcutsOverlay.style.opacity = '1';
    shortcutsOverlay.style.visibility = 'visible';
    shortcutsOverlay.style.transform = 'translate(-50%, -50%) scale(1)';
    shortcutsOverlay.style.pointerEvents = 'auto';
  }

  function hideShortcuts() {
    if (!shortcutsOverlay) return;
    shortcutsOverlay.style.opacity = '0';
    shortcutsOverlay.style.visibility = 'hidden';
    shortcutsOverlay.style.transform = 'translate(-50%, -50%) scale(0.9)';
    shortcutsOverlay.style.pointerEvents = 'none';
  }

  function toggleShortcuts() {
    if (shortcutsOverlay && shortcutsOverlay.style.visibility === 'visible') {
      hideShortcuts();
    } else {
      showShortcuts();
    }
  }

  function initShortcuts() {
    document.addEventListener('keydown', (e) => {
      const tag = e.target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
        e.preventDefault();
        toggleShortcuts();
        return;
      }

      // Quick filter shortcuts: 1=All, 2=Easy, 3=Medium, 4=Hard
      if (['1', '2', '3', '4'].includes(e.key)) {
        const difficulties = ['all', 'Easy', 'Medium', 'Hard'];
        const idx = parseInt(e.key) - 1;
        const diffFilter = document.getElementById('difficulty-filter');
        if (diffFilter && idx < difficulties.length) {
          diffFilter.value = difficulties[idx];
          diffFilter.dispatchEvent(new Event('change'));
        }
      }
    });

    // Close on Escape (if not handled by app.js)
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && shortcutsOverlay?.style.visibility === 'visible') {
        hideShortcuts();
      }
    });
  }

  // Init
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initShortcuts);
  } else {
    initShortcuts();
  }

})();
