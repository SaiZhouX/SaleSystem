// pages/add-fish/add-fish.js
const api = require('../../utils/api.js');
const wxbarcode = require('../../utils/wxbarcode.js');

Page({
  data: {
    fishId: '',
    purchaseDate: '',
    purchasePrice: '',
    photoPath: '',
    barcode: '',
    barcodeError: false,
    submitting: false
  },

  onLoad() {
    // 生成唯一ID
    const fishId = Math.random().toString(36).substr(2, 10) + Date.now().toString(36);
    const batchNumber = 'B' + Date.now().toString(36).substr(2, 6);
      // 生成barcode并记录日志
      const generatedBarcode = fishId.substring(0, 12).toUpperCase();
      console.log('生成的barcode数据:', generatedBarcode);
      this.setData({
      fishId: fishId,
        batchNumber: batchNumber,
        barcode: fishId.substring(0, 12).toUpperCase(),
      // 设置默认日期为今天
      purchaseDate: new Date().toISOString().split('T')[0]
    });

    // 生成条形码
    wx.nextTick(() => {
      try {
        wxbarcode.barcode('barcode', generatedBarcode, 300, 80);
      } catch (e) {
        console.error('条形码生成失败:', e);
        this.setData({
          barcodeError: true
        });
      }
    });
  },

  navigateToBatchAddFish() {
    wx.navigateTo({ url: '/pages/batch-add-fish/batch-add-fish' });
  },

  bindDateChange(e) {
  bindDateChange(e) {
    this.setData({
      purchaseDate: e.detail.value
    });
  },

  takePhoto: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        this.setData({
          photoPath: tempFilePath
        });
        wx.showToast({ title: '照片已选择', icon: 'success' });
      },
      fail: (err) => {
        console.error('选择照片失败:', err);
        wx.showToast({
          title: '选择照片失败',
          icon: 'none'
        });
      }
    });
  },

  previewPhoto: function() {
    if (this.data.photoPath) {
      wx.previewImage({
        urls: [this.data.photoPath],
        current: this.data.photoPath
      });
    }
  },

  formSubmit(e) {
    const { purchasePrice, purchaseDate } = e.detail.value;
    const price = parseFloat(purchasePrice);

    // 表单验证
    if (!purchaseDate) {
      wx.showToast({ title: '请选择进货日期', icon: 'none' });
      return;
    }

    if (isNaN(price) || price <= 0) {
      wx.showToast({ title: '请输入有效的进货价格', icon: 'none' });
      return;
    }

    if (this.data.submitting) return;
    this.setData({ submitting: true });

    // 创建新鱼信息对象
    // 创建新鱼信息对象
    const newFish = {
      id: this.data.fishId,
      batch: this.data.batchNumber,
      purchase_date: purchaseDate,
      purchasePrice: price,
      barcode: this.data.barcode,
      photoPath: this.data.photoPath || '',
      status: 'instock',
      timestamp: Date.now()
    };

    // 保存到本地存储
    const fishList = wx.getStorageSync('fishList') || [];
    fishList.push(newFish);
    wx.setStorageSync('fishList', fishList);

    // 同步鱼进货支出到总支出
    const expenseList = wx.getStorageSync('expenseList') || [];
    expenseList.push({
      item: '鱼进货',
      amount: newFish.purchasePrice,
      quantity: 1,
      total: newFish.purchasePrice,
      date: newFish.purchase_date
    });
    wx.setStorageSync('expenseList', expenseList);

    // 更新总支出
    const totalExpense = wx.getStorageSync('totalExpense') || 0;
    wx.setStorageSync('totalExpense', totalExpense + newFish.purchasePrice);

    // 同步到服务器
    console.log('提交到服务器的数据:', newFish);
    wx.request({
      url: api.addFish,
      method: 'POST',
      data: newFish,
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