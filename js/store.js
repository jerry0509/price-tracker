const Store = {
  STORAGE_KEY: 'price-tracker-data',
  CATEGORIES_KEY: 'price-tracker-categories',
  CHANNELS_KEY: 'price-tracker-channels',
  VERSION_KEY: 'price-tracker-version',
  CURRENT_VERSION: '3.0',

  defaultCategories: ['日用品', '蔬菜', '水果', '肉类', '零食', '饮料', '个护', '电子', '其他'],
  defaultChannels: ['京东', '淘宝', '拼多多', '大润发', '盒马', '山姆', '永辉', '美团', '其他'],

  defaultPurchases: [
    { id: 'd01', itemId: 'item-tissue', itemName: '抽纸', category: '日用品', price: 35, quantity: 10, totalPrice: 350, channel: '京东', date: '2026-01-08', notes: '年货节', specQty: 120, specUnit: '抽', isPromo: true, promoType: '满减', actualPaid: 320 },
    { id: 'd02', itemId: 'item-tissue', itemName: '抽纸', category: '日用品', price: 28, quantity: 5, totalPrice: 140, channel: '拼多多', date: '2026-02-15', notes: '', specQty: 110, specUnit: '抽' },
    { id: 'd03', itemId: 'item-tissue', itemName: '抽纸', category: '日用品', price: 32, quantity: 8, totalPrice: 256, channel: '大润发', date: '2026-04-20', notes: '特价', specQty: 130, specUnit: '抽', isPromo: true, promoType: '买一送一', actualPaid: 128 },
    { id: 'd04', itemId: 'item-tissue', itemName: '抽纸', category: '日用品', price: 30, quantity: 6, totalPrice: 180, channel: '盒马', date: '2026-06-10', notes: '', specQty: 120, specUnit: '抽' },

    { id: 'd05', itemId: 'item-shampoo', itemName: '洗发水', category: '个护', price: 49, quantity: 2, totalPrice: 98, channel: '京东', date: '2026-01-20', notes: '' },
    { id: 'd06', itemId: 'item-shampoo', itemName: '洗发水', category: '个护', price: 45, quantity: 1, totalPrice: 45, channel: '山姆', date: '2026-04-05', notes: '大瓶装' },
    { id: 'd07', itemId: 'item-shampoo', itemName: '洗发水', category: '个护', price: 52, quantity: 2, totalPrice: 104, channel: '盒马', date: '2026-06-25', notes: '' },

    { id: 'd08', itemId: 'item-detergent', itemName: '洗衣液', category: '日用品', price: 39, quantity: 2, totalPrice: 78, channel: '拼多多', date: '2026-01-12', notes: '' },
    { id: 'd09', itemId: 'item-detergent', itemName: '洗衣液', category: '日用品', price: 45, quantity: 1, totalPrice: 45, channel: '大润发', date: '2026-03-18', notes: '蓝月亮' },
    { id: 'd10', itemId: 'item-detergent', itemName: '洗衣液', category: '日用品', price: 42, quantity: 2, totalPrice: 84, channel: '山姆', date: '2026-05-22', notes: '' },

    { id: 'd11', itemId: 'item-rice', itemName: '大米', category: '食品', price: 59, quantity: 1, totalPrice: 59, channel: '山姆', date: '2026-01-25', notes: '5kg装' },
    { id: 'd12', itemId: 'item-rice', itemName: '大米', category: '食品', price: 65, quantity: 1, totalPrice: 65, channel: '盒马', date: '2026-03-30', notes: '东北大米' },
    { id: 'd13', itemId: 'item-rice', itemName: '大米', category: '食品', price: 55, quantity: 1, totalPrice: 55, channel: '大润发', date: '2026-06-05', notes: '' },

    { id: 'd14', itemId: 'item-eggs', itemName: '鸡蛋', category: '食品', price: 18, quantity: 2, totalPrice: 36, channel: '盒马', date: '2026-01-10', notes: '', specQty: 10, specUnit: '枚' },
    { id: 'd15', itemId: 'item-eggs', itemName: '鸡蛋', category: '食品', price: 15, quantity: 2, totalPrice: 30, channel: '永辉', date: '2026-02-20', notes: '30枚装', specQty: 30, specUnit: '枚' },
    { id: 'd16', itemId: 'item-eggs', itemName: '鸡蛋', category: '食品', price: 20, quantity: 1, totalPrice: 20, channel: '美团', date: '2026-04-12', notes: '', specQty: 10, specUnit: '枚' },
    { id: 'd17', itemId: 'item-eggs', itemName: '鸡蛋', category: '食品', price: 16, quantity: 2, totalPrice: 32, channel: '大润发', date: '2026-06-18', notes: '', specQty: 12, specUnit: '枚' },

    { id: 'd18', itemId: 'item-milk', itemName: '牛奶', category: '饮料', price: 55, quantity: 2, totalPrice: 110, channel: '山姆', date: '2026-01-05', notes: '鲜奶', specQty: 1000, specUnit: 'ml' },
    { id: 'd19', itemId: 'item-milk', itemName: '牛奶', category: '饮料', price: 49, quantity: 2, totalPrice: 98, channel: '盒马', date: '2026-03-08', notes: '', specQty: 950, specUnit: 'ml' },
    { id: 'd20', itemId: 'item-milk', itemName: '牛奶', category: '饮料', price: 58, quantity: 1, totalPrice: 58, channel: '山姆', date: '2026-05-15', notes: '', specQty: 1000, specUnit: 'ml' },
    { id: 'd21', itemId: 'item-milk', itemName: '牛奶', category: '饮料', price: 52, quantity: 2, totalPrice: 104, channel: '美团', date: '2026-06-28', notes: '', specQty: 250, specUnit: 'ml' },

    { id: 'd22', itemId: 'item-apple', itemName: '苹果', category: '水果', price: 35, quantity: 1, totalPrice: 35, channel: '盒马', date: '2026-01-18', notes: '红富士' },
    { id: 'd23', itemId: 'item-apple', itemName: '苹果', category: '水果', price: 28, quantity: 2, totalPrice: 56, channel: '美团', date: '2026-03-22', notes: '' },
    { id: 'd24', itemId: 'item-apple', itemName: '苹果', category: '水果', price: 32, quantity: 1, totalPrice: 32, channel: '永辉', date: '2026-05-10', notes: '' },

    { id: 'd25', itemId: 'item-banana', itemName: '香蕉', category: '水果', price: 12, quantity: 2, totalPrice: 24, channel: '美团', date: '2026-02-05', notes: '' },
    { id: 'd26', itemId: 'item-banana', itemName: '香蕉', category: '水果', price: 15, quantity: 1, totalPrice: 15, channel: '盒马', date: '2026-04-18', notes: '' },
    { id: 'd27', itemId: 'item-banana', itemName: '香蕉', category: '水果', price: 10, quantity: 3, totalPrice: 30, channel: '大润发', date: '2026-06-22', notes: '特价' },

    { id: 'd28', itemId: 'item-pork', itemName: '猪肉', category: '肉类', price: 25, quantity: 2, totalPrice: 50, channel: '永辉', date: '2026-01-22', notes: '五花肉' },
    { id: 'd29', itemId: 'item-pork', itemName: '猪肉', category: '肉类', price: 22, quantity: 2, totalPrice: 44, channel: '美团', date: '2026-03-15', notes: '' },
    { id: 'd30', itemId: 'item-pork', itemName: '猪肉', category: '肉类', price: 28, quantity: 1, totalPrice: 28, channel: '山姆', date: '2026-05-28', notes: '黑猪肉' },

    { id: 'd31', itemId: 'item-chicken', itemName: '鸡胸肉', category: '肉类', price: 18, quantity: 3, totalPrice: 54, channel: '山姆', date: '2026-02-12', notes: '' },
    { id: 'd32', itemId: 'item-chicken', itemName: '鸡胸肉', category: '肉类', price: 15, quantity: 2, totalPrice: 30, channel: '美团', date: '2026-04-25', notes: '' },
    { id: 'd33', itemId: 'item-chicken', itemName: '鸡胸肉', category: '肉类', price: 20, quantity: 2, totalPrice: 40, channel: '盒马', date: '2026-06-15', notes: '' },

    { id: 'd34', itemId: 'item-tomato', itemName: '西红柿', category: '蔬菜', price: 8, quantity: 2, totalPrice: 16, channel: '美团', date: '2026-01-28', notes: '' },
    { id: 'd35', itemId: 'item-tomato', itemName: '西红柿', category: '蔬菜', price: 6, quantity: 3, totalPrice: 18, channel: '永辉', date: '2026-03-25', notes: '' },
    { id: 'd36', itemId: 'item-tomato', itemName: '西红柿', category: '蔬菜', price: 10, quantity: 2, totalPrice: 20, channel: '盒马', date: '2026-06-08', notes: '' },

    { id: 'd37', itemId: 'item-broccoli', itemName: '西兰花', category: '蔬菜', price: 12, quantity: 2, totalPrice: 24, channel: '盒马', date: '2026-02-08', notes: '' },
    { id: 'd38', itemId: 'item-broccoli', itemName: '西兰花', category: '蔬菜', price: 8, quantity: 2, totalPrice: 16, channel: '美团', date: '2026-04-30', notes: '' },
    { id: 'd39', itemId: 'item-broccoli', itemName: '西兰花', category: '蔬菜', price: 10, quantity: 1, totalPrice: 10, channel: '大润发', date: '2026-06-20', notes: '' },

    { id: 'd40', itemId: 'item-chips', itemName: '薯片', category: '零食', price: 12, quantity: 3, totalPrice: 36, channel: '拼多多', date: '2026-01-30', notes: '' },
    { id: 'd41', itemId: 'item-chips', itemName: '薯片', category: '零食', price: 15, quantity: 2, totalPrice: 30, channel: '京东', date: '2026-04-08', notes: '' },
    { id: 'd42', itemId: 'item-chips', itemName: '薯片', category: '零食', price: 10, quantity: 4, totalPrice: 40, channel: '大润发', date: '2026-06-12', notes: '促销' },

    { id: 'd43', itemId: 'item-earphone', itemName: '蓝牙耳机', category: '电子', price: 299, quantity: 1, totalPrice: 299, channel: '淘宝', date: '2025-12-01', notes: '降噪款' },
    { id: 'd44', itemId: 'item-earphone', itemName: '蓝牙耳机', category: '电子', price: 199, quantity: 1, totalPrice: 199, channel: '京东', date: '2026-05-20', notes: '备用' },

    { id: 'd45', itemId: 'item-cable', itemName: '数据线', category: '电子', price: 15, quantity: 3, totalPrice: 45, channel: '拼多多', date: '2026-02-25', notes: 'Type-C' },
    { id: 'd46', itemId: 'item-cable', itemName: '数据线', category: '电子', price: 12, quantity: 2, totalPrice: 24, channel: '淘宝', date: '2026-05-05', notes: '' },

    { id: 'd47', itemId: 'item-toothpaste', itemName: '牙膏', category: '个护', price: 15, quantity: 2, totalPrice: 30, channel: '大润发', date: '2026-01-15', notes: '' },
    { id: 'd48', itemId: 'item-toothpaste', itemName: '牙膏', category: '个护', price: 12, quantity: 3, totalPrice: 36, channel: '山姆', date: '2026-04-15', notes: '套装' },

    { id: 'd49', itemId: 'item-water', itemName: '矿泉水', category: '饮料', price: 2, quantity: 12, totalPrice: 24, channel: '美团', date: '2026-03-05', notes: '' },
    { id: 'd50', itemId: 'item-water', itemName: '矿泉水', category: '饮料', price: 2, quantity: 24, totalPrice: 48, channel: '山姆', date: '2026-06-01', notes: '整箱' },
  ],

  init() {
    const savedVersion = localStorage.getItem(this.VERSION_KEY);
    if (savedVersion !== this.CURRENT_VERSION) {
      this.savePurchases(this.defaultPurchases);
      this.saveCategories(this.defaultCategories);
      this.saveChannels(this.defaultChannels);
      localStorage.setItem(this.VERSION_KEY, this.CURRENT_VERSION);
    }
  },

  getPurchases() {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Failed to parse purchases:', e);
      return [];
    }
  },

  savePurchases(purchases) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(purchases));
  },

  addPurchase(purchase) {
    const purchases = this.getPurchases();
    purchase.id = purchase.id || Utils.generateId();
    purchase.totalPrice = purchase.price * purchase.quantity;
    purchases.push(purchase);
    this.savePurchases(purchases);
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
      return purchases[index];
    }
    return null;
  },

  deletePurchase(id) {
    const purchases = this.getPurchases();
    const filtered = purchases.filter(p => p.id !== id);
    this.savePurchases(filtered);
    return filtered.length < purchases.length;
  },

  getCategories() {
    try {
      const data = localStorage.getItem(this.CATEGORIES_KEY);
      return data ? JSON.parse(data) : this.defaultCategories;
    } catch (e) {
      return this.defaultCategories;
    }
  },

  saveCategories(categories) {
    localStorage.setItem(this.CATEGORIES_KEY, JSON.stringify(categories));
  },

  getChannels() {
    try {
      const data = localStorage.getItem(this.CHANNELS_KEY);
      return data ? JSON.parse(data) : this.defaultChannels;
    } catch (e) {
      return this.defaultChannels;
    }
  },

  saveChannels(channels) {
    localStorage.setItem(this.CHANNELS_KEY, JSON.stringify(channels));
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

    const items = Object.values(itemsMap).map(item => {
      const prices = item.purchases.map(p => p.price);
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      const cheapestPurchase = item.purchases.reduce((min, p) => p.price < min.price ? p : min, item.purchases[0]);
      const totalPurchases = item.purchases.length;
      const totalQuantity = item.purchases.reduce((sum, p) => sum + p.quantity, 0);

      // 归一化单价
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
        specUnit: item.specUnit
      };
    });

    return items;
  },

  calculateAvgDuration(sortedPurchases) {
    if (sortedPurchases.length < 2) return null;

    const durations = [];
    const today = new Date();

    for (let i = 0; i < sortedPurchases.length - 1; i++) {
      const current = sortedPurchases[i];
      const next = sortedPurchases[i + 1];
      const daysDiff = Utils.daysBetween(current.date, next.date);

      if (daysDiff <= 3) continue;

      durations.push(daysDiff / current.quantity);
    }

    if (sortedPurchases.length >= 2) {
      const lastPurchase = sortedPurchases[sortedPurchases.length - 1];
      const daysSinceLastPurchase = Utils.daysBetween(lastPurchase.date, today);

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
    this.savePurchases(filtered);
    return purchases.length - filtered.length;
  },

  exportJSON() {
    const data = {
      version: '1.0',
      exportDate: Utils.formatDate(new Date()),
      purchases: this.getPurchases(),
      categories: this.getCategories(),
      channels: this.getChannels()
    };
    return JSON.stringify(data, null, 2);
  },

  exportCSV() {
    const purchases = this.getPurchases();
    const headers = ['日期', '物品名称', '分类', '单价', '数量', '总价', '渠道', '备注'];
    const rows = purchases.map(p => [
      p.date,
      p.itemName,
      p.category,
      p.price,
      p.quantity,
      p.totalPrice,
      p.channel,
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
    const headers = ['物品名称', '分类', '最高价', '最低价', '平均价', '最便宜渠道', '购买次数', '平均时长(天)', '日均成本'];
    const rows = items.map(item => [
      item.name,
      item.category,
      item.maxPrice.toFixed(2),
      item.minPrice.toFixed(2),
      item.avgPrice.toFixed(2),
      item.cheapestChannel,
      item.totalPurchases,
      item.avgDuration ? item.avgDuration.toFixed(1) : '数据不足',
      item.dailyCost ? item.dailyCost.toFixed(2) : 'N/A'
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    return '\uFEFF' + csvContent;
  },

  async importJSON(jsonStr, mode = 'merge') {
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
      monthly[month] = (monthly[month] || 0) + p.totalPrice;
    });

    return monthly;
  },

  getCategorySpending() {
    const purchases = this.getPurchases();
    const category = {};

    purchases.forEach(p => {
      category[p.category] = (category[p.category] || 0) + p.totalPrice;
    });

    return category;
  },

  getChannelSpending() {
    const purchases = this.getPurchases();
    const channel = {};

    purchases.forEach(p => {
      channel[p.channel] = (channel[p.channel] || 0) + p.totalPrice;
    });

    return channel;
  },

  getCurrentMonthSpending() {
    const currentMonth = Utils.getCurrentMonth();
    const purchases = this.getPurchases();
    return purchases
      .filter(p => p.date.startsWith(currentMonth))
      .reduce((sum, p) => sum + p.totalPrice, 0);
  },

  getCurrentYearSpending() {
    const currentYear = Utils.getCurrentYear();
    const purchases = this.getPurchases();
    return purchases
      .filter(p => p.date.startsWith(currentYear))
      .reduce((sum, p) => sum + p.totalPrice, 0);
  },

  getTotalSpending() {
    const purchases = this.getPurchases();
    return purchases.reduce((sum, p) => sum + p.totalPrice, 0);
  }
};

window.Store = Store;
