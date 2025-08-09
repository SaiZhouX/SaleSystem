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
  },
  
  // UI配置
  UI_CONFIG: {
    TOAST_DURATION: {
      SHORT: 1500,
      NORMAL: 2000,
      LONG: 3000
    },
    LOADING_TIMEOUT: 10000,
    NAVIGATION_DELAY: 1500
  },
  
  // QR码在线服务配置
  QRCODE_SERVICE: {
    PRIMARY_URL: 'https://api.qrserver.com/v1/create-qr-code/',
    BACKUP_URL: 'https://chart.googleapis.com/chart?chs={size}x{size}&cht=qr&chl=',
    DEFAULT_SIZE: 300,
    MAX_SIZE: 500,
    MIN_SIZE: 100
  },
  
  // 错误消息
  ERROR_MESSAGES: {
    NETWORK_ERROR: '网络连接失败',
    NETWORK_TIMEOUT: '网络超时，请检查网络连接',
    DATA_NOT_FOUND: '数据不存在',
    VALIDATION_FAILED: '数据验证失败',
    OPERATION_FAILED: '操作失败',
    PERMISSION_DENIED: '权限不足',
    QRCODE_LOAD_FAILED: 'QR码加载失败',
    PHOTO_FAILED: '照片处理失败'
  },
  
  // 成功消息
  SUCCESS_MESSAGES: {
    ADD_SUCCESS: '添加成功',
    UPDATE_SUCCESS: '更新成功',
    DELETE_SUCCESS: '删除成功',
    SYNC_SUCCESS: '同步成功',
    SAVE_SUCCESS: '保存成功',
    SELL_SUCCESS: '标记为已出售',
    MARK_DEAD_SUCCESS: '已标记为死亡'
  }
};

module.exports = {
  APP_CONFIG
};