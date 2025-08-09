// utils/managers/DataManager.js
// 统一的数据管理工具类

const { APP_CONFIG } = require('../constants/AppConstants.js');

class DataManager {
  /**
   * 获取鱼信息列表
   */
  static getFishList() {
    return wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.FISH_LIST) || [];
  }

  /**
   * 保存鱼信息列表
   */
  static saveFishList(fishList) {
    wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.FISH_LIST, fishList);
  }

  /**
   * 添加单条鱼信息
   */
  static addFish(fishData) {
    const fishList = this.getFishList();
    
    // 确保新数据有同步标记
    const fishWithSyncInfo = {
      ...fishData,
      needsSync: true,
      lastModified: Date.now()
    };
    
    fishList.push(fishWithSyncInfo);
    this.saveFishList(fishList);
    
    // 同步更新支出记录
    this.updateExpense(fishData.purchasePrice, fishData.purchase_date, '鱼进货');
    
    // 标记财务数据需要同步
    this.markFinancialDataForSync();
    
    return fishWithSyncInfo;
  }

  /**
   * 批量添加鱼信息
   */
  static addFishBatch(fishDataList) {
    const fishList = this.getFishList();
    fishList.push(...fishDataList);
    this.saveFishList(fishList);
    
    // 计算总支出
    const totalAmount = fishDataList.reduce((sum, fish) => sum + fish.purchasePrice, 0);
    const quantity = fishDataList.length;
    const avgPrice = totalAmount / quantity;
    
    // 同步更新支出记录
    this.updateExpense(avgPrice, fishDataList[0].purchase_date, '鱼进货(批量)', quantity, totalAmount);
    
    return fishDataList;
  }


  /**
   * 根据ID获取鱼信息
   */
  static getFishById(fishId) {
    const fishList = this.getFishList();
    return fishList.find(fish => fish.id === fishId);
  }

  /**
   * 更新支出记录
   */
  static updateExpense(amount, date, item = '鱼进货', quantity = 1, total = null) {
    const expenseList = wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.EXPENSE_LIST) || [];
    
    const expenseRecord = {
      item,
      amount,
      quantity,
      total: total || (amount * quantity),
      date
    };
    
    expenseList.push(expenseRecord);
    wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.EXPENSE_LIST, expenseList);
    
    // 更新总支出
    const totalExpense = wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.TOTAL_EXPENSE) || 0;
    wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.TOTAL_EXPENSE, totalExpense + expenseRecord.total);
  }

  /**
   * 更新收入记录
   */
  static updateIncome(amount) {
    const totalIncome = wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.TOTAL_INCOME) || 0;
    wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.TOTAL_INCOME, totalIncome + amount);
  }

  /**
   * 获取财务汇总信息
   */
  static getFinancialSummary() {
    return {
      totalIncome: wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.TOTAL_INCOME) || 0,
      totalExpense: wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.TOTAL_EXPENSE) || 0,
      expenseList: wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.EXPENSE_LIST) || []
    };
  }

  /**
   * 清除所有数据
   */
  static clearAllData() {
    wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.FISH_LIST, []);
    wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.TOTAL_INCOME, 0);
    wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.TOTAL_EXPENSE, 0);
    wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.EXPENSE_LIST, []);
  }

  /**
   * 数据兼容性处理
   */
  static processDataCompatibility(fishList) {
    return fishList.map(item => ({
      ...item,
      purchase_date: item.purchase_date || item.purchaseDate || '',
      status: item.status || (item.isSold ? APP_CONFIG.FISH_STATUS.SOLD : APP_CONFIG.FISH_STATUS.INSTOCK)
    }));
  }

  /**
   * 生成唯一ID
   */
  static generateFishId() {
    return Math.random().toString(36).substr(2, 10) + Date.now().toString(36);
  }

  /**
   * 生成批次号
   */
  static generateBatchNumber() {
    return 'B' + Date.now().toString(36).substr(2, 6);
  }

  /**
   * 处理API数据（兼容性处理）
   */
  static processApiData(data) {
    if (!Array.isArray(data)) {
      return [];
    }
    
    return data.map(item => ({
      ...item,
      purchase_date: item.purchase_date || item.purchaseDate || '',
      status: item.status || (item.isSold ? APP_CONFIG.FISH_STATUS.SOLD : APP_CONFIG.FISH_STATUS.INSTOCK)
    }));
  }

  /**
   * 获取汇总数据
   */
  static getSummary() {
    return {
      totalIncome: wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.TOTAL_INCOME) || 0,
      totalExpense: wx.getStorageSync(APP_CONFIG.STORAGE_KEYS.TOTAL_EXPENSE) || 0
    };
  }

  /**
   * 标记财务数据需要同步
   */
  static markFinancialDataForSync() {
    const currentFinancial = this.getFinancialSummary();
    const financialSyncStatus = {
      ...currentFinancial,
      needsSync: true,
      lastModified: Date.now()
    };
    wx.setStorageSync(APP_CONFIG.STORAGE_KEYS.FINANCIAL_SYNC_STATUS, financialSyncStatus);
  }

  /**
   * 更新鱼信息状态（添加同步标记）
   */
  static updateFishStatus(fishId, status, additionalData = {}) {
    const fishList = this.getFishList();
    const fishIndex = fishList.findIndex(fish => fish.id === fishId);
    
    if (fishIndex > -1) {
      fishList[fishIndex].status = status;
      fishList[fishIndex].needsSync = true;
      fishList[fishIndex].lastModified = Date.now();
      Object.assign(fishList[fishIndex], additionalData);
      
      // 如果是销售状态，更新收入
      if (status === APP_CONFIG.FISH_STATUS.SOLD && additionalData.soldPrice) {
        this.updateIncome(additionalData.soldPrice);
      }
      
      this.saveFishList(fishList);
      
      // 标记财务数据需要同步
      this.markFinancialDataForSync();
      
      return fishList[fishIndex];
    }
    
    return null;
  }
}

module.exports = DataManager;
