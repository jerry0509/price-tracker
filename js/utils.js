/**
 * Utils - 工具函数
 * 职责：格式化、日期、防抖、安全等通用工具
 */

/**
 * 生成UUID
 * @returns {string} UUID字符串
 */
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

/**
 * 格式化日期
 * @param {Date|string} date - 日期对象或字符串
 * @returns {string} YYYY-MM-DD格式
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 解析日期字符串
 * @param {string} dateStr - YYYY-MM-DD格式
 * @returns {Date|null} Date对象或null
 */
export function parseDate(dateStr) {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

/**
 * 计算两个日期间隔天数
 * @param {string} date1 - 日期1
 * @param {string} date2 - 日期2
 * @returns {number} 天数
 */
export function daysBetween(date1, date2) {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 格式化价格
 * @param {number} price - 价格
 * @returns {string} ¥格式的价格
 */
export function formatPrice(price) {
  if (price === null || price === undefined) return '¥0.00';
  return `¥${Number(price).toFixed(2)}`;
}

/**
 * 四舍五入到分（避免浮点精度问题）
 * @param {number} price - 价格
 * @returns {number} 精确到分的价格
 */
export function roundPrice(price) {
  return Math.round(Number(price) * 100) / 100;
}

/**
 * 格式化数字（千分位）
 * @param {number} num - 数字
 * @returns {string} 格式化后的字符串
 */
export function formatNumber(num) {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString('zh-CN');
}

/**
 * 格式化时长
 * @param {number} days - 天数
 * @returns {string} 格式化后的时长
 */
export function formatDuration(days) {
  if (days === null || days === undefined) return '数据不足';
  if (days < 1) return `${Math.round(days * 24)}小时`;
  if (days < 30) return `${Math.round(days)}天`;
  if (days < 365) return `${Math.round(days / 30)}个月`;
  return `${(days / 365).toFixed(1)}年`;
}

/**
 * 防抖函数
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟毫秒数
 * @returns {Function} 防抖后的函数
 */
export function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * HTML转义（防XSS）
 * @param {string} str - 原始字符串
 * @returns {string} 转义后的字符串
 */
export function escapeHtml(str) {
  if (!str) return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * 下载文件
 * @param {string} content - 文件内容
 * @param {string} filename - 文件名
 * @param {string} type - MIME类型
 */
export function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * 读取文件
 * @param {File} file - File对象
 * @returns {Promise<string>} 文件内容
 */
export function readFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => resolve(e.target.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * 获取当前月份
 * @returns {string} YYYY-MM格式
 */
export function getCurrentMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

/**
 * 获取当前年份
 * @returns {string} YYYY格式
 */
export function getCurrentYear() {
  return new Date().getFullYear().toString();
}

/**
 * 获取月份名称
 * @param {string} monthStr - YYYY-MM格式
 * @returns {string} X月格式
 */
export function getMonthName(monthStr) {
  const months = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
  const month = parseInt(monthStr.split('-')[1]) - 1;
  return months[month] || monthStr;
}

/**
 * 获取最近12个月
 * @returns {string[]} YYYY-MM格式数组
 */
export function getLast12Months() {
  const months = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    months.push(monthStr);
  }
  return months;
}

/**
 * 根据索引获取颜色
 * @param {number} index - 索引
 * @param {number} total - 总数
 * @returns {string} HSL颜色值
 */
export function getColorForIndex(index, total) {
  const hue = (index * 360 / total) % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * 获取渠道颜色
 * @param {string} channel - 渠道名
 * @returns {string} 颜色值
 */
export function getChannelColor(channel) {
  const colors = {
    '京东': '#e53935',
    '淘宝': '#ff6f00',
    '拼多多': '#f57c00',
    '超市': '#43a047',
    '其他': '#6366f1'
  };
  return colors[channel] || '#6366f1';
}

/**
 * 获取日均成本颜色class
 * @param {number} dailyCost - 日均成本
 * @returns {string} CSS类名
 */
export function getCostColorClass(dailyCost) {
  if (dailyCost === null || dailyCost === undefined) return '';
  if (dailyCost >= 5) return 'cost-high';
  if (dailyCost >= 1) return 'cost-medium';
  return 'cost-low';
}

/**
 * 获取日均成本标签
 * @param {number} dailyCost - 日均成本
 * @returns {string} 标签文本
 */
export function getCostLabel(dailyCost) {
  if (dailyCost === null || dailyCost === undefined) return '';
  if (dailyCost >= 5) return '消耗快';
  if (dailyCost >= 1) return '中等';
  return '消耗慢';
}
