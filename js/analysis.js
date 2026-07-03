/**
 * Analysis - 数据分析模块
 * 职责：统计卡片、图表渲染、年月筛选
 */

import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import { formatPrice, formatNumber } from './utils.js';

// 模块状态
const state = {
  currentYear: new Date().getFullYear(),
  currentMonth: 0
};

// 图表颜色配置
const colors = {
  multi: ['#f97316', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#eab308'],
  channels: {
    '京东': '#ef4444',
    '淘宝': '#f97316',
    '拼多多': '#f59e0b',
    '大润发': '#10b981',
    '盒马': '#3b82f6',
    '山姆': '#06b6d4',
    '永辉': '#f59e0b',
    '美团': '#eab308',
    '超市': '#10b981',
    '其他': '#8b5cf6'
  }
};

/**
 * 初始化模块
 */
export function init() {
  buildSelectors();
  bindEvents();

  // 监听数据变化事件
  EventBus.on('purchase:added', () => renderAll());
  EventBus.on('purchase:updated', () => renderAll());
  EventBus.on('purchase:deleted', () => renderAll());
  EventBus.on('data:imported', () => renderAll());
}

/**
 * 构建年月选择器
 */
function buildSelectors() {
  const now = new Date();
  const yearSel = document.getElementById('chart-year');
  const monthSel = document.getElementById('chart-month');

  if (!yearSel || !monthSel) return;

  for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) {
    const opt = document.createElement('option');
    opt.value = y;
    opt.textContent = y + '年';
    yearSel.appendChild(opt);
  }
  yearSel.value = now.getFullYear();

  fillMonths(now.getFullYear());
  monthSel.value = 0;
}

/**
 * 填充月份选项
 * @param {number} year - 年份
 */
function fillMonths(year) {
  const monthSel = document.getElementById('chart-month');
  if (!monthSel) return;

  const now = new Date();
  const maxMonth = (year === now.getFullYear()) ? now.getMonth() + 1 : 12;

  monthSel.innerHTML = '<option value="0">全部月份</option>';
  for (let m = 1; m <= maxMonth; m++) {
    const opt = document.createElement('option');
    opt.value = m;
    opt.textContent = m + '月';
    monthSel.appendChild(opt);
  }
}

/**
 * 绑定事件
 */
function bindEvents() {
  const yearSel = document.getElementById('chart-year');
  const monthSel = document.getElementById('chart-month');

  if (yearSel) {
    yearSel.addEventListener('change', () => {
      state.currentYear = parseInt(yearSel.value);
      state.currentMonth = parseInt(monthSel?.value || 0);
      if (state.currentMonth > 0) {
        const now = new Date();
        if (state.currentYear === now.getFullYear() && state.currentMonth > now.getMonth() + 1) {
          if (monthSel) monthSel.value = 0;
          state.currentMonth = 0;
        }
      }
      fillMonths(state.currentYear);
      if (monthSel) monthSel.value = state.currentMonth;
      renderAll();
    });
  }

  if (monthSel) {
    monthSel.addEventListener('change', () => {
      state.currentMonth = parseInt(monthSel.value);
      renderAll();
    });
  }
}

/**
 * 获取筛选后的购买记录
 * @returns {Array} 筛选后的记录
 */
function getFilteredPurchases() {
  let purchases = Store.getPurchases();
  const y = state.currentYear;
  const m = state.currentMonth;

  if (m > 0) {
    const prefix = `${y}-${String(m).padStart(2, '0')}`;
    purchases = purchases.filter(p => p.date.startsWith(prefix));
  } else {
    purchases = purchases.filter(p => p.date.startsWith(y + '-'));
  }
  return purchases;
}

/**
 * 格式化数字（简短）
 * @param {number} n - 数字
 * @returns {string} 格式化后的字符串
 */
function fmt(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
  return Math.round(n).toLocaleString();
}

/**
 * 创建甜甜圈图
 * @param {string} containerId - 容器ID
 * @param {Array} data - 数据
 * @param {Object} options - 选项
 */
