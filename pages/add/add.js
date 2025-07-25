// pages/add/add.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  onShow: function () {
    this.getTabBar().setData({
      active: 1
    });
  },

  navigateToAddFish() {
    wx.navigateTo({ url: '/pages/add-fish/add-fish' });
  },

  navigateToAddExpense() {
    wx.navigateTo({ url: '/pages/add-expense/add-expense' });
  },

  navigateToBatchAddFish() {
    wx.navigateTo({ url: '/pages/batch-add-fish/batch-add-fish' });
  }
})