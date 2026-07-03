# 设计规范

## 气质定位（已确认）

- **参考对象**：Notion 数据库视图 + Apple 设置页面
- **整体感受**：冷静 · 专业 · 克制
- **视觉记忆点**：深色背景上的清晰数据卡片

---

## 配色方案

### 暗色主题（默认）

| 用途 | 色值 | 说明 |
|------|------|------|
| 背景-主 | `#0d1117` | 页面主背景 |
| 背景-次 | `#161b22` | 卡片、输入框背景 |
| 背景-三 | `#1c2128` | hover状态、下拉菜单 |
| 边框 | `rgba(240, 246, 252, 0.1)` | 卡片、分割线 |
| 边框-hover | `rgba(240, 246, 252, 0.2)` | hover状态边框 |
| 文字-主 | `#e6edf3` | 标题、重要数据 |
| 文字-次 | `#8b949e` | 正文、说明文字 |
| 文字-辅 | `#484f58` | 辅助信息、placeholder |
| 主色 | `#238636` | 主按钮、成功状态 |
| 主色-hover | `#2ea043` | 主按钮hover |
| 危险色 | `#da3633` | 删除、错误状态 |
| 警告色 | `#d29922` | 警告、促销标记 |
| 价格降 | `#3fb950` | 价格下降、正向变化 |
| 价格涨 | `#f85149` | 价格上升、负向变化 |

### 亮色主题

| 用途 | 色值 | 说明 |
|------|------|------|
| 背景-主 | `#ffffff` | 页面主背景 |
| 背景-次 | `#f6f8fa` | 卡片、输入框背景 |
| 背景-三 | `#eaeef2` | hover状态、下拉菜单 |
| 边框 | `rgba(31, 35, 40, 0.15)` | 卡片、分割线 |
| 边框-hover | `rgba(31, 35, 40, 0.3)` | hover状态边框 |
| 文字-主 | `#1f2328` | 标题、重要数据 |
| 文字-次 | `#656d76` | 正文、说明文字 |
| 文字-辅 | `#8c959f` | 辅助信息、placeholder |
| 主色 | `#1a7f37` | 主按钮、成功状态 |
| 主色-hover | `#1f883d` | 主按钮hover |
| 危险色 | `#cf222e` | 删除、错误状态 |
| 警告色 | `#9a6700` | 警告、促销标记 |
| 价格降 | `#1a7f37` | 价格下降、正向变化 |
| 价格涨 | `#cf222e` | 价格上升、负向变化 |

---

## 字体规范

### 字体栈

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
--font-mono: "SF Mono", "Cascadia Code", "Fira Code", "JetBrains Mono", monospace;
```

### 字号层级

| 层级 | 字号 | 字重 | 行高 | 用途 |
|------|------|------|------|------|
| h1 | 24px | 600 | 1.3 | 页面标题 |
| h2 | 18px | 600 | 1.4 | 卡片标题 |
| h3 | 16px | 600 | 1.4 | 小节标题 |
| 正文 | 14px | 400 | 1.5 | 主要内容 |
| 辅助 | 12px | 400 | 1.5 | 说明文字、标签 |
| 价格 | 14px | 500 | 1.4 | 价格数字（等宽） |
| 价格-大 | 24px | 600 | 1.3 | 统计卡片价格（等宽） |

### 字体使用规则

- 所有数字使用等宽字体（`--font-mono`）
- 价格数字使用 `font-variant-numeric: tabular-nums` 保证对齐
- 中文使用系统默认字体，不额外指定

---

## 间距系统

### 基准单位
`8px`

### 常用间距

| 名称 | 值 | 用途 |
|------|-----|------|
| xs | 4px | 图标与文字间距、标签内边距 |
| sm | 8px | 紧凑元素间距、表单项间距 |
| md | 16px | 卡片内边距、常规间距 |
| lg | 24px | 区块间距、卡片间距 |
| xl | 32px | 大区块分隔 |
| xxl | 48px | 页面区域间距 |

### 使用规则

- 所有间距必须是 `4px` 的倍数
- 卡片内边距：`16px` 或 `24px`
- 表格单元格内边距：`12px 16px`
- 按钮内边距：`8px 16px`
- 输入框内边距：`8px 12px`

---

## 圆角规范

| 名称 | 值 | 用途 |
|------|-----|------|
| sm | 6px | 小按钮、标签、输入框 |
| md | 8px | 卡片、下拉菜单 |
| lg | 12px | 模态框、大卡片 |

### 使用规则

- 不使用超过 `12px` 的圆角
- 圆角必须是 `2px` 的倍数
- 内部元素圆角应小于或等于外部容器

---

## 阴影规范

| 名称 | 值 | 用途 |
|------|-----|------|
| sm | `0 1px 2px rgba(0,0,0,0.3)` | 按钮、输入框 |
| md | `0 4px 12px rgba(0,0,0,0.4)` | 卡片、下拉菜单 |
| lg | `0 8px 24px rgba(0,0,0,0.5)` | 模态框 |

### 使用规则

- 暗色主题下阴影需要更强的透明度
- 不使用发光阴影（glow effect）
- hover状态可轻微增强阴影

---

## 组件规范

### 按钮

#### 主按钮（Primary）
```css
.btn-primary {
  background: var(--primary);
  color: #ffffff;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.15s ease;
}
.btn-primary:hover {
  background: var(--primary-hover);
}
```

#### 次按钮（Secondary / Ghost）
```css
.btn {
  background: transparent;
  color: var(--text-secondary);
  border: 1px solid var(--border);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}