function createDonut(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { centerLabel = '' } = options;
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:48px 0;font-size:13px">暂无数据</div>';
    return;
  }

  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;
  const segments = data.map((d, i) => {
    const pct = d.value / total;
    const dashArray = `${pct * circumference} ${circumference}`;
    const dashOffset = -offset;
    offset += pct * circumference;
    return `<circle cx="90" cy="90" r="${radius}" stroke="${d.color}" stroke-dasharray="${dashArray}" stroke-dashoffset="${dashOffset}" style="opacity:0;animation:donutIn 0.8s ease ${i * 0.08}s forwards"/>`;
  });

  const legendItems = data.map(d => {
    const pct = ((d.value / total) * 100).toFixed(1);
    return `<div class="legend-item">
      <div class="legend-dot" style="background:${d.color}"></div>
      <span class="legend-label">${d.label}</span>
      <span class="legend-value">¥${fmt(d.value)} (${pct}%)</span>
    </div>`;
  }).join('');

  container.innerHTML = `<div class="donut-container" style="padding-left:32px">
    <div class="donut-chart">
      <svg viewBox="0 0 180 180">${segments.join('')}</svg>
      <div class="donut-center">
        <div class="donut-center-value">¥${fmt(total)}</div>
        <div class="donut-center-label">${centerLabel}</div>
      </div>
    </div>
    <div class="donut-legend">${legendItems}</div>
  </div>`;

  if (!document.getElementById('donut-kf')) {
    const s = document.createElement('style');
    s.id = 'donut-kf';
    s.textContent = '@keyframes donutIn{from{opacity:0;stroke-dasharray:0 999}to{opacity:1}}';
    document.head.appendChild(s);
  }
}

/**
 * 创建柱状图
 * @param {string} containerId - 容器ID
 * @param {Array} data - 数据
 * @param {Object} options - 选项
 */
function createBar(containerId, data, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const { valuePrefix = '' } = options;
  const max = Math.max(...data.map(d => d.value), 1);

  container.innerHTML = data.map((item, i) => {
    const pct = (item.value / max) * 100;
    return `<div class="bar-row" style="animation:barIn 0.5s ease ${i * 0.05}s both">
      <div class="bar-label" title="${item.label}">${item.label}</div>
      <div class="bar-track">
        <div class="bar-fill" style="width:${pct}%;background:${item.color || 'var(--gradient-primary)'}">
        </div>
      </div>
      <div class="bar-value">${valuePrefix}${fmt(item.value)}</div>
    </div>`;
  }).join('');

  if (!document.getElementById('bar-kf')) {
    const s = document.createElement('style');
    s.id = 'bar-kf';
    s.textContent = '@keyframes barIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}';
    document.head.appendChild(s);
  }
}

/**
 * 渲染月度趋势
 */
function renderMonthly() {
  const purchases = Store.getPurchases();
  const y = state.currentYear;
  const m = state.currentMonth;
  const titleEl = document.getElementById('monthly-title');

  if (m > 0) {
    const prefix = `${y}-${String(m).padStart(2, '0')}`;
    const dayMap = {};
    purchases.filter(p => p.date.startsWith(prefix)).forEach(p => {
      const day = parseInt(p.date.split('-')[2]);
      dayMap[day] = (dayMap[day] || 0) + p.totalPrice;
    });

    const daysInMonth = new Date(y, m, 0).getDate();
    const firstDay = new Date(y, m - 1, 1).getDay();
    const mondayOffset = firstDay === 0 ? 6 : firstDay - 1;

    const weeks = [];
    let weekStart = 1;
    let weekNum = 1;

    if (mondayOffset > 0) {
      const end = Math.min(mondayOffset, daysInMonth);
      let sum = 0;
      for (let d = weekStart; d <= end; d++) sum += (dayMap[d] || 0);
      weeks.push({ label: `余 (${weekStart}-${end}日)`, value: sum });
      weekStart = end + 1;
    }

    while (weekStart <= daysInMonth) {
      const weekEnd = Math.min(weekStart + 6, daysInMonth);
      let sum = 0;
      for (let d = weekStart; d <= weekEnd; d++) sum += (dayMap[d] || 0);

      const isPartial = (weekEnd - weekStart + 1) < 7;
      const label = isPartial
        ? `余 (${weekStart}-${weekEnd}日)`
        : `第${weekNum}周 (${weekStart}-${weekEnd}日)`;

      weeks.push({ label, value: sum });
      weekStart = weekEnd + 1;
      if (!isPartial) weekNum++;
    }

    const data = weeks.map((w, i) => {
      const hue = 240 + i * 25;
      return { ...w, color: `linear-gradient(135deg, hsl(${hue},70%,60%), hsl(${hue+10},70%,50%))` };
    });

    if (titleEl) titleEl.textContent = m + '月消费趋势（按周）';
    createBar('chart-monthly', data, { valuePrefix: '¥' });
  } else {
    const monthly = {};
    purchases.filter(p => p.date.startsWith(y + '-')).forEach(p => {
      const mo = parseInt(p.date.split('-')[1]);
      monthly[mo] = (monthly[mo] || 0) + p.totalPrice;
    });

    const data = [];
    for (let mo = 1; mo <= 12; mo++) {
      const hue = 240 + (mo - 1) * 10;
      data.push({
        label: mo + '月',
        value: monthly[mo] || 0,
        color: `linear-gradient(135deg, hsl(${hue},70%,60%), hsl(${hue+10},70%,50%))`
      });
    }

    if (titleEl) titleEl.textContent = '月度消费趋势';
    createBar('chart-monthly', data, { valuePrefix: '¥' });
  }
}

