// utils/managers/ServerManager.js
// 服务器连接和数据同步管理工具类

const { APP_CONFIG } = require('../constants/AppConstants.js');
const api = require('../api.js');

class ServerManager {
  /**
   * 检测服务器连接状态
   */
  static checkServerConnection() {
    return new Promise((resolve) => {
      // 检查网络状态
      wx.getNetworkType({
        success: (res) => {
          if (res.networkType === 'none') {
            resolve({
              connected: false,
              status: 'no_network',
              message: '无网络连接'
            });
            return;
          }

          // 尝试连接服务器
          wx.request({
            url: api.checkConnection || (api.baseUrl + '/health'),
            method: 'GET',
            timeout: 5000,
            success: (serverRes) => {
              if (serverRes.statusCode === 200) {
                resolve({
                  connected: true,
                  status: 'connected',
                  message: '服务器连接正常'
                });
              } else {
                resolve({
                  connected: false,
                  status: 'server_error',
                  message: '服务器响应异常'
                });
              }
            },
            fail: (error) => {
              resolve({
                connected: false,
                status: 'connection_failed',
                message: '无法连接到服务器'
              });
            }
          });
        },
        fail: () => {
          resolve({
            connected: false,
            status: 'network_check_failed',
            message: '网络状态检查失败'
          });
        }
      });
    });
  }

  /**
   * 获取连接状态（从缓存）
   */
  static getConnectionStatus() {
    const status = wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.SERVER_CONNECTION_STATUS) || {
      connected: false,
      status: 'unknown',
      message: '未检测',
      lastCheck: null
    };
    return status;
  }

  /**
   * 保存连接状态
   */
  static saveConnectionStatus(status) {
    const statusWithTime = {
      ...status,
      lastCheck: Date.now()
    };
    wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.SERVER_CONNECTION_STATUS, statusWithTime);
    return statusWithTime;
  }

  /**
   * 获取待同步数据数量
   */
  static getPendingSyncCount() {
    const DataManager = require('./DataManager.js');
    const fishList = DataManager.getFishList();
    
    // 统计需要同步的鱼信息
    const pendingFish = fishList.filter(fish => fish.needsSync === true).length;
    
    // 检查财务数据是否需要同步
    const financialSyncStatus = wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.FINANCIAL_SYNC_STATUS) || {};
    const hasFinancialChanges = financialSyncStatus.needsSync === true;
    
    // 如果有鱼数据需要同步，财务数据会一起同步，不重复计算
    // 只有当没有鱼数据但有独立的财务变更时，才单独计算财务数据
    const pendingFinancial = (pendingFish === 0 && hasFinancialChanges) ? 1 : 0;
    
    return {
      total: pendingFish + pendingFinancial,
      fish: pendingFish,
      financial: hasFinancialChanges ? 1 : 0
    };
  }

  /**
   * 获取最后同步时间
   */
  static getLastSyncTime() {
    return wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.LAST_SYNC_TIME) || null;
  }

  /**
   * 上传所有数据到服务器
   */
  static async syncAllDataToServer() {
    try {
      // 1. 检查服务器连接
      const connectionStatus = await this.checkServerConnection();
      if (!connectionStatus.connected) {
        return {
          success: false,
          error: connectionStatus.message
        };
      }

      const DataManager = require('./DataManager.js');
      
      // 2. 准备同步数据
      const fishList = DataManager.getFishList();
      const financialData = DataManager.getFinancialSummary();
      
      const syncData = {
        fishList: fishList,
        totalIncome: financialData.totalIncome,
        totalExpense: financialData.totalExpense,
        expenseList: financialData.expenseList,
        syncTime: Date.now()
      };

      // 3. 上传数据到服务器
      const uploadResult = await this.uploadDataToServer(syncData);
      
      if (uploadResult.success) {
        // 4. 标记数据为已同步
        this.markDataAsSynced();
        
        // 5. 保存同步时间
        wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.LAST_SYNC_TIME, Date.now());
        
        return {
          success: true,
          message: '数据同步成功',
          syncCount: syncData.fishList.length
        };
      } else {
        return {
          success: false,
          error: uploadResult.error
        };
      }

    } catch (error) {
      console.error('数据同步失败:', error);
      return {
        success: false,
        error: error.message || '同步过程中发生错误'
      };
    }
  }

  /**
   * 上传数据到服务器
   */
  static uploadDataToServer(data) {
    return new Promise((resolve) => {
      wx.request({
        url: api.syncAllData || (api.baseUrl + '/sync'),
        method: 'POST',
        data: data,
        success: (res) => {
          if (res.statusCode === 200 && res.data.success) {
            resolve({
              success: true,
              data: res.data
            });
          } else {
            resolve({
              success: false,
              error: res.data.message || '服务器返回错误'
            });
          }
        },
        fail: (error) => {
          resolve({
            success: false,
            error: error.errMsg || '网络请求失败'
          });
        }
      });
    });
  }

  /**
   * 标记所有数据为已同步
   */
  static markDataAsSynced() {
    const DataManager = require('./DataManager.js');
    
    // 标记鱼信息为已同步
    const fishList = DataManager.getFishList();
    const updatedFishList = fishList.map(fish => ({
      ...fish,
      needsSync: false,
      lastSynced: Date.now()
    }));
    DataManager.saveFishList(updatedFishList);
    
    // 标记财务数据为已同步
    const currentFinancial = DataManager.getFinancialSummary();
    wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.FINANCIAL_SYNC_STATUS, {
      ...currentFinancial,
      needsSync: false,
      lastSynced: Date.now()
    });
  }

  /**
   * 监听网络状态变化
   */
  static watchNetworkStatus(callback) {
    wx.onNetworkStatusChange((res) => {
      if (callback && typeof callback === 'function') {
        callback({
          isConnected: res.isConnected,
          networkType: res.networkType
        });
      }
    });
  }

  /**
   * 获取同步状态摘要
   */
  static getSyncStatusSummary() {
    const connectionStatus = this.getConnectionStatus();
    const pendingCount = this.getPendingSyncCount();
    const lastSyncTime = this.getLastSyncTime();
    
    return {
      serverConnected: connectionStatus.connected,
      serverStatus: connectionStatus.status,
      serverMessage: connectionStatus.message,
      pendingCount: pendingCount.total,
      pendingDetails: pendingCount,
      lastSyncTime: lastSyncTime,
      lastSyncFormatted: lastSyncTime ? this.formatSyncTime(lastSyncTime) : '从未同步'
    };
  }

  /**
   * 格式化同步时间
   */
  static formatSyncTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) {
      return '刚刚';
    } else if (diffMins < 60) {
      return `${diffMins}分钟前`;
    } else if (diffHours < 24) {
      return `${diffHours}小时前`;
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else {
      return date.toLocaleDateString('zh-CN');
    }
  }
}

module.exports = ServerManager;