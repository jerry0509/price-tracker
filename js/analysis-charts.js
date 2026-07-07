/**
 * AnalysisCharts - 图表渲染模块
 * 职责：环形图、柱状图、趋势图渲染
 */

import { formatPrice, formatNumber, getColorForIndex, getChannelColor, getMonthName, getLast12Months } from './utils.js';

// 图表颜色配置
const colors = {
  multi: ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308'],
  channels: {
    '京东': '#ef4444', '淘宝': '#f97316', '拼多多': '#f59e0b', '大润发': '#10b981',
    '盒马': '#3b82f6', '山姆': '#06b6d4', '永辉': '#f97316', '美团': '#eab308',
    '菜市场': '#84cc16', '超市': '#10b981', '超盒算': '#14b8a6', '其他': '#6b7280'
  }
};

/**
 * 创建环形图
 * @param {string} containerId - 容器ID
 * @param {Object} data - 数据
 * @param {string} colorType - 颜色类型
 */
export function createDonut(containerId, data, colorType = 'multi') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const total = entries.reduce((sum, [, v]) => sum + v, 0);

  if (total === 0) {
    container.innerHTML = '<div class="chart-empty">暂无数据</div>';
    return;
  }

  const size = 160;
  const radius = 60;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulated = 0;
  const segments = entries.map(([key, value], i) => {
    const percent = value / total;
    const offset = accumulated;
    accumulated += percent;

    let color;
    if (colorType === 'channels') {
      color = colors.channels[key] || colors.multi[i % colors.multi.length];
    } else {
      color = colors.multi[i % colors.multi.length];
    }

    return {
      key,
      value,
      percent,
      offset,
      color
    };
  });

  const svg = `
    <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      ${segments.map(seg => `
        <circle
          cx="${cx}" cy="${cy}" r="${radius}"
          fill="none"
          stroke="${seg.color}"
          stroke-width="20"
          stroke-dasharray="${circumference * seg.percent} ${circumference * (1 - seg.percent)}"
          stroke-dashoffset="${-circumference * seg.offset}"
          transform="rotate(-90 ${cx} ${cy})"
          style="transition: stroke-dasharray 0.3s ease"
        />
      `).join('')}
      <text x="${cx}" y="${cy - 8}" text-anchor="middle" fill="var(--text-primary)" font-size="16" font-weight="600">${formatNumber(total)}</text>
      <text x="${cx}" y="${cy + 12}" text-anchor="middle" fill="var(--text-muted)" font-size="11">总计</text>
    </svg>
  `;

  const legend = `
    <div class="chart-legend">
      ${segments.slice(0, 8).map(seg => `
        <div class="legend-item">
          <span class="legend-color" style="background:${seg.color}"></span>
          <span class="legend-label">${seg.key}</span>
          <span class="legend-value">${formatPrice(seg.value)}</span>
          <span class="legend-percent">${(seg.percent * 100).toFixed(1)}%</span>
        </div>
      `).join('')}
    </div>
  `;

  container.innerHTML = `<div class="donut-chart">${svg}${legend}</div>`;
}

/**
 * 渲染月度趋势图
 * @param {Array} months - 月份列表
 * @param {Object} monthlyData - 月度数据
 */
export function renderMonthlyChart(months, monthlyData) {
  const container = document.getElementById('monthly-chart');
  if (!container) return;

  const values = months.map(m => monthlyData[m] || 0);
  const max = Math.max(...values, 1);

  const bars = months.map((month, i) => {
    const value = values[i];
    const height = (value / max) * 100;
    const isCurrentMonth = month === new Date().toISOString().substring(0, 7);

    return `
      <div class="bar-group" title="${getMonthName(month)}: ${formatPrice(value)}">
        <div class="bar-value">${value > 0 ? formatPrice(value) : ''}</div>
        <div class="bar ${isCurrentMonth ? 'bar-current' : ''}" style="height:${Math.max(height, 2)}%"></div>
        <div class="bar-label">${getMonthName(month)}</div>
      </div>
    `;
  }).join('');

  container.innerHTML = `<div class="bar-chart">${bars}</div>`;
}

/**
 * 渲染日均成本排名
 * @param {Array} items - 商品列表
 * @param {string} categoryFilter - 分类筛选
 */
export function renderDailyCostRank(items, categoryFilter = '') {
  const container = document.getElementById('daily-cost-chart');
  if (!container) return;

  let filtered = items.filter(item => item.dailyCost !== null);
  if (categoryFilter) {
    filtered = filtered.filter(item => item.category === categoryFilter);
  }

  filtered.sort((a, b) => b.dailyCost - a.dailyCost);
  filtered = filtered.slice(0, 10);

  if (filtered.length === 0) {
    container.innerHTML = '<div class="chart-empty">暂无数据</div>';
    return;
  }

  const max = filtered[0]?.dailyCost || 1;

  const rows = filtered.map((item, i) => {
    const width = (item.dailyCost / max) * 100;
    return `
      <div class="cost-rank-item">
        <span class="rank">${i + 1}</span>
        <span class="name">${item.name}</span>
        <div class="bar-wrapper">
          <div class="bar" style="width:${width}%"></div>
        </div>
        <span class="value">¥${item.dailyCost.toFixed(2)}/天</span>
      </div>
    `;
  }).join('');

  container.innerHTML = rows;
}

export { colors };
