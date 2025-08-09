// pages/my/my.js
const DataManager = require('../../utils/managers/DataManager.js');
const ServerManager = require('../../utils/managers/ServerManager.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUseGetUserProfile: false,
    
    // 财务数据
    totalIncome: 0,
    totalExpense: 0,
    profit: 0,
    
    // 服务器状态
    serverConnected: false,
    serverStatus: 'unknown',
    serverMessage: '未检测',
    lastSyncTime: null,
    lastSyncFormatted: '从未同步',
    pendingCount: 0,
    
    // 同步状态
    syncing: false,
    syncProgress: 0
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      })
    }
  },

  onShow: function () {
    this.getTabBar().setData({
      active: 2
    });
    
    // 加载数据
    this.loadFinancialData();
    this.loadServerStatus();
    this.checkServerConnection();
  },

  /**
   * 加载财务数据
   */
  loadFinancialData() {
    const financialData = DataManager.getFinancialSummary();
    const profit = financialData.totalIncome - financialData.totalExpense;
    
    this.setData({
      totalIncome: financialData.totalIncome,
      totalExpense: financialData.totalExpense,
      profit: profit
    });
  },

  /**
   * 加载服务器状态
   */
  loadServerStatus() {
    const syncStatus = ServerManager.getSyncStatusSummary();
    
    this.setData({
      serverConnected: syncStatus.serverConnected,
      serverStatus: syncStatus.serverStatus,
      serverMessage: syncStatus.serverMessage,
      lastSyncTime: syncStatus.lastSyncTime,
      lastSyncFormatted: syncStatus.lastSyncFormatted,
      pendingCount: syncStatus.pendingCount
    });
  },

  /**
   * 检查服务器连接状态
   */
  async checkServerConnection() {
    const connectionStatus = await ServerManager.checkServerConnection();
    ServerManager.saveConnectionStatus(connectionStatus);
    
    this.setData({
      serverConnected: connectionStatus.connected,
      serverStatus: connectionStatus.status,
      serverMessage: connectionStatus.message
    });
  },

  /**
   * 手动刷新服务器状态
   */
  async refreshServerStatus() {
    wx.showLoading({ title: '检测中...' });
    
    try {
      await this.checkServerConnection();
      this.loadServerStatus();
      
      wx.showToast({
        title: this.data.serverConnected ? '连接正常' : '连接失败',
        icon: this.data.serverConnected ? 'success' : 'none'
      });
    } catch (error) {
      wx.showToast({
        title: '检测失败',
        icon: 'none'
      });
    } finally {
      wx.hideLoading();
    }
  },

  /**
   * 上传数据到服务器
   */
  async syncDataToServer() {
    if (!this.data.serverConnected) {
      wx.showToast({
        title: '服务器未连接',
        icon: 'none'
      });
      return;
    }

    if (this.data.syncing) {
      return;
    }

    this.setData({ syncing: true, syncProgress: 0 });
    
    wx.showLoading({ title: '同步中...' });

    try {
      // 模拟同步进度
      const progressInterval = setInterval(() => {
        if (this.data.syncProgress < 90) {
          this.setData({
            syncProgress: this.data.syncProgress + 10
          });
        }
      }, 200);

      const result = await ServerManager.syncAllDataToServer();
      
      clearInterval(progressInterval);
      this.setData({ syncProgress: 100 });

      if (result.success) {
        wx.showToast({
          title: '同步成功',
          icon: 'success'
        });
        
        // 刷新状态
        this.loadServerStatus();
        
      } else {
        wx.showModal({
          title: '同步失败',
          content: result.error || '未知错误',
          showCancel: false
        });
      }

    } catch (error) {
      wx.showModal({
        title: '同步失败',
        content: error.message || '网络错误',
        showCancel: false
      });
    } finally {
      wx.hideLoading();
      this.setData({ 
        syncing: false, 
        syncProgress: 0 
      });
    }
  },

  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认
    // 开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: '用于完善会员资料', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true
        })
      }
    })
  },

  clearData() {
    wx.showModal({
      title: '提示',
      content: '确定要清除所有数据吗？此操作不可逆。',
      success: (res) => {
        if (res.confirm) {
          DataManager.clearAllData();
          wx.showToast({ title: '数据已清除' });
          // 刷新页面数据
          this.loadFinancialData();
          this.loadServerStatus();
          // 返回首页并刷新
          wx.switchTab({ url: '/pages/index/index' });
        }
      }
    });
  }
})
