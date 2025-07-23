// pages/add-expense/add-expense.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  formSubmit: function (e) {
    const { item, amount } = e.detail.value;
    if (!item || !amount) {
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
      date: new Date().toISOString()
    });
    wx.setStorageSync('expenseList', expenseList);

    // 更新总支出
    const totalExpense = wx.getStorageSync('totalExpense') || 0;
    wx.setStorageSync('totalExpense', totalExpense + parseFloat(amount));

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