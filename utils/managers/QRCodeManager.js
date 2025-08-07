// utils/managers/QRCodeManager.js
// 统一的QR码管理工具类

const { APP_CONFIG } = require('../constants/AppConstants.js');
const { drawQRCodeOnCanvas } = require('../qrcode-generator.js');

class QRCodeManager {
  /**
   * 生成QR码数据（使用鱼的唯一ID）
   */
  static generateQRCodeData(fishId) {
    // 直接使用鱼的完整唯一ID作为QR码内容
    return fishId;
  }

  /**
   * 渲染QR码到画布
   */
  static renderQRCode(canvasId, qrData, size = null) {
    return new Promise((resolve, reject) => {
      try {
        const qrSize = size || APP_CONFIG.QRCODE_CONFIG.SIZE;
        
        console.log('生成QR码，数据:', qrData);
        drawQRCodeOnCanvas(canvasId, qrData, qrSize);
        
        // 给一点时间让canvas渲染完成
        setTimeout(() => {
          resolve(true);
        }, 100);
      } catch (e) {
        console.error('QR码生成失败:', e);
        reject(e);
      }
    });
  }

  /**
   * 安全渲染QR码（带错误处理）
   */
  static async safeRenderQRCode(canvasId, qrData, size = null) {
    try {
      await this.renderQRCode(canvasId, qrData, size);
      return { success: true, error: false };
    } catch (error) {
      console.error('QR码渲染失败:', error);
      return { success: false, error: true, message: error.message };
    }
  }

  /**
   * 初始化QR码显示
   */
  static initQRCodeDisplay(canvasId, fishId, callback = null) {
    const qrData = this.generateQRCodeData(fishId);
    
    // 使用 wx.nextTick 确保DOM已渲染
    wx.nextTick(async () => {
      const result = await this.safeRenderQRCode(canvasId, qrData);
      
      if (callback && typeof callback === 'function') {
        callback(result);
      }
      
      return result;
    });
  }

  /**
   * 验证QR码数据
   */
  static validateQRCodeData(qrData) {
    if (!qrData || typeof qrData !== 'string') {
      return { valid: false, message: 'QR码数据不能为空' };
    }
    
    if (qrData.length < 3) {
      return { valid: false, message: 'QR码数据长度不足' };
    }
    
    return { valid: true, message: 'QR码数据有效' };
  }

  /**
   * 扫描QR码
   */
  static scanQRCode() {
    return new Promise((resolve, reject) => {
      wx.scanCode({
        success: (res) => {
          const scannedData = res.result;
          const validation = this.validateQRCodeData(scannedData);
          
          resolve({
            success: true,
            data: scannedData,
            valid: validation.valid,
            message: validation.message
          });
        },
        fail: (err) => {
          console.error('扫码失败:', err);
          reject({
            success: false,
            error: err.errMsg || '扫码失败'
          });
        }
      });
    });
  }

  /**
   * 处理扫码查询鱼信息
   */
  static async handleScanToFindFish() {
    try {
      const scanResult = await this.scanQRCode();
      
      if (!scanResult.success) {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
        return { success: false, error: scanResult.error };
      }

      if (!scanResult.valid) {
        wx.showToast({
          title: '无效的QR码',
          icon: 'none'
        });
        return { success: false, error: scanResult.message };
      }

      // 查找对应的鱼信息
      const DataManager = require('./DataManager.js');
      const fishList = DataManager.getFishList();
      
      // 支持多种匹配方式：QR码数据、条形码（向后兼容）、鱼ID
      const foundFish = fishList.find(fish => 
        fish.id === scanResult.data || 
        fish.barcode === scanResult.data ||
        fish.qrcode === scanResult.data
      );

      if (foundFish) {
        // 跳转到鱼详情页面
        wx.navigateTo({
          url: `/pages/fish-detail/fish-detail?id=${foundFish.id}`
        });
        return { success: true, fish: foundFish };
      } else {
        wx.showToast({
          title: '未找到该鱼的信息',
          icon: 'none'
        });
        return { success: false, error: '未找到对应的鱼信息' };
      }

    } catch (error) {
      console.error('扫码查询失败:', error);
      wx.showToast({
        title: '扫码查询失败',
        icon: 'none'
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * 生成在线QR码图片URL（用于扫码测试页面）
   */
  static generateOnlineQRCodeUrl(fishId, size = 200) {
    const qrData = this.generateQRCodeData(fishId);
    const encodedData = encodeURIComponent(qrData);
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodedData}`;
  }
}

module.exports = QRCodeManager;