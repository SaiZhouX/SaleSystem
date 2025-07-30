// index.js
// 获取应用实例
const app = getApp()
const api = require('../../utils/api.js');

Page({
  data: {
    totalIncome: 0,
    totalExpense: 0,
    fishList: [],
    filteredFishList: [],
    currentTab: 'instock'
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
          // 处理API返回数据，统一日期字段和状态字段
          const processedData = res.data.map(item => ({
            ...item,
            purchase_date: item.purchase_date || item.purchaseDate || '',
            status: item.status || (item.isSold ? 'sold' : 'instock') // 兼容旧数据
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
    // 处理本地数据，统一日期字段和状态字段
    const processedData = fishList.map(item => ({
      ...item,
      purchase_date: item.purchase_date || item.purchaseDate || '',
      status: item.status || (item.isSold ? 'sold' : 'instock') // 兼容旧数据
    }));
    this.setData({
      fishList: processedData
    });
    this.filterAndSortFishList(); // 加载数据后进行过滤排序
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
    // 更新过滤后的列表
    this.filterAndSortFishList();
  },

  // 状态切换函数
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
    this.filterAndSortFishList();
  },

  // 过滤和排序鱼列表
  filterAndSortFishList() {
    const { fishList, currentTab } = this.data;
    
    // 过滤数据
    let filteredList = fishList.filter(fish => {
      const status = fish.status || (fish.isSold ? 'sold' : 'instock');
      return status === currentTab;
    });

    // 排序数据
    filteredList.sort((a, b) => {
      let dateA, dateB;
      
      if (currentTab === 'sold') {
        // 已出售按销售日期降序
        dateA = new Date(a.soldDate || '1970-01-01');
        dateB = new Date(b.soldDate || '1970-01-01');
      } else if (currentTab === 'dead') {
        // 死亡按死亡日期降序
        dateA = new Date(a.deadDate || '1970-01-01');
        dateB = new Date(b.deadDate || '1970-01-01');
      } else {
        // 未出售按进货日期降序
        dateA = new Date(a.purchase_date || a.purchaseDate || '1970-01-01');
        dateB = new Date(b.purchase_date || b.purchaseDate || '1970-01-01');
      }
      
      return dateB - dateA; // 降序排列
    });

    this.setData({
      filteredFishList: filteredList
    });
  },
// index.js
// 获取应用实例
const app = getApp()
const api = require('../../utils/api.js');

Page({
  data: {
    totalIncome: 0,
    totalExpense: 0,
    fishList: [],
    filteredFishList: [],
    currentTab: 'instock'
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
          // 处理API返回数据，统一日期字段和状态字段
          const processedData = res.data.map(item => ({
            ...item,
            purchase_date: item.purchase_date || item.purchaseDate || '',
            status: item.status || (item.isSold ? 'sold' : 'instock') // 兼容旧数据
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
    // 处理本地数据，统一日期字段和状态字段
    const processedData = fishList.map(item => ({
      ...item,
      purchase_date: item.purchase_date || item.purchaseDate || '',
      status: item.status || (item.isSold ? 'sold' : 'instock') // 兼容旧数据
    }));
    this.setData({
      fishList: processedData
    });
    this.filterAndSortFishList(); // 加载数据后进行过滤排序
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
    // 更新过滤后的列表
    this.filterAndSortFishList();
  },

  // 状态切换函数
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
    this.filterAndSortFishList();
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
  },

  clearAllData: function() {
    wx.showModal({
      title: '确认清理',
      content: '确定要清除所有数据吗？此操作将删除所有鱼信息、收入和支出记录，不可恢复。',
      success: (res) => {
        if (res.confirm) {
          // 清除所有本地存储数据
          wx.setStorageSync('fishList', []);
          wx.setStorageSync('totalIncome', 0);
          wx.setStorageSync('totalExpense', 0);
          
          // 更新页面数据
          this.setData({
            fishList: [],
            totalIncome: '0.00',
            totalExpense: '0.00'
          });
          
          wx.showToast({
            title: '所有数据已清除',
            icon: 'success'
          });
        }
      }
    });
  }
})