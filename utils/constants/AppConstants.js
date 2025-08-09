// utils/constants/AppConstants.js
// 应用常量配置

const APP_CONFIG = {
  // API配置
  API_BASE_URL: 'http://localhost:8080/api',
  
  // 本地存储键名
  STORAGE_KEYS: {
    FISH_LIST: 'fishList',
    TOTAL_INCOME: 'totalIncome',
    TOTAL_EXPENSE: 'totalExpense',
    EXPENSE_LIST: 'expenseList',
    SERVER_CONNECTION_STATUS: 'serverConnectionStatus',
    LAST_SYNC_TIME: 'lastSyncTime',
    FINANCIAL_SYNC_STATUS: 'financialSyncStatus'
  },
  
  // 鱼的状态
  FISH_STATUS: {
    INSTOCK: 'instock',    // 未出售
    SOLD: 'sold',          // 已出售
    DEAD: 'dead'           // 死亡
  },
  
  // 状态显示文本
  STATUS_TEXT: {
    instock: '未出售',
    sold: '已出售',
    dead: '死亡'
  },
  
  // 状态颜色
  STATUS_COLORS: {
    instock: '#3498db',    // 蓝色
    sold: '#1aad19',       // 绿色
    dead: '#e74c3c'        // 红色
  },
  
  // 条形码配置（保持向后兼容）
  BARCODE_CONFIG: {
    WIDTH: 300,
    HEIGHT: 80,
    LENGTH: 12
  },
  
  // QR码配置
  QRCODE_CONFIG: {
    SIZE: 280,
    ONLINE_SIZE: 200
  },
  
  // 照片配置
  PHOTO_CONFIG: {
    COUNT: 1,
    SIZE_TYPE: ['compressed'],
    SOURCE_TYPE: ['camera', 'album']
  },
  
  // 表单验证规则
  VALIDATION: {
    PRICE: {
      MIN: 0.01,
      MAX: 99999.99
    },
    QUANTITY: {
      MIN: 1,
      MAX: 9999
    }
  }
};

module.exports = {
  APP_CONFIG
};