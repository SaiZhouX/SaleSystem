// index.js
// 获取应用实例
const app = getApp()
const api = require('../../utils/api.js');
const DataManager = require('../../utils/managers/DataManager.js');
const StatusManager = require('../../utils/managers/StatusManager.js');
const SecurityManager = require('../../utils/managers/SecurityManager.js');
const { APP_CONFIG } = require('../../utils/constants/AppConstants.js');
const DateHelper = require('../../utils/helpers/DateHelper.js');

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
    // 重置安全状态
    SecurityManager.resetSecurityState();
    this.loadDashboardData();
  },
  // 使用工具类加载仪表板数据
  loadDashboardData() {
    wx.request({
      url: api.getFishList,
      method: 'GET',
      success: (res) => {
        console.log('API response:', res.data);
        if (res.statusCode === 200 && res.data && res.data.length > 0) {
          // 使用数据管理工具类处理API数据
          const processedData = DataManager.processApiData(res.data);
          this.setData({ fishList: processedData });
          DataManager.saveFishList(processedData);
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

  // 使用工具类加载本地数据
  loadLocalData() {
    console.log('Loading local data');
    const fishList = DataManager.getFishList();
    const processedData = DataManager.processApiData(fishList);
    this.setData({ fishList: processedData });
    this.filterAndSortFishList();
    wx.showToast({
      title: '已加载本地数据',
      icon: 'none'
    });
  },

  // 使用工具类更新汇总数据
  updateSummary() {
    const summary = DataManager.getSummary();
    const totalIncome = summary.totalIncome.toFixed(2);
    const totalExpense = summary.totalExpense.toFixed(2);
    
    // 根据安全状态决定是否显示真实金额
    this.setData({
      totalIncome: totalIncome,
      totalExpense: totalExpense,
      maskedIncome: SecurityManager.showSensitiveData ? totalIncome : '******',
      maskedExpense: SecurityManager.showSensitiveData ? totalExpense : '******',
      showRealAmount: SecurityManager.showSensitiveData
    });
    
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

  // 使用工具类过滤和排序鱼列表
  filterAndSortFishList() {
    const { fishList, currentTab } = this.data;
    
    // 使用状态管理工具类进行过滤和排序
    const filteredAndSortedList = StatusManager.filterAndSortFish(fishList, currentTab);

    this.setData({
      filteredFishList: filteredAndSortedList
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

  goToScanTest() {
    wx.navigateTo({
      url: '/pages/scan-test/scan-test'
    });
  },

  scanCode: function() {
    const QRCodeManager = require('../../utils/managers/QRCodeManager.js');
    QRCodeManager.handleScanToFindFish()
      .then(result => {
        if (!result.success) {
          console.error('扫码查询失败:', result.error);
        }
      })
      .catch(error => {
        console.error('扫码查询异常:', error);
      });
  },

  // 使用工具类清理所有数据
  clearAllData() {
    wx.showModal({
      title: '确认清理',
      content: '确定要清除所有数据吗？此操作将删除所有鱼信息、收入和支出记录，不可恢复。',
      success: (res) => {
        if (res.confirm) {
          // 使用数据管理工具类清除所有数据
          DataManager.clearAllData();
          
          // 更新页面数据
          this.setData({
            fishList: [],
            filteredFishList: [],
            totalIncome: '0.00',
            totalExpense: '0.00',
            maskedIncome: '******',
            maskedExpense: '******',
            showRealAmount: false
          });
          
          // 重置安全状态
          SecurityManager.resetSecurityState();
          
          wx.showToast({
            title: '所有数据已清除',
            icon: 'success'
          });
        }
      }
    });
  },
  
  /**
   * 验证身份并显示真实金额
   */
  verifyAndShowAmount() {
    if (SecurityManager.showSensitiveData) {
      // 如果已经显示了真实金额，则隐藏
      SecurityManager.resetSecurityState();
      this.updateSummary();
      return;
    }
    
    // 执行人脸识别
    SecurityManager.performFaceID()
      .then(() => {
        // 验证成功，更新显示
        this.updateSummary();
      })
      .catch(err => {
        console.error('验证失败', err);
      });
  },

  /**
   * 点击总收入，进入收入详情页面
   */
  goToIncomeDetail() {
    wx.navigateTo({
      url: '/pages/financial-detail/financial-detail?type=income'
    });
  },

  /**
   * 点击总支出，进入支出详情页面
   */
  goToExpenseDetail() {
    wx.navigateTo({
      url: '/pages/financial-detail/financial-detail?type=expense'
    });
  }
})