/* ═══════════════════════════════════════════════
 * Solo Leveling System — Quest Chains Module
 * Linear story chains, milestone tiers, multi-part subtasks
 * ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  // ─── CHAIN DEFINITIONS ───
  // Define chains that link existing quests by title

  const CHAIN_DEFINITIONS = {
    // ─── STORY CHAINS (linear progression) ───

    "morning-ibadah": {
      name: "Morning Ibadah Routine",
      description: "Start your day with worship and self-care",
      icon: "fa-sun",
      color: "#ffd166",
      type: "story",
      quests: [
        { title: "Night Prayer (Tahajjud)", order: 1 },
        { title: "Daily Adhkar & Dua", order: 2 },
        { title: "Quran Reading (1pg min)", order: 3 },
        { title: "Daily Health Essentials", order: 4 },
        { title: "Email & Comms", order: 5 },
      ]
    },

    "quran-mastery": {
      name: "Quran Mastery Path",
      description: "Deepen your connection with the Book of Allah",
      icon: "fa-book-open",
      color: "#4ecdc4",
      type: "story",
      quests: [
        { title: "Quran Reading (1pg min)", order: 1 },
        { title: "The 3 Quls (Protection)", order: 2 },
        { title: "Quran Memorization (Hifz)", order: 3 },
        { title: "Quran Deep Study", order: 4 },
        { title: "Mujawwad Recitation & Teaching", order: 5 },
      ]
    },

    "arabic-journey": {
      name: "Arabic Language Journey",
      description: "Learn the language of the Quran",
      icon: "fa-language",
      color: "#b388ff",
      type: "story",
      quests: [
        { title: "Madina Arabic & Grammar", order: 1 },
        { title: "Arabic Conversation (Pimsleur)", order: 2 },
        { title: "Nahwu (Arabic Grammar)", order: 3 },
        { title: "Word4Word Quran", order: 4 },
      ]
    },

    "self-mastery": {
      name: "Self Mastery Path",
      description: "Conquer your inner self",
      icon: "fa-fist-raised",
      color: "#ff4961",
      type: "story",
      quests: [
        { title: "Control Your Nafs", order: 1 },
        { title: "Digital Detox (1hr)", order: 2 },
        { title: "Silence Fast & Self-Observation", order: 3 },
        { title: "Be an Observer", order: 4 },
        { title: "Effectiveness Audit", order: 5 },
      ]
    },

    // ─── MILESTONE CHAINS (tiered progression) ───

    "pushups": {
      name: "Push-up Progression",
      description: "Build upper body strength tier by tier",
      icon: "fa-dumbbell",
      color: "#ff922b",
      type: "milestone",
      quests: [
        { title: "50 Push-ups (Punishment)", tier: 1 },
        { title: "5x25 Push-ups", tier: 2 },
        { title: "100 Push-ups", tier: 3 },
        { title: "Monthly Workout Streak", tier: 4 },
      ]
    },

    "running": {
      name: "Running Progression",
      description: "Improve your speed and endurance",
      icon: "fa-running",
      color: "#51cf66",
      type: "milestone",
      quests: [
        { title: "Daily Workout", tier: 1 },
        { title: "Agility Training", tier: 2 },
        { title: "300m Run", tier: 3 },
        { title: "Monthly Workout Streak", tier: 4 },
      ]
    },
  };

  // ─── RESOLVE CHAIN QUESTS FROM DB ───

  async function resolveChainQuests(chainId) {
    const def = CHAIN_DEFINITIONS[chainId];
    if (!def) return [];
    try {
      const allQuests = await db.quests.toArray();
      return def.quests.map(spec => {
        // Find matching quest by title
        const match = allQuests.find(q => {
          const qTitle = q.title.toLowerCase().trim();
          const specTitle = spec.title.toLowerCase().trim();
          return qTitle === specTitle;
        });
        if (!match) {
          // Quest not in DB yet - create a virtual reference
          return { ...spec, id: null, status: 'locked', title: spec.title };
        }
        return { ...match, chainOrder: spec.order || spec.tier || 0, chainTier: spec.tier || 0 };
      });
    } catch (e) {
      return [];
    }
  }

  async function getAllChains() {
    const chains = [];
    for (const [id, def] of Object.entries(CHAIN_DEFINITIONS)) {
      const resolved = await resolveChainQuests(id);
      const completed = resolved.filter(q => q.status === 'completed').length;
      const active = resolved.find(q => q.status !== 'completed' && q.status !== 'locked');
      chains.push({
        id,
        ...def,
        quests: resolved,
        completed,
        total: resolved.length,
        active: active || resolved[resolved.length - 1],
        progress: resolved.length > 0 ? Math.round((completed / resolved.length) * 100) : 0,
      });
    }
    return chains;
  }

  // ─── SUBTASK MANAGEMENT ───

  function getSubtasks(quest) {
    return quest.subtasks || [];
  }

  function hasSubtasks(quest) {
    const subs = getSubtasks(quest);
    return subs.length > 0;
  }

  function getSubtaskCompletion(quest) {
    return quest.subtaskCompletion || {};
  }

  function areAllSubtasksDone(quest) {
    const subtasks = getSubtasks(quest);
    if (!subtasks.length) return true;
    const completion = getSubtaskCompletion(quest);
    return subtasks.every((_, i) => completion[i] === true);
  }

  function getCompletedSubtaskCount(quest) {
    const subtasks = getSubtasks(quest);
    if (!subtasks.length) return 0;
    const completion = getSubtaskCompletion(quest);
    return subtasks.filter((_, i) => completion[i] === true).length;
  }

  async function toggleSubtask(questId, subtaskIndex) {
    try {
      const quest = await db.quests.get(parseInt(questId));
      if (!quest) return null;
      const completion = getSubtaskCompletion(quest);
      completion[subtaskIndex] = !completion[subtaskIndex];
      quest.subtaskCompletion = completion;
      await db.quests.put(quest);

      // Check if all subtasks are now done
      if (areAllSubtasksDone(quest)) {
        showNotification ? showNotification('All subtasks complete! Ready to complete quest.', 'success') : null;
      }

      if (typeof renderQuests === 'function') renderQuests();
      return quest;
    } catch (e) {
      console.warn('[QuestChains] Toggle subtask error:', e);
      return null;
    }
  }

  // ─── INTEGRATION HOOKS ───

  async function beforeQuestComplete(questId) {
    try {
      const quest = questId ? await db.quests.get(parseInt(questId)) : null;
      if (!quest) return { allowed: true, quest };

      // Check subtasks
      if (hasSubtasks(quest) && !areAllSubtasksDone(quest)) {
        const done = getCompletedSubtaskCount(quest);
        const total = getSubtasks(quest).length;
        return { allowed: false, reason: `subtasks`, done, total, quest };
      }

      return { allowed: true, quest };
    } catch (e) {
      return { allowed: true, quest: null };
    }
  }

  async function afterQuestComplete(quest) {
    if (!quest) return;

    // Check if this quest is part of a chain
    for (const [chainId, def] of Object.entries(CHAIN_DEFINITIONS)) {
      const specIndex = def.quests.findIndex(spec => {
        const qTitle = quest.title.toLowerCase().trim();
        const specTitle = spec.title.toLowerCase().trim();
        return qTitle === specTitle || qTitle.includes(specTitle) || specTitle.includes(qTitle);
      });

      if (specIndex === -1) continue;

      const spec = def.quests[specIndex];

      if (def.type === 'milestone') {
        // Unlock next tier
        const nextSpec = def.quests[specIndex + 1];
        if (nextSpec) {
          // Find the quest in DB by title
          const allQuests = await db.quests.toArray();
          const nextQuest = allQuests.find(q => {
            const qt = q.title.toLowerCase().trim();
            const st = nextSpec.title.toLowerCase().trim();
            return qt === st || qt.includes(st) || st.includes(qt);
          });
          if (nextQuest) {
            await db.quests.put({ ...nextQuest, status: 'inbox' });
            showNotification ? showNotification(`🏆 Milestone ${nextSpec.tier} unlocked: ${nextQuest.title}!`, 'success') : null;
          }
        } else {
          showNotification ? showNotification(`🎊 All milestones in "${def.name}" complete!`, 'success') : null;
        }
      } else if (def.type === 'story') {
        // Unlock next story step
        const nextSpec = def.quests[specIndex + 1];
        if (nextSpec) {
          const allQuests = await db.quests.toArray();
          const nextQuest = allQuests.find(q => {
            const qt = q.title.toLowerCase().trim();
            const st = nextSpec.title.toLowerCase().trim();
            return qt === st;
          });
          if (nextQuest) {
            await db.quests.put({ ...nextQuest, status: 'inbox' });
            showNotification ? showNotification(`⛓️ Chain continues: "${nextQuest.title}" unlocked!`, 'success') : null;
          }
        } else {
          showNotification ? showNotification(`🎊 Story chain complete: "${def.name}"!`, 'success') : null;
        }
      }
      break;
    }

    if (typeof renderQuests === 'function') renderQuests();
  }

  // ─── UI RENDERING ───

  function renderSubtasksInQuest(container, quest) {
    const subtasks = getSubtasks(quest);
    if (!subtasks.length) return;

    const completion = getSubtaskCompletion(quest);
    const allDone = areAllSubtasksDone(quest);
    const done = getCompletedSubtaskCount(quest);

    const wrapper = document.createElement('div');
    wrapper.className = 'quest-subtasks';
    wrapper.style.cssText = 'margin-top: 6px; padding: 4px 0;';

    // Progress bar
    if (done > 0) {
      const bar = document.createElement('div');
      bar.style.cssText = `height: 3px; background: rgba(255,255,255,0.06); border-radius: 2px; margin-bottom: 6px; overflow: hidden;`;
      const fill = document.createElement('div');
      fill.style.cssText = `height: 100%; width: ${(done / subtasks.length) * 100}%;
        background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
        border-radius: 2px; transition: width 0.5s ease;`;
      bar.appendChild(fill);
      wrapper.appendChild(bar);
    }

    subtasks.forEach((subtask, i) => {
      const isDone = completion[i] === true;
      const item = document.createElement('div');
      item.title = isDone ? 'Click to uncheck' : 'Click to complete';
      item.style.cssText = `
        display: flex; align-items: center; gap: 8px; padding: 4px 8px;
        border-radius: 6px; cursor: pointer; transition: all 0.2s ease;
        font-size: 0.82rem; color: ${isDone ? 'var(--accent-green,#51cf66)' : 'var(--text-secondary,#9898b0)'};
        opacity: ${isDone ? '0.8' : '1'};
      `;
      item.onmouseover = () => { item.style.background = 'rgba(255,255,255,0.05)'; };
      item.onmouseout = () => { item.style.background = 'transparent'; };

      const check = document.createElement('span');
      check.style.cssText = `
        width: 16px; height: 16px; border-radius: 50%; flex-shrink: 0;
        border: 2px solid ${isDone ? 'var(--accent-green,#51cf66)' : 'rgba(255,255,255,0.2)'};
        display: flex; align-items: center; justify-content: center;
        background: ${isDone ? 'var(--accent-green,#51cf66)' : 'transparent'};
        transition: all 0.2s ease; font-size: 8px;
      `;
      if (isDone) check.innerHTML = '<i class="fas fa-check" style="color:white;"></i>';
      item.appendChild(check);

      const label = document.createElement('span');
      label.textContent = subtask;
      if (isDone) label.style.textDecoration = 'line-through';
      item.appendChild(label);

      item.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleSubtask(quest.id, i);
      });

      wrapper.appendChild(item);
    });

    container.appendChild(wrapper);
  }

  function renderChainIndicators(questElem, quest) {
    // Check if quest is part of any chain
    let isInChain = false;
    for (const [chainId, def] of Object.entries(CHAIN_DEFINITIONS)) {
      const spec = def.quests.find(s => {
        const qt = quest.title.toLowerCase().trim();
        const st = s.title.toLowerCase().trim();
        return qt === st || qt.includes(st) || st.includes(qt);
      });
      if (!spec) continue;
      isInChain = true;

      const orderOrTier = spec.order || spec.tier || 0;

      if (def.type === 'story') {
        const badge = document.createElement('div');
        badge.style.cssText = `
          position: absolute; top: 8px; right: 8px;
          background: rgba(74, 144, 226, 0.12);
          border: 1px solid rgba(74, 144, 226, 0.25);
          border-radius: 10px; padding: 2px 8px;
          font-size: 0.68rem; color: var(--accent-primary);
          display: flex; align-items: center; gap: 4px;
          cursor: help; z-index: 2;
        `;
        badge.title = `${def.name} - Step ${orderOrTier}`;
        badge.innerHTML = `<i class="fas ${def.icon}"></i> #${orderOrTier}`;
        questElem.appendChild(badge);
      } else if (def.type === 'milestone') {
        const badge = document.createElement('div');
        badge.style.cssText = `
          position: absolute; top: 8px; right: 8px;
          background: rgba(255, 209, 102, 0.12);
          border: 1px solid rgba(255, 209, 102, 0.2);
          border-radius: 10px; padding: 2px 8px;
          font-size: 0.68rem; color: var(--accent-tertiary);
          display: flex; align-items: center; gap: 4px;
          cursor: help; z-index: 2;
        `;
        badge.title = `${def.name} - Tier ${orderOrTier}`;
        badge.innerHTML = `<i class="fas ${def.icon}"></i> T${orderOrTier}`;
        questElem.appendChild(badge);
      }
      break;
    }
  }

  // ─── CHAIN PROGRESS PANEL ───

  async function renderChainProgressPanel(container) {
    if (!container) return;
    const chains = await getAllChains();
    if (!chains.length) { container.style.display = 'none'; return; }

    container.style.display = 'block';
    container.innerHTML = '';

    // Only show chains that have at least some quests
    const activeChains = chains.filter(c => c.quests.length > 1);

    activeChains.forEach(chain => {
      const card = document.createElement('div');
      card.style.cssText = `
        background: rgba(40, 40, 50, 0.4); border: 1px solid rgba(74, 144, 226, 0.15);
        border-radius: 10px; padding: 12px 16px; margin-bottom: 8px;
        transition: all 0.2s ease;
      `;

      // Header
      const header = document.createElement('div');
      header.style.cssText = 'display: flex; align-items: center; gap: 10px; margin-bottom: 8px;';
      header.innerHTML = `
        <div style="width: 32px; height: 32px; border-radius: 8px; background: ${chain.color}22; 
             border: 1px solid ${chain.color}44; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <i class="fas ${chain.icon}" style="color: ${chain.color}; font-size: 0.9rem;"></i>
        </div>
        <div style="flex:1;min-width:0;">
          <div style="font-size: 0.85rem; font-weight: 600; color: var(--text-primary);">${chain.name}</div>
          <div style="font-size: 0.7rem; color: var(--text-secondary); opacity: 0.7;">${chain.description}</div>
        </div>
        <div style="text-align:right; flex-shrink:0;">
          <div style="font-size: 0.9rem; font-weight: 700; color: ${chain.progress >= 100 ? 'var(--accent-green)' : 'var(--accent-primary)'};">${chain.completed}/${chain.total}</div>
          <div style="font-size: 0.65rem; color: var(--text-secondary);">${chain.progress}%</div>
        </div>
      `;
      card.appendChild(header);

      // Progress bar
      const bar = document.createElement('div');
      bar.style.cssText = 'height: 4px; background: rgba(255,255,255,0.06); border-radius: 2px; overflow: hidden; margin-bottom: 6px;';
      const fill = document.createElement('div');
      fill.style.cssText = `height: 100%; width: ${chain.progress}%; background: linear-gradient(90deg, ${chain.color}88, ${chain.color});
        border-radius: 2px; transition: width 0.8s ease;`;
      bar.appendChild(fill);
      card.appendChild(bar);

      // Quest list (show active + completed, hide locked)
      const questList = document.createElement('div');
      questList.style.cssText = 'display: flex; flex-direction: column; gap: 2px;';

      chain.quests.forEach((q, i) => {
        const isCompleted = q.status === 'completed';
        const isActive = q.status === 'inbox' && !isCompleted;
        const isLocked = q.status === 'locked' || (!isCompleted && !isActive);

        const item = document.createElement('div');
        item.style.cssText = `
          display: flex; align-items: center; gap: 6px; padding: 3px 6px;
          border-radius: 4px; font-size: 0.75rem;
          color: ${isCompleted ? 'var(--accent-green,#51cf66)' : isActive ? 'var(--text-primary)' : 'var(--text-secondary)'};
          opacity: ${isLocked ? '0.4' : '1'};
        `;

        const dot = document.createElement('span');
        dot.style.cssText = `
          width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0;
          background: ${isCompleted ? 'var(--accent-green,#51cf66)' : isActive ? chain.color : 'rgba(255,255,255,0.1)'};
          border: 2px solid ${isActive ? chain.color : 'transparent'};
        `;
        item.appendChild(dot);

        const name = document.createElement('span');
        name.textContent = q.title || `Step ${i + 1}`;
        if (isCompleted) name.style.textDecoration = 'line-through';
        item.appendChild(name);

        if (isActive) {
          const badge = document.createElement('span');
          badge.style.cssText = `
            margin-left: auto; font-size: 0.6rem; background: ${chain.color}22;
            color: ${chain.color}; padding: 1px 6px; border-radius: 4px; white-space: nowrap;
          `;
          badge.textContent = 'ACTIVE';
          item.appendChild(badge);
        }

        questList.appendChild(item);
      });

      card.appendChild(questList);
      container.appendChild(card);
    });
  }

  // ─── EXPORTS ───

  window.QuestChains = {
    CHAIN_DEFINITIONS,
    getSubtasks,
    hasSubtasks,
    getSubtaskCompletion,
    areAllSubtasksDone,
    getCompletedSubtaskCount,
    toggleSubtask,
    resolveChainQuests,
    getAllChains,
    beforeQuestComplete,
    afterQuestComplete,
    renderSubtasksInQuest,
    renderChainIndicators,
    renderChainProgressPanel,
  };

  console.log(`[QuestChains] Loaded ${Object.keys(CHAIN_DEFINITIONS).length} chain definitions`);

})();
