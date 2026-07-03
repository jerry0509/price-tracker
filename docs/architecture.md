# 技术方案

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端 | 原生 HTML + CSS + JavaScript | 零依赖，无需构建工具 |
| 存储 | localStorage | 本地存储，隐私优先 |
| 模块化 | ES Modules | 浏览器原生支持，无需打包 |
| 图表 | Chart.js (CDN) | 轻量级图表库，CDN引入 |

---

## 文件结构

```
price-tracker/
├── index.html              # 入口页面
├── css/
│   └── styles.css          # 全局样式 + CSS变量
├── js/
│   ├── eventBus.js         # 基础设施：事件总线
│   ├── store.js            # 数据层：localStorage CRUD、聚合计算
│   ├── utils.js            # 工具函数：格式化、日期、防抖、escapeHtml
│   ├── overview.js         # 价格总览模块：商品列表、筛选、排序
│   ├── records.js          # 购买记录模块：记录列表、筛选、CRUD
│   ├── analysis.js         # 数据分析模块：统计卡片、图表
│   ├── ai-import.js        # AI导入模块：模板生成、数据导入
│   └── app.js              # 入口+Tab路由：初始化、模块组装
├── README.md
└── WORKFLOW.md
```

---

## 模块职责

### eventBus.js（基础设施）
**职责**：模块间通信的事件总线

```javascript
// 导出单例
export const EventBus = {
  on(event, callback)      // 监听事件，返回取消函数
  off(event, callback)     // 取消监听
  emit(event, data)        // 触发事件
  once(event, callback)    // 监听一次
}

// 标准事件列表
// 'purchase:added'     - 新增购买记录
// 'purchase:updated'   - 更新购买记录
// 'purchase:deleted'   - 删除购买记录
// 'tab:switch'         - 切换Tab
// 'data:imported'      - 数据导入完成
// 'data:exported'      - 数据导出完成
```

### store.js（数据层）
**职责**：localStorage CRUD、数据聚合、导入导出

```javascript
import { EventBus } from './eventBus.js';

// 导出单例
export const Store = {
  // 初始化
  init()                        // 初始化存储，加载默认数据
  
  // 购买记录 CRUD
  getPurchases()                // 获取所有购买记录
  getPurchaseById(id)           // 获取单条记录
  addPurchase(data)             // 新增记录，触发 purchase:added
  updatePurchase(id, data)      // 更新记录，触发 purchase:updated
  deletePurchase(id)            // 删除记录，触发 purchase:deleted
  
  // 商品聚合
  getItems()                    // 获取聚合后的商品列表
  getItemById(itemId)           // 获取单个商品（含购买记录）
  getItemByName(name)           // 按名称查找商品
  deleteItem(itemId)            // 删除商品及其所有记录
  
  // 分类/渠道
  getCategories()               // 获取分类列表
  saveCategories(categories)    // 保存分类列表
  getChannels()                 // 获取渠道列表
  saveChannels(channels)        // 保存渠道列表
  
  // 导入导出
  exportJSON()                  // 导出JSON
  exportCSV()                   // 导出CSV（记录）
  exportItemsCSV()              // 导出CSV（商品汇总）
  importJSON(data, mode)        // 导入JSON（merge/overwrite）
  
  // 工具
  generateId()                  // 生成唯一ID
  calculateAvgDuration(purchases) // 计算平均使用天数
}
```

### utils.js（工具函数）
**职责**：通用工具函数

```javascript
// 导出函数
export function generateId()                  // 生成UUID
export function formatPrice(price)            // 格式化价格（¥12.50）
export function formatNumber(num)             // 格式化数字（1,234）
export function formatDate(date)              // 格式化日期（2026-07-03）
export function formatDuration(days)          // 格式化时长（15天）
export function daysBetween(date1, date2)     // 计算两个日期间隔天数
export function getMonthRange(year, month)    // 获取月份范围
export function escapeHtml(str)               // 防XSS转义
export function debounce(fn, delay)           // 防抖
export function getCostColorClass(dailyCost)  // 获取日均成本颜色class
export function getCostLabel(dailyCost)       // 获取日均成本标签
```

### overview.js（价格总览模块）
**职责**：价格总览页面的渲染和交互

```javascript
import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import * as Utils from './utils.js';

// 导出模块
export const Overview = {
  // 初始化
  init()                        // 绑定事件、监听 purchase:* 事件
  
  // 渲染
  render()                      // 渲染整个页面
  renderTable(items)            // 渲染表格
  renderSummary(items)          // 渲染汇总信息
  renderPagination(total)       // 渲染分页
  
  // 筛选/排序
  getFilteredItems()            // 获取筛选后的商品
  sortItems(items)              // 排序商品
  handleSort(field)             // 处理排序点击
  
  // 交互
  showItemHistory(itemId)       // 显示商品购买历史
  editItem(itemId)              // 编辑商品
  deleteItem(itemId)            // 删除商品
}
```

