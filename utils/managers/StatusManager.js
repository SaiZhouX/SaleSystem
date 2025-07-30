// utils/managers/StatusManager.js
// 统一的状态管理工具类

const { APP_CONFIG } = require('../constants/AppConstants.js');

class StatusManager {
  /**
   * 获取状态显示文本
   */
  static getStatusText(status) {
    return APP_CONFIG.STATUS_TEXT[status] || APP_CONFIG.STATUS_TEXT.instock;
  }

  /**
   * 获取状态颜色
   */
  static getStatusColor(status) {
    return APP_CONFIG.STATUS_COLORS[status] || APP_CONFIG.STATUS_COLORS.instock;
  }

  /**
   * 获取状态CSS类名
   */
  static getStatusClass(status) {
    return `status-${status || APP_CONFIG.FISH_STATUS.INSTOCK}`;
  }

  /**
   * 验证状态是否有效
   */
  static isValidStatus(status) {
    return Object.values(APP_CONFIG.FISH_STATUS).includes(status);
  }

  /**
   * 获取所有可用状态
   */
  static getAllStatuses() {
    return [
      {
        key: APP_CONFIG.FISH_STATUS.INSTOCK,
        text: APP_CONFIG.STATUS_TEXT.instock,
        color: APP_CONFIG.STATUS_COLORS.instock
      },
      {
        key: APP_CONFIG.FISH_STATUS.SOLD,
        text: APP_CONFIG.STATUS_TEXT.sold,
        color: APP_CONFIG.STATUS_COLORS.sold
      },
      {
        key: APP_CONFIG.FISH_STATUS.DEAD,
        text: APP_CONFIG.STATUS_TEXT.dead,
        color: APP_CONFIG.STATUS_COLORS.dead
      }
    ];
  }

  /**
   * 过滤指定状态的鱼列表
   */
  static filterFishByStatus(fishList, status) {
    return fishList.filter(fish => {
      const fishStatus = fish.status || (fish.isSold ? APP_CONFIG.FISH_STATUS.SOLD : APP_CONFIG.FISH_STATUS.INSTOCK);
      return fishStatus === status;
    });
  }

  /**
   * 按状态排序鱼列表
   */
  static sortFishByStatus(fishList, status) {
    return fishList.sort((a, b) => {
      let dateA, dateB;
      
      switch (status) {
        case APP_CONFIG.FISH_STATUS.SOLD:
          // 已出售按销售日期降序
          dateA = new Date(a.soldDate || '1970-01-01');
          dateB = new Date(b.soldDate || '1970-01-01');
          break;
        case APP_CONFIG.FISH_STATUS.DEAD:
          // 死亡按死亡日期降序
          dateA = new Date(a.deadDate || '1970-01-01');
          dateB = new Date(b.deadDate || '1970-01-01');
          break;
        default:
          // 未出售按进货日期降序
          dateA = new Date(a.purchase_date || a.purchaseDate || '1970-01-01');
          dateB = new Date(b.purchase_date || b.purchaseDate || '1970-01-01');
          break;
      }
      
      return dateB - dateA; // 降序排列
    });
  }

  /**
   * 过滤并排序鱼列表
   */
  static filterAndSortFish(fishList, status) {
    const filteredList = this.filterFishByStatus(fishList, status);
    return this.sortFishByStatus(filteredList, status);
  }

  /**
   * 获取状态统计信息
   */
  static getStatusStatistics(fishList) {
    const stats = {
      [APP_CONFIG.FISH_STATUS.INSTOCK]: 0,
      [APP_CONFIG.FISH_STATUS.SOLD]: 0,
      [APP_CONFIG.FISH_STATUS.DEAD]: 0,
      total: fishList.length
    };

    fishList.forEach(fish => {
      const status = fish.status || (fish.isSold ? APP_CONFIG.FISH_STATUS.SOLD : APP_CONFIG.FISH_STATUS.INSTOCK);
      if (stats.hasOwnProperty(status)) {
        stats[status]++;
      }
    });

    return stats;
  }

  /**
   * 获取状态对应的日期字段名
   */
  static getDateFieldByStatus(status) {
    switch (status) {
      case APP_CONFIG.FISH_STATUS.SOLD:
        return 'soldDate';
      case APP_CONFIG.FISH_STATUS.DEAD:
        return 'deadDate';
      default:
        return 'purchase_date';
    }
  }

  /**
   * 获取状态对应的日期显示文本
   */
  static getDateLabelByStatus(status) {
    switch (status) {
      case APP_CONFIG.FISH_STATUS.SOLD:
        return '销售日期';
      case APP_CONFIG.FISH_STATUS.DEAD:
        return '死亡日期';
      default:
        return '进货日期';
    }
  }

  /**
   * 处理状态变更
   */
  static handleStatusChange(fishId, newStatus, additionalData = {}) {
    const DataManager = require('./DataManager.js');
    
    // 验证状态
    if (!this.isValidStatus(newStatus)) {
      return { success: false, error: '无效的状态' };
    }

    // 准备更新数据
    const updateData = { ...additionalData };
    const currentDate = new Date().toISOString().split('T')[0];

    switch (newStatus) {
      case APP_CONFIG.FISH_STATUS.SOLD:
        updateData.soldDate = currentDate;
        updateData.isSold = true; // 保持向后兼容
        break;
      case APP_CONFIG.FISH_STATUS.DEAD:
        updateData.deadDate = currentDate;
        updateData.isSold = false; // 确保不被计算为销售
        break;
      case APP_CONFIG.FISH_STATUS.INSTOCK:
        updateData.isSold = false;
        break;
    }

    // 更新数据
    const updatedFish = DataManager.updateFishStatus(fishId, newStatus, updateData);
    
    if (updatedFish) {
      return { success: true, fish: updatedFish };
    } else {
      return { success: false, error: '未找到对应的鱼信息' };
    }
  }
}

module.exports = StatusManager;