/**
 * 渲染分类占比
 */
function renderCategory() {
  const purchases = getFilteredPurchases();
  const cat = {};
  purchases.forEach(p => { cat[p.category] = (cat[p.category] || 0) + p.totalPrice; });

  const data = Object.entries(cat)
    .map(([label, value], i) => ({ label, value, color: colors.multi[i % colors.multi.length] }))
    .sort((a, b) => b.value - a.value);

  createDonut('chart-category', data, { centerLabel: '分类占比' });
}

/**
 * 渲染渠道占比
 */
function renderChannel() {
  const purchases = getFilteredPurchases();
  const ch = {};
  purchases.forEach(p => { ch[p.channel] = (ch[p.channel] || 0) + p.totalPrice; });

  const data = Object.entries(ch)
    .map(([label, value]) => ({ label, value, color: colors.channels[label] || '#8b5cf6' }))
    .sort((a, b) => b.value - a.value);

  createDonut('chart-channel', data, { centerLabel: '渠道占比' });
}

/**
 * 渲染日均成本排名
 */
function renderDailyCost() {
  const items = Store.getItems();
  const data = items
    .filter(i => i.dailyCost !== null)
    .map(i => ({ label: i.name, value: i.dailyCost }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    const container = document.getElementById('chart-daily-cost');
    if (container) {
      container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:48px 0;font-size:13px">暂无数据</div>';
    }
    return;
  }

  const max = data[0].value;
  const colored = data.map(d => {
    const r = d.value / max;
    if (r > 0.6) return { ...d, color: 'linear-gradient(135deg, #ef4444, #dc2626)' };
    if (r > 0.3) return { ...d, color: 'linear-gradient(135deg, #f59e0b, #d97706)' };
    return { ...d, color: 'linear-gradient(135deg, #10b981, #059669)' };
  });

  createBar('chart-daily-cost', colored, { valuePrefix: '¥' });
}

/**
 * 更新统计卡片
 */
function updateStatCards() {
  const filtered = getFilteredPurchases();
  const total = filtered.reduce((s, p) => s + Store.getEffectivePrice(p), 0);

  const y = state.currentYear;
  const m = state.currentMonth;
  const now = new Date();
  
  // 根据选择的年月计算
  let monthTotal, avgDaily;
  
  if (m > 0) {
    // 选择了具体月份
    const prefix = `${y}-${String(m).padStart(2, '0')}`;
    const daysInMonth = new Date(y, m, 0).getDate();
    
    monthTotal = filtered.reduce((s, p) => s + Store.getEffectivePrice(p), 0);
    avgDaily = monthTotal / daysInMonth;
  } else {
    // 选择了全年
    const daysInYear = (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 ? 366 : 365;
    const dayOfYear = y === now.getFullYear() 
      ? Math.floor((now - new Date(y, 0, 1)) / (1000 * 60 * 60 * 24)) + 1
      : daysInYear;
    
    monthTotal = total;
    avgDaily = total / dayOfYear;
  }

  const statTotalSpending = document.getElementById('stat-total-spending');
  const statMonthSpending = document.getElementById('stat-month-spending');
  const statPurchaseCount = document.getElementById('stat-purchase-count');
  const statDailySpending = document.getElementById('stat-daily-spending');

  if (statTotalSpending) statTotalSpending.textContent = '¥' + total.toLocaleString();
  if (statMonthSpending) statMonthSpending.textContent = '¥' + monthTotal.toLocaleString();
  if (statPurchaseCount) statPurchaseCount.textContent = filtered.length;
  if (statDailySpending) statDailySpending.textContent = '¥' + avgDaily.toFixed(1);
}

/**
 * 渲染所有图表
 */
export function renderAll() {
  renderMonthly();
  renderCategory();
  renderChannel();
  renderDailyCost();
  updateStatCards();
}
