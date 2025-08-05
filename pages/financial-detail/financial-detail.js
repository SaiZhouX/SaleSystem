// pages/financial-detail/financial-detail.js
const DataManager = require('../../utils/managers/DataManager.js');
const DateHelper = require('../../utils/helpers/DateHelper.js');

Page({
  data: {
    type: '', // 'income' 或 'expense'
    title: '',
    totalAmount: 0,
    detailList: [],
    isEmpty: false
  },

  onLoad(options) {
    const type = options.type || 'income';
    this.setData({
      type: type,
      title: type === 'income' ? '收入详情' : '支出详情'
    });
    
    // 设置导航栏标题
    wx.setNavigationBarTitle({
      title: this.data.title
    });
    
    this.loadFinancialData();
  },

  /**
   * 加载财务数据
   */
  loadFinancialData() {
    const { type } = this.data;
    
    if (type === 'income') {
      this.loadIncomeData();
    } else {
      this.loadExpenseData();
    }
  },

  /**
   * 加载收入数据
   */
  loadIncomeData() {
    const fishList = DataManager.getFishList();
    const soldFishList = fishList.filter(fish => fish.status === 'sold' && fish.soldPrice);
    
    const incomeList = soldFishList.map(fish => ({
      id: fish.id,
      item: `鱼类销售 (ID: ${fish.id})`,
      amount: parseFloat(fish.soldPrice) || 0,
      date: fish.soldDate || '未知日期',
      type: 'income',
      description: `进货价: ¥${fish.purchasePrice || 0}, 售价: ¥${fish.soldPrice || 0}`
    }));

    // 按日期排序（最新的在前）
    incomeList.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalAmount = incomeList.reduce((sum, item) => sum + item.amount, 0);

    this.setData({
      detailList: incomeList,
      totalAmount: totalAmount.toFixed(2),
      isEmpty: incomeList.length === 0
    });
  },

  /**
   * 加载支出数据
   */
  loadExpenseData() {
    const financialSummary = DataManager.getFinancialSummary();
    const expenseList = financialSummary.expenseList || [];
    
    // 转换支出数据格式
    const formattedExpenseList = expenseList.map((expense, index) => ({
      id: `expense_${index}`,
      item: expense.item || '鱼进货',
      amount: parseFloat(expense.total || expense.amount) || 0,
      date: expense.date || '未知日期',
      type: 'expense',
      description: expense.quantity > 1 ? 
        `数量: ${expense.quantity}, 单价: ¥${expense.amount}` : 
        `单价: ¥${expense.amount}`
    }));

    // 按日期排序（最新的在前）
    formattedExpenseList.sort((a, b) => new Date(b.date) - new Date(a.date));

    const totalAmount = formattedExpenseList.reduce((sum, item) => sum + item.amount, 0);

    this.setData({
      detailList: formattedExpenseList,
      totalAmount: totalAmount.toFixed(2),
      isEmpty: formattedExpenseList.length === 0
    });
  },

  /**
   * 点击详情项
   */
  onItemTap(e) {
    const item = e.currentTarget.dataset.item;
    
    if (item.type === 'income' && item.id) {
      // 如果是收入项，跳转到对应的鱼详情页面
      wx.navigateTo({
        url: `/pages/fish-detail/fish-detail?id=${item.id}`
      });
    } else {
      // 显示详细信息
      wx.showModal({
        title: '详细信息',
        content: `项目: ${item.item}\n金额: ¥${item.amount}\n日期: ${item.date}\n${item.description}`,
        showCancel: false
      });
    }
  },

  /**
   * 刷新数据
   */
  onRefresh() {
    this.loadFinancialData();
    wx.showToast({
      title: '数据已刷新',
      icon: 'success'
    });
  }
});