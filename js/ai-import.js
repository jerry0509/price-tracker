/**
 * AiImport - AI智能导入模块
 * 职责：模板生成、数据导入、格式验证
 */

import { EventBus } from './eventBus.js';
import { Store } from './store.js';
import { escapeHtml, generateId, formatDate, roundPrice } from './utils.js';

/**
 * 初始化模块
 */
export function init() {
  // 绑定事件
  bindEvents();
}

/**
 * 绑定事件
 */
function bindEvents() {
  // AI导入相关按钮事件会在 HTML 中通过 onclick 绑定
  // 这里可以添加其他需要的事件监听
}

/**
 * 获取AI提示词模板
 * @returns {string} 提示词模板
 */
export function getAITemplate() {
  const categories = Store.getCategories();
  const channels = Store.getChannels();

  return `你是一个购物小票识别助手。请根据我提供的小票信息，提取出购买记录并转换为 JSON 格式。

要求：
1. 每条记录包含以下字段：
   - itemName: 物品通用名称（简短，2-4个字，如"洗发水""抽纸""牛奶""酱油"，不要包含品牌、规格、口味等修饰词）
   - brand: 品牌（单独提取，如"海飞丝""维达""蒙牛""李锦记"）
   - category: 分类（从以下选项中选择：${categories.join('、')}）
   - price: 单价（数字，单位元）
   - quantity: 数量（整数）
   - channel: 购买渠道（从以下选项中选择：${channels.join('、')}）
   - date: 购买日期（格式 YYYY-MM-DD，如果小票没有日期则用今天）
   - notes: 备注（可选，放口味、规格描述、促销说明等，如"去屑型750ml""红富士""东北大米5kg"）
   - specQty: 规格数量（可选，如120抽、250ml、30枚等中的数字部分）
   - specUnit: 规格单位（可选，如抽、ml、枚、g、kg、片、包、卷）
   - isPromo: 是否促销（可选，true/false）
   - promoType: 促销方式（可选，如买一送一、限时特价、满减等）
   - actualPaid: 实付金额（可选，促销时实际支付的金额）

2. 输出格式为 JSON 数组，例如：
[
  {
    "itemName": "抽纸",
    "brand": "维达",
    "category": "日用个护",
    "price": 29.9,
    "quantity": 10,
    "channel": "京东",
    "date": "2026-06-30",
    "notes": "超韧，618囤货",
    "specQty": 120,
    "specUnit": "抽",
    "isPromo": true,
    "promoType": "满减",
    "actualPaid": 269.1
  }
]

3. ⚠️ 名称拆分规则（重要）：
   - "海飞丝去屑洗发水750ml" → itemName: "洗发水", brand: "海飞丝", notes: "去屑型", specQty: 750, specUnit: "ml"
   - "维达超韧抽纸120抽" → itemName: "抽纸", brand: "维达", notes: "超韧", specQty: 120, specUnit: "抽"
   - "蒙牛纯牛奶1000ml" → itemName: "牛奶", brand: "蒙牛", notes: "纯牛奶", specQty: 1000, specUnit: "ml"
   - "金龙鱼东北大米5kg" → itemName: "大米", brand: "金龙鱼", notes: "东北大米", specQty: 5, specUnit: "kg"
   - "乐事原味薯片75g" → itemName: "薯片", brand: "乐事", notes: "原味", specQty: 75, specUnit: "g"
   - "农夫山泉矿泉水550ml×24" → itemName: "矿泉水", brand: "农夫山泉", specQty: 550, specUnit: "ml"

4. 注意事项：
   - 如果小票显示的是总价而非单价，请用总价除以数量得到单价
   - 如果无法确定品牌，brand字段可以留空或省略
   - 如果无法确定分类，默认填"其他"
   - 如果无法确定渠道，默认填"其他"
   - 日期格式必须是 YYYY-MM-DD
   - 只输出 JSON 数组，不要有其他文字

现在请识别以下小票信息：`;
}

/**
 * 复制AI提示词到剪贴板
 */
export async function copyAITemplate() {
  const template = getAITemplate();

  try {
    await navigator.clipboard.writeText(template);
    EventBus.emit('toast:show', { message: '✅ AI 提示词模板已复制到剪贴板', type: 'success' });
  } catch (err) {
    // 降级方案
    const textarea = document.createElement('textarea');
    textarea.value = template;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    EventBus.emit('toast:show', { message: '✅ AI 提示词模板已复制到剪贴板', type: 'success' });
  }
}

