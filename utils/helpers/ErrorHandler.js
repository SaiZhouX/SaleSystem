// utils/helpers/ErrorHandler.js
// 统一的错误处理工具类

class ErrorHandler {
  /**
   * 显示错误提示
   */
  static showError(message, duration = 2000) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: duration
    });
  }

  /**
   * 显示成功提示
   */
  static showSuccess(message, duration = 1500) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: duration
    });
  }

  /**
   * 显示加载中
   */
  static showLoading(title = '加载中...') {
    wx.showLoading({
      title: title,
      mask: true
    });
  }

  /**
   * 隐藏加载
   */
  static hideLoading() {
    wx.hideLoading();
  }

  /**
   * 显示确认对话框
   */
  static showConfirm(options) {
    const defaultOptions = {
      title: '提示',
      content: '确定要执行此操作吗？',
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消'
    };

    return new Promise((resolve) => {
      wx.showModal({
        ...defaultOptions,
        ...options,
        success: (res) => {
          resolve({
            confirmed: res.confirm,
            cancelled: res.cancel,
            content: res.content || ''
          });
        },
        fail: () => {
          resolve({
            confirmed: false,
            cancelled: true,
            content: ''
          });
        }
      });
    });
  }

  /**
   * 处理异步操作的通用错误
   */
  static async handleAsyncOperation(operation, loadingText = '处理中...', successText = '操作成功') {
    this.showLoading(loadingText);
    
    try {
      const result = await operation();
      this.hideLoading();
      
      if (result && result.success !== false) {
        this.showSuccess(successText);
        return { success: true, data: result };
      } else {
        this.showError(result?.error || '操作失败');
        return { success: false, error: result?.error || '操作失败' };
      }
    } catch (error) {
      this.hideLoading();
      console.error('异步操作失败:', error);
      this.showError(error.message || '操作失败');
      return { success: false, error: error.message || '操作失败' };
    }
  }

  /**
   * 网络错误处理
   */
  static handleNetworkError(error) {
    let message = '网络错误';
    
    if (error.errMsg) {
      if (error.errMsg.includes('timeout')) {
        message = '网络超时，请检查网络连接';
      } else if (error.errMsg.includes('fail')) {
        message = '网络连接失败';
      }
    }
    
    this.showError(message);
    return message;
  }
}

module.exports = ErrorHandler;