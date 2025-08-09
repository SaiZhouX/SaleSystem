// pages/add-fish/add-fish.js
const DataManager = require('../../utils/managers/DataManager.js');
const PhotoManager = require('../../utils/managers/PhotoManager.js');
const QRCodeManager = require('../../utils/managers/QRCodeManager.js');
const FormValidator = require('../../utils/validators/FormValidator.js');
const DateHelper = require('../../utils/helpers/DateHelper.js');
const { APP_CONFIG } = require('../../utils/constants/AppConstants.js');

Page({
  data: {
    fishId: '',
    batchNumber: '',
    purchaseDate: '',
    purchasePrice: '',
    photoPath: '',
    qrcode: '',
    qrcodeError: false,
    qrcodeImageUrl: '',
    submitting: false
  },

  onLoad() {
    // 使用工具类生成ID和批次号
    const fishId = DataManager.generateFishId();
    const batchNumber = DataManager.generateBatchNumber();
    const qrcode = QRCodeManager.generateQRCodeData(fishId);
    
    // 生成在线QR码URL（与鱼详情页面保持一致）
    const qrcodeUrl = QRCodeManager.generateOnlineQRCodeUrl(fishId, 300);
    
    this.setData({
      fishId: fishId,
      batchNumber: batchNumber,
      qrcode: qrcode,
      qrcodeImageUrl: qrcodeUrl,
      purchaseDate: DateHelper.getCurrentDate()
    });

    // 使用工具类生成QR码（作为备用）
    QRCodeManager.initQRCodeDisplay('qrcode', fishId, (result) => {
      if (!result.success) {
        this.setData({ qrcodeError: true });
      }
    });
  },

  navigateToBatchAddFish() {
    wx.navigateTo({ url: '/pages/batch-add-fish/batch-add-fish' });
  },

  bindDateChange(e) {
    this.setData({
      purchaseDate: e.detail.value
    });
  },

  // 使用工具类处理拍照
  async takePhoto() {
    try {
      const result = await PhotoManager.handleTakePhoto(this.data.fishId);
      if (result.success) {
        this.setData({
          photoPath: result.fish.photoPath
        });
      }
    } catch (error) {
      console.error('拍照处理失败:', error);
    }
  },

  // 使用工具类预览照片
  previewPhoto() {
    PhotoManager.previewPhoto(this.data.photoPath);
  },

  // 使用工具类处理表单提交
  async formSubmit(e) {
    const { purchasePrice, purchaseDate } = e.detail.value;

    // 使用表单验证工具类
    const validationResult = FormValidator.validateAddFishForm({
      purchaseDate: purchaseDate,
      purchasePrice: purchasePrice
    });

    if (!FormValidator.handleFormValidation(validationResult)) {
      return;
    }

    if (this.data.submitting) return;
    this.setData({ submitting: true });

    try {
      // 生成并保存QR码图片
      let qrcodePath = '';
      try {
        const qrResult = await QRCodeManager.generateAndSaveQRCode(this.data.fishId, 300);
        if (qrResult.success) {
          qrcodePath = qrResult.qrcodePath;
        }
      } catch (qrError) {
        console.error('生成QR码图片失败:', qrError);
        // 继续执行，即使QR码生成失败
      }

      // 创建新鱼信息对象
      const newFish = {
        id: this.data.fishId,
        batch: this.data.batchNumber,
        purchase_date: validationResult.data.purchaseDate,
        purchasePrice: validationResult.data.purchasePrice,
        qrcode: this.data.qrcode,
        qrcodePath: qrcodePath, // 保存QR码图片路径
        photoPath: this.data.photoPath || '',
        status: APP_CONFIG.FISH_STATUS.INSTOCK,
        timestamp: Date.now()
      };

      // 使用数据管理工具类保存数据
      DataManager.addFish(newFish);

      // 同步到服务器
      this.syncToServer(newFish);

    } catch (error) {
      console.error('添加鱼信息失败:', error);
      wx.showToast({ 
        title: '添加失败', 
        icon: 'none' 
      });
      this.setData({ submitting: false });
    }
  },

  // 同步数据到服务器
  syncToServer(fishData) {
    const api = require('../../utils/api.js');
    
    console.log('提交到服务器的数据:', fishData);
    wx.request({
      url: api.addFish,
      method: 'POST',
      data: fishData,
      success: (res) => {
        if (res.statusCode === 200) {
          wx.showToast({ title: '添加成功', icon: 'success' });
          setTimeout(() => wx.navigateBack(), 1500);
        } else {
          wx.showToast({ title: '服务器保存失败', icon: 'none' });
          this.setData({ submitting: false });
        }
      },
      fail: () => {
        wx.showToast({ title: '网络错误，已保存到本地', icon: 'none' });
        setTimeout(() => wx.navigateBack(), 1500);
      },
      complete: () => {
        this.setData({ submitting: false });
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
})