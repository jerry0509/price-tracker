# 调研报告

## 现有方案

| 方案 | 类型 | 优点 | 缺点 | 匹配度 |
|------|------|------|------|--------|
| [gider.im-pwa](https://github.com/needim/gider.im-pwa) ⭐211 | 开源PWA | 隐私优先、本地存储、PWA离线支持、UI简洁 | 功能较简单，无价格追踪 | 70% |
| [expenses](https://github.com/nominalista/expenses) ⭐405 | 开源Android | Material Design风格、分类清晰、动画流畅 | Kotlin原生，无法直接复用 | 60% |
| [Budget-Buddy-App](https://github.com/betomoedano/Budget-Buddy-App) ⭐102 | 开源React Native | 移动端体验好、SQLite存储、实时图表 | React Native技术栈不同 | 55% |
| [PricePulse](https://github.com/itsJaspreetKaur/PricePulse-Ecommerce-Price-Tracker) | 开源全栈 | 价格追踪功能完整、多平台比价、AI比价 | UI较基础，Python后端 | 75% |
| [supermarket-comparison](https://github.com/gikenn/supermarket-comparison-web-app) | 开源React | 价格对比逻辑好、购物篮优化、现代UI | React技术栈，功能偏超市比价 | 65% |

## 推荐方案

**自己做（基于现有代码重构）**

**理由**：
1. 现有项目功能完整，核心逻辑成熟（2500+行代码）
2. 主要需求是UI/UX升级和架构重构，而非新功能开发
3. 零依赖约束下，引入第三方库不现实
4. 已有明确的WORKFLOW.md规范指导重构

## 设计参考

### 风格一：Notion 风格（清爽极简）
- **特点**: 大量留白、无边框卡片、柔和阴影、Inter/Noto Sans SC 字体
- **配色**: 白色背景 + 灰色层级 + 少量品牌色点缀
- **适用场景**: 数据录入、列表展示、详情页

### 风格二：Linear 风格（深色主题）
- **特点**: 深色背景、高对比度文字、微妙的边框、精准的间距
- **配色**: `#1a1a2e` 背景 + `#e0e0e0` 文字 + `#6c63ff` 强调色
- **适用场景**: 数据仪表盘、图表页面、高级功能

### 风格三：Apple 风格（极简精致）
- **特点**: 圆角卡片、SF Pro 字体、毛玻璃效果、流畅过渡
- **配色**: 纯白/纯黑 + 系统蓝 `#007AFF` + 灰色层级
- **适用场景**: 移动端适配、设置页面、模态框

### 推荐混合方案
**Notion + Apple 混合风格**：
- 主界面：Notion 风格的清爽列表
- 图表页：深色背景 + 高对比度数据可视化
- 录入表单：Apple 风格的简洁表单
- 模态框：毛玻璃背景 + 圆角卡片

## 架构参考

### EventBus 实现模式

**推荐参考：[krasimir/EventBus](https://github.com/krasimir/EventBus) ⭐434**

```javascript
class EventBus {
  constructor() {
    this.listeners = {};
  }
  
  on(event, callback) {
    if (!this.listeners[event]) this.listeners[event] = [];
    this.listeners[event].push(callback);
    return () => this.off(event, callback);
  }
  
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }
  
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => callback(data));
  }
}
```

### 模块化方案

**推荐：ES Modules（无需构建工具）**

```html
<script type="importmap">
{
  "imports": {
    "./js/eventbus.js": "./js/eventbus.js",
    "./js/store.js": "./js/store.js"
  }
}
</script>
<script type="module" src="./js/app.js"></script>
```

### 大文件拆分策略

**当前问题**：`app.js` 1104行，超过WORKFLOW.md规定的300行限制

**推荐拆分方案**（7个文件，平铺结构）：
```
js/
  eventBus.js    # 基础设施：事件总线
  store.js       # 数据层：localStorage CRUD、聚合计算
  utils.js       # 工具函数：格式化、日期、防抖、escapeHtml
  overview.js    # 价格总览模块：商品列表、筛选、排序
  records.js     # 购买记录模块：记录列表、筛选、CRUD
  analysis.js    # 数据分析模块：统计卡片、图表
  app.js         # 入口+Tab路由：初始化、模块组装
```

## 如果自己做，参考哪些项目

| 项目 | 值得借鉴的点 |
|------|-------------|
| gider.im-pwa | 隐私优先理念、PWA离线支持、简洁录入界面 |
| krasimir/EventBus | EventBus实现模式、事件管理最佳实践 |
| expenses | Material Design分类视觉、图表展示方式 |
| PricePulse | 多平台价格对比逻辑、价格历史图表 |
| supermarket-comparison | 价格对比UI布局、购物篮优化思路 |

## 总结

### UI/UX 改进方向
1. 去除"AI味"：移除过度的渐变、光晕效果，改用克制的阴影和边框
2. 统一设计语言：选定 Notion + Apple 混合风格
3. 提升细节：统一圆角、间距、字体层级、颜色系统
4. 增强交互：添加过渡动画、加载状态、空状态设计

### 架构重构方向
1. 引入 EventBus 解耦模块间通信
2. 使用 ES Modules 替代全局变量
3. 将 app.js 拆分为独立的功能模块
4. 建立统一的状态管理机制

### 优先级建议
1. **P0**: 架构重构（先拆分 app.js，引入 EventBus）
2. **P1**: UI 框架搭建（建立 CSS 变量系统、组件样式）
3. **P2**: 逐模块 UI 优化
