const App = {
  currentTab: 'overview',
  currentSort: { field: 'dailyCost', direction: 'desc' },
  currentFilters: {
    search: '',
    category: '',
    channel: '',
    dateFrom: '',
    dateTo: ''
  },
  editingItem: null,
  editingPurchase: null,
  pageSize: 10,
  currentPage: { overview: 1, records: 1 },

  init() {
    Store.init();
    this.bindEvents();
    this.render();
  },

  bindEvents() {
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
    });

    document.getElementById('btn-add-purchase')?.addEventListener('click', () => this.showPurchaseModal());
    document.getElementById('btn-export')?.addEventListener('click', () => this.showExportMenu());
    document.getElementById('btn-import')?.addEventListener('click', () => this.importData());
    document.getElementById('btn-ai-template')?.addEventListener('click', () => {
      this.switchTab('ai');
    });

    document.getElementById('search-overview')?.addEventListener('input', Utils.debounce(e => {
      this.currentFilters.search = e.target.value;
      this.renderOverview();
    }, 300));

    document.getElementById('filter-category-overview')?.addEventListener('change', e => {
      this.currentFilters.category = e.target.value;
      this.currentPage.overview = 1;
      this.renderOverview();
    });

    document.getElementById('filter-channel-overview')?.addEventListener('change', e => {
      this.currentFilters.channel = e.target.value;
      this.currentPage.overview = 1;
      this.renderOverview();
    });

    document.getElementById('search-records')?.addEventListener('input', Utils.debounce(e => {
      this.currentFilters.search = e.target.value;
      this.currentPage.records = 1;
      this.renderRecords();
    }, 300));

    document.getElementById('filter-category-records')?.addEventListener('change', e => {
      this.currentFilters.category = e.target.value;
      this.currentPage.records = 1;
      this.renderRecords();
    });

    document.getElementById('filter-channel')?.addEventListener('change', e => {
      this.currentFilters.channel = e.target.value;
      this.currentPage.records = 1;
      this.renderRecords();
    });

    document.getElementById('filter-date-from')?.addEventListener('change', e => {
      this.currentFilters.dateFrom = e.target.value;
      this.renderRecords();
    });

    document.getElementById('filter-date-to')?.addEventListener('change', e => {
      this.currentFilters.dateTo = e.target.value;
      this.renderRecords();
    });

    document.querySelectorAll('[data-sort]').forEach(th => {
      th.addEventListener('click', () => this.handleSort(th.dataset.sort));
    });

    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', e => {
        if (e.target === overlay) {
          this.closeAllModals();
        }
      });
    });

    document.getElementById('purchase-form')?.addEventListener('submit', e => {
      e.preventDefault();
      this.savePurchase();
    });

    document.getElementById('item-is-promo')?.addEventListener('change', e => {
      document.getElementById('promo-fields').style.display = e.target.checked ? 'flex' : 'none';
    });

    document.getElementById('item-name')?.addEventListener('input', Utils.debounce(e => {
      this.handleItemNameInput(e.target.value);
    }, 200));

    document.getElementById('item-price')?.addEventListener('input', () => this.calculateTotal());
    document.getElementById('item-quantity')?.addEventListener('input', () => this.calculateTotal());
  },

  switchTab(tabName) {
    this.currentTab = tabName;

    document.querySelectorAll('.tab').forEach(tab => {
      tab.classList.toggle('active', tab.dataset.tab === tabName);
    });

    document.querySelectorAll('.tab-content').forEach(content => {
      content.style.display = content.id === `tab-${tabName}` ? 'block' : 'none';
    });

    this.render();
  },

  render() {
    switch (this.currentTab) {
      case 'overview':
        this.renderOverview();
        break;
      case 'records':
        this.renderRecords();
        break;
      case 'analysis':
        this.renderAnalysis();
        break;
    }
  },

  renderOverview() {
    const allItems = this.getFilteredItems();
    const items = this.paginate(allItems, 'overview');
    const tbody = document.getElementById('overview-tbody');
    const emptyState = document.getElementById('overview-empty');

    if (allItems.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    tbody.innerHTML = items.map(item => `
      <tr>
        <td>
          <strong>${Utils.escapeHtml(item.name)}</strong>
          ${item.specUnit ? `<span class="spec-tag">${item.specUnit}</span>` : ''}
        </td>
        <td><span class="tag">${Utils.escapeHtml(item.category)}</span></td>
        <td class="price">${Utils.formatPrice(item.maxPrice)}</td>
        <td class="price">${Utils.formatPrice(item.minPrice)}</td>
        <td class="price">${Utils.formatPrice(item.avgPrice)}</td>
        <td>${Utils.escapeHtml(item.cheapestChannel)}</td>
        <td>${item.totalPurchases}次</td>
        <td>${Utils.formatDuration(item.avgDuration)}</td>
        <td class="price">${item.unitPrice !== null ? '¥' + item.unitPrice.toFixed(4) + '/' + item.specUnit : '-'}</td>
        <td class="price">
          <strong class="${Utils.getCostColorClass(item.dailyCost)}">
            ${item.dailyCost ? Utils.formatPrice(item.dailyCost) : 'N/A'}
          </strong>
          ${item.dailyCost ? `<span class="cost-tip">${Utils.getCostLabel(item.dailyCost)}</span>` : ''}
        </td>
        <td>
          <div class="actions">
            <button class="btn btn-sm" onclick="App.editItem('${item.id}')">编辑</button>
            <button class="btn btn-sm btn-danger" onclick="App.deleteItem('${item.id}')">删除</button>
          </div>
        </td>
      </tr>
    `).join('');

    this.updateOverviewSummary(allItems);
  },

  getFilteredItems() {
    let items = Store.getItems();

    if (this.currentFilters.search) {
      const search = this.currentFilters.search.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(search) ||
        item.category.toLowerCase().includes(search)
      );
    }

    if (this.currentFilters.category) {
      items = items.filter(item => item.category === this.currentFilters.category);
    }

    if (this.currentFilters.channel) {
      items = items.filter(item => item.cheapestChannel === this.currentFilters.channel);
    }

    items = this.sortItems(items);

    return items;
  },

  sortItems(items) {
    const { field, direction } = this.currentSort;
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
  },

  handleSort(field) {
    if (this.currentSort.field === field) {
      this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.currentSort.field = field;
      this.currentSort.direction = 'desc';
    }

    document.querySelectorAll('[data-sort]').forEach(th => {
      th.classList.toggle('sorted', th.dataset.sort === field);
      const arrow = th.querySelector('.sort-arrow');
      if (arrow) {
        arrow.textContent = th.dataset.sort === field
          ? (this.currentSort.direction === 'asc' ? '↑' : '↓')
          : '↕';
      }
    });

    this.renderOverview();
  },

  updateOverviewSummary(items) {
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

    document.getElementById('summary-total-items').textContent = totalItems;
    document.getElementById('summary-total-spending').textContent = Utils.formatPrice(totalSpending);
    document.getElementById('summary-avg-daily').textContent = Utils.formatPrice(avgDailyCost);

    const maxEl = document.getElementById('summary-max-daily');
    maxEl.textContent = maxItem ? `${maxItem.name} ${Utils.formatPrice(maxDailyCost)}` : '-';
    maxEl.className = 'cost-high';

    const minEl = document.getElementById('summary-min-daily');
    minEl.textContent = minItem ? `${minItem.name} ${Utils.formatPrice(minDailyCost)}` : '-';
    minEl.className = 'cost-low';
  },

  renderRecords() {
    const allPurchases = this.getFilteredPurchases();
    const purchases = this.paginate(allPurchases, 'records');
    const tbody = document.getElementById('records-tbody');
    const emptyState = document.getElementById('records-empty');

    if (allPurchases.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    tbody.innerHTML = purchases.map(p => `
      <tr>
        <td>${Utils.escapeHtml(p.date)}</td>
        <td>
          <strong>${Utils.escapeHtml(p.itemName)}</strong>
          ${p.specQty && p.specUnit ? `<span class="spec-tag">${p.specQty}${p.specUnit}/份</span>` : ''}
          ${p.isPromo ? `<span class="promo-badge">🏷️${p.promoType || '促销'}</span>` : ''}
        </td>
        <td><span class="tag">${Utils.escapeHtml(p.category)}</span></td>
        <td class="price">${Utils.formatPrice(p.price)}</td>
        <td>${p.quantity}</td>
        <td class="price">
          ${p.isPromo && p.actualPaid ? `<s style="color:var(--text-muted);font-size:11px">${Utils.formatPrice(p.totalPrice)}</s> ${Utils.formatPrice(p.actualPaid)}` : Utils.formatPrice(p.totalPrice)}
        </td>
        <td>${Utils.escapeHtml(p.channel)}</td>
        <td style="color:var(--text-secondary)">${Utils.escapeHtml(p.notes || '')}</td>
        <td>
          <div class="actions">
            <button class="btn btn-sm" onclick="App.editPurchase('${p.id}')">编辑</button>
            <button class="btn btn-sm btn-danger" onclick="App.deletePurchase('${p.id}')">删除</button>
          </div>
        </td>
      </tr>
    `).join('');

    this.updateRecordsSummary(allPurchases);
  },

  getFilteredPurchases() {
    let purchases = Store.getPurchases();

    if (this.currentFilters.search) {
      const search = this.currentFilters.search.toLowerCase();
      purchases = purchases.filter(p =>
        p.itemName.toLowerCase().includes(search) ||
        p.category.toLowerCase().includes(search) ||
        p.channel.toLowerCase().includes(search) ||
        (p.notes && p.notes.toLowerCase().includes(search))
      );
    }

    if (this.currentFilters.category) {
      purchases = purchases.filter(p => p.category === this.currentFilters.category);
    }

    if (this.currentFilters.channel) {
      purchases = purchases.filter(p => p.channel === this.currentFilters.channel);
    }

    if (this.currentFilters.dateFrom) {
      purchases = purchases.filter(p => p.date >= this.currentFilters.dateFrom);
    }

    if (this.currentFilters.dateTo) {
      purchases = purchases.filter(p => p.date <= this.currentFilters.dateTo);
    }

    return purchases.sort((a, b) => new Date(b.date) - new Date(a.date));
  },

  updateRecordsSummary(purchases) {
    const currentMonth = Utils.getCurrentMonth();
    const currentYear = Utils.getCurrentYear();

    const monthSpending = purchases
      .filter(p => p.date.startsWith(currentMonth))
      .reduce((sum, p) => sum + p.totalPrice, 0);

    const yearSpending = purchases
      .filter(p => p.date.startsWith(currentYear))
      .reduce((sum, p) => sum + p.totalPrice, 0);

    document.getElementById('summary-month-spending').textContent = Utils.formatPrice(monthSpending);
    document.getElementById('summary-year-spending').textContent = Utils.formatPrice(yearSpending);
    document.getElementById('summary-records-count').textContent = purchases.length;
  },

  currentPeriod: 'year',

  renderAnalysis() {
    Charts.renderAll();
  },

  updateStatCards() {
    const totalSpending = Store.getTotalSpending();
    const monthSpending = Store.getCurrentMonthSpending();
    const purchases = Store.getPurchases();
    const items = Store.getItems();

    const dailyCosts = items.filter(i => i.dailyCost !== null).map(i => i.dailyCost);
    const avgDailySpending = dailyCosts.length > 0
      ? dailyCosts.reduce((a, b) => a + b, 0) / dailyCosts.length
      : 0;

    document.getElementById('stat-total-spending').textContent = Utils.formatPrice(totalSpending);
    document.getElementById('stat-month-spending').textContent = Utils.formatPrice(monthSpending);
    document.getElementById('stat-purchase-count').textContent = purchases.length;
    document.getElementById('stat-daily-spending').textContent = Utils.formatPrice(avgDailySpending);
  },

  showPurchaseModal(purchase = null) {
    this.editingPurchase = purchase;
    const modal = document.getElementById('modal-purchase');
    const form = document.getElementById('purchase-form');
    const title = document.getElementById('modal-purchase-title');

    title.textContent = purchase ? '编辑购买记录' : '添加购买记录';

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
      document.getElementById('item-date').value = Utils.formatDate(new Date());
      document.getElementById('item-quantity').value = '1';
      document.getElementById('promo-fields').style.display = 'none';
    }

    this.updateCategorySelect();
    this.updateChannelSelect();

    modal.classList.add('show');
  },

  closePurchaseModal() {
    const modal = document.getElementById('modal-purchase');
    modal.classList.remove('show');
    this.editingPurchase = null;
    this.hideAutocomplete();
  },

  closeAllModals() {
    document.querySelectorAll('.modal-overlay.show').forEach(modal => {
      modal.classList.remove('show');
    });
    this.editingPurchase = null;
    this.editingItem = null;
    this.hideAutocomplete();
  },

  savePurchase() {
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
      this.showToast('请填写必填项', 'error');
      return;
    }

    if (isNaN(price) || price <= 0) {
      this.showToast('请输入有效的单价', 'error');
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
    const itemId = existingItem ? existingItem.id : Utils.generateId();

    const purchase = {
      id: id || Utils.generateId(),
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
      isPromo: isPromo || undefined,
      promoType,
      actualPaid
    };

    if (id) {
      Store.updatePurchase(id, purchase);
    } else {
      Store.addPurchase(purchase);
    }

    this.closePurchaseModal();
    this.render();
  },

  editPurchase(id) {
    const purchases = Store.getPurchases();
    const purchase = purchases.find(p => p.id === id);
    if (purchase) {
      this.showPurchaseModal(purchase);
    }
  },

  deletePurchase(id) {
    if (confirm('确定要删除这条购买记录吗？')) {
      Store.deletePurchase(id);
      this.render();
    }
  },

  editItem(itemId) {
    const item = Store.getItemById(itemId);
    if (!item) return;

    this.editingItem = item;
    const modal = document.getElementById('modal-edit-item');
    const nameInput = document.getElementById('edit-item-name');
    const categorySelect = document.getElementById('edit-item-category');

    nameInput.value = item.name;
    this.updateEditCategorySelect();
    categorySelect.value = item.category;

    modal.classList.add('show');
  },

  closeEditItemModal() {
    const modal = document.getElementById('modal-edit-item');
    modal.classList.remove('show');
    this.editingItem = null;
  },

  saveEditItem() {
    if (!this.editingItem) return;

    const name = document.getElementById('edit-item-name').value.trim();
    const category = document.getElementById('edit-item-category').value.trim() || '其他';

    if (!name) {
      this.showToast('物品名称不能为空', 'error');
      return;
    }

    const categories = Store.getCategories();
    if (category && !categories.includes(category)) {
      categories.push(category);
      Store.saveCategories(categories);
    }

    const purchases = Store.getPurchases();
    purchases.forEach(p => {
      if (p.itemId === this.editingItem.id) {
        p.itemName = name;
        p.category = category;
      }
    });

    Store.savePurchases(purchases);
    this.closeEditItemModal();
    this.render();
  },

  deleteItem(itemId) {
    const item = Store.getItemById(itemId);
    if (!item) return;

    const count = item.totalPurchases;
    if (confirm(`确定要删除「${item.name}」吗？将同时删除该物品的 ${count} 条购买记录。`)) {
      Store.deleteItem(itemId);
      this.render();
    }
  },

  handleItemNameInput(value) {
    if (!value) {
      this.hideAutocomplete();
      return;
    }

    const items = Store.getItems();
    const matches = items.filter(item =>
      item.name.toLowerCase().includes(value.toLowerCase())
    );

    if (matches.length === 0) {
      this.hideAutocomplete();
      return;
    }

    this.showAutocomplete(matches);
  },

  showAutocomplete(items) {
    const container = document.getElementById('autocomplete-list');
    const input = document.getElementById('item-name');

    container.innerHTML = items.map(item => `
      <div class="autocomplete-item" data-name="${Utils.escapeHtml(item.name)}" data-category="${Utils.escapeHtml(item.category)}">
        ${Utils.escapeHtml(item.name)} <span style="color:var(--text-muted);font-size:12px">${Utils.escapeHtml(item.category)}</span>
      </div>
    `).join('');

    container.style.display = 'block';

    container.querySelectorAll('.autocomplete-item').forEach(el => {
      el.addEventListener('click', () => {
        input.value = el.dataset.name;
        document.getElementById('item-category').value = el.dataset.category;
        this.hideAutocomplete();
      });
    });
  },

  hideAutocomplete() {
    const container = document.getElementById('autocomplete-list');
    if (container) {
      container.style.display = 'none';
    }
  },

  calculateTotal() {
    const price = parseFloat(document.getElementById('item-price').value) || 0;
    const quantity = parseInt(document.getElementById('item-quantity').value) || 0;
    const total = price * quantity;
    document.getElementById('item-total').value = total.toFixed(2);
  },

  updateCategorySelect() {
    const datalist = document.getElementById('category-list');
    const categories = Store.getCategories();
    datalist.innerHTML = categories.map(cat =>
      `<option value="${Utils.escapeHtml(cat)}">`
    ).join('');
  },

  updateEditCategorySelect() {
    const datalist = document.getElementById('category-list');
    const categories = Store.getCategories();
    datalist.innerHTML = categories.map(cat =>
      `<option value="${Utils.escapeHtml(cat)}">`
    ).join('');
  },

  updateChannelSelect() {
    const datalist = document.getElementById('channel-list');
    const channels = Store.getChannels();
    datalist.innerHTML = channels.map(ch =>
      `<option value="${Utils.escapeHtml(ch)}">`
    ).join('');
  },

  showExportMenu() {
    const menu = document.getElementById('export-menu');
    menu.style.display = menu.style.display === 'block' ? 'none' : 'block';

    const closeMenu = (e) => {
      if (!menu.contains(e.target) && e.target.id !== 'btn-export') {
        menu.style.display = 'none';
        document.removeEventListener('click', closeMenu);
      }
    };

    setTimeout(() => document.addEventListener('click', closeMenu), 0);
  },

  exportJSON() {
    const json = Store.exportJSON();
    Utils.downloadFile(json, `price-tracker-${Utils.formatDate(new Date())}.json`, 'application/json');
    document.getElementById('export-menu').style.display = 'none';
  },

  exportCSV() {
    const csv = Store.exportCSV();
    Utils.downloadFile(csv, `purchases-${Utils.formatDate(new Date())}.csv`, 'text/csv;charset=utf-8');
    document.getElementById('export-menu').style.display = 'none';
  },

  exportItemsCSV() {
    const csv = Store.exportItemsCSV();
    Utils.downloadFile(csv, `items-${Utils.formatDate(new Date())}.csv`, 'text/csv;charset=utf-8');
    document.getElementById('export-menu').style.display = 'none';
  },

  importData() {
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

        const result = await Store.importJSON(content, mode);
        if (result.success) {
          alert(`成功导入 ${result.count} 条记录`);
          this.render();
        } else {
          alert(`导入失败：${result.error}`);
        }
      } catch (err) {
        alert('文件读取失败');
      }
    };
    input.click();
  },

  initFilters() {
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
  },

  deleteTestData() {
    const purchases = Store.getPurchases();
    const testPurchases = purchases.filter(p => !p.id.startsWith('d'));
    if (confirm(`确定删除 ${purchases.length - testPurchases.length} 条测试数据吗？`)) {
      Store.savePurchases(testPurchases);
      this.showToast('✅ 测试数据已删除', 'success');
      this.render();
    }
  },

  deleteAllData() {
    if (confirm('⚠️ 确定删除所有数据吗？此操作不可恢复！')) {
      if (confirm('再次确认：删除所有购买记录？')) {
        Store.savePurchases([]);
        this.showToast('✅ 所有数据已删除', 'success');
        this.render();
      }
    }
  },

  loadDemoData() {
    if (confirm('重置为示例数据？当前数据将被覆盖。')) {
      Store.savePurchases(Store.defaultPurchases);
      Store.saveCategories(Store.defaultCategories);
      Store.saveChannels(Store.defaultChannels);
      this.showToast('✅ 示例数据已重置', 'success');
      this.initFilters();
      this.render();
    }
  },

  getAITemplate() {
    const categories = Store.getCategories();
    const channels = Store.getChannels();

    return `你是一个购物小票识别助手。请根据我提供的小票信息，提取出购买记录并转换为 JSON 格式。

要求：
1. 每条记录包含以下字段：
   - itemName: 物品名称（字符串）
   - category: 分类（从以下选项中选择：${categories.join('、')}）
   - price: 单价（数字，单位元）
   - quantity: 数量（整数）
   - channel: 购买渠道（从以下选项中选择：${channels.join('、')}）
   - date: 购买日期（格式 YYYY-MM-DD，如果小票没有日期则用今天）
   - notes: 备注（可选，如有特殊说明则填写）

2. 输出格式为 JSON 数组，例如：
[
  {
    "itemName": "抽纸",
    "category": "日用品",
    "price": 29.9,
    "quantity": 10,
    "channel": "京东",
    "date": "2026-06-30",
    "notes": "618囤货"
  }
]

3. 注意事项：
   - 如果小票显示的是总价而非单价，请用总价除以数量得到单价
   - 如果无法确定分类，默认填"其他"
   - 如果无法确定渠道，默认填"其他"
   - 日期格式必须是 YYYY-MM-DD
   - 只输出 JSON 数组，不要有其他文字

现在请识别以下小票信息：`;
  },

  async copyAITemplate() {
    const template = this.getAITemplate();

    try {
      await navigator.clipboard.writeText(template);
      this.showToast('✅ AI 提示词模板已复制到剪贴板', 'success');
    } catch (err) {
      const textarea = document.createElement('textarea');
      textarea.value = template;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      this.showToast('✅ AI 提示词模板已复制到剪贴板', 'success');
    }
  },

  showTemplatePreview() {
    const preview = document.getElementById('template-preview');
    const template = this.getAITemplate();

    if (preview.style.display === 'none') {
      preview.textContent = template;
      preview.style.display = 'block';
    } else {
      preview.style.display = 'none';
    }
  },

  async pasteFromClipboard() {
    try {
      const text = await navigator.clipboard.readText();
      document.getElementById('ai-import-input').value = text;
      this.showToast('📋 已从剪贴板粘贴', 'success');
    } catch (err) {
      this.showToast('❌ 无法读取剪贴板，请手动粘贴', 'error');
    }
  },

  clearImportArea() {
    document.getElementById('ai-import-input').value = '';
  },

  formatImportJSON() {
    const input = document.getElementById('ai-import-input');
    try {
      const data = JSON.parse(input.value);
      input.value = JSON.stringify(data, null, 2);
      this.showToast('✅ JSON 已格式化', 'success');
    } catch (err) {
      this.showToast('❌ JSON 格式错误', 'error');
    }
  },

  validateImportJSON() {
    const input = document.getElementById('ai-import-input');
    try {
      const data = JSON.parse(input.value);

      if (!Array.isArray(data)) {
        this.showToast('❌ 数据必须是数组格式', 'error');
        return false;
      }

      const requiredFields = ['itemName', 'price', 'quantity', 'date'];
      const missingFields = [];

      data.forEach((item, index) => {
        requiredFields.forEach(field => {
          if (item[field] === undefined || item[field] === null) {
            missingFields.push(`第 ${index + 1} 条缺少 ${field}`);
          }
        });
      });

      if (missingFields.length > 0) {
        this.showToast(`❌ ${missingFields[0]}`, 'error');
        return false;
      }

      this.showToast(`✅ 验证通过，共 ${data.length} 条记录`, 'success');
      return true;
    } catch (err) {
      this.showToast('❌ JSON 解析失败，请检查格式', 'error');
      return false;
    }
  },

  importAIData() {
    const input = document.getElementById('ai-import-input');
    let data;

    try {
      data = JSON.parse(input.value);
    } catch (err) {
      this.showToast('❌ JSON 解析失败，请检查格式', 'error');
      return;
    }

    if (!Array.isArray(data)) {
      this.showToast('❌ 数据必须是数组格式', 'error');
      return;
    }

    const today = Utils.formatDate(new Date());
    const categories = Store.getCategories();
    const channels = Store.getChannels();
    let importedCount = 0;

    data.forEach(item => {
      if (!item.itemName || !item.price) return;

      const purchase = {
        id: Utils.generateId(),
        itemId: Utils.generateId(),
        itemName: item.itemName,
        category: categories.includes(item.category) ? item.category : '其他',
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity) || 1,
        totalPrice: parseFloat(item.price) * (parseInt(item.quantity) || 1),
        channel: channels.includes(item.channel) ? item.channel : '其他',
        date: item.date || today,
        notes: item.notes || ''
      };

      const existingItem = Store.getItemByName(purchase.itemName);
      if (existingItem) {
        purchase.itemId = existingItem.id;
      }

      Store.addPurchase(purchase);
      importedCount++;
    });

    if (importedCount > 0) {
      this.showToast(`✅ 成功导入 ${importedCount} 条记录`, 'success');
      input.value = '';
      this.render();
    } else {
      this.showToast('❌ 没有有效数据可导入', 'error');
    }
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.animation = 'fadeIn 0.3s ease reverse';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  },

  goPage(tab, delta) {
    this.currentPage[tab] += delta;
    if (this.currentPage[tab] < 1) this.currentPage[tab] = 1;
    if (tab === 'overview') this.renderOverview();
    else this.renderRecords();
  },

  paginate(data, tab) {
    const total = data.length;
    const totalPages = Math.max(1, Math.ceil(total / this.pageSize));
    if (this.currentPage[tab] > totalPages) this.currentPage[tab] = totalPages;
    const start = (this.currentPage[tab] - 1) * this.pageSize;
    const pageData = data.slice(start, start + this.pageSize);

    const pagEl = document.getElementById(`${tab}-pagination`);
    const infoEl = document.getElementById(`${tab}-page-info`);
    if (total > this.pageSize) {
      pagEl.style.display = 'flex';
      infoEl.textContent = `${this.currentPage[tab]} / ${totalPages}`;
    } else {
      pagEl.style.display = 'none';
    }

    return pageData;
  }
};

window.App = App;
