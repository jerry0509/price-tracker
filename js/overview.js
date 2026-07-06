/**
 * Overview - 价格总览模块
 * 职责：商品列表、筛选、排序、商品历史、编辑商品
 */

import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import { escapeHtml, formatPrice, formatDuration, debounce, getCostColorClass, getCostLabel } from './utils.js';

// 模块状态
const state = {
  currentSort: { field: 'totalPurchases', direction: 'desc' },
  editingItem: null,
  pageSize: 10,
  currentPage: 1,
  filters: {}
};

/**
 * 初始化模块
 */
export function init() {
  // 监听数据变化事件
  EventBus.on('purchase:added', () => render(state.filters));
  EventBus.on('purchase:updated', () => render(state.filters));
  EventBus.on('purchase:deleted', () => render(state.filters));
  EventBus.on('data:imported', () => render(state.filters));
}

/**
 * 获取当前状态（供 app.js 访问）
 */
export function getState() {
  return { ...state };
}

/**
 * 设置当前页
 */
export function setCurrentPage(page) {
  state.currentPage = page;
}

/**
 * 渲染总览页面
 * @param {Object} filters - 筛选条件
 */
export function render(filters = {}) {
  // 保存当前筛选条件
  state.filters = filters;
  
  const allItems = getFilteredItems(filters);
  const items = paginate(allItems);
  const tbody = document.getElementById('overview-tbody');
  const emptyState = document.getElementById('overview-empty');

  if (!tbody) return;

  if (allItems.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = items.map(item => {
    // 品牌显示逻辑
    let brandHtml = '';
    if (item.brandCount === 1) {
      brandHtml = `<span class="brand-tag" title="${escapeHtml(item.mainBrand)}">${escapeHtml(item.mainBrand)}</span>`;
    } else if (item.brandCount > 1) {
      brandHtml = `<span class="brand-tag brand-multi" title="${escapeHtml(item.brands.join('、'))}">${item.brandCount}品牌</span>`;
    }

    return `
    <tr>
      <td>
        <strong class="item-name-link" onclick="App.showItemHistory('${item.id}')" title="查看购买历史">${escapeHtml(item.name)}</strong>
        ${brandHtml}
        ${item.specUnit ? `<span class="spec-tag">${item.specUnit}</span>` : ''}
      </td>
      <td><span class="tag">${escapeHtml(item.category)}</span></td>
      <td class="price">${formatPrice(item.maxPrice)}</td>
      <td class="price">${formatPrice(item.minPrice)}</td>
      <td class="price">${formatPrice(item.avgPrice)}</td>
      <td>${escapeHtml(item.cheapestChannel)}</td>
      <td>${item.totalPurchases}次</td>
      <td>${formatDuration(item.avgDuration)}</td>
      <td class="price">${item.unitPrice !== null ? '¥' + item.unitPrice.toFixed(4) + '/' + item.specUnit : '-'}</td>
      <td class="price">
        <strong class="${getCostColorClass(item.dailyCost)}">
          ${item.dailyCost ? formatPrice(item.dailyCost) : 'N/A'}
        </strong>
        ${item.dailyCost ? `<span class="cost-tip">${getCostLabel(item.dailyCost)}</span>` : ''}
      </td>
      <td>
        <div class="actions">
          <button class="btn btn-sm" onclick="App.editItem('${item.id}')">编辑</button>
          <button class="btn btn-sm btn-danger" onclick="App.deleteItem('${item.id}')">删除</button>
        </div>
      </td>
    </tr>
    `;
  }).join('');

  updateOverviewSummary(allItems);
}

/**
 * 获取筛选后的商品
 * @param {Object} filters - 筛选条件
 * @returns {Array} 筛选后的商品列表
 */
function getFilteredItems(filters) {
  let items = Store.getItems();

  if (filters.search) {
    const search = filters.search.toLowerCase();
    items = items.filter(item =>
      item.name.toLowerCase().includes(search) ||
      item.category.toLowerCase().includes(search) ||
      (item.brands && item.brands.some(b => b.toLowerCase().includes(search)))
    );
  }

  if (filters.category) {
    items = items.filter(item => item.category === filters.category);
  }

  if (filters.channel) {
    items = items.filter(item => item.cheapestChannel === filters.channel);
  }

  items = sortItems(items);

  return items;
}

/**
 * 排序商品
 * @param {Array} items - 商品列表
 * @returns {Array} 排序后的商品列表
 */
function sortItems(items) {
  const { field, direction } = state.currentSort;
  const multiplier = direction === 'asc' ? 1 : -1;

  return [...items].sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];

    if (valueA === null || valueA === undefined) valueA = direction === 'asc' ? Infinity : -Infinity;
    if (valueB === null || valueB === undefined) valueB = direction === 'asc' ? Infinity : -Infinity;

    if (typeof valueA === 'string') {
      return valueA.localeCompare(valueB) * multiplier;
    }

    return (valueA - valueB) * multiplier;
  });
}

