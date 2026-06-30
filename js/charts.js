const Charts = {
  colors: {
    multi: ['#6c5ce7', '#00cec9', '#fdcb6e', '#ff6b6b', '#fd79a8', '#55efc4', '#74b9ff', '#fab1a0'],
    channels: {
      '京东': '#e53935',
      '淘宝': '#ff6f00',
      '拼多多': '#f57c00',
      '大润发': '#43a047',
      '盒马': '#2196f3',
      '山姆': '#00897b',
      '永辉': '#ff9800',
      '美团': '#ffc107',
      '超市': '#43a047',
      '其他': '#6c5ce7'
    }
  },

  currentYear: new Date().getFullYear(),
  currentMonth: 0,

  init() {
    this.buildSelectors();
    this.bindEvents();
    this.renderAll();
  },

  buildSelectors() {
    const now = new Date();
    const yearSel = document.getElementById('chart-year');
    const monthSel = document.getElementById('chart-month');

    for (let y = now.getFullYear(); y >= now.getFullYear() - 3; y--) {
      const opt = document.createElement('option');
      opt.value = y;
      opt.textContent = y + '年';
      yearSel.appendChild(opt);
    }
    yearSel.value = now.getFullYear();

    this.fillMonths(now.getFullYear());
    monthSel.value = 0;
  },

  fillMonths(year) {
    const monthSel = document.getElementById('chart-month');
    const now = new Date();
    const maxMonth = (year === now.getFullYear()) ? now.getMonth() + 1 : 12;

    monthSel.innerHTML = '<option value="0">全部月份</option>';
    for (let m = 1; m <= maxMonth; m++) {
      const opt = document.createElement('option');
      opt.value = m;
      opt.textContent = m + '月';
      monthSel.appendChild(opt);
    }
  },

  bindEvents() {
    const yearSel = document.getElementById('chart-year');
    const monthSel = document.getElementById('chart-month');

    yearSel.addEventListener('change', () => {
      this.currentYear = parseInt(yearSel.value);
      this.currentMonth = parseInt(monthSel.value);
      if (this.currentMonth > 0) {
        const now = new Date();
        if (this.currentYear === now.getFullYear() && this.currentMonth > now.getMonth() + 1) {
          monthSel.value = 0;
          this.currentMonth = 0;
        }
      }
      this.fillMonths(this.currentYear);
      monthSel.value = this.currentMonth;
      this.renderAll();
    });

    monthSel.addEventListener('change', () => {
      this.currentMonth = parseInt(monthSel.value);
      this.renderAll();
    });
  },

  getFilteredPurchases() {
    let purchases = Store.getPurchases();
    const y = this.currentYear;
    const m = this.currentMonth;

    if (m > 0) {
      const prefix = `${y}-${String(m).padStart(2, '0')}`;
      purchases = purchases.filter(p => p.date.startsWith(prefix));
    } else {
      purchases = purchases.filter(p => p.date.startsWith(y + '-'));
    }
    return purchases;
  },

  createDonut(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const { centerLabel = '', centerValue = '' } = options;
    const total = data.reduce((sum, d) => sum + d.value, 0);

    if (total === 0) {
      container.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:48px 0;font-size:13px">暂无数据</div>';
      return;
    }

    const radius = 72;
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
        <span class="legend-value">¥${this.fmt(d.value)} (${pct}%)</span>
      </div>`;
    }).join('');

    container.innerHTML = `<div class="donut-container">
      <div class="donut-chart">
        <svg viewBox="0 0 180 180">${segments.join('')}</svg>
        <div class="donut-center">
          <div class="donut-center-value">¥${this.fmt(total)}</div>
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
  },

  createBar(containerId, data, options = {}) {
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
        <div class="bar-value">${valuePrefix}${this.fmt(item.value)}</div>
      </div>`;
    }).join('');

    if (!document.getElementById('bar-kf')) {
      const s = document.createElement('style');
      s.id = 'bar-kf';
      s.textContent = '@keyframes barIn{from{opacity:0;transform:translateX(-12px)}to{opacity:1;transform:translateX(0)}}';
      document.head.appendChild(s);
    }
  },

  fmt(n) {
    if (n >= 10000) return (n / 10000).toFixed(1) + 'w';
    if (n >= 1000) return (n / 1000).toFixed(1) + 'k';
    return Math.round(n).toLocaleString();
  },

  renderMonthly() {
    const purchases = Store.getPurchases();
    const y = this.currentYear;
    const m = this.currentMonth;
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

      titleEl.textContent = m + '月消费趋势（按周）';
      this.createBar('chart-monthly', data, { valuePrefix: '¥' });
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

      titleEl.textContent = '月度消费趋势';
      this.createBar('chart-monthly', data, { valuePrefix: '¥' });
    }
  },

  renderCategory() {
    const purchases = this.getFilteredPurchases();
    const cat = {};
    purchases.forEach(p => { cat[p.category] = (cat[p.category] || 0) + p.totalPrice; });

    const data = Object.entries(cat)
      .map(([label, value], i) => ({ label, value, color: this.colors.multi[i % this.colors.multi.length] }))
      .sort((a, b) => b.value - a.value);

    this.createDonut('chart-category', data, { centerLabel: '分类占比' });
  },

  renderChannel() {
    const purchases = this.getFilteredPurchases();
    const ch = {};
    purchases.forEach(p => { ch[p.channel] = (ch[p.channel] || 0) + p.totalPrice; });

    const data = Object.entries(ch)
      .map(([label, value]) => ({ label, value, color: this.colors.channels[label] || '#6c5ce7' }))
      .sort((a, b) => b.value - a.value);

    this.createDonut('chart-channel', data, { centerLabel: '渠道占比' });
  },

  renderDailyCost() {
    const items = Store.getItems();
    const data = items
      .filter(i => i.dailyCost !== null)
      .map(i => ({ label: i.name, value: i.dailyCost }))
      .sort((a, b) => b.value - a.value);

    if (data.length === 0) {
      document.getElementById('chart-daily-cost').innerHTML =
        '<div style="text-align:center;color:var(--text-muted);padding:48px 0;font-size:13px">暂无数据</div>';
      return;
    }

    const max = data[0].value;
    const colored = data.map(d => {
      const r = d.value / max;
      if (r > 0.6) return { ...d, color: 'linear-gradient(135deg, #ff6b6b, #ee5a24)' };
      if (r > 0.3) return { ...d, color: 'linear-gradient(135deg, #fdcb6e, #f39c12)' };
      return { ...d, color: 'linear-gradient(135deg, #55efc4, #00b894)' };
    });

    this.createBar('chart-daily-cost', colored, { valuePrefix: '¥' });
  },

  renderAll() {
    this.renderMonthly();
    this.renderCategory();
    this.renderChannel();
    this.renderDailyCost();
    this.updateStatCards();
  },

  updateStatCards() {
    const filtered = this.getFilteredPurchases();
    const total = filtered.reduce((s, p) => s + p.totalPrice, 0);

    const now = new Date();
    const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const monthTotal = Store.getPurchases()
      .filter(p => p.date.startsWith(thisMonth))
      .reduce((s, p) => s + p.totalPrice, 0);

    const items = Store.getItems();
    const costs = items.filter(i => i.dailyCost !== null).map(i => i.dailyCost);
    const avgDaily = costs.length > 0 ? costs.reduce((a, b) => a + b, 0) / costs.length : 0;

    document.getElementById('stat-total-spending').textContent = '¥' + total.toLocaleString();
    document.getElementById('stat-month-spending').textContent = '¥' + monthTotal.toLocaleString();
    document.getElementById('stat-purchase-count').textContent = filtered.length;
    document.getElementById('stat-daily-spending').textContent = '¥' + avgDaily.toFixed(1);
  }
};

window.Charts = Charts;
