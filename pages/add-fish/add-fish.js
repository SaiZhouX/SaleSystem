// pages/add-fish/add-fish.js
const DataManager = require('../../utils/managers/DataManager.js');
const PhotoManager = require('../../utils/managers/PhotoManager.js');
const QRCodeManager = require('../../utils/managers/QRCodeManager.js');
const FormValidator = require('../../utils/validators/FormValidator.js');
const DateHelper = require('../../utils/helpers/DateHelper.js');
const ErrorHandler = require('../../utils/helpers/ErrorHandler.js');
const QRCodeHelper = require('../../utils/helpers/QRCodeHelper.js');
const PageHelper = require('../../utils/helpers/PageHelper.js');
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
    const qrcode = QRCodeHelper.generateQRCodeData(fishId);
    
    this.setData({
      fishId: fishId,
      batchNumber: batchNumber,
      qrcode: qrcode,
      purchaseDate: DateHelper.getCurrentDate()
    });

    // 使用统一的QR码显示工具
    QRCodeHelper.setupQRCodeDisplay(this, fishId);
  },

  navigateToBatchAddFish() {
    wx.navigateTo({ url: '/pages/batch-add-fish/batch-add-fish' });
  },

  bindDateChange(e) {
    this.setData({
      purchaseDate: e.detail.value
    });
  },

  // 使用工具类处理拍照（添加页面专用）
  async takePhoto() {
    try {
      const result = await PhotoManager.handleTakePhotoForAdd(this.data.fishId);
      if (result.success) {
        this.setData({
          photoPath: result.photoPath
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

    // 使用统一的表单提交处理
    await PageHelper.handleFormSubmit(
      this,
      async () => {
        // 生成QR码在线URL
        const qrcodeUrl = QRCodeHelper.generateOnlineQRCodeUrl(this.data.fishId);

        // 创建新鱼信息对象
        const newFish = {
          id: this.data.fishId,
          batch: this.data.batchNumber,
          purchase_date: validationResult.data.purchaseDate,
          purchasePrice: validationResult.data.purchasePrice,
          qrcode: this.data.qrcode,
          qrcodeUrl: qrcodeUrl,
          photoPath: this.data.photoPath || '',
          status: APP_CONFIG.FISH_STATUS.INSTOCK,
          timestamp: Date.now(),
          needsSync: true,
          lastModified: Date.now()
        };

        console.log('准备保存的鱼信息:', newFish);

        // 使用数据管理工具类保存数据
        DataManager.addFish(newFish);
        
        console.log('鱼信息已保存到本地存储');
        return { success: true };
      },
      APP_CONFIG.SUCCESS_MESSAGES.ADD_SUCCESS
    );
  },

  /**
   * QR码图片加载成功
   */
  onQRImageLoad: function(e) {
    QRCodeHelper.handleQRCodeLoadSuccess(this, e);
  },

  /**
   * QR码图片加载失败
   */
  onQRImageError: function(e) {
    QRCodeHelper.handleQRCodeLoadError(this, e, this.data.fishId);
  }
})