/**
 * 处理排序点击
 * @param {string} field - 排序字段
 */
export function handleSort(field) {
  if (state.currentSort.field === field) {
    state.currentSort.direction = state.currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    state.currentSort.field = field;
    state.currentSort.direction = 'desc';
  }

  document.querySelectorAll('[data-sort]').forEach(th => {
    th.classList.toggle('sorted', th.dataset.sort === field);
    const arrow = th.querySelector('.sort-arrow');
    if (arrow) {
      arrow.textContent = th.dataset.sort === field
        ? (state.currentSort.direction === 'asc' ? '↑' : '↓')
        : '↕';
    }
  });

  render();
}

/**
 * 更新总览汇总信息
 * @param {Array} items - 商品列表
 */
function updateOverviewSummary(items) {
  const totalItems = items.length;
  const totalSpending = items.reduce((sum, item) => {
    return sum + item.avgPrice * item.totalPurchases;
  }, 0);

  const dailyCosts = items.filter(i => i.dailyCost !== null).map(i => i.dailyCost);
  const avgDailyCost = dailyCosts.length > 0
    ? dailyCosts.reduce((a, b) => a + b, 0) / dailyCosts.length
    : 0;

  const maxDailyCost = dailyCosts.length > 0 ? Math.max(...dailyCosts) : 0;
  const minDailyCost = dailyCosts.length > 0 ? Math.min(...dailyCosts) : 0;

  const maxItem = items.find(i => i.dailyCost === maxDailyCost);
  const minItem = items.find(i => i.dailyCost === minDailyCost);

  const summaryTotalItems = document.getElementById('summary-total-items');
  const summaryTotalSpending = document.getElementById('summary-total-spending');
  const summaryAvgDaily = document.getElementById('summary-avg-daily');
  const summaryMaxDaily = document.getElementById('summary-max-daily');
  const summaryMinDaily = document.getElementById('summary-min-daily');

  if (summaryTotalItems) summaryTotalItems.textContent = totalItems;
  if (summaryTotalSpending) summaryTotalSpending.textContent = formatPrice(totalSpending);
  if (summaryAvgDaily) summaryAvgDaily.textContent = formatPrice(avgDailyCost);

  if (summaryMaxDaily) {
    summaryMaxDaily.textContent = maxItem ? `${maxItem.name} ${formatPrice(maxDailyCost)}` : '-';
    summaryMaxDaily.className = 'cost-high';
  }

  if (summaryMinDaily) {
    summaryMinDaily.textContent = minItem ? `${minItem.name} ${formatPrice(minDailyCost)}` : '-';
    summaryMinDaily.className = 'cost-low';
  }
}

/**
 * 显示商品购买历史
 * @param {string} itemId - 商品ID
 */
export function showItemHistory(itemId) {
  const item = Store.getItemById(itemId);
  if (!item) return;

  const modal = document.getElementById('modal-item-history');
  if (!modal) return;

  // 标题
  const historyTitle = document.getElementById('history-title');
  if (historyTitle) historyTitle.textContent = `📊 ${item.name} - 购买历史`;

  // 摘要统计
  const historyCategory = document.getElementById('history-category');
  const historyCount = document.getElementById('history-count');
  const historyPriceRange = document.getElementById('history-price-range');
  const historyAvgPrice = document.getElementById('history-avg-price');

  if (historyCategory) historyCategory.textContent = item.category;
  if (historyCount) historyCount.textContent = `${item.totalPurchases}次`;
  if (historyPriceRange) historyPriceRange.textContent = `${formatPrice(item.minPrice)} ~ ${formatPrice(item.maxPrice)}`;
  if (historyAvgPrice) historyAvgPrice.textContent = formatPrice(item.avgPrice);

  // 按日期排序购买记录（最新在前）
  const purchases = [...item.purchases].sort((a, b) => new Date(b.date) - new Date(a.date));

  // 构建表格行
  const tbody = document.getElementById('history-tbody');
  if (tbody) {
    tbody.innerHTML = purchases.map((p, i) => {
      // 价格趋势（与前一次购买比较）
      let trendHtml = '';
      if (i < purchases.length - 1) {
        const prevPrice = purchases[i + 1].price;
        const diff = p.price - prevPrice;
        if (diff < -0.01) {
          trendHtml = '<span class="price-trend down">↓</span>';
        } else if (diff > 0.01) {
          trendHtml = '<span class="price-trend up">↑</span>';
        } else {
          trendHtml = '<span class="price-trend flat">→</span>';
        }
      }

      // 促销徽章
      const promoHtml = p.isPromo
        ? `<span class="promo-badge">🏷️ ${escapeHtml(p.promoType || '促销')}</span>`
        : '-';

      // 规格信息
      const specHtml = p.specQty && p.specUnit
        ? `${p.specQty}${escapeHtml(p.specUnit)}`
        : '-';

      return `
        <tr>
          <td>${p.date}</td>
          <td>${p.brand ? escapeHtml(p.brand) : '-'}</td>
          <td class="price">${formatPrice(p.price)}${trendHtml}</td>
          <td>${p.quantity}</td>
          <td class="price">${formatPrice(p.totalPrice)}</td>
          <td>${escapeHtml(p.channel)}</td>
          <td>${specHtml}</td>
          <td>${promoHtml}</td>
          <td>${p.notes ? escapeHtml(p.notes) : '-'}</td>
        </tr>
      `;
    }).join('');
  }

  modal.classList.add('show');
}

