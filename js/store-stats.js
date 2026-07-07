/**
 * StoreStats - 统计计算模块
 * 职责：月度/分类/渠道消费统计
 */

import { getCurrentMonth, getCurrentYear } from './utils.js';

/**
 * 获取月度消费统计
 * @param {Array} purchases - 购买记录
 * @param {Function} getEffectivePrice - 有效价格计算函数
 * @returns {Object} 月度消费数据
 */
export function getMonthlySpending(purchases, getEffectivePrice) {
  const monthly = {};
  purchases.forEach(p => {
    const month = p.date.substring(0, 7);
    monthly[month] = (monthly[month] || 0) + getEffectivePrice(p);
  });
  return monthly;
}

/**
 * 获取分类消费统计
 * @param {Array} purchases - 购买记录
 * @param {Function} getEffectivePrice - 有效价格计算函数
 * @returns {Object} 分类消费数据
 */
export function getCategorySpending(purchases, getEffectivePrice) {
  const category = {};
  purchases.forEach(p => {
    category[p.category] = (category[p.category] || 0) + getEffectivePrice(p);
  });
  return category;
}

/**
 * 获取渠道消费统计
 * @param {Array} purchases - 购买记录
 * @param {Function} getEffectivePrice - 有效价格计算函数
 * @returns {Object} 渠道消费数据
 */
export function getChannelSpending(purchases, getEffectivePrice) {
  const channel = {};
  purchases.forEach(p => {
    channel[p.channel] = (channel[p.channel] || 0) + getEffectivePrice(p);
  });
  return channel;
}

/**
 * 获取当月消费
 * @param {Array} purchases - 购买记录
 * @param {Function} getEffectivePrice - 有效价格计算函数
 * @returns {number} 当月消费总额
 */
export function getCurrentMonthSpending(purchases, getEffectivePrice) {
  const currentMonth = getCurrentMonth();
  return purchases
    .filter(p => p.date.startsWith(currentMonth))
    .reduce((sum, p) => sum + getEffectivePrice(p), 0);
}

/**
 * 获取当年消费
 * @param {Array} purchases - 购买记录
 * @param {Function} getEffectivePrice - 有效价格计算函数
 * @returns {number} 当年消费总额
 */
export function getCurrentYearSpending(purchases, getEffectivePrice) {
  const currentYear = getCurrentYear();
  return purchases
    .filter(p => p.date.startsWith(currentYear))
    .reduce((sum, p) => sum + getEffectivePrice(p), 0);
}

/**
 * 获取总消费
 * @param {Array} purchases - 购买记录
 * @param {Function} getEffectivePrice - 有效价格计算函数
 * @returns {number} 总消费额
 */
export function getTotalSpending(purchases, getEffectivePrice) {
  return purchases.reduce((sum, p) => sum + getEffectivePrice(p), 0);
}

/**
 * 计算有效价格（促销价优先）
 * @param {Object} p - 购买记录
 * @returns {number} 有效价格
 */
export function getEffectivePrice(p) {
  return (p.isPromo && p.actualPaid) ? p.actualPaid : p.totalPrice;
}
