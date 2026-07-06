/**
 * Store - 数据层
 * 职责：localStorage CRUD、数据聚合、导入导出
 */

import { EventBus } from './eventBus.js';
import { generateId, daysBetween, formatDate, getCurrentMonth, getCurrentYear } from './utils.js';

const STORAGE_KEY = 'price-tracker-data';
const CATEGORIES_KEY = 'price-tracker-categories';
const CHANNELS_KEY = 'price-tracker-channels';
const VERSION_KEY = 'price-tracker-version';
const CURRENT_VERSION = '3.8';

const defaultCategories = ['日用个护', '柴米油盐', '零食饮料', '科技电子', '其他'];
const defaultChannels = ['京东', '淘宝', '拼多多', '大润发', '盒马', '山姆', '永辉', '美团', '菜市场', '超市', '超盒算', '其他'];

const defaultPurchases = [
  { id: 'd01', itemId: 'item-tissue', itemName: '抽纸', category: '日用个护', price: 35, quantity: 10, totalPrice: 350, channel: '京东', date: '2026-01-08', notes: '年货节', specQty: 120, specUnit: '抽', isPromo: true, promoType: '满减', actualPaid: 320, rating: 5, brand: '维达' },
  { id: 'd02', itemId: 'item-tissue', itemName: '抽纸', category: '日用个护', price: 28, quantity: 5, totalPrice: 140, channel: '拼多多', date: '2026-02-15', notes: '', specQty: 110, specUnit: '抽', rating: 3, brand: '清风' },
  { id: 'd03', itemId: 'item-tissue', itemName: '抽纸', category: '日用个护', price: 32, quantity: 8, totalPrice: 256, channel: '大润发', date: '2026-04-20', notes: '特价', specQty: 130, specUnit: '抽', isPromo: true, promoType: '买一送一', actualPaid: 128, rating: 4, brand: '心相印' },
  { id: 'd04', itemId: 'item-tissue', itemName: '抽纸', category: '日用个护', price: 30, quantity: 6, totalPrice: 180, channel: '盒马', date: '2026-06-10', notes: '', specQty: 120, specUnit: '抽', rating: 4, brand: '维达' },
  { id: 'd05', itemId: 'item-shampoo', itemName: '洗发水', category: '日用个护', price: 49, quantity: 2, totalPrice: 98, channel: '京东', date: '2026-01-20', notes: '', rating: 4, brand: '海飞丝' },
  { id: 'd06', itemId: 'item-shampoo', itemName: '洗发水', category: '日用个护', price: 45, quantity: 1, totalPrice: 45, channel: '山姆', date: '2026-04-05', notes: '大瓶装', rating: 5, brand: '潘婷' },
  { id: 'd07', itemId: 'item-shampoo', itemName: '洗发水', category: '日用个护', price: 52, quantity: 2, totalPrice: 104, channel: '盒马', date: '2026-06-25', notes: '', rating: 3, brand: '海飞丝' },
  { id: 'd08', itemId: 'item-detergent', itemName: '洗衣液', category: '日用个护', price: 39, quantity: 2, totalPrice: 78, channel: '拼多多', date: '2026-01-12', notes: '', rating: 4, brand: '立白' },
  { id: 'd09', itemId: 'item-detergent', itemName: '洗衣液', category: '日用个护', price: 45, quantity: 1, totalPrice: 45, channel: '大润发', date: '2026-03-18', notes: '', rating: 3, brand: '蓝月亮' },
  { id: 'd10', itemId: 'item-detergent', itemName: '洗衣液', category: '日用个护', price: 42, quantity: 2, totalPrice: 84, channel: '山姆', date: '2026-05-22', notes: '', rating: 5, brand: '奥妙' },
  { id: 'd11', itemId: 'item-rice', itemName: '大米', category: '柴米油盐', price: 59, quantity: 1, totalPrice: 59, channel: '山姆', date: '2026-01-25', notes: '5kg装', rating: 5, brand: '福临门' },
  { id: 'd12', itemId: 'item-rice', itemName: '大米', category: '柴米油盐', price: 65, quantity: 1, totalPrice: 65, channel: '盒马', date: '2026-03-30', notes: '东北大米', rating: 4, brand: '金龙鱼' },
  { id: 'd13', itemId: 'item-rice', itemName: '大米', category: '柴米油盐', price: 55, quantity: 1, totalPrice: 55, channel: '大润发', date: '2026-06-05', notes: '', rating: 3, brand: '福临门' },
  { id: 'd14', itemId: 'item-eggs', itemName: '鸡蛋', category: '柴米油盐', price: 18, quantity: 2, totalPrice: 36, channel: '盒马', date: '2026-01-10', notes: '', specQty: 10, specUnit: '枚', rating: 4, brand: '' },
  { id: 'd15', itemId: 'item-eggs', itemName: '鸡蛋', category: '柴米油盐', price: 15, quantity: 2, totalPrice: 30, channel: '永辉', date: '2026-02-20', notes: '30枚装', specQty: 30, specUnit: '枚', rating: 5, brand: '' },
  { id: 'd16', itemId: 'item-eggs', itemName: '鸡蛋', category: '柴米油盐', price: 20, quantity: 1, totalPrice: 20, channel: '美团', date: '2026-04-12', notes: '', specQty: 10, specUnit: '枚', rating: 3, brand: '' },
  { id: 'd17', itemId: 'item-eggs', itemName: '鸡蛋', category: '柴米油盐', price: 16, quantity: 2, totalPrice: 32, channel: '大润发', date: '2026-06-18', notes: '', specQty: 12, specUnit: '枚', rating: 4, brand: '' },
  { id: 'd18', itemId: 'item-milk', itemName: '牛奶', category: '零食饮料', price: 55, quantity: 2, totalPrice: 110, channel: '山姆', date: '2026-01-05', notes: '鲜奶', specQty: 1000, specUnit: 'ml', rating: 5, brand: '蒙牛' },
  { id: 'd19', itemId: 'item-milk', itemName: '牛奶', category: '零食饮料', price: 49, quantity: 2, totalPrice: 98, channel: '盒马', date: '2026-03-08', notes: '', specQty: 950, specUnit: 'ml', rating: 4, brand: '伊利' },
  { id: 'd20', itemId: 'item-milk', itemName: '牛奶', category: '零食饮料', price: 58, quantity: 1, totalPrice: 58, channel: '山姆', date: '2026-05-15', notes: '', specQty: 1000, specUnit: 'ml', rating: 4, brand: '蒙牛' },
  { id: 'd21', itemId: 'item-milk', itemName: '牛奶', category: '零食饮料', price: 52, quantity: 2, totalPrice: 104, channel: '美团', date: '2026-06-28', notes: '', specQty: 250, specUnit: 'ml', rating: 3, brand: '光明' },
  { id: 'd22', itemId: 'item-apple', itemName: '苹果', category: '柴米油盐', price: 35, quantity: 1, totalPrice: 35, channel: '盒马', date: '2026-01-18', notes: '红富士', rating: 4, brand: '' },
  { id: 'd23', itemId: 'item-apple', itemName: '苹果', category: '柴米油盐', price: 28, quantity: 2, totalPrice: 56, channel: '美团', date: '2026-03-22', notes: '', rating: 3, brand: '' },
  { id: 'd24', itemId: 'item-apple', itemName: '苹果', category: '柴米油盐', price: 32, quantity: 1, totalPrice: 32, channel: '永辉', date: '2026-05-10', notes: '', rating: 4, brand: '' },
  { id: 'd25', itemId: 'item-banana', itemName: '香蕉', category: '柴米油盐', price: 12, quantity: 2, totalPrice: 24, channel: '美团', date: '2026-02-05', notes: '', rating: 5, brand: '' },
  { id: 'd26', itemId: 'item-banana', itemName: '香蕉', category: '柴米油盐', price: 15, quantity: 1, totalPrice: 15, channel: '盒马', date: '2026-04-18', notes: '', rating: 4, brand: '' },
  { id: 'd27', itemId: 'item-banana', itemName: '香蕉', category: '柴米油盐', price: 10, quantity: 3, totalPrice: 30, channel: '大润发', date: '2026-06-22', notes: '特价', rating: 5, brand: '' },
  { id: 'd28', itemId: 'item-pork', itemName: '猪肉', category: '柴米油盐', price: 25, quantity: 2, totalPrice: 50, channel: '永辉', date: '2026-01-22', notes: '五花肉', rating: 4, brand: '' },
  { id: 'd29', itemId: 'item-pork', itemName: '猪肉', category: '柴米油盐', price: 22, quantity: 2, totalPrice: 44, channel: '美团', date: '2026-03-15', notes: '', rating: 3, brand: '' },
  { id: 'd30', itemId: 'item-pork', itemName: '猪肉', category: '柴米油盐', price: 28, quantity: 1, totalPrice: 28, channel: '山姆', date: '2026-05-28', notes: '黑猪肉', rating: 5, brand: '' },
  { id: 'd31', itemId: 'item-chicken', itemName: '鸡胸肉', category: '柴米油盐', price: 18, quantity: 3, totalPrice: 54, channel: '山姆', date: '2026-02-12', notes: '', rating: 4, brand: '' },
  { id: 'd32', itemId: 'item-chicken', itemName: '鸡胸肉', category: '柴米油盐', price: 15, quantity: 2, totalPrice: 30, channel: '美团', date: '2026-04-25', notes: '', rating: 3, brand: '' },
  { id: 'd33', itemId: 'item-chicken', itemName: '鸡胸肉', category: '柴米油盐', price: 20, quantity: 2, totalPrice: 40, channel: '盒马', date: '2026-06-15', notes: '', rating: 4, brand: '' },
  { id: 'd34', itemId: 'item-tomato', itemName: '西红柿', category: '柴米油盐', price: 8, quantity: 2, totalPrice: 16, channel: '美团', date: '2026-01-28', notes: '', rating: 4, brand: '' },
  { id: 'd35', itemId: 'item-tomato', itemName: '西红柿', category: '柴米油盐', price: 6, quantity: 3, totalPrice: 18, channel: '永辉', date: '2026-03-25', notes: '', rating: 5, brand: '' },
  { id: 'd36', itemId: 'item-tomato', itemName: '西红柿', category: '柴米油盐', price: 10, quantity: 2, totalPrice: 20, channel: '盒马', date: '2026-06-08', notes: '', rating: 4, brand: '' },
  { id: 'd37', itemId: 'item-broccoli', itemName: '西兰花', category: '柴米油盐', price: 12, quantity: 2, totalPrice: 24, channel: '盒马', date: '2026-02-08', notes: '', rating: 4, brand: '' },
  { id: 'd38', itemId: 'item-broccoli', itemName: '西兰花', category: '柴米油盐', price: 8, quantity: 2, totalPrice: 16, channel: '美团', date: '2026-04-30', notes: '', rating: 3, brand: '' },
  { id: 'd39', itemId: 'item-broccoli', itemName: '西兰花', category: '柴米油盐', price: 10, quantity: 1, totalPrice: 10, channel: '大润发', date: '2026-06-20', notes: '', rating: 4, brand: '' },
  { id: 'd40', itemId: 'item-chips', itemName: '薯片', category: '零食饮料', price: 12, quantity: 3, totalPrice: 36, channel: '拼多多', date: '2026-01-30', notes: '', rating: 4, brand: '乐事' },
  { id: 'd41', itemId: 'item-chips', itemName: '薯片', category: '零食饮料', price: 15, quantity: 2, totalPrice: 30, channel: '京东', date: '2026-04-08', notes: '', rating: 3, brand: '品客' },
  { id: 'd42', itemId: 'item-chips', itemName: '薯片', category: '零食饮料', price: 10, quantity: 4, totalPrice: 40, channel: '大润发', date: '2026-06-12', notes: '促销', rating: 5, brand: '乐事' },
  { id: 'd43', itemId: 'item-earphone', itemName: '蓝牙耳机', category: '科技电子', price: 299, quantity: 1, totalPrice: 299, channel: '淘宝', date: '2025-12-01', notes: '降噪款', rating: 5, brand: '索尼' },
  { id: 'd44', itemId: 'item-earphone', itemName: '蓝牙耳机', category: '科技电子', price: 199, quantity: 1, totalPrice: 199, channel: '京东', date: '2026-05-20', notes: '备用', rating: 4, brand: '漫步者' },
  { id: 'd45', itemId: 'item-cable', itemName: '数据线', category: '科技电子', price: 15, quantity: 3, totalPrice: 45, channel: '拼多多', date: '2026-02-25', notes: 'Type-C', rating: 4, brand: '绿联' },
  { id: 'd46', itemId: 'item-cable', itemName: '数据线', category: '科技电子', price: 12, quantity: 2, totalPrice: 24, channel: '淘宝', date: '2026-05-05', notes: '', rating: 3, brand: '品胜' },
  { id: 'd47', itemId: 'item-toothpaste', itemName: '牙膏', category: '日用个护', price: 15, quantity: 2, totalPrice: 30, channel: '大润发', date: '2026-01-15', notes: '', rating: 4, brand: '高露洁' },
  { id: 'd48', itemId: 'item-toothpaste', itemName: '牙膏', category: '日用个护', price: 12, quantity: 3, totalPrice: 36, channel: '山姆', date: '2026-04-15', notes: '套装', rating: 5, brand: '佳洁士' },
  { id: 'd49', itemId: 'item-water', itemName: '矿泉水', category: '零食饮料', price: 2, quantity: 12, totalPrice: 24, channel: '美团', date: '2026-03-05', notes: '', rating: 4, brand: '农夫山泉' },
  { id: 'd50', itemId: 'item-water', itemName: '矿泉水', category: '零食饮料', price: 2, quantity: 24, totalPrice: 48, channel: '山姆', date: '2026-06-01', notes: '整箱', rating: 5, brand: '怡宝' },
  { id: 'd51', itemId: 'item-tissue', itemName: '抽纸', category: '日用个护', price: 28, quantity: 8, totalPrice: 224, channel: '京东', date: '2026-07-01', notes: '618返场', specQty: 120, specUnit: '抽', isPromo: true, promoType: '满减', actualPaid: 199, rating: 5, brand: '维达' },
  { id: 'd52', itemId: 'item-milk', itemName: '牛奶', category: '零食饮料', price: 55, quantity: 2, totalPrice: 110, channel: '山姆', date: '2026-07-02', notes: '', specQty: 1000, specUnit: 'ml', rating: 4, brand: '蒙牛' },
  { id: 'd53', itemId: 'item-eggs', itemName: '鸡蛋', category: '柴米油盐', price: 18, quantity: 2, totalPrice: 36, channel: '盒马', date: '2026-07-03', notes: '', specQty: 10, specUnit: '枚', rating: 4, brand: '' },
  // 菜市场数据
  { id: 'd54', itemId: 'item-pork', itemName: '猪肉', category: '柴米油盐', price: 22, quantity: 2, totalPrice: 44, channel: '菜市场', date: '2026-06-10', notes: '五花肉', rating: 5, brand: '' },
  { id: 'd55', itemId: 'item-tomato', itemName: '西红柿', category: '柴米油盐', price: 5, quantity: 3, totalPrice: 15, channel: '菜市场', date: '2026-06-15', notes: '', rating: 5, brand: '' },
  { id: 'd56', itemId: 'item-apple', itemName: '苹果', category: '柴米油盐', price: 8, quantity: 5, totalPrice: 40, channel: '菜市场', date: '2026-07-01', notes: '红富士', rating: 4, brand: '' },
  { id: 'd57', itemId: 'item-chicken', itemName: '鸡胸肉', category: '柴米油盐', price: 16, quantity: 2, totalPrice: 32, channel: '菜市场', date: '2026-07-02', notes: '', rating: 4, brand: '' },
  // 超市数据
  { id: 'd58', itemId: 'item-detergent', itemName: '洗衣液', category: '日用个护', price: 35, quantity: 2, totalPrice: 70, channel: '超市', date: '2026-05-20', notes: '', rating: 3, brand: '蓝月亮' },
  { id: 'd59', itemId: 'item-toothpaste', itemName: '牙膏', category: '日用个护', price: 18, quantity: 1, totalPrice: 18, channel: '超市', date: '2026-06-08', notes: '', rating: 3, brand: '高露洁' },
  { id: 'd60', itemId: 'item-chips', itemName: '薯片', category: '零食饮料', price: 12, quantity: 3, totalPrice: 36, channel: '超市', date: '2026-06-25', notes: '', rating: 4, brand: '乐事' },
  { id: 'd61', itemId: 'item-banana', itemName: '香蕉', category: '柴米油盐', price: 6, quantity: 4, totalPrice: 24, channel: '超市', date: '2026-07-01', notes: '', rating: 4, brand: '' },
  // 超盒算数据
  { id: 'd62', itemId: 'item-rice', itemName: '大米', category: '柴米油盐', price: 52, quantity: 1, totalPrice: 52, channel: '超盒算', date: '2026-05-15', notes: '5kg装', rating: 5, brand: '金龙鱼' },
  { id: 'd63', itemId: 'item-milk', itemName: '牛奶', category: '零食饮料', price: 48, quantity: 2, totalPrice: 96, channel: '超盒算', date: '2026-06-20', notes: '', specQty: 1000, specUnit: 'ml', rating: 5, brand: '伊利' },
  { id: 'd64', itemId: 'item-eggs', itemName: '鸡蛋', category: '柴米油盐', price: 15, quantity: 2, totalPrice: 30, channel: '超盒算', date: '2026-07-01', notes: '', specQty: 10, specUnit: '枚', rating: 4, brand: '' },
  { id: 'd65', itemId: 'item-broccoli', itemName: '西兰花', category: '柴米油盐', price: 8, quantity: 2, totalPrice: 16, channel: '超盒算', date: '2026-07-03', notes: '', rating: 4, brand: '' },
  // 更多分类数据
  { id: 'd66', itemId: 'item-soap', itemName: '香皂', category: '日用个护', price: 8, quantity: 3, totalPrice: 24, channel: '拼多多', date: '2026-04-10', notes: '', rating: 4, brand: '舒肤佳' },
  { id: 'd67', itemId: 'item-towel', itemName: '毛巾', category: '日用个护', price: 25, quantity: 2, totalPrice: 50, channel: '淘宝', date: '2026-05-05', notes: '', rating: 3, brand: '洁丽雅' },
  { id: 'd68', itemId: 'item-yogurt', itemName: '酸奶', category: '零食饮料', price: 12, quantity: 6, totalPrice: 72, channel: '盒马', date: '2026-06-18', notes: '', rating: 5, brand: '安慕希' },
  { id: 'd69', itemId: 'item-noodles', itemName: '方便面', category: '零食饮料', price: 5, quantity: 10, totalPrice: 50, channel: '拼多多', date: '2026-06-28', notes: '整箱', rating: 3, brand: '康师傅' },
  { id: 'd70', itemId: 'item-orange', itemName: '橙子', category: '柴米油盐', price: 10, quantity: 3, totalPrice: 30, channel: '美团', date: '2026-07-02', notes: '', rating: 4, brand: '' },
];

