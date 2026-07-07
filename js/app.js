/**
 * App - 入口+Tab路由
 * 职责：应用初始化、Tab切换、全局操作
 */

import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import * as Overview from './overview.js';
import * as Records from './records.js';
import * as Analysis from './analysis.js';
import * as AiImport from './ai-import.js';
import * as Utils from './utils.js';

// 应用状态
const state = {
  currentTab: 'overview',
  filters: {
    search: '',
    category: '',
    channel: '',
    dateFrom: '',
    dateTo: ''
  }
};

/**
 * 初始化应用
 */
function init() {
  Store.init();
  bindEvents();
  initFilters();
  initModules();
  render();
}

/**
 * 初始化各模块
 */
function initModules() {
  Overview.init();
  Records.init();
  Records.initRatingStars();
  Analysis.init();
  AiImport.init();
}

/**
 * 绑定全局事件
 */
function bindEvents() {
  // Tab切换
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // 添加记录按钮
  document.getElementById('btn-add-purchase')?.addEventListener('click', () => {
    Records.showPurchaseModal();
  });

  // 导出菜单
  document.getElementById('btn-export')?.addEventListener('click', showExportMenu);

  // 导入按钮
  document.getElementById('btn-import')?.addEventListener('click', importData);

  // AI导入按钮
  document.getElementById('btn-ai-template')?.addEventListener('click', () => {
    switchTab('ai');
  });

  // 总览搜索
  document.getElementById('search-overview')?.addEventListener('input', Utils.debounce(e => {
    state.filters.search = e.target.value;
    Overview.render(state.filters);
  }, 300));

  // 总览分类筛选
  document.getElementById('filter-category-overview')?.addEventListener('change', e => {
    state.filters.category = e.target.value;
    Overview.setCurrentPage(1);
    Overview.render(state.filters);
  });

  // 总览渠道筛选
  document.getElementById('filter-channel-overview')?.addEventListener('change', e => {
    state.filters.channel = e.target.value;
    Overview.setCurrentPage(1);
    Overview.render(state.filters);
  });

  // 记录搜索
  document.getElementById('search-records')?.addEventListener('input', Utils.debounce(e => {
    state.filters.search = e.target.value;
    Records.setCurrentPage(1);
    Records.render(state.filters);
  }, 300));

  // 记录分类筛选
  document.getElementById('filter-category-records')?.addEventListener('change', e => {
    state.filters.category = e.target.value;
    Records.setCurrentPage(1);
    Records.render(state.filters);
  });

  // 记录渠道筛选
  document.getElementById('filter-channel')?.addEventListener('change', e => {
    state.filters.channel = e.target.value;
    Records.setCurrentPage(1);
    Records.render(state.filters);
  });

  // 记录日期筛选
  document.getElementById('filter-date-from')?.addEventListener('change', e => {
    state.filters.dateFrom = e.target.value;
    Records.render(state.filters);
  });

  document.getElementById('filter-date-to')?.addEventListener('change', e => {
    state.filters.dateTo = e.target.value;
    Records.render(state.filters);
  });

  // 排序
  document.querySelectorAll('[data-sort]').forEach(th => {
    th.addEventListener('click', () => Overview.handleSort(th.dataset.sort));
  });

  // ESC关闭模态框
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeAllModals();
  });

  // 点击遮罩关闭模态框
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeAllModals();
    });
  });

  // 购买记录表单提交
  document.getElementById('purchase-form')?.addEventListener('submit', e => {
    e.preventDefault();
    Records.savePurchase();
  });

  // 促销复选框
  document.getElementById('item-is-promo')?.addEventListener('change', e => {
    const promoFields = document.getElementById('promo-fields');
    if (promoFields) promoFields.style.display = e.target.checked ? 'flex' : 'none';
  });

  // 商品名称自动补全
  document.getElementById('item-name')?.addEventListener('input', Utils.debounce(e => {
    Records.handleItemNameInput(e.target.value);
  }, 200));

  // 计算总价
  document.getElementById('item-price')?.addEventListener('input', () => Records.calculateTotal());
  document.getElementById('item-quantity')?.addEventListener('input', () => Records.calculateTotal());

  // 监听 toast 事件
  EventBus.on('toast:show', ({ message, type }) => showToast(message, type));
}

