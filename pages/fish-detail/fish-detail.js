// pages/fish-detail/fish-detail.js
const DataManager = require('../../utils/managers/DataManager.js');
const PhotoManager = require('../../utils/managers/PhotoManager.js');
const QRCodeManager = require('../../utils/managers/QRCodeManager.js');
const StatusManager = require('../../utils/managers/StatusManager.js');
const FormValidator = require('../../utils/validators/FormValidator.js');
const { APP_CONFIG } = require('../../utils/constants/AppConstants.js');

Page({
  data: {
    fishInfo: null,
    qrcodeError: false,
    qrcodeImageUrl: ''
  },

  onLoad(options) {
    const fishId = options.id;
    this.loadFishData(fishId);
  },

  // 使用工具类加载鱼信息数据
  loadFishData(fishId) {
    const fishInfo = DataManager.getFishById(fishId);

    if (fishInfo) {
      this.setData({
        fishInfo: fishInfo
      }, () => {
        // 使用工具类生成在线QR码
        if (fishInfo.qrcode || fishInfo.barcode || fishInfo.id) {
          const qrcodeUrl = QRCodeManager.generateOnlineQRCodeUrl(fishInfo.id, 300);
          this.setData({ qrcodeImageUrl: qrcodeUrl });
        }
      });
    } else {
      wx.showToast({
        title: '未找到该鱼的信息',
        icon: 'none'
      });
      wx.navigateBack();
    }
  },

  // 使用工具类处理拍照
  async takePhoto() {
    try {
      const result = await PhotoManager.handleTakePhoto(this.data.fishInfo.id);
      if (result.success) {
        this.setData({
          'fishInfo.photoPath': result.fish.photoPath
        });
      }
    } catch (error) {
      console.error('拍照处理失败:', error);
    }
  },

  // 使用工具类预览照片
  previewPhoto() {
    PhotoManager.previewPhoto(this.data.fishInfo.photoPath);
  },

  // 使用工具类处理销售
  sellFish() {
    wx.showModal({
      title: '输入销售价格',
      editable: true,
      placeholderText: '请输入销售价格',
      success: (res) => {
        if (res.confirm && res.content) {
          // 使用表单验证工具类验证价格
          const priceValidation = FormValidator.validateSellPrice(res.content);
          
          if (!priceValidation.valid) {
            wx.showToast({ 
              title: priceValidation.message, 
              icon: 'none' 
            });
            return;
          }

          // 使用状态管理工具类更新状态
          const result = StatusManager.handleStatusChange(
            this.data.fishInfo.id,
            APP_CONFIG.FISH_STATUS.SOLD,
            { soldPrice: priceValidation.value }
          );

          if (result.success) {
            this.setData({ fishInfo: result.fish });
            wx.showToast({ 
              title: '标记为已出售', 
              icon: 'success',
              success: () => {
                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              }
            });
          } else {
            wx.showToast({ 
              title: result.error || '操作失败', 
              icon: 'none' 
            });
          }
        }
      }
    });
  },

  // 使用工具类处理死亡标记
  markAsDead() {
    wx.showModal({
      title: '确认标记',
      content: '确定要将此鱼标记为死亡吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          // 使用状态管理工具类更新状态
          const result = StatusManager.handleStatusChange(
            this.data.fishInfo.id,
            APP_CONFIG.FISH_STATUS.DEAD
          );

          if (result.success) {
            this.setData({ fishInfo: result.fish });
            wx.showToast({ 
              title: '已标记为死亡', 
              icon: 'none',
              success: () => {
                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              }
            });
          } else {
            wx.showToast({ 
              title: result.error || '操作失败', 
              icon: 'none' 
            });
          }
        }
      }
    });
  },

  /**
   * QR码图片加载成功
   */
  onQRImageLoad: function(e) {
    console.log('QR码图片加载成功:', e);
  },

  /**
   * QR码图片加载失败
   */
  onQRImageError: function(e) {
    console.error('QR码图片加载失败:', e);
    this.setData({ qrcodeError: true });
    wx.showToast({
      title: 'QR码加载失败',
      icon: 'none',
      duration: 2000
    });
  }
});