export const Store = {
  init() {
    try {
      const savedVersion = localStorage.getItem(VERSION_KEY);
      if (savedVersion !== CURRENT_VERSION) {
        this.savePurchases(defaultPurchases);
        this.saveCategories(defaultCategories);
        this.saveChannels(defaultChannels);
        localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
      }
    } catch (e) {
      console.error('Store init failed:', e);
    }
  },

  getPurchases() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse purchases:', e);
      return [];
    }
  },

  savePurchases(purchases) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(purchases));
    } catch (e) {
      console.error('Failed to save purchases:', e);
    }
  },

  addPurchase(purchase) {
    const purchases = this.getPurchases();
    purchase.id = purchase.id || generateId();
    purchase.totalPrice = purchase.price * purchase.quantity;
    purchase.createdAt = Date.now(); // 添加时间戳
    purchases.push(purchase);
    this.savePurchases(purchases);
    EventBus.emit('purchase:added', purchase);
    return purchase;
  },

  updatePurchase(id, updates) {
    const purchases = this.getPurchases();
    const index = purchases.findIndex(p => p.id === id);
    if (index !== -1) {
      purchases[index] = { ...purchases[index], ...updates };
      if (updates.price || updates.quantity) {
        purchases[index].totalPrice = purchases[index].price * purchases[index].quantity;
      }
      this.savePurchases(purchases);
      EventBus.emit('purchase:updated', purchases[index]);
      return purchases[index];
    }
    return null;
  },

  deletePurchase(id) {
    const purchases = this.getPurchases();
    const filtered = purchases.filter(p => p.id !== id);
    if (filtered.length < purchases.length) {
      this.savePurchases(filtered);
      EventBus.emit('purchase:deleted', { id });
      return true;
    }
    return false;
  },

  getCategories() {
    try {
      const data = localStorage.getItem(CATEGORIES_KEY);
      return data ? JSON.parse(data) : defaultCategories;
    } catch (e) {
      return defaultCategories;
    }
  },

  saveCategories(categories) {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  },

  getChannels() {
    try {
      const data = localStorage.getItem(CHANNELS_KEY);
      return data ? JSON.parse(data) : defaultChannels;
    } catch (e) {
      return defaultChannels;
    }
  },

  saveChannels(channels) {
    localStorage.setItem(CHANNELS_KEY, JSON.stringify(channels));
  },

  getBrands() {
    const purchases = this.getPurchases();
    const brands = [...new Set(purchases.map(p => p.brand).filter(Boolean))];
    return brands.sort();
  },

  getItems() {
    const purchases = this.getPurchases();
    const itemsMap = {};

    purchases.forEach(p => {
      if (!itemsMap[p.itemId]) {
        itemsMap[p.itemId] = {
          id: p.itemId,
          name: p.itemName,
          category: p.category,
          purchases: [],
          specUnit: p.specUnit || null
        };
      }
      itemsMap[p.itemId].purchases.push(p);
    });

    return Object.values(itemsMap).map(item => {
      const prices = item.purchases.map(p => p.price);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const cheapestPurchase = item.purchases.reduce((min, p) => p.price < min.price ? p : min, item.purchases[0]);
      const totalPurchases = item.purchases.length;
      const totalQuantity = item.purchases.reduce((sum, p) => sum + p.quantity, 0);

      const specPurchases = item.purchases.filter(p => p.specQty && p.specUnit);
      let unitPrice = null;
      if (specPurchases.length > 0) {
        const unitPrices = specPurchases.map(p => {
          const totalUnits = p.specQty * p.quantity;
          const paid = p.actualPaid || p.totalPrice;
          return paid / totalUnits;
        });
        unitPrice = unitPrices.reduce((a, b) => a + b, 0) / unitPrices.length;
      }

      const sortedPurchases = [...item.purchases].sort((a, b) => new Date(a.date) - new Date(b.date));
      const avgDuration = this.calculateAvgDuration(sortedPurchases);
      const dailyCost = avgDuration ? avgPrice / avgDuration : null;

      // 品牌聚合
      const brandMap = {};
      item.purchases.forEach(p => {
        if (p.brand) {
          brandMap[p.brand] = (brandMap[p.brand] || 0) + 1;
        }
      });
      const brands = Object.keys(brandMap);
      const mainBrand = brands.length > 0
        ? brands.reduce((a, b) => brandMap[a] > brandMap[b] ? a : b)
        : null;
      const brandCount = brands.length;

      return {
        ...item,
        maxPrice,
        minPrice,
        avgPrice,
        cheapestChannel: cheapestPurchase.channel,
        totalPurchases,
        totalQuantity,
        avgDuration,
        dailyCost,
        unitPrice,
        specUnit: item.specUnit,
        brands,
        mainBrand,
        brandCount
      };
    });
  },

  calculateAvgDuration(sortedPurchases) {
    if (sortedPurchases.length < 2) return null;

    const durations = [];
    const today = new Date();

    for (let i = 0; i < sortedPurchases.length - 1; i++) {
      const current = sortedPurchases[i];
      const next = sortedPurchases[i + 1];
      const daysDiff = daysBetween(current.date, next.date);
      if (daysDiff <= 3) continue;
      durations.push(daysDiff / current.quantity);
    }

    if (sortedPurchases.length >= 2) {
      const lastPurchase = sortedPurchases[sortedPurchases.length - 1];
      const daysSinceLastPurchase = daysBetween(lastPurchase.date, today);
      if (daysSinceLastPurchase > 3) {
        durations.push(daysSinceLastPurchase / lastPurchase.quantity);
      }
    }

    if (durations.length === 0) return null;
    return durations.reduce((a, b) => a + b, 0) / durations.length;
  },

  getItemById(itemId) {
    const items = this.getItems();
    return items.find(i => i.id === itemId) || null;
  },

  getItemByName(name) {
    const items = this.getItems();
    return items.find(i => i.name === name) || null;
  },

  deleteItem(itemId) {
    const purchases = this.getPurchases();
    const filtered = purchases.filter(p => p.itemId !== itemId);
    const deletedCount = purchases.length - filtered.length;
    if (deletedCount > 0) {
      this.savePurchases(filtered);
      EventBus.emit('purchase:deleted', { itemId, count: deletedCount });
    }
    return deletedCount;
  },

  exportJSON() {
    const data = {
      version: '1.0',
      exportDate: formatDate(new Date()),
      purchases: this.getPurchases(),
      categories: this.getCategories(),
      channels: this.getChannels()
    };
    return JSON.stringify(data, null, 2);
  },

  exportCSV() {
    const purchases = this.getPurchases();
    const headers = ['日期', '物品名称', '品牌', '分类', '单价', '数量', '总价', '渠道', '规格数量', '规格单位', '是否促销', '促销方式', '实付金额', '推荐度', '备注'];
    const rows = purchases.map(p => [
      p.date,
      p.itemName,
      p.brand || '',
      p.category,
      p.price,
      p.quantity,
      p.totalPrice,
      p.channel,
      p.specQty || '',
      p.specUnit || '',
      p.isPromo ? '是' : '',
      p.promoType || '',
      p.actualPaid || '',
      p.rating || '',
      p.notes || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return '\uFEFF' + csvContent;
  },

  exportItemsCSV() {
    const items = this.getItems();
    const headers = ['物品名称', '品牌', '分类', '最高价', '最低价', '平均价', '最便宜渠道', '购买次数', '平均时长(天)', '日均成本', '单位价格', '规格单位'];
    const rows = items.map(item => [
      item.name,
      item.mainBrand || '',
      item.category,
      item.maxPrice.toFixed(2),
      item.minPrice.toFixed(2),
      item.avgPrice.toFixed(2),
      item.cheapestChannel,
      item.totalPurchases,
      item.avgDuration ? item.avgDuration.toFixed(1) : '数据不足',
      item.dailyCost ? item.dailyCost.toFixed(2) : 'N/A',
      item.unitPrice !== null ? item.unitPrice.toFixed(4) : '',
      item.specUnit || ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return '\uFEFF' + csvContent;
  },

  importJSON(jsonStr, mode = 'merge') {
    try {
      const data = JSON.parse(jsonStr);
      if (!data.purchases || !Array.isArray(data.purchases)) {
        throw new Error('无效的数据格式');
      }

      if (mode === 'overwrite') {
        this.savePurchases(data.purchases);
        if (data.categories) this.saveCategories(data.categories);
        if (data.channels) this.saveChannels(data.channels);
      } else {
        const existingPurchases = this.getPurchases();
        const existingIds = new Set(existingPurchases.map(p => p.id));
        const newPurchases = data.purchases.filter(p => !existingIds.has(p.id));
        this.savePurchases([...existingPurchases, ...newPurchases]);

        if (data.categories) {
          const existingCategories = this.getCategories();
          const mergedCategories = [...new Set([...existingCategories, ...data.categories])];
          this.saveCategories(mergedCategories);
        }

        if (data.channels) {
          const existingChannels = this.getChannels();
          const mergedChannels = [...new Set([...existingChannels, ...data.channels])];
          this.saveChannels(mergedChannels);
        }
      }

      EventBus.emit('data:imported', { count: data.purchases.length, mode });
      return { success: true, count: data.purchases.length };
    } catch (e) {
      return { success: false, error: e.message };
    }
  },

  getMonthlySpending() {
    const purchases = this.getPurchases();
    const monthly = {};
    purchases.forEach(p => {
      const month = p.date.substring(0, 7);
      monthly[month] = (monthly[month] || 0) + this.getEffectivePrice(p);
    });
    return monthly;
  },

  getCategorySpending() {
    const purchases = this.getPurchases();
    const category = {};
    purchases.forEach(p => {
      category[p.category] = (category[p.category] || 0) + this.getEffectivePrice(p);
    });
    return category;
  },

  getChannelSpending() {
    const purchases = this.getPurchases();
    const channel = {};
    purchases.forEach(p => {
      channel[p.channel] = (channel[p.channel] || 0) + this.getEffectivePrice(p);
    });
    return channel;
  },

  getCurrentMonthSpending() {
    const currentMonth = getCurrentMonth();
    const purchases = this.getPurchases();
    return purchases
      .filter(p => p.date.startsWith(currentMonth))
      .reduce((sum, p) => sum + this.getEffectivePrice(p), 0);
  },

  getCurrentYearSpending() {
    const currentYear = getCurrentYear();
    const purchases = this.getPurchases();
    return purchases
      .filter(p => p.date.startsWith(currentYear))
      .reduce((sum, p) => sum + this.getEffectivePrice(p), 0);
  },

  getTotalSpending() {
    const purchases = this.getPurchases();
    return purchases.reduce((sum, p) => sum + this.getEffectivePrice(p), 0);
  },

  getEffectivePrice(p) {
    return (p.isPromo && p.actualPaid) ? p.actualPaid : p.totalPrice;
  },

  // 暴露默认数据供loadDemoData使用
  defaultPurchases,
  defaultCategories,
  defaultChannels
};