/**
 * 切换Tab
 * @param {string} tabName - Tab名称
 */
function switchTab(tabName) {
  state.currentTab = tabName;

  // 更新Tab按钮状态
  document.querySelectorAll('.tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.tab === tabName);
  });

  // 显示/隐藏内容
  document.querySelectorAll('.tab-content').forEach(content => {
    content.style.display = content.id === `tab-${tabName}` ? 'block' : 'none';
  });

  render();
}

/**
 * 渲染当前Tab
 */
function render() {
  switch (state.currentTab) {
    case 'overview':
      Overview.render(state.filters);
      break;
    case 'records':
      Records.render(state.filters);
      break;
    case 'analysis':
      Analysis.renderAll();
      break;
    case 'ai':
      AiImport.render();
      break;
  }
}

/**
 * 关闭所有模态框
 */
function closeAllModals() {
  document.querySelectorAll('.modal-overlay.show').forEach(modal => {
    modal.classList.remove('show');
  });
  Records.hideAutocomplete();
}

/**
 * 初始化筛选器选项
 */
function initFilters() {
  const categorySelects = document.querySelectorAll('[id^="filter-category"]');
  const channelSelects = document.querySelectorAll('[id^="filter-channel"]');

  const categories = Store.getCategories();
  categorySelects.forEach(select => {
    const current = select.value;
    select.innerHTML = '<option value="">全部分类</option>' +
      categories.map(cat =>
        `<option value="${Utils.escapeHtml(cat)}" ${cat === current ? 'selected' : ''}>${Utils.escapeHtml(cat)}</option>`
      ).join('');
  });

  const channels = Store.getChannels();
  channelSelects.forEach(select => {
    const current = select.value;
    select.innerHTML = '<option value="">全部渠道</option>' +
      channels.map(ch =>
        `<option value="${Utils.escapeHtml(ch)}" ${ch === current ? 'selected' : ''}>${Utils.escapeHtml(ch)}</option>`
      ).join('');
  });

  // 初始化品牌选择器
  Records.updateBrandSelect();
}

/**
 * 显示导出菜单
 */
function showExportMenu() {
  const menu = document.getElementById('export-menu');
  if (!menu) return;

  menu.style.display = menu.style.display === 'block' ? 'none' : 'block';

  const closeMenu = (e) => {
    if (!menu.contains(e.target) && e.target.id !== 'btn-export') {
      menu.style.display = 'none';
      document.removeEventListener('click', closeMenu);
    }
  };

  setTimeout(() => document.addEventListener('click', closeMenu), 0);
}

/**
 * 导出JSON
 */
function exportJSON() {
  const json = Store.exportJSON();
  Utils.downloadFile(json, `price-tracker-${Utils.formatDate(new Date())}.json`, 'application/json');
  document.getElementById('export-menu').style.display = 'none';
}

/**
 * 导出CSV（记录）
 */
function exportCSV() {
  const csv = Store.exportCSV();
  Utils.downloadFile(csv, `purchases-${Utils.formatDate(new Date())}.csv`, 'text/csv;charset=utf-8');
  document.getElementById('export-menu').style.display = 'none';
}

/**
 * 导出CSV（商品汇总）
 */
function exportItemsCSV() {
  const csv = Store.exportItemsCSV();
  Utils.downloadFile(csv, `items-${Utils.formatDate(new Date())}.csv`, 'text/csv;charset=utf-8');
  document.getElementById('export-menu').style.display = 'none';
}

/**
 * 导入数据
 */
function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const content = await Utils.readFile(file);
      const mode = confirm('选择导入模式：\n\n确定 = 合并（按ID去重）\n取消 = 覆盖所有数据')
        ? 'merge'
        : 'overwrite';

      const result = Store.importJSON(content, mode);
      if (result.success) {
        showToast(`✅ 成功导入 ${result.count} 条记录`, 'success');
        initFilters();
        render();
      } else {
        showToast(`❌ 导入失败：${result.error}`, 'error');
      }
    } catch (err) {
      showToast('❌ 文件读取失败', 'error');
    }
  };
  input.click();
}