### records.js（购买记录模块）
**职责**：购买记录页面的渲染和交互

```javascript
import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import * as Utils from './utils.js';

// 导出模块
export const Records = {
  // 初始化
  init()                        // 绑定事件、监听 purchase:* 事件
  
  // 渲染
  render()                      // 渲染整个页面
  renderTable(purchases)        // 渲染表格
  renderPagination(total)       // 渲染分页
  
  // 筛选
  getFilteredPurchases()        // 获取筛选后的记录
  
  // CRUD交互
  showPurchaseModal(purchase)   // 显示新增/编辑模态框
  savePurchase()                // 保存记录
  deletePurchase(id)            // 删除记录
  closePurchaseModal()          // 关闭模态框
  
  // 自动补全
  showAutocomplete(input)       // 显示自动补全列表
  hideAutocomplete()            // 隐藏自动补全
}
```

### analysis.js（数据分析模块）
**职责**：数据分析页面的渲染和图表

```javascript
import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import * as Utils from './utils.js';

// Chart.js 通过 CDN 引入，挂载在 window.Chart
// <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

// 导出模块
export const Analysis = {
  // 图表实例
  categoryChart: null,
  channelChart: null,
  monthlyChart: null,
  dailyCostChart: null,
  
  // 初始化
  init()                        // 绑定事件、监听 purchase:* 事件
  
  // 渲染
  render()                      // 渲染整个页面
  renderStatCards(data)          // 渲染统计卡片
  renderCharts(data)             // 渲染图表（调用Chart.js）
  
  // 数据计算
  getStatistics(year, month)    // 获取统计数据
  getCategoryData(purchases)    // 获取分类数据
  getChannelData(purchases)     // 获取渠道数据
  getMonthlyData(purchases)     // 获取月度趋势
  getDailyCostRanking(items)    // 获取日均成本排名
  
  // 图表（使用Chart.js）
  createDonutChart(data, canvasId)   // 创建甜甜圈图
  createBarChart(data, canvasId)     // 创建柱状图
  destroyCharts()                     // 销毁图表实例（避免内存泄漏）
}
```

### ai-import.js（AI导入模块）
**职责**：AI智能导入功能

```javascript
import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import * as Utils from './utils.js';

// 导出模块
export const AiImport = {
  // 初始化
  init()                        // 绑定事件
  
  // 渲染
  render()                      // 渲染AI导入页面
  
  // 功能
  generatePrompt()              // 生成AI提示词模板
  copyPrompt()                  // 复制提示词到剪贴板
  parseImportData(jsonStr)      // 解析AI返回的JSON数据
  validateImportData(data)      // 验证导入数据格式
  importData(data)              // 执行导入
  formatJsonPreview(data)       // 格式化JSON预览
  
  // UI
  showToast(message, type)      // 显示提示
  showError(message)            // 显示错误
}
```

### app.js（入口+Tab路由）
**职责**：应用初始化、Tab切换、全局操作

```javascript
import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import { Overview } from './overview.js';
import { Records } from './records.js';
import { Analysis } from './analysis.js';
import { AiImport } from './ai-import.js';
import * as Utils from './utils.js';

// 导出模块
export const App = {
  // 状态
  currentTab: 'overview',
  
  // 初始化
  init()                        // 初始化所有模块
  initFilters()                 // 初始化筛选器选项
  
  // Tab路由
  switchTab(tabName)            // 切换Tab，触发 tab:switch 事件
  
  // 全局操作
  showExportMenu()              // 显示导出菜单
  hideExportMenu()              // 隐藏导出菜单
  importData()                  // 导入数据
  loadDemoData()                // 加载示例数据
  deleteAllData()               // 删除所有数据
  
  // 模态框
  closeAllModals()              // 关闭所有模态框
  showToast(message, type)      // 显示Toast提示
}
```

---

## 数据结构

### 购买记录（Purchase）

```javascript
{
  id: "abc123",                 // 唯一标识（UUID）
  itemId: "item-tissue",        // 商品ID（同名商品共享）
  itemName: "抽纸",             // 商品名称
  category: "日用品",           // 分类
  price: 35,                    // 单价（元）
  quantity: 10,                 // 数量
  totalPrice: 350,              // 总价（price * quantity）
  channel: "京东",              // 购买渠道
  date: "2026-01-08",           // 购买日期（YYYY-MM-DD）
  notes: "年货节",              // 备注（可选）
  specQty: 120,                 // 规格数量（可选，如120抽）
  specUnit: "抽",               // 规格单位（可选）
  isPromo: true,                // 是否促销
  promoType: "满减",            // 促销类型（可选）
  actualPaid: 320               // 实付金额（可选，默认=totalPrice）
}
```

