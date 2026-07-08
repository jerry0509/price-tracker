/**
 * Records - 购买记录模块
 * 职责：记录列表、筛选、分页
 */

import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import { escapeHtml, formatPrice } from './utils.js';
import {
  showPurchaseModal, closePurchaseModal, savePurchase,
  editPurchase, deletePurchase, handleItemNameInput,
  hideAutocomplete, calculateTotal, initRatingStars,
  updateCategorySelect, updateChannelSelect, updateBrandSelect
} from './records-modal.js';

// 模块状态
const state = {
  editingPurchase: null,
  pageSize: 10,
  currentPage: 1,
  filters: {},
  currentSort: { field: 'date', direction: 'desc' }
};

/**
 * 初始化模块
 */
export function init() {
  EventBus.on('purchase:added', () => render(state.filters));
  EventBus.on('purchase:updated', () => render(state.filters));
  EventBus.on('purchase:deleted', () => render(state.filters));
  EventBus.on('data:imported', () => render(state.filters));
}

/**
 * 渲染星级评分
 */
function renderStars(rating) {
  if (!rating) return '<span class="stars-empty">-</span>';
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(i <= rating ? '★' : '☆');
  }
  return `<span class="stars">${stars.join('')}</span>`;
}

/**
 * 设置当前页
 */
export function setCurrentPage(page) {
  state.currentPage = page;
}

/**
 * 获取当前状态
 */
export function getState() {
  return { ...state };
}

/**
 * 渲染记录页面
 */
export function render(filters = {}) {
  state.filters = filters;
  
  const allPurchases = getFilteredPurchases(filters);
  const purchases = paginate(allPurchases);
  const tbody = document.getElementById('records-tbody');
  const emptyState = document.getElementById('records-empty');

  if (!tbody) return;

  if (allPurchases.length === 0) {
    tbody.innerHTML = '';
    if (emptyState) emptyState.style.display = 'block';
    return;
  }

  if (emptyState) emptyState.style.display = 'none';

  tbody.innerHTML = purchases.map(p => `
    <tr>
      <td>${escapeHtml(p.date)}</td>
      <td>
        <strong>${escapeHtml(p.itemName)}</strong>
        ${p.specQty && p.specUnit ? `<span class="spec-tag">${escapeHtml(String(p.specQty))}${escapeHtml(p.specUnit)}/份</span>` : ''}
        ${p.isPromo ? `<span class="promo-badge">🏷️${escapeHtml(p.promoType || '促销')}</span>` : ''}
      </td>
      <td>${p.brand ? `<span class="brand-tag">${escapeHtml(p.brand)}</span>` : '-'}</td>
      <td><span class="tag">${escapeHtml(p.category)}</span></td>
      <td class="price">${formatPrice(p.price)}</td>
      <td>${p.quantity}</td>
      <td class="price">
        ${p.isPromo && p.actualPaid ? `<s style="color:var(--text-muted);font-size:11px">${formatPrice(p.totalPrice)}</s> ${formatPrice(p.actualPaid)}` : formatPrice(p.totalPrice)}
      </td>
      <td>${escapeHtml(p.channel)}</td>
      <td>${renderStars(p.rating)}</td>
      <td style="color:var(--text-secondary)">${escapeHtml(p.notes || '')}</td>
      <td>
        <div class="actions">
          <button class="btn btn-sm" onclick="App.editPurchase('${p.id}')">编辑</button>
          <button class="btn btn-sm btn-danger" onclick="App.deletePurchase('${p.id}')">删除</button>
        </div>
      </td>
    </tr>
  `).join('');

  updateRecordsSummary(allPurchases);
}

/**
 * 获取筛选后的记录
 */
