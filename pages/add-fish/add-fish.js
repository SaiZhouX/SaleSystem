// pages/add-fish/add-fish.js
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const wxbarcode = require('../../utils/wxbarcode.js');

Page({
  data: {
    date: '',
    price: '',
    photoPath: '',
    barcode: '',
    batch: ''
  },

  onLoad: function () {
    this.setData({
      date: util.formatTime(new Date()).split(' ')[0] // 默认当天日期
    });
  },

  bindDateChange: function (e) {
    this.setData({
      date: e.detail.value
    });
  },

  onLoad: function () {
    this.setData({
      date: util.formatTime(new Date()).split(' ')[0], // 默认当天日期
      batch: 'B' + new Date().getTime() // 生成批次号
    });
    this.generateBarcode();
  },

  takePhoto: function () {
    const that = this;
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['camera'],
      success(res) {
        // 保存图片到本地
        const tempFilePaths = res.tempFilePaths[0];
        that.setData({ photoPath: tempFilePaths });

        // 保存到相册
        wx.saveImageToPhotosAlbum({
          filePath: tempFilePaths,
          success() { wx.showToast({ title: '图片已保存' }) }
        });

        // 如果连接服务器，上传图片
        if (util.checkNetwork()) {
          that.uploadPhoto(tempFilePaths);
        }
      }
    });
  },

  uploadPhoto: function (filePath) {
    wx.uploadFile({
      url: api.uploadPhoto,
      filePath: filePath,
      name: 'photo',
      formData: { 'batch': this.data.batch },
      success(res) { console.log('图片上传成功', res) }
    });
  },

  generateBarcode: function () {
    const barcode = 'F' + new Date().getTime();
    this.setData({ barcode: barcode });

    // 生成条形码图片
    wxbarcode.barcode('barcode', barcode, 680, 200);

    // 如果连接服务器，上传条形码
    if (util.checkNetwork()) {
      this.uploadBarcode(barcode);
    }
  },

  uploadBarcode: function (barcode) {
    wx.request({
      url: api.uploadBarcode,
      method: 'POST',
      data: { batch: this.data.batch, barcode: barcode },
      success(res) { console.log('条形码上传成功', res) }
    });
  },

  formSubmit: function (e) {
    const { price, date } = e.detail.value;
    if (!price) {
      wx.showToast({
        title: '请填写单价',
        icon: 'none'
      });
      return;
    }

    const fishList = wx.getStorageSync('fishList') || [];
    const batch = 'B' + new Date().getTime(); // 生成批次号
    const uniqueId = 'F' + new Date().getTime(); // 生成唯一ID
    const newFish = {
      id: uniqueId,
      uniqueId: uniqueId,
      purchaseDate: date,
      purchasePrice: parseFloat(price),
      batch: this.data.batch,
      isSold: false,
      soldDate: null,
      soldPrice: null,
      photoPath: this.data.photoPath,
      barcode: this.data.barcode,
      statusLog: [{
        date: util.formatTime(new Date()),
        status: '健康',
        notes: '入库'
      }]
    };

    wx.request({
      url: api.addFish,
      method: 'POST',
      data: newFish,
      success: (res) => {
        console.log('上传成功', res.data);
        const updatedFishList = fishList.concat(newFish);
        wx.setStorageSync('fishList', updatedFishList);

        // 更新总支出
        const totalExpense = wx.getStorageSync('totalExpense') || 0;
        const newExpense = parseFloat(price) * parseInt(quantity);
        wx.setStorageSync('totalExpense', totalExpense + newExpense);

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
      },
      fail: (err) => {
        console.error('上传失败', err);
        // 网络失败，保存到本地
        const updatedFishList = fishList.concat(newFish);
        wx.setStorageSync('fishList', updatedFishList);

        // 更新总支出
        const totalExpense = wx.getStorageSync('totalExpense') || 0;
        const newExpense = parseFloat(price) * parseInt(quantity);
        wx.setStorageSync('totalExpense', totalExpense + newExpense);

        wx.showToast({
          title: '已离线保存',
          icon: 'none',
          duration: 2000,
          success: () => {
            setTimeout(() => {
              wx.switchTab({ url: '/pages/index/index' });
            }, 2000);
          }
        });
      }
    });
  }
});