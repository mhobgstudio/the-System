/* ═══════════════════════════════════════════════
 * Solo Leveling System — Stats Visualization
 * Radar chart + stat history line chart using Chart.js
 * ═══════════════════════════════════════════════ */

(function() {
  'use strict';

  let radarChartInstance = null;
  let historyChartInstance = null;

  const STAT_NAMES = ['strength', 'agility', 'intelligence', 'stamina', 'willpower', 'discipline'];
  const STAT_LABELS = ['Strength', 'Agility', 'Intelligence', 'Stamina', 'Willpower', 'Discipline'];
  const STAT_COLORS = [
    'rgba(255, 99, 132, 0.8)',   // Strength - red
    'rgba(54, 162, 235, 0.8)',    // Agility - blue
    'rgba(255, 206, 86, 0.8)',    // Intelligence - yellow
    'rgba(75, 192, 192, 0.8)',    // Stamina - teal
    'rgba(153, 102, 255, 0.8)',   // Willpower - purple
    'rgba(255, 159, 64, 0.8)',    // Discipline - orange
  ];

  function getCanvas(parent, id) {
    let canvas = parent.querySelector('canvas#' + id);
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = id;
      canvas.style.width = '100%';
      canvas.style.height = '300px';
      parent.appendChild(canvas);
    }
    return canvas;
  }

  async function renderRadarChart() {
    const container = document.querySelector('.spider-chart-modal .stats-chart-container');
    if (!container || typeof Chart === 'undefined') return;

    try {
      const stats = await db.playerStats.toArray();
      const player = stats[0] || {};
      const values = STAT_NAMES.map(s => player[s] || 1);

      // Clear previous chart
      if (radarChartInstance) {
        radarChartInstance.destroy();
        radarChartInstance = null;
      }

      // Remove old canvas if exists
      const oldCanvas = container.querySelector('canvas');
      if (oldCanvas) oldCanvas.remove();

      // Create wrapper for chart
      const wrapper = document.createElement('div');
      wrapper.style.cssText = 'width:100%;max-width:450px;margin:0 auto;padding:10px;';
      const canvas = document.createElement('canvas');
      wrapper.appendChild(canvas);
      container.innerHTML = '';
      container.appendChild(wrapper);

      radarChartInstance = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: STAT_LABELS,
          datasets: [{
            label: 'Current Stats',
            data: values,
            backgroundColor: 'rgba(74, 144, 226, 0.2)',
            borderColor: 'rgba(74, 144, 226, 0.8)',
            borderWidth: 2,
            pointBackgroundColor: STAT_COLORS,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              beginAtZero: true,
              grid: { color: 'rgba(74, 144, 226, 0.15)' },
              angleLines: { color: 'rgba(74, 144, 226, 0.15)' },
              pointLabels: { color: '#e0e0e0', font: { size: 12 } },
              ticks: {
                backdropColor: 'transparent',
                color: '#9898b0',
                font: { size: 10 }
              }
            }
          },
          plugins: {
            legend: {
              labels: { color: '#e0e0e0', font: { size: 12 } }
            }
          }
        }
      });
    } catch (e) {
      console.warn('[StatsChart] Radar render error:', e);
    }
  }

  async function renderStatHistoryChart(range) {
    const container = document.querySelector('.history-chart-container');
    if (!container || typeof Chart === 'undefined') return;

    container.style.display = 'block';

    try {
      // Determine date range
      const now = new Date();
      let startDate;
      switch (range) {
        case 'week':
          startDate = new Date(now); startDate.setDate(startDate.getDate() - 7);
          break;
        case 'month':
          startDate = new Date(now); startDate.setMonth(startDate.getMonth() - 1);
          break;
        case 'alltime':
        default:
          startDate = new Date(0); // Beginning of time
          break;
      }

      const history = await db.statHistory.toArray();
      const filtered = history.filter(h => new Date(h.date) >= startDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      if (filtered.length === 0) {
        container.innerHTML = '<p style="text-align:center;color:var(--text-secondary);padding:2rem;">No stat history yet. Complete quests to start tracking!</p>';
        return;
      }

      // Clear previous
      if (historyChartInstance) {
        historyChartInstance.destroy();
        historyChartInstance = null;
      }

      // Create canvas
      const oldCanvas = container.querySelector('canvas');
      if (oldCanvas) oldCanvas.remove();
      const canvas = document.createElement('canvas');
      canvas.style.width = '100%';
      canvas.style.height = '300px';
      container.innerHTML = '';
      container.appendChild(canvas);

      const datasets = STAT_NAMES.map((stat, i) => ({
        label: STAT_LABELS[i],
        data: filtered.map(h => h[stat] || 0),
        borderColor: STAT_COLORS[i],
        backgroundColor: STAT_COLORS[i].replace('0.8', '0.1'),
        borderWidth: 2,
        pointRadius: 2,
        pointHoverRadius: 5,
        tension: 0.3,
        fill: false,
      }));

      const labels = filtered.map(h => {
        const d = new Date(h.date);
        return `${d.getMonth()+1}/${d.getDate()}`;
      });

      historyChartInstance = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          interaction: {
            mode: 'index',
            intersect: false,
          },
          scales: {
            x: {
              grid: { color: 'rgba(74, 144, 226, 0.1)' },
              ticks: { color: '#9898b0', font: { size: 10 }, maxTicksLimit: 15 }
            },
            y: {
              beginAtZero: true,
              grid: { color: 'rgba(74, 144, 226, 0.1)' },
              ticks: { color: '#9898b0', font: { size: 10 } }
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: '#e0e0e0', font: { size: 11 }, boxWidth: 12, padding: 12 }
            }
          }
        }
      });
    } catch (e) {
      console.warn('[StatsChart] History render error:', e);
    }
  }

  // Hook into existing spider chart modal
  function initStatsCharts() {
    // Wait for Chart.js to be available
    if (typeof Chart === 'undefined') {
      // If Chart.js isn't loaded yet, try loading it
      if (!document.querySelector('script[src*="chart.js"]')) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js';
        script.onload = () => {
          console.log('[StatsChart] Chart.js loaded');
          setupChartHooks();
        };
        document.head.appendChild(script);
      }
      return;
    }
    setupChartHooks();
  }

  function setupChartHooks() {
    // Hook into spider chart modal showing
    const modal = document.getElementById('spider-chart-modal');
    if (!modal) return;

    const observer = new MutationObserver(() => {
      if (modal.style.display !== 'none' && modal.style.display !== '') {
        setTimeout(() => {
          renderRadarChart();
          updateStatValues();
        }, 100);
      }
    });
    observer.observe(modal, { attributes: true, attributeFilter: ['style'] });

    // Hook view tabs
    const currentBtn = document.getElementById('view-current');
    const historyBtn = document.getElementById('view-history');
    const compareBtn = document.getElementById('view-compare');

    if (currentBtn) {
      currentBtn.addEventListener('click', () => {
        setTimeout(renderRadarChart, 50);
      });
    }

    if (historyBtn) {
      historyBtn.addEventListener('click', async () => {
        const activeRange = document.querySelector('.time-button.active');
        const range = activeRange ? activeRange.dataset.range : 'week';
        await renderStatHistoryChart(range);
      });
    }

    // Hook time range buttons
    document.querySelectorAll('.time-button').forEach(btn => {
      btn.addEventListener('click', async () => {
        if (document.getElementById('view-history')?.classList.contains('active')) {
          await renderStatHistoryChart(btn.dataset.range);
        }
      });
    });

    // Hook compare button to show radar comparison
    if (compareBtn) {
      compareBtn.addEventListener('click', async () => {
        const history = await db.statHistory.toArray();
        if (history.length < 2) {
          document.querySelector('.chart-legend').style.display = 'none';
          return;
        }
        document.querySelector('.chart-legend').style.display = 'flex';
        setTimeout(async () => {
          await renderComparisonChart();
        }, 50);
      });
    }

    // Initial render hook
    if (modal.style.display === 'flex' || modal.style.display === 'block') {
      setTimeout(renderRadarChart, 100);
    }
  }

  async function renderComparisonChart() {
    const container = document.querySelector('.spider-chart-modal .stats-chart-container');
    if (!container || typeof Chart === 'undefined') return;

    try {
      const history = await db.statHistory.toArray();
      if (history.length < 2) return;

      const sorted = history.sort((a, b) => new Date(b.date) - new Date(a.date));
      const current = sorted[0];
      const previous = sorted[Math.min(7, sorted.length - 1)]; // 7 days ago or earliest

      if (radarChartInstance) {
        radarChartInstance.destroy();
        radarChartInstance = null;
      }

      const wrapper = container.querySelector('div') || container;
      const canvas = wrapper.querySelector('canvas') || (() => {
        const c = document.createElement('canvas');
        wrapper.innerHTML = '';
        wrapper.appendChild(c);
        return c;
      })();

      const currentValues = STAT_NAMES.map(s => current[s] || 1);
      const previousValues = STAT_NAMES.map(s => previous[s] || 1);

      radarChartInstance = new Chart(canvas, {
        type: 'radar',
        data: {
          labels: STAT_LABELS,
          datasets: [
            {
              label: 'Current',
              data: currentValues,
              backgroundColor: 'rgba(74, 144, 226, 0.2)',
              borderColor: 'rgba(74, 144, 226, 0.8)',
              borderWidth: 2,
              pointBackgroundColor: STAT_COLORS,
            },
            {
              label: 'Previous',
              data: previousValues,
              backgroundColor: 'rgba(255, 159, 64, 0.1)',
              borderColor: 'rgba(255, 159, 64, 0.6)',
              borderWidth: 2,
              borderDash: [5, 5],
              pointBackgroundColor: STAT_COLORS.map(() => 'rgba(255, 159, 64, 0.8)'),
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          scales: {
            r: {
              beginAtZero: true,
              grid: { color: 'rgba(74, 144, 226, 0.15)' },
              angleLines: { color: 'rgba(74, 144, 226, 0.15)' },
              pointLabels: { color: '#e0e0e0', font: { size: 12 } },
              ticks: { backdropColor: 'transparent', color: '#9898b0', font: { size: 10 } }
            }
          },
          plugins: {
            legend: {
              labels: { color: '#e0e0e0', font: { size: 12 } }
            }
          }
        }
      });
    } catch (e) {
      console.warn('[StatsChart] Comparison render error:', e);
    }
  }

  async function updateStatValues() {
    try {
      const stats = await db.playerStats.toArray();
      const player = stats[0] || {};
      // Bars are a percentage of MAX_STAT, matching the main stat display
      const MAX_STAT = (typeof SL_CONFIG !== 'undefined' && SL_CONFIG.MAX_STAT) ? SL_CONFIG.MAX_STAT : 10000;
      STAT_NAMES.forEach(s => {
        const val = player[s] || 1;
        const el = document.getElementById(`${s}-value`);
        const progress = document.getElementById(`${s}-progress`);
        if (el) el.textContent = val;
        if (progress) progress.style.width = `${Math.min(100, (val / MAX_STAT) * 100)}%`;
      });

      // Update total and average
      const total = STAT_NAMES.reduce((sum, s) => sum + (player[s] || 1), 0);
      const avg = Math.round(total / STAT_NAMES.length);
      const totalEl = document.getElementById('stat-total-value');
      const avgEl = document.getElementById('stat-avg-value');
      if (totalEl) totalEl.textContent = total;
      if (avgEl) avgEl.textContent = avg;
    } catch (e) {
      console.warn('[StatsChart] Update values error:', e);
    }
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStatsCharts);
  } else {
    initStatsCharts();
  }

  // Export for external use
  window.renderRadarChart = renderRadarChart;
  window.renderStatHistoryChart = renderStatHistoryChart;
  window.updateStatValues = updateStatValues;

})();
