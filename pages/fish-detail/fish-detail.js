// pages/fish-detail/fish-detail.js
const DataManager = require('../../utils/managers/DataManager.js');
const PhotoManager = require('../../utils/managers/PhotoManager.js');
const QRCodeManager = require('../../utils/managers/QRCodeManager.js');
const StatusManager = require('../../utils/managers/StatusManager.js');
const FormValidator = require('../../utils/validators/FormValidator.js');
const ErrorHandler = require('../../utils/helpers/ErrorHandler.js');
const QRCodeHelper = require('../../utils/helpers/QRCodeHelper.js');
const PageHelper = require('../../utils/helpers/PageHelper.js');
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
    console.log('加载鱼信息，ID:', fishId);
    console.log('获取到的鱼信息:', fishInfo);

    if (fishInfo) {
      this.setData({ fishInfo: fishInfo });
      
      // 使用统一的QR码显示工具
      const existingQRCodeUrl = fishInfo.qrcodeUrl || fishInfo.qrcodePath;
      QRCodeHelper.setupQRCodeDisplay(this, fishInfo.id, existingQRCodeUrl);
    } else {
      ErrorHandler.showError(APP_CONFIG.ERROR_MESSAGES.DATA_NOT_FOUND);
      PageHelper.safeNavigate('', 0, 'navigateBack');
    }
  },

  // 使用工具类处理拍照（详情页面专用）
  async takePhoto() {
    try {
      const result = await PhotoManager.handleTakePhotoForDetail(this.data.fishInfo.id);
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
  async sellFish() {
    const result = await ErrorHandler.showConfirm({
      title: '输入销售价格',
      editable: true,
      placeholderText: '请输入销售价格'
    });

    if (result.confirmed && result.content) {
      // 使用表单验证工具类验证价格
      const priceValidation = FormValidator.validateSellPrice(result.content);
      
      if (!priceValidation.valid) {
        ErrorHandler.showError(priceValidation.message);
        return;
      }

      // 使用状态管理工具类更新状态
      const updateResult = StatusManager.handleStatusChange(
        this.data.fishInfo.id,
        APP_CONFIG.FISH_STATUS.SOLD,
        { soldPrice: priceValidation.value }
      );

      if (updateResult.success) {
        this.setData({ fishInfo: updateResult.fish });
        PageHelper.successAndBack(APP_CONFIG.SUCCESS_MESSAGES.SELL_SUCCESS);
      } else {
        ErrorHandler.showError(updateResult.error || APP_CONFIG.ERROR_MESSAGES.OPERATION_FAILED);
      }
    }
  },

  // 使用工具类处理死亡标记
  async markAsDead() {
    await PageHelper.handleConfirmAction(
      '确认标记',
      '确定要将此鱼标记为死亡吗？此操作不可撤销。',
      async () => {
        // 使用状态管理工具类更新状态
        const result = StatusManager.handleStatusChange(
          this.data.fishInfo.id,
          APP_CONFIG.FISH_STATUS.DEAD
        );

        if (result.success) {
          this.setData({ fishInfo: result.fish });
          PageHelper.successAndBack(APP_CONFIG.SUCCESS_MESSAGES.MARK_DEAD_SUCCESS);
        } else {
          ErrorHandler.showError(result.error || APP_CONFIG.ERROR_MESSAGES.OPERATION_FAILED);
        }
      }
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
    QRCodeHelper.handleQRCodeLoadError(this, e, this.data.fishInfo?.id);
  }
});
