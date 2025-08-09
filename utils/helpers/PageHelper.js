// utils/helpers/PageHelper.js
// 统一的页面操作辅助工具

const { APP_CONFIG } = require('../constants/AppConstants.js');
const ErrorHandler = require('./ErrorHandler.js');

class PageHelper {
  /**
   * 安全的页面导航
   * @param {string} url - 目标页面URL
   * @param {number} delay - 延迟时间（毫秒）
   * @param {string} method - 导航方法：navigateTo, redirectTo, navigateBack, switchTab
   */
  static safeNavigate(url, delay = APP_CONFIG.UI_CONFIG.NAVIGATION_DELAY, method = 'navigateTo') {
    setTimeout(() => {
      try {
        switch (method) {
          case 'navigateBack':
            wx.navigateBack();
            break;
          case 'redirectTo':
            wx.redirectTo({ url });
            break;
          case 'switchTab':
            wx.switchTab({ url });
            break;
          default:
            wx.navigateTo({ url });
        }
      } catch (error) {
        console.error('页面导航失败:', error);
        ErrorHandler.showError('页面跳转失败');
      }
    }, delay);
  }

  /**
   * 带成功提示的页面返回
   * @param {string} message - 成功消息
   * @param {number} delay - 延迟时间
   */
  static successAndBack(message, delay = APP_CONFIG.UI_CONFIG.NAVIGATION_DELAY) {
    ErrorHandler.showSuccess(message);
    this.safeNavigate('', delay, 'navigateBack');
  }

  /**
   * 设置页面标题
   * @param {string} title - 页面标题
   */
  static setPageTitle(title) {
    wx.setNavigationBarTitle({
      title: title
    });
  }

  /**
   * 防抖处理函数
   * @param {Function} func - 要防抖的函数
   * @param {number} delay - 防抖延迟时间
   * @returns {Function} 防抖后的函数
   */
  static debounce(func, delay = 300) {
    let timeoutId;
    return function (...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * 节流处理函数
   * @param {Function} func - 要节流的函数
   * @param {number} delay - 节流延迟时间
   * @returns {Function} 节流后的函数
   */
  static throttle(func, delay = 300) {
    let lastTime = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastTime >= delay) {
        lastTime = now;
        return func.apply(this, args);
      }
    };
  }

  /**
   * 处理表单提交状态
   * @param {Object} pageInstance - 页面实例
   * @param {boolean} submitting - 是否正在提交
   */
  static setSubmittingState(pageInstance, submitting) {
    pageInstance.setData({ submitting });
  }

  /**
   * 通用的异步表单提交处理
   * @param {Object} pageInstance - 页面实例
   * @param {Function} submitFunction - 提交函数
   * @param {string} successMessage - 成功消息
   * @param {boolean} navigateBack - 是否在成功后返回
   */
  static async handleFormSubmit(pageInstance, submitFunction, successMessage, navigateBack = true) {
    if (pageInstance.data.submitting) return;
    
    this.setSubmittingState(pageInstance, true);
    
    try {
      const result = await submitFunction();
      
      if (result && result.success !== false) {
        if (navigateBack) {
          this.successAndBack(successMessage);
        } else {
          ErrorHandler.showSuccess(successMessage);
        }
        return { success: true, data: result };
      } else {
        ErrorHandler.showError(result?.error || APP_CONFIG.ERROR_MESSAGES.OPERATION_FAILED);
        return { success: false, error: result?.error };
      }
    } catch (error) {
      console.error('表单提交失败:', error);
      ErrorHandler.showError(error.message || APP_CONFIG.ERROR_MESSAGES.OPERATION_FAILED);
      return { success: false, error: error.message };
    } finally {
      this.setSubmittingState(pageInstance, false);
    }
  }

  /**
   * 通用的数据加载处理
   * @param {Object} pageInstance - 页面实例
   * @param {Function} loadFunction - 加载函数
   * @param {string} loadingText - 加载提示文本
   * @param {string} errorMessage - 错误消息
   */
  static async handleDataLoad(pageInstance, loadFunction, loadingText = '加载中...', errorMessage = '加载失败') {
    ErrorHandler.showLoading(loadingText);
    
    try {
      const result = await loadFunction();
      ErrorHandler.hideLoading();
      
      if (result && result.success !== false) {
        return { success: true, data: result };
      } else {
        ErrorHandler.showError(errorMessage);
        return { success: false, error: errorMessage };
      }
    } catch (error) {
      ErrorHandler.hideLoading();
      console.error('数据加载失败:', error);
      ErrorHandler.showError(errorMessage);
      return { success: false, error: error.message };
    }
  }

  /**
   * 通用的确认操作处理
   * @param {string} title - 确认标题
   * @param {string} content - 确认内容
   * @param {Function} confirmCallback - 确认回调
   * @param {Object} options - 其他选项
   */
  static async handleConfirmAction(title, content, confirmCallback, options = {}) {
    const result = await ErrorHandler.showConfirm({
      title,
      content,
      ...options
    });

    if (result.confirmed) {
      try {
        await confirmCallback(result);
      } catch (error) {
        console.error('确认操作失败:', error);
        ErrorHandler.showError(error.message || APP_CONFIG.ERROR_MESSAGES.OPERATION_FAILED);
      }
    }
  }

  /**
   * 格式化显示金额
   * @param {number} amount - 金额
   * @param {boolean} showSymbol - 是否显示货币符号
   * @returns {string} 格式化后的金额
   */
  static formatAmount(amount, showSymbol = true) {
    const formattedAmount = parseFloat(amount || 0).toFixed(2);
    return showSymbol ? `¥${formattedAmount}` : formattedAmount;
  }

  /**
   * 格式化显示日期
   * @param {string|Date} date - 日期
   * @param {string} format - 格式类型：'date', 'datetime', 'time'
   * @returns {string} 格式化后的日期
   */
  static formatDate(date, format = 'date') {
    if (!date) return '未知日期';
    
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    switch (format) {
      case 'datetime':
        return dateObj.toLocaleString('zh-CN');
      case 'time':
        return dateObj.toLocaleTimeString('zh-CN');
      default:
        return dateObj.toLocaleDateString('zh-CN');
    }
  }
}

module.exports = PageHelper;