// index.js
// 获取应用实例
const app = getApp()
const api = require('../../utils/api.js');

Page({
  data: {
    totalIncome: 0,
    totalExpense: 0,
    fishList: []
  },
  onShow() {
    this.getTabBar().setData({
      active: 0
    });
    this.loadDashboardData();
  },
  loadDashboardData() {
    wx.request({
      url: api.getFishList,
      method: 'GET',
      success: (res) => {
        console.log('API response:', res.data);
        if (res.statusCode === 200 && res.data) {
          this.setData({
            fishList: res.data
          });
          wx.setStorageSync('fishList', res.data); // 同步到本地缓存
        } else {
          console.log('API request failed, loading local data');
        this.loadLocalData();
        }
        this.updateSummary();
      },
      fail: (err) => {
        console.error('获取列表失败', err);
        this.loadLocalData();
        this.updateSummary();
      }
    });
  },

  loadLocalData() {
        console.log('Loading local data');
    const fishList = wx.getStorageSync('fishList') || [];
    this.setData({
      fishList: fishList
    });
    wx.showToast({
      title: '已加载本地数据',
      icon: 'none'
    });
  },

  updateSummary() {
    const totalIncome = wx.getStorageSync('totalIncome') || 0;
    const totalExpense = wx.getStorageSync('totalExpense') || 0;
    this.setData({
      totalIncome: totalIncome.toFixed(2),
      totalExpense: totalExpense.toFixed(2)
    });
  },
  goToFishDetail(e) {
    const fishId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/fish-detail/fish-detail?id=${fishId}`
    });
  },

  scanCode: function() {
    wx.scanCode({
      success: (res) => {
        const fishId = res.result;
        const fishList = wx.getStorageSync('fishList') || [];
        const fishExists = fishList.some(fish => fish.id === fishId);

        if (fishExists) {
          wx.navigateTo({
            url: `/pages/fish-detail/fish-detail?id=${fishId}`
          });
        } else {
          wx.showToast({
            title: '未找到该鱼的信息',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.showToast({
          title: '扫码失败',
          icon: 'none'
        });
      }
    });
  }
})