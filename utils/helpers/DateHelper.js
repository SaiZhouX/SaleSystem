// utils/helpers/DateHelper.js
// 日期辅助工具类

class DateHelper {
  /**
   * 格式化日期为 YYYY-MM-DD 格式
   */
  static formatDate(date = new Date()) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    return date.toISOString().split('T')[0];
  }

  /**
   * 获取当前日期
   */
  static getCurrentDate() {
    return this.formatDate();
  }

  /**
   * 解析日期字符串
   */
  static parseDate(dateString) {
    if (!dateString) {
      return new Date('1970-01-01');
    }
    
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date('1970-01-01') : date;
  }

  /**
   * 格式化时间为完整格式
   */
  static formatDateTime(date = new Date()) {
    if (typeof date === 'string') {
      date = new Date(date);
    }
    
    if (isNaN(date.getTime())) {
      return '';
    }
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hour = date.getHours();
    const minute = date.getMinutes();
    const second = date.getSeconds();

    const formatNumber = n => n.toString().padStart(2, '0');

    return `${year}-${formatNumber(month)}-${formatNumber(day)} ${formatNumber(hour)}:${formatNumber(minute)}:${formatNumber(second)}`;
  }

  /**
   * 格式化显示日期（中文格式）
   */
  static formatDisplayDate(dateString) {
    if (!dateString) {
      return '未设置';
    }
    
    const date = this.parseDate(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return `${year}年${month}月${day}日`;
  }

  /**
   * 计算日期差（天数）
   */
  static getDaysDifference(startDate, endDate = new Date()) {
    const start = this.parseDate(startDate);
    const end = typeof endDate === 'string' ? this.parseDate(endDate) : endDate;
    
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  }

  /**
   * 检查日期是否为今天
   */
  static isToday(dateString) {
    const today = this.getCurrentDate();
    const checkDate = this.formatDate(dateString);
    return today === checkDate;
  }

  /**
   * 检查日期是否为本周
   */
  static isThisWeek(dateString) {
    const date = this.parseDate(dateString);
    const today = new Date();
    
    // 获取本周的开始日期（周一）
    const startOfWeek = new Date(today);
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);
    
    // 获取本周的结束日期（周日）
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    
    return date >= startOfWeek && date <= endOfWeek;
  }

  /**
   * 检查日期是否为本月
   */
  static isThisMonth(dateString) {
    const date = this.parseDate(dateString);
    const today = new Date();
    
    return date.getFullYear() === today.getFullYear() && 
           date.getMonth() === today.getMonth();
  }

  /**
   * 获取日期范围内的所有日期
   */
  static getDateRange(startDate, endDate) {
    const dates = [];
    const start = this.parseDate(startDate);
    const end = this.parseDate(endDate);
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      dates.push(this.formatDate(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  }

  /**
   * 获取相对时间描述
   */
  static getRelativeTime(dateString) {
    const date = this.parseDate(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) {
      return '今天';
    } else if (diffDays === 1) {
      return '昨天';
    } else if (diffDays === 2) {
      return '前天';
    } else if (diffDays < 7) {
      return `${diffDays}天前`;
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7);
      return `${weeks}周前`;
    } else if (diffDays < 365) {
      const months = Math.floor(diffDays / 30);
      return `${months}个月前`;
    } else {
      const years = Math.floor(diffDays / 365);
      return `${years}年前`;
    }
  }

  /**
   * 验证日期格式
   */
  static isValidDate(dateString) {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }

  /**
   * 获取月份的第一天
   */
  static getFirstDayOfMonth(year, month) {
    return this.formatDate(new Date(year, month - 1, 1));
  }

  /**
   * 获取月份的最后一天
   */
  static getLastDayOfMonth(year, month) {
    return this.formatDate(new Date(year, month, 0));
  }

  /**
   * 获取本月的第一天和最后一天
   */
  static getCurrentMonthRange() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    return {
      start: this.getFirstDayOfMonth(year, month),
      end: this.getLastDayOfMonth(year, month)
    };
  }

  /**
   * 根据状态对鱼列表进行日期排序
   */
  static sortFishByDate(fishList, status) {
    const { APP_CONFIG } = require('../constants/AppConstants.js');
    
    return fishList.sort((a, b) => {
      let dateA, dateB;
      
      switch (status) {
        case APP_CONFIG.FISH_STATUS.SOLD:
          // 已出售按销售日期降序
          dateA = this.parseDate(a.soldDate);
          dateB = this.parseDate(b.soldDate);
          break;
        case APP_CONFIG.FISH_STATUS.DEAD:
          // 死亡按死亡日期降序
          dateA = this.parseDate(a.deadDate);
          dateB = this.parseDate(b.deadDate);
          break;
        default:
          // 未出售按进货日期降序
          dateA = this.parseDate(a.purchase_date || a.purchaseDate);
          dateB = this.parseDate(b.purchase_date || b.purchaseDate);
          break;
      }
      
      return dateB.getTime() - dateA.getTime(); // 降序排列
    });
  }
}

module.exports = DateHelper;