function getFilteredPurchases(filters) {
  let purchases = Store.getPurchases();

  if (filters.search) {
    const search = filters.search.toLowerCase();
    purchases = purchases.filter(p =>
      p.itemName.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      p.channel.toLowerCase().includes(search) ||
      (p.brand && p.brand.toLowerCase().includes(search)) ||
      (p.notes && p.notes.toLowerCase().includes(search))
    );
  }

  if (filters.category) {
    purchases = purchases.filter(p => p.category === filters.category);
  }

  if (filters.channel) {
    purchases = purchases.filter(p => p.channel === filters.channel);
  }

  if (filters.dateFrom) {
    purchases = purchases.filter(p => p.date >= filters.dateFrom);
  }

  if (filters.dateTo) {
    purchases = purchases.filter(p => p.date <= filters.dateTo);
  }

  return purchases.sort((a, b) => {
    const { field, direction } = state.currentSort;
    const dir = direction === 'asc' ? 1 : -1;

    let aVal = a[field];
    let bVal = b[field];

    // 数值字段
    if (['price', 'quantity', 'totalPrice', 'rating'].includes(field)) {
      aVal = Number(aVal) || 0;
      bVal = Number(bVal) || 0;
      return (aVal - bVal) * dir;
    }

    // 日期字段
    if (field === 'date') {
      return (new Date(aVal) - new Date(bVal)) * dir;
    }

    // 字符串字段
    aVal = (aVal || '').toString();
    bVal = (bVal || '').toString();
    return aVal.localeCompare(bVal) * dir;
  });
}

/**
 * 处理排序
 */
export function handleSort(field) {
  if (state.currentSort.field === field) {
    state.currentSort.direction = state.currentSort.direction === 'asc' ? 'desc' : 'asc';
  } else {
    state.currentSort.field = field;
    state.currentSort.direction = 'desc';
  }

  // 更新表头样式
  document.querySelectorAll('#records-tbody').forEach(() => {});
  const ths = document.querySelectorAll('[data-sort]');
  ths.forEach(th => {
    th.classList.toggle('sorted', th.dataset.sort === field);
    const arrow = th.querySelector('.sort-arrow');
    if (arrow) {
      arrow.textContent = th.dataset.sort === field
        ? (state.currentSort.direction === 'asc' ? '↑' : '↓')
        : '↕';
    }
  });

  render(state.filters);
}

/**
 * 更新记录汇总信息
 */
function updateRecordsSummary(purchases) {
  const currentMonth = new Date().toISOString().substring(0, 7);
  const currentYear = new Date().getFullYear().toString();

  const monthSpending = purchases
    .filter(p => p.date.startsWith(currentMonth))
    .reduce((sum, p) => sum + Store.getEffectivePrice(p), 0);

  const yearSpending = purchases
    .filter(p => p.date.startsWith(currentYear))
    .reduce((sum, p) => sum + Store.getEffectivePrice(p), 0);

  const summaryMonthSpending = document.getElementById('summary-month-spending');
  const summaryYearSpending = document.getElementById('summary-year-spending');
  const summaryRecordsCount = document.getElementById('summary-records-count');

  if (summaryMonthSpending) summaryMonthSpending.textContent = formatPrice(monthSpending);
  if (summaryYearSpending) summaryYearSpending.textContent = formatPrice(yearSpending);
  if (summaryRecordsCount) summaryRecordsCount.textContent = purchases.length;
}

/**
 * 分页
 */
function paginate(data) {
  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  if (state.currentPage > totalPages) state.currentPage = totalPages;
  const start = (state.currentPage - 1) * state.pageSize;
  const pageData = data.slice(start, start + state.pageSize);

  const pagEl = document.getElementById('records-pagination');
  const inputEl = document.getElementById('records-page-input');
  const totalEl = document.getElementById('records-total-pages');

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

// 重新导出模态框函数，保持API兼容
export {
  savePurchase, deletePurchase, handleItemNameInput,
  hideAutocomplete, calculateTotal, initRatingStars,
  updateCategorySelect, updateChannelSelect, updateBrandSelect
};

// 包装函数，自动传递state参数
export function editPurchaseWrapper(id) {
  editPurchase(id, state);
}

// 为了保持向后兼容，也导出editPurchase
export { editPurchaseWrapper as editPurchase };

// 包装showPurchaseModal，自动传递state参数
export function showPurchaseModalWrapper(purchase) {
  showPurchaseModal(purchase, state);
}

// 为了保持向后兼容，也导出showPurchaseModal
export { showPurchaseModalWrapper as showPurchaseModal };

// 包装closePurchaseModal，自动传递state参数
export function closePurchaseModalWrapper() {
  closePurchaseModal(state);
}

// 为了保持向后兼容，也导出closePurchaseModal
export { closePurchaseModalWrapper as closePurchaseModal };