.btn:hover {
  background: var(--bg-tertiary);
  color: var(--text-primary);
  border-color: var(--border-hover);
}
```

#### 危险按钮（Danger）
```css
.btn-danger {
  background: transparent;
  color: var(--danger);
  border: 1px solid var(--danger);
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
.btn-danger:hover {
  background: var(--danger);
  color: #ffffff;
}
```

#### 小按钮（Small）
```css
.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}
```

### 输入框

```css
.input {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border);
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.15s ease;
}
.input:focus {
  outline: none;
  border-color: var(--primary);
}
.input::placeholder {
  color: var(--text-muted);
}
```

### 卡片

```css
.card {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 24px;
}
```

### 表格

```css
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
}
td {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border);
}
tr:hover td {
  background: var(--bg-tertiary);
}
```

### 标签（Tag）

```css
.tag {
  display: inline-block;
  padding: 2px 8px;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-size: 12px;
  border-radius: 4px;
}
```

### 模态框

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.modal {
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  width: 480px;
  max-width: 90vw;
  max-height: 85vh;
  overflow-y: auto;
}
```

### Toast 提示

```css
.toast {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  color: var(--text-primary);
  box-shadow: var(--shadow-lg);
  animation: slideIn 0.3s ease;
}
.toast-success { border-left: 3px solid var(--primary); }
.toast-error { border-left: 3px solid var(--danger); }
.toast-warning { border-left: 3px solid var(--warning); }
```

---

## 页面布局

### 整体结构

```
┌─────────────────────────────────────────────────────────┐
│  Header: Logo + 标题 + 操作按钮                         │
├─────────────────────────────────────────────────────────┤
│  Tabs: 价格总览 | 购买记录 | 数据分析 | AI导入          │
├─────────────────────────────────────────────────────────┤
│  Content:                                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Card: 筛选栏 + 表格/图表                        │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### 价格总览页

```
┌─────────────────────────────────────────────────────────┐
│  [添加记录]  搜索框  分类筛选  渠道筛选                 │
├─────────────────────────────────────────────────────────┤
│  商品名 | 分类 | 最高价 | 最低价 | 均价 | 渠道 | 次数 │
│  ─────────────────────────────────────────────────────  │
│  抽纸   | 日用 | ¥29.9 | ¥19.9 | ¥24.9| 京东 | 5次   │
│  ...                                                    │
├─────────────────────────────────────────────────────────┤
│  合计: XX个商品  共XX条记录                              │
│  [1] [2] [3] ...                                        │
└─────────────────────────────────────────────────────────┘
```

### 购买记录页

```
┌─────────────────────────────────────────────────────────┐
│  搜索框  分类筛选  渠道筛选  日期范围                   │
├─────────────────────────────────────────────────────────┤
│  日期 | 商品 | 分类 | 单价 | 数量 | 总价 | 渠道 | 备注 │
│  ─────────────────────────────────────────────────────  │
│  07-01| 抽纸 | 日用 | ¥25  | 2   | ¥50  | 京东 | ...  │
│  ...                                                    │
├─────────────────────────────────────────────────────────┤
│  共XX条记录                                              │
│  [1] [2] [3] ...                                        │
└─────────────────────────────────────────────────────────┘
```

### 数据分析页

```
┌─────────────────────────────────────────────────────────┐
│  年份选择  月份选择                                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ 总消费   │ │ 本月消费 │ │ 购买次数 │ │ 日均消费 │  │
│  │ ¥1,234  │ │ ¥456    │ │ 89次    │ │ ¥12.5   │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌──────────────────┐             │
│  │ 分类消费饼图     │ │ 渠道消费饼图     │             │
│  └──────────────────┘ └──────────────────┘             │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────────┐ ┌──────────────────┐             │
│  │ 月度趋势柱状图   │ │ 日均成本排名     │             │
│  └──────────────────┘ └──────────────────┘             │
└─────────────────────────────────────────────────────────┘
```

---

## 关键交互

### 点击商品名称 → 打开购买历史模态框
- 显示商品摘要（分类、总购买、价格区间、均价）
- 表格显示所有购买记录（日期、单价、数量、总价、渠道、规格、促销、备注）
- 价格趋势箭头（↓降 / ↑涨 / →平）

### 空状态 → 显示引导
```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│                    📦                                   │
│              暂无购买记录                                │
│                                                         │
│            [添加第一条记录]                              │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 错误状态 → 显示提示
- localStorage 满：提示导出数据清理
- 数据格式错误：提示重新导入
- 网络错误：显示重试按钮

