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
        if (res.statusCode === 200 && res.data && res.data.length > 0) {
          // 处理API返回数据，统一日期字段
          const processedData = res.data.map(item => ({
            ...item,
            purchase_date: item.purchase_date || item.purchaseDate || ''
          }));
          this.setData({
            fishList: processedData
          });
          wx.setStorageSync('fishList', processedData); // 仅当API返回有效数据时同步到本地缓存
        } else {
          console.log('API request failed or returned empty data, loading local data');
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
    // 处理本地数据，统一日期字段
    const processedData = fishList.map(item => ({
      ...item,
      purchase_date: item.purchase_date || item.purchaseDate || ''
    }));
    this.setData({
      fishList: processedData
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

  goToFishList() {
    wx.navigateTo({
      url: '/pages/fish-list/fish-list'
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