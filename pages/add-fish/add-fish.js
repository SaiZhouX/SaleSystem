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
    submitting: false
  },

  onLoad() {
    // 使用工具类生成ID和批次号
    const fishId = DataManager.generateFishId();
    const batchNumber = DataManager.generateBatchNumber();
    const qrcode = QRCodeManager.generateQRCodeData(fishId);
    
    this.setData({
      fishId: fishId,
      batchNumber: batchNumber,
      qrcode: qrcode,
      purchaseDate: DateHelper.getCurrentDate()
    });

    // 使用工具类生成QR码
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
  formSubmit(e) {
    const { purchasePrice, purchaseDate, notes } = e.detail.value;

    // 使用表单验证工具类
    const validationResult = FormValidator.validateAddFishForm({
      purchaseDate: purchaseDate,
      purchasePrice: purchasePrice,
      notes: notes
    });

    if (!FormValidator.handleFormValidation(validationResult)) {
      return;
    }

    if (this.data.submitting) return;
    this.setData({ submitting: true });

    try {
      // 创建新鱼信息对象
      const newFish = {
        id: this.data.fishId,
        batch: this.data.batchNumber,
        purchase_date: validationResult.data.purchaseDate,
        purchasePrice: validationResult.data.purchasePrice,
        qrcode: this.data.qrcode,
        photoPath: this.data.photoPath || '',
        status: APP_CONFIG.FISH_STATUS.INSTOCK,
        notes: validationResult.data.notes,
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
  }
})