/**
 * 删除测试数据
 */
function deleteTestData() {
  const purchases = Store.getPurchases();
  const testPurchases = purchases.filter(p => !p.id.startsWith('d'));
  if (confirm(`确定删除 ${purchases.length - testPurchases.length} 条测试数据吗？`)) {
    Store.savePurchases(testPurchases);
    showToast('✅ 测试数据已删除', 'success');
    render();
  }
}

/**
 * 删除所有数据
 */
function deleteAllData() {
  if (confirm('⚠️ 确定删除所有数据吗？此操作不可恢复！')) {
    if (confirm('再次确认：删除所有购买记录？')) {
      Store.savePurchases([]);
      showToast('✅ 所有数据已删除', 'success');
      render();
    }
  }
}

/**
 * 加载示例数据
 */
function loadDemoData() {
  if (confirm('重置为示例数据？当前数据将被覆盖。')) {
    // 需要访问 Store 的默认数据
    Store.savePurchases(Store.defaultPurchases || []);
    Store.saveCategories(Store.defaultCategories || []);
    Store.saveChannels(Store.defaultChannels || []);
    showToast('✅ 示例数据已重置', 'success');
    initFilters();
    render();
  }
}

/**
 * 显示Toast提示
 * @param {string} message - 消息内容
 * @param {string} type - 消息类型
 */
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'fadeIn 0.3s ease reverse';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

/**
 * 跳转分页
 * @param {string} tab - Tab名称
 * @param {number} delta - 页码变化
 */
function goPage(tab, delta) {
  if (tab === 'overview') {
    const overviewState = Overview.getState();
    Overview.setCurrentPage(overviewState.currentPage + delta);
    Overview.render(state.filters);
  } else {
    const recordsState = Records.getState();
    Records.setCurrentPage(recordsState.currentPage + delta);
    Records.render(state.filters);
  }
}

/**
 * 跳转到指定页
 * @param {string} tab - Tab名称
 * @param {number} value - 页码
 */
function jumpPage(tab, value) {
  const page = parseInt(value);
  if (isNaN(page) || page < 1) return;

  if (tab === 'overview') {
    Overview.setCurrentPage(page);
    Overview.render(state.filters);
  } else {
    Records.setCurrentPage(page);
    Records.render(state.filters);
  }
}

// 导出全局接口（供 HTML onclick 使用）
window.App = {
  init,
  switchTab,
  showExportMenu,
  exportJSON,
  exportCSV,
  exportItemsCSV,
  importData,
  loadDemoData,
  deleteTestData,
  deleteAllData,
  showToast,
  closeAllModals,
  goPage,
  jumpPage,
  // Overview 模块方法
  showItemHistory: (id) => Overview.showItemHistory(id),
  closeItemHistoryModal: () => Overview.closeItemHistoryModal(),
  editItem: (id) => Overview.editItem(id),
  deleteItem: (id) => Overview.deleteItem(id),
  saveEditItem: () => Overview.saveEditItem(),
  closeEditItemModal: () => Overview.closeEditItemModal(),
  handleSort: (field) => Overview.handleSort(field),
  // Records 模块方法
  showPurchaseModal: (p) => Records.showPurchaseModal(p),
  closePurchaseModal: () => Records.closePurchaseModal(),
  savePurchase: () => Records.savePurchase(),
  editPurchase: (id) => Records.editPurchase(id),
  deletePurchase: (id) => Records.deletePurchase(id),
  // AiImport 模块方法
  getAITemplate: () => AiImport.getAITemplate(),
  copyAITemplate: () => AiImport.copyAITemplate(),
  showTemplatePreview: () => AiImport.showTemplatePreview(),
  pasteFromClipboard: () => AiImport.pasteFromClipboard(),
  clearImportArea: () => AiImport.clearImportArea(),
  formatImportJSON: () => AiImport.formatImportJSON(),
  validateImportJSON: () => AiImport.validateImportJSON(),
  importAIData: () => AiImport.importAIData()
};

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', init);
