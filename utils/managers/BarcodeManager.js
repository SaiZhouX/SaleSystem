// utils/managers/BarcodeManager.js
// 统一的条形码管理工具类

const { APP_CONFIG } = require('../constants/AppConstants.js');
const wxbarcode = require('../wxbarcode.js');

class BarcodeManager {
  /**
   * 生成条形码数据
   */
  static generateBarcodeData(fishId) {
    return fishId.substring(0, APP_CONFIG.BARCODE_CONFIG.LENGTH).toUpperCase();
  }

  /**
   * 渲染条形码到画布
   */
  static renderBarcode(canvasId, barcodeData, width = null, height = null) {
    return new Promise((resolve, reject) => {
      try {
        const barcodeWidth = width || APP_CONFIG.BARCODE_CONFIG.WIDTH;
        const barcodeHeight = height || APP_CONFIG.BARCODE_CONFIG.HEIGHT;
        
        console.log('生成条形码，数据:', barcodeData);
        wxbarcode.barcode(canvasId, barcodeData, barcodeWidth, barcodeHeight);
        resolve(true);
      } catch (e) {
        console.error('条形码生成失败:', e);
        reject(e);
      }
    });
  }

  /**
   * 安全渲染条形码（带错误处理）
   */
  static async safeRenderBarcode(canvasId, barcodeData, width = null, height = null) {
    try {
      await this.renderBarcode(canvasId, barcodeData, width, height);
      return { success: true, error: false };
    } catch (error) {
      console.error('条形码渲染失败:', error);
      return { success: false, error: true, message: error.message };
    }
  }

  /**
   * 初始化条形码显示
   */
  static initBarcodeDisplay(canvasId, fishId, callback = null) {
    const barcodeData = this.generateBarcodeData(fishId);
    
    // 使用 wx.nextTick 确保DOM已渲染
    wx.nextTick(async () => {
      const result = await this.safeRenderBarcode(canvasId, barcodeData);
      
      if (callback && typeof callback === 'function') {
        callback(result);
      }
      
      return result;
    });
  }

  /**
   * 验证条形码数据
   */
  static validateBarcodeData(barcodeData) {
    if (!barcodeData || typeof barcodeData !== 'string') {
      return { valid: false, message: '条形码数据不能为空' };
    }
    
    if (barcodeData.length < 6) {
      return { valid: false, message: '条形码数据长度不足' };
    }
    
    // 检查是否包含有效字符
    const validPattern = /^[A-Z0-9]+$/;
    if (!validPattern.test(barcodeData)) {
      return { valid: false, message: '条形码数据包含无效字符' };
    }
    
    return { valid: true, message: '条形码数据有效' };
  }

  /**
   * 扫描条形码
   */
  static scanBarcode() {
    return new Promise((resolve, reject) => {
      wx.scanCode({
        success: (res) => {
          const scannedData = res.result;
          const validation = this.validateBarcodeData(scannedData);
          
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
      const scanResult = await this.scanBarcode();
      
      if (!scanResult.success) {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
        return { success: false, error: scanResult.error };
      }

      if (!scanResult.valid) {
        wx.showToast({
          title: '无效的条形码',
          icon: 'none'
        });
        return { success: false, error: scanResult.message };
      }

      // 查找对应的鱼信息
      const DataManager = require('./DataManager.js');
      const fishList = DataManager.getFishList();
      const foundFish = fishList.find(fish => 
        fish.barcode === scanResult.data || fish.id === scanResult.data
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
}

module.exports = BarcodeManager;