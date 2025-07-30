// pages/batch-add-fish/batch-add-fish.js
const DataManager = require('../../utils/managers/DataManager.js');
const BarcodeManager = require('../../utils/managers/BarcodeManager.js');
const FormValidator = require('../../utils/validators/FormValidator.js');
const DateHelper = require('../../utils/helpers/DateHelper.js');
const { APP_CONFIG } = require('../../utils/constants/AppConstants.js');

Page({
  data: {
    dateValue: '',
    submitting: false
  },

  onLoad() {
    // 使用日期工具类设置默认日期
    this.setData({
      dateValue: DateHelper.getCurrentDate()
    });
  },

  bindDateChange(e) {
    this.setData({
      dateValue: e.detail.value
    });
  },

  // 使用工具类处理表单提交
  formSubmit(e) {
    const { averagePrice, quantity } = e.detail.value;
    const purchaseDate = this.data.dateValue;

    // 使用表单验证工具类
    const validationResult = FormValidator.validateBatchAddFishForm({
      purchaseDate: purchaseDate,
      averagePrice: averagePrice,
      quantity: quantity
    });

    if (!FormValidator.handleFormValidation(validationResult)) {
      return;
    }

    if (this.data.submitting) return;
    this.setData({ submitting: true });

    try {
      // 使用工具类批量生成鱼信息
      const fishDataList = this.generateBatchFishData(
        validationResult.data.quantity,
        validationResult.data.averagePrice,
        validationResult.data.purchaseDate
      );

      // 使用数据管理工具类保存数据
      DataManager.addFishBatch(fishDataList);

      // 显示成功提示并返回首页
      wx.showToast({
        title: `成功添加${validationResult.data.quantity}条鱼信息`,
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.switchTab({ url: '/pages/index/index' });
          }, 2000);
        }
      });

    } catch (error) {
      console.error('批量添加鱼信息失败:', error);
      wx.showToast({ 
        title: '添加失败', 
        icon: 'none' 
      });
    } finally {
      this.setData({ submitting: false });
    }
  },

  // 批量生成鱼信息数据
  generateBatchFishData(quantity, price, date) {
    const fishDataList = [];
    const baseTimestamp = Date.now();
    const batchNumber = DataManager.generateBatchNumber();

    for (let i = 0; i < quantity; i++) {
      // 生成唯一ID，每个鱼有微小时间差异
      const fishId = Math.random().toString(36).substr(2, 10) + (baseTimestamp + i).toString(36);
      const barcode = BarcodeManager.generateBarcodeData(fishId);

      const newFish = {
        id: fishId,
        batch: batchNumber,
        purchase_date: date,
        purchasePrice: price,
        barcode: barcode,
        status: APP_CONFIG.FISH_STATUS.INSTOCK,
        timestamp: Date.now()
      };

      fishDataList.push(newFish);
    }

    return fishDataList;
  }
})