### 删除操作 → 确认弹窗
```
确定要删除「抽纸」吗？
将同时删除该物品的 5 条购买记录。

[取消]  [删除]
```

### 加载状态 → 骨架屏
- 表格加载时显示3-5行骨架屏
- 图表加载时显示占位块

---

## 响应式策略

### 断点

| 名称 | 宽度 | 设备 |
|------|------|------|
| mobile | < 768px | 手机 |
| tablet | 768px - 1024px | 平板 |
| desktop | > 1024px | 桌面 |

### 布局变化

#### 桌面（> 1024px）
- 表格显示所有列
- 图表并排显示（2列）
- 统计卡片4列显示
- 侧边栏展开（如有）

#### 平板（768px - 1024px）
- 表格隐藏次要列（规格、促销）
- 图表并排显示（2列）
- 统计卡片2列显示
- 筛选栏换行

#### 手机（< 768px）
- 表格只显示核心列（商品、价格、日期）
- 图表单列显示
- 统计卡片单列显示
- 筛选栏折叠为下拉
- 操作按钮改为全宽
- Tab栏固定底部

### 移动端特殊处理

- 模态框全屏显示
- 表格改为卡片列表
- 筛选栏改为抽屉式
- 添加记录按钮固定右下角（FAB风格）

---

## 图标规范

### 图标库
使用 SVG 图标，不使用 emoji

### 图标尺寸

| 名称 | 尺寸 | 用途 |
|------|------|------|
| sm | 16px | 按钮内图标、表格内图标 |
| md | 20px | Tab图标、标题前图标 |
| lg | 24px | 空状态图标、统计卡片图标 |

### 图标颜色

- 默认：`currentColor`（继承文字颜色）
- 强调：使用主色或语义色

### 常用图标列表

| 功能 | 图标名 | 说明 |
|------|--------|------|
| 添加 | plus | +号 |
| 编辑 | edit | 铅笔 |
| 删除 | trash | 垃圾桶 |
| 搜索 | search | 放大镜 |
| 筛选 | filter | 漏斗 |
| 导出 | download | 向下箭头 |
| 导入 | upload | 向上箭头 |
| 关闭 | x | 叉号 |
| 返回 | arrow-left | 左箭头 |
| 价格降 | trending-down | 向下趋势 |
| 价格涨 | trending-up | 向上趋势 |
| 价格平 | minus | 横线 |

---

## 动画规范

### 时长

| 名称 | 时长 | 用途 |
|------|------|------|
| fast | 0.15s | hover效果、颜色变化 |
| normal | 0.3s | 模态框、页面切换 |
| slow | 0.5s | 复杂动画（慎用） |

### 缓动函数

```css
--ease-default: cubic-bezier(0.4, 0, 0.2, 1);
--ease-in: cubic-bezier(0.4, 0, 1, 1);
--ease-out: cubic-bezier(0, 0, 0.2, 1);
```

### 动画类型

- **淡入淡出**：模态框、Toast
- **滑入**：下拉菜单、侧边栏
- **缩放**：按钮点击（0.98）

### 禁止使用的动画

- ❌ 弹跳（bounce）
- ❌ 旋转（rotate）
- ❌ 闪烁（blink）
- ❌ 渐变背景动画

---

## CSS 变量清单

```css
:root {
  /* 背景 */
  --bg-primary: #0d1117;
  --bg-secondary: #161b22;
  --bg-tertiary: #1c2128;
  
  /* 边框 */
  --border: rgba(240, 246, 252, 0.1);
  --border-hover: rgba(240, 246, 252, 0.2);
  
  /* 文字 */
  --text-primary: #e6edf3;
  --text-secondary: #8b949e;
  --text-muted: #484f58;
  
  /* 主色 */
  --primary: #238636;
  --primary-hover: #2ea043;
  
  /* 语义色 */
  --danger: #da3633;
  --warning: #d29922;
  --price-down: #3fb950;
  --price-up: #f85149;
  
  /* 阴影 */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
  
  /* 圆角 */
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* 字体 */
  --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
  --font-mono: "SF Mono", "Cascadia Code", "Fira Code", "JetBrains Mono", monospace;
  
  /* 间距 */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  
  /* 动画 */
  --ease: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-fast: 0.15s;
  --duration-normal: 0.3s;
}
```