/**
 * 显示模板预览
 */
export function showTemplatePreview() {
  const preview = document.getElementById('template-preview');
  if (!preview) return;

  const template = getAITemplate();

  if (preview.style.display === 'none') {
    preview.textContent = template;
    preview.style.display = 'block';
  } else {
    preview.style.display = 'none';
  }
}

/**
 * 从剪贴板粘贴
 */
export async function pasteFromClipboard() {
  try {
    const text = await navigator.clipboard.readText();
    const input = document.getElementById('ai-import-input');
    if (input) {
      input.value = text;
      EventBus.emit('toast:show', { message: '📋 已从剪贴板粘贴', type: 'success' });
    }
  } catch (err) {
    EventBus.emit('toast:show', { message: '❌ 无法读取剪贴板，请手动粘贴', type: 'error' });
  }
}

/**
 * 清空导入区域
 */
export function clearImportArea() {
  const input = document.getElementById('ai-import-input');
  if (input) {
    input.value = '';
  }
}

/**
 * 格式化导入的JSON
 */
export function formatImportJSON() {
  const input = document.getElementById('ai-import-input');
  if (!input) return;

  try {
    const data = JSON.parse(input.value);
    input.value = JSON.stringify(data, null, 2);
    EventBus.emit('toast:show', { message: '✅ JSON 已格式化', type: 'success' });
  } catch (err) {
    EventBus.emit('toast:show', { message: '❌ JSON 格式错误', type: 'error' });
  }
}

/**
 * 验证导入的JSON
 * @returns {boolean} 是否验证通过
 */
export function validateImportJSON() {
  const input = document.getElementById('ai-import-input');
  if (!input) return false;

  try {
    const data = JSON.parse(input.value);

    if (!Array.isArray(data)) {
      EventBus.emit('toast:show', { message: '❌ 数据必须是数组格式', type: 'error' });
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
      EventBus.emit('toast:show', { message: `❌ ${missingFields[0]}`, type: 'error' });
      return false;
    }

    EventBus.emit('toast:show', { message: `✅ 验证通过，共 ${data.length} 条记录`, type: 'success' });
    return true;
  } catch (err) {
    EventBus.emit('toast:show', { message: '❌ JSON 解析失败，请检查格式', type: 'error' });
    return false;
  }
}

/**
 * 导入AI数据
 */
export function importAIData() {
  const input = document.getElementById('ai-import-input');
  if (!input) return;

  let data;

  try {
    data = JSON.parse(input.value);
  } catch (err) {
    EventBus.emit('toast:show', { message: '❌ JSON 解析失败，请检查格式', type: 'error' });
    return;
  }

  if (!Array.isArray(data)) {
    EventBus.emit('toast:show', { message: '❌ 数据必须是数组格式', type: 'error' });
    return;
  }

  const today = formatDate(new Date());
  const categories = Store.getCategories();
  const channels = Store.getChannels();
  let importedCount = 0;

  data.forEach(item => {
    if (!item.itemName || !item.price) return;

    const existingItem = Store.getItemByName(item.itemName);

    const purchase = {
      id: generateId(),
      itemId: existingItem ? existingItem.id : generateId(),
      itemName: item.itemName,
      brand: item.brand || '',
      category: categories.includes(item.category) ? item.category : '其他',
      price: parseFloat(item.price),
      quantity: parseInt(item.quantity) || 1,
      totalPrice: roundPrice(parseFloat(item.price) * (parseInt(item.quantity) || 1)),
      channel: channels.includes(item.channel) ? item.channel : '其他',
      date: item.date || today,
      notes: item.notes || '',
      specQty: parseInt(item.specQty) || null,
      specUnit: item.specUnit || null,
      isPromo: !!item.isPromo,
      promoType: item.promoType || null,
      actualPaid: parseFloat(item.actualPaid) || null
    };

    Store.addPurchase(purchase);
    importedCount++;
  });

  if (importedCount > 0) {
    EventBus.emit('toast:show', { message: `✅ 成功导入 ${importedCount} 条记录`, type: 'success' });
    input.value = '';
    EventBus.emit('data:imported', { count: importedCount, mode: 'ai' });
  } else {
    EventBus.emit('toast:show', { message: '❌ 没有有效数据可导入', type: 'error' });
  }
}

/**
 * 渲染AI导入页面（如果需要动态内容）
 */
export function render() {
  // AI导入页面主要是静态内容，不需要特殊渲染
  // 如果需要动态更新，可以在这里添加
}
