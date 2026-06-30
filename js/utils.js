const Utils = {
  generateId() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },

  parseDate(dateStr) {
    if (!dateStr) return null;
    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
  },

  daysBetween(date1, date2) {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  formatPrice(price) {
    if (price === null || price === undefined) return '¥0.00';
    return `¥${Number(price).toFixed(2)}`;
  },

  formatNumber(num) {
    if (num === null || num === undefined) return '0';
    return num.toLocaleString('zh-CN');
  },

  formatDuration(days) {
    if (days === null || days === undefined) return '数据不足';
    if (days < 1) return `${Math.round(days * 24)}小时`;
    if (days < 30) return `${Math.round(days)}天`;
    if (days < 365) return `${Math.round(days / 30)}个月`;
    return `${(days / 365).toFixed(1)}年`;
  },

  debounce(fn, delay) {
    let timer = null;
    return function(...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  },

  escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  readFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  },

  getCurrentMonth() {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  },

  getCurrentYear() {
    return new Date().getFullYear().toString();
  },

  getMonthName(monthStr) {
    const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
    const month = parseInt(monthStr.split('-')[1]) - 1;
    return months[month] || monthStr;
  },

  getLast12Months() {
    const months = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthStr);
    }
    return months;
  },

  getColorForIndex(index, total) {
    const hue = (index * 360 / total) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  },

  getChannelColor(channel) {
    const colors = {
      '京东': '#e53935',
      '淘宝': '#ff6f00',
      '拼多多': '#f57c00',
      '超市': '#43a047',
      '其他': '#6366f1'
    };
    return colors[channel] || '#6366f1';
  },

  getCostColorClass(dailyCost) {
    if (dailyCost === null || dailyCost === undefined) return '';
    if (dailyCost >= 5) return 'cost-high';
    if (dailyCost >= 1) return 'cost-medium';
    return 'cost-low';
  },

  getCostLabel(dailyCost) {
    if (dailyCost === null || dailyCost === undefined) return '';
    if (dailyCost >= 5) return '消耗快';
    if (dailyCost >= 1) return '中等';
    return '消耗慢';
  }
};

window.Utils = Utils;
