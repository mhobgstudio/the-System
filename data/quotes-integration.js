/* ═══════════════════════════════════════════════
 * Solo Leveling System — Quote Integration
 * Context-aware quotes + streak milestone quotes
 * ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  // Maps quest categories to quote categories
  const CATEGORY_MAP = {
    work: 'discipline',
    health: 'perseverance',
    learning: 'wisdom',
    personal: 'growth',
    spiritual: 'faith',
    fitness: 'strength',
    social: 'discipline',
    finance: 'discipline',
    creative: 'growth',
    cultivation: 'discipline',
    physical: 'strength',
  };

  // Streak milestones that trigger a quote
  const STREAK_MILESTONES = [1, 3, 7, 14, 21, 30, 50, 100, 180, 365];
  const STREAK_STORAGE_KEY = 'sl_last_streak_quote_milestone';

  function getLastQuoteMilestone() {
    return parseInt(localStorage.getItem(STREAK_STORAGE_KEY) || '0');
  }

  function setLastQuoteMilestone(days) {
    localStorage.setItem(STREAK_STORAGE_KEY, String(days));
  }

  // ─── CONTEXT-AWARE QUOTE ON QUEST COMPLETE ───

  function getQuoteForQuestCategory(category) {
    if (typeof motivationalQuotesSystem === 'undefined') return null;

    const quoteCategory = CATEGORY_MAP[category] || null;

    if (quoteCategory) {
      // Try to get a quote matching the context + category
      const matches = motivationalQuotesSystem.quotes.filter(q =>
        q.category === quoteCategory && q.contexts.includes('questComplete')
      );
      if (matches.length > 0) {
        return matches[Math.floor(Math.random() * matches.length)];
      }

      // Fallback to any quote in that category
      const catMatches = motivationalQuotesSystem.quotes.filter(q => q.category === quoteCategory);
      if (catMatches.length > 0) {
        return catMatches[Math.floor(Math.random() * catMatches.length)];
      }
    }

    // Ultimate fallback: random quote with questComplete context
    const ctxMatches = motivationalQuotesSystem.getQuoteByContext('questComplete');
    return ctxMatches || motivationalQuotesSystem.getRandomQuote();
  }

  // ─── STREAK MILESTONE QUOTE ───

  function isStreakMilestone(streak) {
    return STREAK_MILESTONES.includes(streak);
  }

  function shouldShowStreakQuote(streak) {
    if (!isStreakMilestone(streak)) return false;
    return streak > getLastQuoteMilestone();
  }

  function getQuoteForStreakMilestone(streak) {
    if (typeof motivationalQuotesSystem === 'undefined') return null;

    // Pick a quote that matches streak/achievement contexts
    const matches = motivationalQuotesSystem.quotes.filter(q =>
      q.contexts.includes('streakMilestone')
    );
    if (matches.length > 0) {
      return matches[Math.floor(Math.random() * matches.length)];
    }

    return motivationalQuotesSystem.getRandomQuote();
  }

  // ─── DISPLAY FUNCTIONS ───

  function displayContextQuote(category, duration = 6000) {
    const quote = getQuoteForQuestCategory(category);
    if (!quote) return;

    // Use the existing quote display area
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const quoteSource = document.getElementById('quote-source');
    const favBtn = document.getElementById('favorite-quote');

    if (quoteText) {
      // Highlight the category button
      document.querySelectorAll('.category-button').forEach(btn => {
        btn.style.opacity = btn.dataset.category === (CATEGORY_MAP[category] || category) ? '1' : '0.5';
        btn.style.transform = btn.dataset.category === (CATEGORY_MAP[category] || category) ? 'scale(1.1)' : 'scale(1)';
        setTimeout(() => {
          btn.style.opacity = '';
          btn.style.transform = '';
        }, 2000);
      });

      // Animate the quote change
      quoteText.style.opacity = '0';
      quoteText.style.transform = 'translateY(10px)';

      setTimeout(() => {
        quoteText.textContent = `"${quote.text}"`;
        if (quoteAuthor) quoteAuthor.textContent = `- ${quote.author}`;
        if (quoteSource) quoteSource.textContent = quote.source ? `, ${quote.source}` : '';

        // Check if favorited
        if (typeof db !== 'undefined' && quote.id && favBtn) {
          db.favoriteQuotes.where('quoteId').equals(quote.id).first().then(fav => {
            favBtn.innerHTML = `<i class="${fav ? 'fas' : 'far'} fa-heart"></i>`;
          });
        }

        quoteText.style.opacity = '1';
        quoteText.style.transform = 'translateY(0)';
      }, 300);
    }

    // Also show a notification
    if (typeof showNotification === 'function') {
      setTimeout(() => {
        showNotification(`✨ "${quote.text.substring(0, 60)}..." - ${quote.author}`, 'quote');
      }, 500);
    }
  }

  function displayStreakMilestoneQuote(streak) {
    const quote = getQuoteForStreakMilestone(streak);
    if (!quote) return;

    setLastQuoteMilestone(streak);

    // Show quote in the main display area
    const quoteText = document.getElementById('quote-text');
    const quoteAuthor = document.getElementById('quote-author');
    const quoteSource = document.getElementById('quote-source');

    if (quoteText) {
      quoteText.style.opacity = '0';
      quoteText.style.transform = 'translateY(10px)';
      setTimeout(() => {
        quoteText.textContent = `"${quote.text}"`;
        if (quoteAuthor) quoteAuthor.textContent = `- ${quote.author}`;
        if (quoteSource) quoteSource.textContent = quote.source ? `, ${quote.source}` : '';
        quoteText.style.opacity = '1';
        quoteText.style.transform = 'translateY(0)';
      }, 300);
    }

    // Show a special streak notification
    if (typeof showNotification === 'function') {
      showNotification(`🔥 ${streak}-day streak! "${quote.text.substring(0, 50)}..."`, 'streak');
    }

    // Show level-up-style overlay for major milestones
    if (streak >= 30 && typeof sounds !== 'undefined' && sounds?.streakUp) {
      sounds.streakUp.play();
    }
  }

  // ─── STREAK CHECK HOOK ───

  function checkStreakMilestoneQuote() {
    if (typeof db === 'undefined') return;

    db.playerStats.toArray().then(stats => {
      if (!stats.length) return;
      const streak = stats[0].currentStreak || 0;
      if (shouldShowStreakQuote(streak)) {
        setTimeout(() => {
          displayStreakMilestoneQuote(streak);
        }, 1500); // Delay slightly so the streak display updates first
      }
    }).catch(() => {});
  }

  // ─── INIT ───

  function init() {
    // Hook into quest completion
    // We do this via a MutationObserver on the quote container
    // or by patching the completeQuest flow

    // Check for streak milestone on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', checkStreakMilestoneQuote);
    } else {
      checkStreakMilestoneQuote();
    }

    console.log('[QuoteInt] Context-aware quotes active');
  }

  // ─── EXPORTS ───

  window.QuoteIntegration = {
    displayContextQuote,
    displayStreakMilestoneQuote,
    checkStreakMilestoneQuote,
    getQuoteForQuestCategory,
    getQuoteForStreakMilestone,
    shouldShowStreakQuote,
  };

  init();

})();
