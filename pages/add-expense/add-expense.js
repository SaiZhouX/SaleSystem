// pages/add-expense/add-expense.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    dateValue: new Date().toISOString().split('T')[0],
    expenseItems: ['瓶子', '饲料'],
    selectedItemIndex: 0
  },

  onLoad() {
    // 设置默认日期为今天
    const today = new Date().toISOString().split('T')[0];
    this.setData({
      dateValue: today
    });
  },

  bindItemChange: function(e) {
    this.setData({
      selectedItemIndex: e.detail.value
    });
  },

  bindDateChange: function(e) {
    this.setData({
      dateValue: e.detail.value
    });
  },

  formSubmit: function (e) {
    const { item: selectedIndex, amount, quantity } = e.detail.value;
    const item = this.data.expenseItems[selectedIndex];
    const date = this.data.dateValue;
    const qty = quantity ? parseInt(quantity) : 1;
    if (!item || !amount || !date) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    const expenseList = wx.getStorageSync('expenseList') || [];
    expenseList.push({
      item: item,
      amount: parseFloat(amount),
      quantity: qty,
      total: parseFloat(amount) * qty,
      date: date
    });
    wx.setStorageSync('expenseList', expenseList);

    // 更新总支出
    const totalExpense = wx.getStorageSync('totalExpense') || 0;
    wx.setStorageSync('totalExpense', totalExpense + parseFloat(amount) * qty);

    wx.showToast({
      title: '添加成功',
      icon: 'success',
      duration: 2000,
      success: () => {
        setTimeout(() => {
          wx.switchTab({ url: '/pages/index/index' });
        }, 2000);
      }
    });
  }
})