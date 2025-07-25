// pages/batch-add-fish/batch-add-fish.js
const wxbarcode = require('../../utils/wxbarcode.js');

Page({
  /**
   * 页面的初始数据
   */
  data: {
    dateValue: ''
  },

  /**
   * 表单提交处理函数
   */
  formSubmit: function (e) {
    const { averagePrice, quantity, date } = e.detail.value;

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
    const fishList = wx.getStorageSync('fishList') || [];

    // 批量生成鱼信息
    for (let i = 0; i < qty; i++) {
      // 生成唯一ID (时间戳 + 随机数)
      const uniqueId = new Date().getTime().toString() + Math.floor(Math.random() * 1000).toString();
      // 生成条形码 (使用工具库生成)
      const barcode = 'F' + uniqueId.substring(6);

      // 添加鱼信息到列表
      fishList.push({
        id: uniqueId,
        price: price,
        barcode: barcode,
        date: date,
        photo: '', // 照片后续补拍
        addedTime: new Date().toISOString()
      });
    }

    // 保存到本地存储
    wx.setStorageSync('fishList', fishList);

    // 显示成功提示并返回
    wx.showToast({
      title: `成功添加${qty}条鱼信息`,
      icon: 'success',
      duration: 2000,
      success: () => {
        setTimeout(() => {
          wx.navigateBack();
        }, 2000);
      }
    });
  }
})