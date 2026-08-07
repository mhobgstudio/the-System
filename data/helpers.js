/* ──────────────────────────────────────────────
 * Solo Leveling System — Utility Glue
 * (Debounce + Validation — shared by app.js & improvements.js)
 * ────────────────────────────────────────────── */

/* Debounce — used by improvements.js for search */
function debounce(fn, delay) {
  if (delay == null) delay = (typeof SL_CONFIG !== 'undefined' && SL_CONFIG.SEARCH_DEBOUNCE) || 300;
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/* Validate quest input fields — returns error string or '' */
function validateQuestInputs(title, xp) {
  if (!title || title.trim().length === 0) return 'Title is required';
  const maxLen = (typeof SL_CONFIG !== 'undefined' && SL_CONFIG.MAX_QUEST_TITLE_LENGTH) || 100;
  if (title.length > maxLen) return 'Title too long (max ' + maxLen + ' chars)';
  const minXp = (typeof SL_CONFIG !== 'undefined' && SL_CONFIG.XP_MIN) || 1;
  const xpNum = Number(xp);
  if (isNaN(xpNum) || xpNum < minXp) return 'XP must be at least ' + minXp;
  return '';
}
