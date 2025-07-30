// pages/batch-add-fish/batch-add-fish.js
const api = require('../../utils/api.js');
const wxbarcode = require('../../utils/wxbarcode.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    dateValue: new Date().toISOString().split('T')[0],
    submitting: false
  },

  onLoad() {
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    this.setData({
      dateValue: today
    });
  },

  /**
   * 日期选择器变化处理函数
   */
  bindDateChange: function(e) {
    this.setData({
      dateValue: e.detail.value
    });
  },

  /**
   * 表单提交处理函数
   */
  formSubmit: function (e) {
    const { averagePrice, quantity } = e.detail.value;
    const date = this.data.dateValue;

    // 表单验证
    if (!averagePrice || !quantity || !date) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    const qty = parseInt(quantity);
    const price = parseFloat(averagePrice);

    if (isNaN(price) || price <= 0) {
      wx.showToast({ title: '请输入有效的进货价格', icon: 'none' });
      return;
    }

    if (isNaN(qty) || qty <= 0) {
      wx.showToast({ title: '请输入有效的鱼数量', icon: 'none' });
      return;
    }

    if (this.data.submitting) return;
    this.setData({ submitting: true });

    const fishList = wx.getStorageSync('fishList') || [];
    const baseTimestamp = Date.now();
    const batchNumber = 'B' + baseTimestamp.toString(36).substr(2, 6);

    // 批量生成鱼信息
    for (let i = 0; i < qty; i++) {
      // 生成唯一ID，与单个添加保持一致的格式，但每个鱼有微小时间差异
      const fishId = Math.random().toString(36).substr(2, 10) + (baseTimestamp + i).toString(36);
      // 生成条形码，与单个添加保持一致
      const barcode = fishId.substring(0, 12).toUpperCase();

      // 创建新鱼信息对象，与单个添加保持一致的数据结构
      const newFish = {
        id: fishId,
        batch: batchNumber,
        purchase_date: date,
        purchasePrice: price,
        barcode: barcode,
        status: 'instock',
        timestamp: Date.now()
      };

      fishList.push(newFish);
    }

    // 保存到本地存储
    wx.setStorageSync('fishList', fishList);

    // 同步鱼进货支出到总支出
    const expenseList = wx.getStorageSync('expenseList') || [];
    expenseList.push({
      item: '鱼进货(批量)',
      amount: price,
      quantity: qty,
      total: price * qty,
      date: date
    });
    wx.setStorageSync('expenseList', expenseList);

    // 更新总支出
    const totalExpense = wx.getStorageSync('totalExpense') || 0;
    wx.setStorageSync('totalExpense', totalExpense + (price * qty));

    // 显示成功提示并返回
    // 显示成功提示并返回首页
    wx.showToast({
      title: `成功添加${qty}条鱼信息`,
      icon: 'success',
      duration: 2000,
      success: () => {
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 2000);
      }
    });

    this.setData({ submitting: false });
  }
})
