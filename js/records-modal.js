/**
 * RecordsModal - 购买记录模态框模块
 * 职责：模态框显示/隐藏、表单填充、保存记录、自动补全
 */

import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import { escapeHtml, formatDate, generateId, roundPrice } from './utils.js';

/**
 * 设置表单中的星级评分
 * @param {number} rating - 评分 (0-5)
 */
function setRating(rating) {
  const stars = document.querySelectorAll('#rating-stars .star');
  stars.forEach((star, index) => {
    star.classList.toggle('active', index < rating);
  });
  const ratingEl = document.getElementById('item-rating');
  if (ratingEl) ratingEl.value = rating;
}

/**
 * 获取表单中的星级评分
 * @returns {number} 评分
 */
function getRating() {
  const ratingEl = document.getElementById('item-rating');
  return ratingEl ? parseInt(ratingEl.value) || 0 : 0;
}

/**
 * 初始化星级评分交互
 */
export function initRatingStars() {
  const container = document.getElementById('rating-stars');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const star = e.target.closest('.star');
    if (!star) return;
    const rating = parseInt(star.dataset.rating);
    setRating(rating);
  });

  container.addEventListener('mouseover', (e) => {
    const star = e.target.closest('.star');
    if (!star) return;
    const rating = parseInt(star.dataset.rating);
    const stars = container.querySelectorAll('.star');
    stars.forEach((s, i) => {
      s.classList.toggle('hover', i < rating);
    });
  });

  container.addEventListener('mouseout', () => {
    const stars = container.querySelectorAll('.star');
    stars.forEach(s => s.classList.remove('hover'));
  });
}

/**
 * 显示购买记录模态框
 * @param {Object|null} purchase - 购买记录（编辑模式）或null（新增模式）
 * @param {Object} state - 模块状态引用
 */
export function showPurchaseModal(purchase, state) {
  state.editingPurchase = purchase;
  const modal = document.getElementById('modal-purchase');
  const form = document.getElementById('purchase-form');
  const title = document.getElementById('modal-purchase-title');

  if (!modal || !form) return;

  if (title) title.textContent = purchase ? '编辑购买记录' : '添加购买记录';

  if (purchase) {
    const idEl = document.getElementById('item-id');
    const nameEl = document.getElementById('item-name');
    const brandEl = document.getElementById('item-brand');
    const categoryEl = document.getElementById('item-category');
    const priceEl = document.getElementById('item-price');
    const quantityEl = document.getElementById('item-quantity');
    const totalEl = document.getElementById('item-total');
    const channelEl = document.getElementById('item-channel');
    const dateEl = document.getElementById('item-date');
    const notesEl = document.getElementById('item-notes');
    const specQtyEl = document.getElementById('item-spec-qty');
    const specUnitEl = document.getElementById('item-spec-unit');
    const isPromoEl = document.getElementById('item-is-promo');
    const promoTypeEl = document.getElementById('item-promo-type');
    const actualPaidEl = document.getElementById('item-actual-paid');
    const promoFieldsEl = document.getElementById('promo-fields');

    if (idEl) idEl.value = purchase.id;
    if (nameEl) nameEl.value = purchase.itemName;
    if (brandEl) brandEl.value = purchase.brand || '';
    if (categoryEl) categoryEl.value = purchase.category;
    if (priceEl) priceEl.value = purchase.price;
    if (quantityEl) quantityEl.value = purchase.quantity;
    if (totalEl) totalEl.value = purchase.totalPrice;
    if (channelEl) channelEl.value = purchase.channel;
    if (dateEl) dateEl.value = purchase.date;
    if (notesEl) notesEl.value = purchase.notes || '';
    if (specQtyEl) specQtyEl.value = purchase.specQty || '';
    if (specUnitEl) specUnitEl.value = purchase.specUnit || '';
    if (isPromoEl) isPromoEl.checked = !!purchase.isPromo;
    if (promoTypeEl) promoTypeEl.value = purchase.promoType || '';
    if (actualPaidEl) actualPaidEl.value = purchase.actualPaid || '';
    if (promoFieldsEl) promoFieldsEl.style.display = purchase.isPromo ? 'flex' : 'none';
    setRating(purchase.rating || 0);
  } else {
    form.reset();
    const idEl = document.getElementById('item-id');
    const dateEl = document.getElementById('item-date');
    const quantityEl = document.getElementById('item-quantity');
    const promoFieldsEl = document.getElementById('promo-fields');
    
    if (idEl) idEl.value = '';
    if (dateEl) dateEl.value = formatDate(new Date());
    if (quantityEl) quantityEl.value = '1';
    if (promoFieldsEl) promoFieldsEl.style.display = 'none';
    setRating(0);
  }

  modal.classList.add('show');
}