/**
 * 关闭商品历史模态框
 */
export function closeItemHistoryModal() {
  const modal = document.getElementById('modal-item-history');
  if (modal) modal.classList.remove('show');
}

/**
 * 编辑商品
 * @param {string} itemId - 商品ID
 */
export function editItem(itemId) {
  const item = Store.getItemById(itemId);
  if (!item) return;

  state.editingItem = item;
  const modal = document.getElementById('modal-edit-item');
  const nameInput = document.getElementById('edit-item-name');
  const categorySelect = document.getElementById('edit-item-category');

  if (nameInput) nameInput.value = item.name;
  if (categorySelect) {
    // 更新分类选项
    const categories = Store.getCategories();
    categorySelect.innerHTML = categories.map(cat =>
      `<option value="${escapeHtml(cat)}" ${cat === item.category ? 'selected' : ''}>${escapeHtml(cat)}</option>`
    ).join('');
  }

  if (modal) modal.classList.add('show');
}

/**
 * 关闭编辑商品模态框
 */
export function closeEditItemModal() {
  const modal = document.getElementById('modal-edit-item');
  if (modal) modal.classList.remove('show');
  state.editingItem = null;
}

/**
 * 保存编辑的商品
 */
export function saveEditItem() {
  if (!state.editingItem) return;

  const nameInput = document.getElementById('edit-item-name');
  const categorySelect = document.getElementById('edit-item-category');

  const name = nameInput?.value.trim();
  const category = categorySelect?.value.trim() || '其他';

  if (!name) {
    EventBus.emit('toast:show', { message: '物品名称不能为空', type: 'error' });
    return;
  }

  const categories = Store.getCategories();
  if (category && !categories.includes(category)) {
    categories.push(category);
    Store.saveCategories(categories);
  }

  const purchases = Store.getPurchases();
  purchases.forEach(p => {
    if (p.itemId === state.editingItem.id) {
      p.itemName = name;
      p.category = category;
    }
  });

  Store.savePurchases(purchases);
  closeEditItemModal();
  render();
}

/**
 * 删除商品
 * @param {string} itemId - 商品ID
 */
export function deleteItem(itemId) {
  const item = Store.getItemById(itemId);
  if (!item) return;

  const count = item.totalPurchases;
  if (confirm(`确定要删除「${item.name}」吗？将同时删除该物品的 ${count} 条购买记录。`)) {
    Store.deleteItem(itemId);
    render();
  }
}

/**
 * 分页
 * @param {Array} data - 数据
 * @returns {Array} 当前页数据
 */
function paginate(data) {
  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  const start = (state.currentPage - 1) * state.pageSize;
  const pageData = data.slice(start, start + state.pageSize);

  const pagEl = document.getElementById('overview-pagination');
  const inputEl = document.getElementById('overview-page-input');
  const totalEl = document.getElementById('overview-total-pages');

  if (total > state.pageSize) {
    if (pagEl) pagEl.style.display = 'flex';
    if (inputEl) inputEl.value = state.currentPage;
    if (inputEl) inputEl.max = totalPages;
    if (totalEl) totalEl.textContent = totalPages;
  } else {
    if (pagEl) pagEl.style.display = 'none';
  }

  return pageData;
}
