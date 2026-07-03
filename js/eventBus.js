/**
 * EventBus - 事件总线
 * 职责：模块间通信
 */

class EventBusClass {
  constructor() {
    this.listeners = {};
  }

  /**
   * 监听事件
   * @param {string} event - 事件名
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消监听函数
   */
  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);

    // 返回取消函数
    return () => this.off(event, callback);
  }

  /**
   * 取消监听
   * @param {string} event - 事件名
   * @param {Function} callback - 回调函数
   */
  off(event, callback) {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
  }

  /**
   * 触发事件
   * @param {string} event - 事件名
   * @param {*} data - 事件数据
   */
  emit(event, data) {
    if (!this.listeners[event]) return;
    this.listeners[event].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`EventBus error in ${event}:`, error);
      }
    });
  }

  /**
   * 监听一次
   * @param {string} event - 事件名
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消监听函数
   */
  once(event, callback) {
    const unsubscribe = this.on(event, (data) => {
      unsubscribe();
      callback(data);
    });
    return unsubscribe;
  }

  /**
   * 清除所有监听
   * @param {string} [event] - 可选，指定事件名
   */
  clear(event) {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }
}

// 导出单例
export const EventBus = new EventBusClass();