/**
 * 关闭购买记录模态框
 * @param {Object} state - 模块状态引用
 */
export function closePurchaseModal(state) {
  const modal = document.getElementById('modal-purchase');
  if (modal) modal.classList.remove('show');
  state.editingPurchase = null;
  hideAutocomplete();
}

/**
 * 保存购买记录
 * @returns {Object|null} 保存的购买记录或null
 */
export function savePurchase() {
  const idEl = document.getElementById('item-id');
  const nameEl = document.getElementById('item-name');
  const priceEl = document.getElementById('item-price');
  const dateEl = document.getElementById('item-date');
  
  if (!idEl || !nameEl || !priceEl || !dateEl) {
    EventBus.emit('toast:show', { message: '表单元素不存在', type: 'error' });
    return null;
  }

  const id = idEl.value;
  const itemName = nameEl.value.trim();
  const brand = document.getElementById('item-brand')?.value.trim() || '';
  const category = document.getElementById('item-category')?.value.trim() || '其他';
  const price = parseFloat(priceEl.value);
  const quantity = parseInt(document.getElementById('item-quantity')?.value) || 1;
  const channel = document.getElementById('item-channel')?.value.trim() || '其他';
  const date = dateEl.value;
  const notes = document.getElementById('item-notes')?.value.trim() || '';
  const specQty = parseFloat(document.getElementById('item-spec-qty')?.value) || null;
  const specUnit = document.getElementById('item-spec-unit')?.value.trim() || null;
  const isPromo = document.getElementById('item-is-promo')?.checked || false;
  const promoType = document.getElementById('item-promo-type')?.value || null;
  const actualPaid = parseFloat(document.getElementById('item-actual-paid')?.value) || null;
  const rating = getRating();

  if (!itemName || !price || !date) {
    EventBus.emit('toast:show', { message: '请填写必填项', type: 'error' });
    return null;
  }

  if (isNaN(price) || price <= 0) {
    EventBus.emit('toast:show', { message: '请输入有效的单价', type: 'error' });
    return null;
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
    brand,
    category,
    price,
    quantity,
    totalPrice: roundPrice(price * quantity),
    channel,
    date,
    notes,
    specQty,
    specUnit,
    isPromo,
    promoType,
    actualPaid,
    rating
  };

  if (id) {
    Store.updatePurchase(id, purchase);
  } else {
    Store.addPurchase(purchase);
  }

  return purchase;
}

/**
 * 编辑购买记录
 * @param {string} id - 记录ID
 * @param {Object} state - 模块状态引用
 */
export function editPurchase(id, state) {
  const purchases = Store.getPurchases();
  const purchase = purchases.find(p => p.id === id);
  if (purchase) {
    showPurchaseModal(purchase, state);
  }
}

/**
 * 删除购买记录
 * @param {string} id - 记录ID
 * @returns {boolean} 是否删除成功
 */
export function deletePurchase(id) {
  if (confirm('确定要删除这条购买记录吗？')) {
    Store.deletePurchase(id);
    return true;
  }
  return false;
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
  const price = parseFloat(document.getElementById('item-price')?.value) || 0;
  const quantity = parseInt(document.getElementById('item-quantity')?.value) || 0;
  const total = roundPrice(price * quantity);
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
 * 更新品牌选择器
 */
export function updateBrandSelect() {
  const datalist = document.getElementById('brand-list');
  if (!datalist) return;

  const brands = Store.getBrands();
  datalist.innerHTML = brands.map(brand =>
    `<option value="${escapeHtml(brand)}">`
  ).join('');
}
