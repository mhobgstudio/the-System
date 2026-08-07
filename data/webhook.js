/* ═══════════════════════════════════════════════
 * Solo Leveling System — n8n Webhook Integration
 * Sends quest completion events to an n8n webhook
 * which can forward to Telegram, email, etc.
 * ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  const WEBHOOK_CONFIG_KEY = 'sl_n8n_webhook_url';
  const WEBHOOK_ENABLED_KEY = 'sl_n8n_webhook_enabled';

  const N8N_CONFIG = {
    get webhookUrl() {
      return localStorage.getItem(WEBHOOK_CONFIG_KEY) || '';
    },
    set webhookUrl(val) {
      localStorage.setItem(WEBHOOK_CONFIG_KEY, val);
    },
    get enabled() {
      return localStorage.getItem(WEBHOOK_ENABLED_KEY) === 'true';
    },
    set enabled(val) {
      localStorage.setItem(WEBHOOK_ENABLED_KEY, val ? 'true' : 'false');
    }
  };

  async function sendQuestCompleteWebhook(quest) {
    if (!N8N_CONFIG.enabled || !N8N_CONFIG.webhookUrl) return false;
    
    try {
      const playerStats = await db.playerStats.toArray();
      const stats = playerStats[0] || {};

      const payload = {
        event: 'quest_completed',
        timestamp: new Date().toISOString(),
        quest: {
          title: quest.title || quest.dataset?.title || 'Unknown',
          difficulty: quest.difficulty || quest.dataset?.difficulty || 'Easy',
          xp: parseInt(quest.xp || quest.dataset?.xp || 0),
          stat: quest.stat || quest.dataset?.stat || 'discipline',
          category: quest.category || quest.dataset?.category || 'personal',
        },
        player: {
          level: stats.level || 0,
          xp: stats.xp || 0,
          streak: stats.currentStreak || 0,
          stats: {
            strength: stats.strength || 1,
            agility: stats.agility || 1,
            intelligence: stats.intelligence || 1,
            stamina: stats.stamina || 1,
            willpower: stats.willpower || 1,
            discipline: stats.discipline || 1,
          }
        },
        app: 'solo-leveling-system',
        version: 1
      };

      const response = await fetch(N8N_CONFIG.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors' // Allow CORS-less requests to n8n webhooks
      });

      return true;
    } catch (e) {
      console.warn('[Webhook] Failed to send:', e);
      return false;
    }
  }

  function initWebhookSettings() {
    // Check if webhook URL is configured
    const url = N8N_CONFIG.webhookUrl;
    if (!url) return;

    // Add webhook status indicator to settings
    const settingsContent = document.querySelector('.settings-modal .modal-content');
    if (!settingsContent) return;

    // Don't add duplicate entries
    if (document.getElementById('webhook-settings-section')) return;

    const section = document.createElement('div');
    section.id = 'webhook-settings-section';
    section.style.cssText = 'margin: 12px 0; padding: 12px 16px; background: rgba(74, 144, 226, 0.08); border-radius: 10px; border: 1px solid rgba(74, 144, 226, 0.15);';

    section.innerHTML = `
      <h3 style="margin: 0 0 10px 0; font-size: 0.95rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
        <i class="fas fa-plug" style="color: var(--accent-primary);"></i> n8n Webhook
      </h3>
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <input type="url" id="webhook-url-input" class="quest-input" 
               placeholder="https://your-n8n.example.com/webhook/..." 
               value="${N8N_CONFIG.webhookUrl}" 
               style="width: 100%; padding: 8px 12px; box-sizing: border-box;">
        <div style="display: flex; align-items: center; gap: 10px;">
          <label style="display: flex; align-items: center; gap: 6px; cursor: pointer; color: var(--text-secondary); font-size: 0.85rem;">
            <input type="checkbox" id="webhook-enabled-checkbox" ${N8N_CONFIG.enabled ? 'checked' : ''}>
            Enable webhook notifications
          </label>
          <span id="webhook-status" style="font-size: 0.8rem; color: ${N8N_CONFIG.enabled && N8N_CONFIG.webhookUrl ? 'var(--accent-green)' : 'var(--text-secondary)'};">
            ${N8N_CONFIG.enabled && N8N_CONFIG.webhookUrl ? '● Active' : '○ Inactive'}
          </span>
        </div>
        <button id="test-webhook-btn" class="glow-button" 
                style="padding: 6px 12px; font-size: 0.8rem; background: rgba(74,144,226,0.15); border: 1px solid rgba(74,144,226,0.3); border-radius: 6px; cursor: pointer; color: var(--text-primary);">
          <i class="fas fa-paper-plane"></i> Test Webhook
        </button>
      </div>
    `;

    // Find auth section or insert at top
    const authSection = settingsContent.querySelector('.auth-section');
    if (authSection) {
      authSection.after(section);
    } else {
      const divider = settingsContent.querySelector('.settings-divider');
      if (divider) {
        divider.after(section);
      } else {
        settingsContent.prepend(section);
      }
    }

    // Add event listeners
    const urlInput = document.getElementById('webhook-url-input');
    const enabledCheckbox = document.getElementById('webhook-enabled-checkbox');
    const statusSpan = document.getElementById('webhook-status');
    const testBtn = document.getElementById('test-webhook-btn');

    if (urlInput) {
      urlInput.addEventListener('change', () => {
        N8N_CONFIG.webhookUrl = urlInput.value.trim();
        updateWebhookStatus();
      });
    }

    if (enabledCheckbox) {
      enabledCheckbox.addEventListener('change', () => {
        N8N_CONFIG.enabled = enabledCheckbox.checked;
        updateWebhookStatus();
      });
    }

    if (testBtn) {
      testBtn.addEventListener('click', async () => {
        const testQuest = {
          title: 'TEST: Webhook Integration',
          difficulty: 'Easy',
          xp: 1,
          stat: 'discipline',
          category: 'system',
          dataset: { title: 'Webhook Test' }
        };
        testBtn.disabled = true;
        testBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        
        const result = await sendQuestCompleteWebhook(testQuest);
        
        testBtn.disabled = false;
        if (result) {
          testBtn.innerHTML = '<i class="fas fa-check"></i> Sent!';
          setTimeout(() => {
            testBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Test Webhook';
          }, 2000);
        } else {
          testBtn.innerHTML = '<i class="fas fa-times"></i> Failed';
          setTimeout(() => {
            testBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Test Webhook';
          }, 2000);
        }
      });
    }
  }

  function updateWebhookStatus() {
    const statusSpan = document.getElementById('webhook-status');
    if (!statusSpan) return;
    const active = N8N_CONFIG.enabled && N8N_CONFIG.webhookUrl;
    statusSpan.textContent = active ? '● Active' : '○ Inactive';
    statusSpan.style.color = active ? 'var(--accent-green)' : 'var(--text-secondary)';
  }

  // Hook into quest completion — wrap completeQuest so every completed quest
  // (single or batch) is forwarded to the n8n webhook.
  function hookQuestComplete() {
    const origComplete = window.completeQuest;
    if (typeof origComplete !== 'function') {
      // Try again later
      setTimeout(hookQuestComplete, 1000);
      return;
    }
    if (window.__webhookHooked) return;
    window.__webhookHooked = true;

    window.completeQuest = async function (...args) {
      const questElem = args[2];
      const questId = questElem ? parseInt(questElem.dataset.questId) : null;
      // Only forward quests that actually transition to completed (skip blocked re-clicks)
      let wasCompleted = false;
      if (questId) {
        try {
          const before = await db.quests.get(questId);
          wasCompleted = !!(before && before.status === 'completed');
        } catch (e) { /* ignore */ }
      }
      const result = await origComplete.apply(this, args);
      try {
        if (questId && !wasCompleted) {
          const quest = await db.quests.get(questId);
          if (quest && quest.status === 'completed') await sendQuestCompleteWebhook(quest);
        }
      } catch (e) {
        console.warn('[Webhook] Hook error:', e);
      }
      return result;
    };

    console.log('[Webhook] Hook ready - quest completions will be forwarded to n8n');
  }

  // Init after settings modal is available
  function init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        initWebhookSettings();
        hookQuestComplete();
      });
    } else {
      initWebhookSettings();
      hookQuestComplete();
    }
  }

  // Make sendQuestCompleteWebhook accessible to app.js
  window.sendQuestCompleteWebhook = sendQuestCompleteWebhook;
  window.N8N_CONFIG = N8N_CONFIG;

  init();

})();
