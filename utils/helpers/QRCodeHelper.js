// utils/helpers/QRCodeHelper.js
// 统一的QR码处理辅助工具

const { APP_CONFIG } = require('../constants/AppConstants.js');
const ErrorHandler = require('./ErrorHandler.js');

class QRCodeHelper {
  /**
   * 为页面设置QR码显示
   * @param {Object} pageInstance - 页面实例
   * @param {string} fishId - 鱼ID
   * @param {string} qrcodeUrl - 已有的QR码URL（可选）
   */
  static setupQRCodeDisplay(pageInstance, fishId, qrcodeUrl = null) {
    if (qrcodeUrl) {
      // 使用已有的QR码URL
      pageInstance.setData({ 
        qrcodeImageUrl: qrcodeUrl,
        qrcodeError: false 
      });
    } else {
      // 生成新的QR码URL
      const generatedUrl = this.generateOnlineQRCodeUrl(fishId);
      pageInstance.setData({ 
        qrcodeImageUrl: generatedUrl,
        qrcodeError: false 
      });
    }
  }

  /**
   * 生成在线QR码URL
   * @param {string} data - QR码数据
   * @param {number} size - QR码尺寸
   * @returns {string} QR码URL
   */
  static generateOnlineQRCodeUrl(data, size = APP_CONFIG.QRCODE_SERVICE.DEFAULT_SIZE) {
    // 确保尺寸在合理范围内
    const validSize = Math.max(
      APP_CONFIG.QRCODE_SERVICE.MIN_SIZE,
      Math.min(size, APP_CONFIG.QRCODE_SERVICE.MAX_SIZE)
    );

    const encodedData = encodeURIComponent(data);
    return `${APP_CONFIG.QRCODE_SERVICE.PRIMARY_URL}?size=${validSize}x${validSize}&data=${encodedData}`;
  }

  /**
   * 获取备用QR码URL
   * @param {string} data - QR码数据
   * @param {number} size - QR码尺寸
   * @returns {string} 备用QR码URL
   */
  static getBackupQRCodeUrl(data, size = APP_CONFIG.QRCODE_SERVICE.DEFAULT_SIZE) {
    const encodedData = encodeURIComponent(data);
    return APP_CONFIG.QRCODE_SERVICE.BACKUP_URL.replace('{size}', size) + encodedData;
  }

  /**
   * 处理QR码加载成功
   * @param {Object} pageInstance - 页面实例
   * @param {Object} event - 事件对象
   */
  static handleQRCodeLoadSuccess(pageInstance, event) {
    console.log('QR码图片加载成功:', event);
    pageInstance.setData({ qrcodeError: false });
  }

  /**
   * 处理QR码加载失败
   * @param {Object} pageInstance - 页面实例
   * @param {Object} event - 事件对象
   * @param {string} fishId - 鱼ID（用于生成备用URL）
   */
  static handleQRCodeLoadError(pageInstance, event, fishId) {
    console.error('QR码图片加载失败:', event);
    
    // 尝试使用备用URL
    const backupUrl = this.getBackupQRCodeUrl(fishId);
    pageInstance.setData({ 
      qrcodeImageUrl: backupUrl,
      qrcodeError: false 
    });

    // 如果备用URL也失败，则显示错误状态
    setTimeout(() => {
      // 检查备用URL是否加载成功，如果还是失败则显示错误
      pageInstance.setData({ qrcodeError: true });
      ErrorHandler.showError(APP_CONFIG.ERROR_MESSAGES.QRCODE_LOAD_FAILED);
    }, 3000);
  }

  /**
   * 生成QR码数据字符串
   * @param {string} fishId - 鱼ID
   * @returns {string} QR码数据
   */
  static generateQRCodeData(fishId) {
    return `FISH_${fishId}_${Date.now()}`;
  }

  /**
   * 解析QR码数据
   * @param {string} qrcodeData - QR码数据
   * @returns {Object} 解析结果
   */
  static parseQRCodeData(qrcodeData) {
    try {
      if (qrcodeData.startsWith('FISH_')) {
        const parts = qrcodeData.split('_');
        if (parts.length >= 2) {
          return {
            success: true,
            fishId: parts[1],
            timestamp: parts[2] || null
          };
        }
      }
      
      // 兼容旧格式，直接作为fishId处理
      return {
        success: true,
        fishId: qrcodeData,
        timestamp: null
      };
    } catch (error) {
      return {
        success: false,
        error: '无效的QR码格式'
      };
    }
  }
}

module.exports = QRCodeHelper;