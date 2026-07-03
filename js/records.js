/**
 * Records - 购买记录模块
 * 职责：记录列表、筛选、CRUD、自动补全
 */

import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import { escapeHtml, formatPrice, formatDate, generateId, debounce } from './utils.js';

// 模块状态
const state = {
  editingPurchase: null,
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
 * 设置当前页
 */
export function setCurrentPage(page) {
  state.currentPage = page;
}

/**
 * 获取当前状态（供 app.js 访问）
 */
export function getState() {
  return { ...state };
}

/**
 * 渲染记录页面
 * @param {Object} filters - 筛选条件
 */
export function render(filters = {}) {
  // 保存当前筛选条件
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
        ${p.specQty && p.specUnit ? `<span class="spec-tag">${p.specQty}${p.specUnit}/份</span>` : ''}
        ${p.isPromo ? `<span class="promo-badge">🏷️${p.promoType || '促销'}</span>` : ''}
      </td>
      <td><span class="tag">${escapeHtml(p.category)}</span></td>
      <td class="price">${formatPrice(p.price)}</td>
      <td>${p.quantity}</td>
      <td class="price">
        ${p.isPromo && p.actualPaid ? `<s style="color:var(--text-muted);font-size:11px">${formatPrice(p.totalPrice)}</s> ${formatPrice(p.actualPaid)}` : formatPrice(p.totalPrice)}
      </td>
      <td>${escapeHtml(p.channel)}</td>
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
 * @param {Object} filters - 筛选条件
 * @returns {Array} 筛选后的记录列表
 */
function getFilteredPurchases(filters) {
  let purchases = Store.getPurchases();

  if (filters.search) {
    const search = filters.search.toLowerCase();
    purchases = purchases.filter(p =>
      p.itemName.toLowerCase().includes(search) ||
      p.category.toLowerCase().includes(search) ||
      p.channel.toLowerCase().includes(search) ||
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
    // 按添加时间倒序（新数据在前）
    const aTime = a.createdAt || 0;
    const bTime = b.createdAt || 0;
    if (aTime !== bTime) {
      return bTime - aTime;
    }
    // 时间相同时，按日期倒序
    const dateDiff = new Date(b.date) - new Date(a.date);
    if (dateDiff !== 0) return dateDiff;
    // 日期相同时，按id倒序
    return b.id.localeCompare(a.id);
  });
}

/**
 * 更新记录汇总信息
 * @param {Array} purchases - 记录列表
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
 * 显示购买记录模态框
 * @param {Object|null} purchase - 购买记录（编辑模式）或null（新增模式）
 */
export function showPurchaseModal(purchase = null) {
  state.editingPurchase = purchase;
  const modal = document.getElementById('modal-purchase');
  const form = document.getElementById('purchase-form');
  const title = document.getElementById('modal-purchase-title');

  if (!modal || !form) return;

  if (title) title.textContent = purchase ? '编辑购买记录' : '添加购买记录';

  if (purchase) {
    document.getElementById('item-id').value = purchase.id;
    document.getElementById('item-name').value = purchase.itemName;
    document.getElementById('item-category').value = purchase.category;
    document.getElementById('item-price').value = purchase.price;
    document.getElementById('item-quantity').value = purchase.quantity;
    document.getElementById('item-total').value = purchase.totalPrice;
    document.getElementById('item-channel').value = purchase.channel;
    document.getElementById('item-date').value = purchase.date;
    document.getElementById('item-notes').value = purchase.notes || '';
    document.getElementById('item-spec-qty').value = purchase.specQty || '';
    document.getElementById('item-spec-unit').value = purchase.specUnit || '';
    document.getElementById('item-is-promo').checked = !!purchase.isPromo;
    document.getElementById('item-promo-type').value = purchase.promoType || '';
    document.getElementById('item-actual-paid').value = purchase.actualPaid || '';
    document.getElementById('promo-fields').style.display = purchase.isPromo ? 'flex' : 'none';
  } else {
    form.reset();
    document.getElementById('item-id').value = '';
    document.getElementById('item-date').value = formatDate(new Date());
    document.getElementById('item-quantity').value = '1';
    document.getElementById('promo-fields').style.display = 'none';
  }

  updateCategorySelect();
  updateChannelSelect();

  modal.classList.add('show');
}

/**
 * 关闭购买记录模态框
 */
export function closePurchaseModal() {
  const modal = document.getElementById('modal-purchase');
  if (modal) modal.classList.remove('show');
  state.editingPurchase = null;
  hideAutocomplete();
}

/**
 * 保存购买记录
 */
export function savePurchase() {
  const id = document.getElementById('item-id').value;
  const itemName = document.getElementById('item-name').value.trim();
  const category = document.getElementById('item-category').value.trim() || '其他';
  const price = parseFloat(document.getElementById('item-price').value);
  const quantity = parseInt(document.getElementById('item-quantity').value) || 1;
  const channel = document.getElementById('item-channel').value.trim() || '其他';
  const date = document.getElementById('item-date').value;
  const notes = document.getElementById('item-notes').value.trim();
  const specQty = parseInt(document.getElementById('item-spec-qty').value) || null;
  const specUnit = document.getElementById('item-spec-unit').value.trim() || null;
  const isPromo = document.getElementById('item-is-promo').checked;
  const promoType = document.getElementById('item-promo-type').value || null;
  const actualPaid = parseFloat(document.getElementById('item-actual-paid').value) || null;

  if (!itemName || !price || !date) {
    EventBus.emit('toast:show', { message: '请填写必填项', type: 'error' });
    return;
  }

  if (isNaN(price) || price <= 0) {
    EventBus.emit('toast:show', { message: '请输入有效的单价', type: 'error' });
    return;
  }

  const categories = Store.getCategories();
  if (category && !categories.includes(category)) {
    categories.push(category);
    Store.saveCategories(categories);
  }

  const channels = Store.getChannels();
  if (channel && !channels.includes(channel)) {
    channels.push(channel);
    Store.saveChannels(channels);
  }

  const existingItem = Store.getItemByName(itemName);
  const itemId = existingItem ? existingItem.id : generateId();

  const purchase = {
    id: id || generateId(),
    itemId,
    itemName,
    category,
    price,
    quantity,
    totalPrice: price * quantity,
    channel,
    date,
    notes,
    specQty,
    specUnit,
    isPromo,
    promoType,
    actualPaid
  };

  if (id) {
    Store.updatePurchase(id, purchase);
  } else {
    Store.addPurchase(purchase);
  }

  closePurchaseModal();
  render();
}

/**
 * 编辑购买记录
 * @param {string} id - 记录ID
 */
export function editPurchase(id) {
  const purchases = Store.getPurchases();
  const purchase = purchases.find(p => p.id === id);
  if (purchase) {
    showPurchaseModal(purchase);
  }
}

/**
 * 删除购买记录
 * @param {string} id - 记录ID
 */
export function deletePurchase(id) {
  if (confirm('确定要删除这条购买记录吗？')) {
    Store.deletePurchase(id);
    render();
  }
}

/**
 * 处理商品名称输入（自动补全）
 * @param {string} value - 输入值
 */
export function handleItemNameInput(value) {
  if (!value) {
    hideAutocomplete();
    return;
  }

  const items = Store.getItems();
  const matches = items.filter(item =>
    item.name.toLowerCase().includes(value.toLowerCase())
  );

  if (matches.length === 0) {
    hideAutocomplete();
    return;
  }

  showAutocomplete(matches);
}

/**
 * 显示自动补全列表
 * @param {Array} items - 匹配的商品列表
 */
function showAutocomplete(items) {
  const container = document.getElementById('autocomplete-list');
  const input = document.getElementById('item-name');

  if (!container || !input) return;

  container.innerHTML = items.map(item => `
    <div class="autocomplete-item" data-name="${escapeHtml(item.name)}" data-category="${escapeHtml(item.category)}">
      ${escapeHtml(item.name)} <span style="color:var(--text-muted);font-size:12px">${escapeHtml(item.category)}</span>
    </div>
  `).join('');

  container.style.display = 'block';

  container.querySelectorAll('.autocomplete-item').forEach(el => {
    el.addEventListener('click', () => {
      input.value = el.dataset.name;
      document.getElementById('item-category').value = el.dataset.category;
      hideAutocomplete();
    });
  });
}

/**
 * 隐藏自动补全列表
 */
export function hideAutocomplete() {
  const container = document.getElementById('autocomplete-list');
  if (container) {
    container.style.display = 'none';
  }
}

/**
 * 计算总价
 */
export function calculateTotal() {
  const price = parseFloat(document.getElementById('item-price').value) || 0;
  const quantity = parseInt(document.getElementById('item-quantity').value) || 0;
  const total = price * quantity;
  const totalInput = document.getElementById('item-total');
  if (totalInput) totalInput.value = total.toFixed(2);
}

/**
 * 更新分类选择器
 */
export function updateCategorySelect() {
  const datalist = document.getElementById('category-list');
  if (!datalist) return;

  const categories = Store.getCategories();
  datalist.innerHTML = categories.map(cat =>
    `<option value="${escapeHtml(cat)}">`
  ).join('');
}

/**
 * 更新渠道选择器
 */
export function updateChannelSelect() {
  const datalist = document.getElementById('channel-list');
  if (!datalist) return;

  const channels = Store.getChannels();
  datalist.innerHTML = channels.map(ch =>
    `<option value="${escapeHtml(ch)}">`
  ).join('');
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