### 商品（Item）- 运行时聚合，不存储

```javascript
{
  id: "item-tissue",            // 商品ID
  name: "抽纸",                 // 商品名称
  category: "日用品",           // 分类
  specUnit: "抽",               // 规格单位
  purchases: [...],             // 购买记录数组
  maxPrice: 35,                 // 最高价
  minPrice: 28,                 // 最低价
  avgPrice: 31.25,              // 均价
  cheapestChannel: "拼多多",    // 最便宜渠道
  totalPurchases: 4,            // 购买次数
  totalQuantity: 29,            // 总数量
  avgDuration: 45,              // 平均使用天数
  dailyCost: 0.69,              // 日均成本
  unitPrice: 0.26               // 归一化单价（/specUnit）
}
```

### 导出文件结构

```javascript
{
  version: "3.0",               // 格式版本号
  exportDate: "2026-07-03T10:00:00Z",  // 导出时间
  source: "PriceTracker",       // 来源应用
  data: [...]                   // 购买记录数组
}
```

---

## 模块通信

### 事件驱动架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  overview   │     │   records   │     │  analysis   │     │  ai-import  │
│   .js       │     │    .js      │     │    .js      │     │    .js      │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │                   │
       └───────────────────┼───────────────────┼───────────────────┘
                           │                   │
                    ┌──────▼──────┐            │
                    │  eventBus   │◄───────────┘
                    │    .js      │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   store.js  │
                    └─────────────┘
```

### 事件流示例

**新增购买记录**：
1. `records.js` 调用 `Store.addPurchase(data)`
2. `Store` 保存数据到 localStorage
3. `Store` 触发 `EventBus.emit('purchase:added', purchase)`
4. `overview.js` 监听 `purchase:added`，重新渲染表格
5. `analysis.js` 监听 `purchase:added`，重新渲染图表

**切换Tab**：
1. `app.js` 调用 `EventBus.emit('tab:switch', tabName)`
2. 各模块监听 `tab:switch`，决定是否需要重新渲染
3. `app.js` 更新 DOM 显示/隐藏对应内容

---

## 数据迁移策略

### 版本号管理

```javascript
// store.js
CURRENT_VERSION: '3.0'

// 初始化时检查版本
init() {
  const savedVersion = localStorage.getItem(VERSION_KEY);
  if (savedVersion !== CURRENT_VERSION) {
    this.migrate(savedVersion, CURRENT_VERSION);
    localStorage.setItem(VERSION_KEY, CURRENT_VERSION);
  }
}
```

### 迁移函数

```javascript
migrate(fromVersion, toVersion) {
  // 3.0 → 4.0 示例
  if (fromVersion === '3.0' && toVersion === '4.0') {
    const data = this.getPurchases();
    // 转换数据结构
    const migrated = data.map(item => ({
      ...item,
      newField: 'defaultValue'
    }));
    this.savePurchases(migrated);
  }
}
```

---

## 实施顺序

### 阶段1：基础设施（Day 1）
1. 创建 `eventBus.js`
2. 重构 `store.js`，添加事件触发
3. 重构 `utils.js`，保持接口不变

### 阶段2：模块拆分（Day 2-3）
4. 从 `app.js` 提取 `overview.js`
5. 从 `app.js` 提取 `records.js`
6. 从 `app.js` 提取 `analysis.js`（整合charts.js）
7. 从 `app.js` 提取 `ai-import.js`

### 阶段3：入口重构（Day 4）
8. 重构 `app.js` 为入口+Tab路由
9. 更新 `index.html`，使用 ES Modules + Chart.js CDN

### 阶段4：UI重构（Day 5-7）
10. 更新 `styles.css`，应用新设计规范
11. 更新 `index.html`，使用SVG图标
12. 测试所有功能

---

## 验证方法

### 功能验证
- [ ] 所有CRUD操作正常
- [ ] Tab切换正常
- [ ] 筛选/排序正常
- [ ] 图表渲染正常
- [ ] 导入导出正常

### 架构验证
- [ ] 模块间通过EventBus通信
- [ ] 所有模块使用ES Modules（export/import）
- [ ] 单文件不超过300行
- [ ] localStorage读写有try-catch

### 性能验证
- [ ] 100条数据不卡顿
- [ ] 图表渲染流畅
- [ ] 筛选/排序响应及时

---

## 风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| ES Modules兼容性 | 旧浏览器不支持 | 目标Chrome 80+，已原生支持 |
| Chart.js CDN加载失败 | 图表无法显示 | 降级显示"图表加载失败"提示 |
| 模块拆分导致bug | 功能异常 | 逐模块拆分，每步测试 |
| 样式重构影响体验 | UI错乱 | 保持原有布局，只改细节 |
| 数据迁移丢失 | 用户数据丢失 | 迁移前自动备份 |
