// pages/fish-list/fish-list.js
Page({
  data: {
    fishList: []
  },

  onLoad: function () {
    // 从本地存储加载鱼信息列表
    const fishList = wx.getStorageSync('fishList') || [];
    // 转换价格数据，确保为有效数字并统一日期字段
    const validFishList = fishList.map(item => ({
      ...item,
      // 统一日期字段为purchase_date，兼容旧数据
      purchase_date: item.purchase_date || item.purchaseDate || '',
        // 将价格转换为数字，无效值默认为0
        purchasePrice: !isNaN(Number(item.purchasePrice)) ? Number(item.purchasePrice) : !isNaN(Number(item.price)) ? Number(item.price) : 0,
        formattedPrice: '¥' + (!isNaN(Number(item.purchasePrice)) ? Number(item.purchasePrice) : !isNaN(Number(item.price)) ? Number(item.price) : 0).toFixed(2)
    }));
    this.setData({ fishList: validFishList });
  },

  onShow: function () {
    // 页面显示时刷新数据
    this.onLoad();
  },

  clearAllFish: function() {
    wx.showModal({
      title: '确认清理',
      content: '确定要清除所有鱼信息吗？此操作不可恢复。',
      success: (res) => {
        if (res.confirm) {
          // 清除本地存储中的鱼信息
          wx.setStorageSync('fishList', []);
          // 更新页面数据
          this.setData({ fishList: [] });
          // 显示清理成功提示
          wx.showToast({
            title: '已清除所有鱼信息',
            icon: 'success'
          });
        }
      }
    });
  }
})