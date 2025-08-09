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
    try {
      if (qrcodeUrl) {
        // 使用已有的QR码URL
        pageInstance.setData({ 
          qrcodeImageUrl: qrcodeUrl,
          qrcodeError: false 
        });
      } else {
        // 生成新的QR码URL
        const generatedUrl = this.generateOnlineQRCodeUrl(fishId);
        console.log('生成的QR码URL:', generatedUrl);
        pageInstance.setData({ 
          qrcodeImageUrl: generatedUrl,
          qrcodeError: false 
        });
      }
    } catch (error) {
      console.error('QR码显示设置失败:', error);
      pageInstance.setData({ 
        qrcodeError: true,
        qrcodeImageUrl: ''
      });
      
      // 尝试使用canvas备用方案
      this.fallbackToCanvas(pageInstance, fishId);
    }
  }

  /**
   * 备用方案：使用canvas生成QR码
   * @param {Object} pageInstance - 页面实例
   * @param {string} fishId - 鱼ID
   */
  static fallbackToCanvas(pageInstance, fishId) {
    try {
      const QRCodeManager = require('../managers/QRCodeManager.js');
      QRCodeManager.initQRCodeDisplay('qrcode', fishId, (result) => {
        if (!result.success) {
          pageInstance.setData({ qrcodeError: true });
        }
      });
    } catch (error) {
      console.error('Canvas备用方案也失败:', error);
      pageInstance.setData({ qrcodeError: true });
    }
  }

  /**
   * 生成在线QR码URL
   * @param {string} data - QR码数据
   * @param {number} size - QR码尺寸
   * @returns {string} QR码URL
   */
  static generateOnlineQRCodeUrl(data, size = 300) {
    try {
      // 确保尺寸在合理范围内
      const validSize = Math.max(100, Math.min(size, 1000));
      const encodedData = encodeURIComponent(data);
      
      // 使用QRCode Monkey API（与原始QRCodeManager保持一致）
      const url = `https://api.qrcode-monkey.com/qr/custom?data=${encodedData}&size=${validSize}&download=false`;
      console.log('生成QR码URL:', url);
      return url;
    } catch (error) {
      console.error('生成QR码URL失败:', error);
      // 返回备用URL
      return this.getBackupQRCodeUrl(data, size);
    }
  }

  /**
   * 获取备用QR码URL
   * @param {string} data - QR码数据
   * @param {number} size - QR码尺寸
   * @returns {string} 备用QR码URL
   */
  static getBackupQRCodeUrl(data, size = 300) {
    try {
      const encodedData = encodeURIComponent(data);
      // 使用QR Server API作为备用
      return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
    } catch (error) {
      console.error('生成备用QR码URL失败:', error);
      // 最后的备用方案：使用Google Charts API
      const encodedData = encodeURIComponent(data);
      return `https://chart.googleapis.com/chart?chs=${size}x${size}&cht=qr&chl=${encodedData}`;
    }
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
    // 直接使用鱼的完整唯一ID作为QR码内容，保持与原QRCodeManager一致
    return fishId;
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