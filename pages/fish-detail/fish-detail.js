// pages/fish-detail/fish-detail.js
const util = require('../../utils/util.js');
const wxbarcode = require('../../utils/wxbarcode.js');
const api = require('../../utils/api.js');

Page({
  data: {
    fishInfo: null
  },

  // 获取状态显示文本
  getStatusText: function(status) {
    const statusMap = {
      'instock': '未出售',
      'sold': '已售出', 
      'dead': '死亡'
    };
    return statusMap[status || 'instock'] || '未出售';
  },

  onLoad: function (options) {
    const fishId = options.id;
    this.loadLocalData(fishId);
  },

  loadLocalData: function(id) {
    const fishList = wx.getStorageSync('fishList') || [];
    const fishInfo = fishList.find(f => f.id === id);

    if (fishInfo) {
      this.setData({
        fishInfo: fishInfo
      }, () => {
        // 生成条形码
        if (this.data.fishInfo && this.data.fishInfo.barcode) {
          wx.nextTick(() => {
            try {
              const barcodeData = this.data.fishInfo.barcode;
              console.log('生成条形码，数据:', barcodeData);
              wxbarcode.barcode('barcode', barcodeData, 300, 80);
            } catch (e) {
              console.error('条形码生成失败:', e);
              // 如果条形码生成失败，显示条形码字符串作为备选
              this.setData({
                barcodeError: true
              });
            }
          });
        }
      });
    } else {
      wx.showToast({
        title: '未找到该鱼的信息',
        icon: 'none'
      });
      wx.navigateBack();
    }
  },

  takePhoto: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera', 'album'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        
        // 先保存到本地存储
        let fishList = wx.getStorageSync('fishList') || [];
        const fishIndex = fishList.findIndex(fish => fish.id === this.data.fishInfo.id);

        if (fishIndex > -1) {
          fishList[fishIndex].photoPath = tempFilePath;
          fishList[fishIndex].photoUploadStatus = 'pending'; // 标记为待上传
          wx.setStorageSync('fishList', fishList);

          this.setData({
            'fishInfo.photoPath': tempFilePath
          });

          wx.showToast({ title: '照片已保存', icon: 'success' });

          // 尝试上传到服务器
          this.uploadPhoto(tempFilePath, fishIndex);
        }
      },
      fail: (err) => {
        console.error('选择照片失败:', err);
        wx.showToast({
          title: '选择照片失败',
          icon: 'none'
        });
      }
    });
  },

  uploadPhoto: function(filePath, fishIndex) {
    // 检查网络状态
    wx.getNetworkType({
      success: (res) => {
        if (res.networkType === 'none') {
          console.log('无网络连接，照片将在网络恢复后上传');
          return;
        }

        // 上传到服务器
        wx.uploadFile({
          url: api.uploadPhoto,
          filePath: filePath,
          name: 'photo',
          formData: {
            fishId: this.data.fishInfo.id
          },
          success: (uploadRes) => {
            try {
              const result = JSON.parse(uploadRes.data);
              if (result.success) {
                // 上传成功，更新本地存储
                let fishList = wx.getStorageSync('fishList') || [];
                if (fishList[fishIndex]) {
                  fishList[fishIndex].photoPath = result.url;
                  fishList[fishIndex].photoUploadStatus = 'success';
                  wx.setStorageSync('fishList', fishList);
                  
                  this.setData({
                    'fishInfo.photoPath': result.url
                  });
                  
                  console.log('照片上传成功');
                }
              }
            } catch (e) {
              console.error('解析上传结果失败:', e);
            }
          },
          fail: (err) => {
            console.error('照片上传失败:', err);
            // 上传失败，保持本地照片，标记为上传失败
            let fishList = wx.getStorageSync('fishList') || [];
            if (fishList[fishIndex]) {
              fishList[fishIndex].photoUploadStatus = 'failed';
              wx.setStorageSync('fishList', fishList);
            }
          }
        });
      }
    });
  },

  previewPhoto: function() {
    if (this.data.fishInfo.photoPath) {
      wx.previewImage({
        urls: [this.data.fishInfo.photoPath],
        current: this.data.fishInfo.photoPath
      });
    }
  },

  sellFish: function() {
    wx.showModal({
      title: '输入销售价格',
      editable: true,
      placeholderText: '请输入销售价格',
      success: (res) => {
        if (res.confirm && res.content) {
          const soldPrice = parseFloat(res.content);
          if (isNaN(soldPrice) || soldPrice <= 0) {
            wx.showToast({ title: '请输入有效的价格', icon: 'none' });
            return;
          }

          let fishList = wx.getStorageSync('fishList') || [];
          const fishIndex = fishList.findIndex(fish => fish.id === this.data.fishInfo.id);

          if (fishIndex > -1) {
            const currentDate = new Date().toISOString().split('T')[0];
            
            // 更新鱼的状态为已售出
            fishList[fishIndex].status = 'sold';
            fishList[fishIndex].isSold = true; // 保持向后兼容
            fishList[fishIndex].soldDate = currentDate;
            fishList[fishIndex].soldPrice = soldPrice;

            wx.setStorageSync('fishList', fishList);

            // 更新总收入
            const totalIncome = wx.getStorageSync('totalIncome') || 0;
            wx.setStorageSync('totalIncome', totalIncome + soldPrice);

            this.setData({ fishInfo: fishList[fishIndex] });

            wx.showToast({ 
              title: '标记为已售出', 
              icon: 'success',
              success: () => {
                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              }
            });
          }
        }
      }
    });
  },

  markAsDead: function() {
    wx.showModal({
      title: '确认标记',
      content: '确定要将此鱼标记为死亡吗？此操作不可撤销。',
      success: (res) => {
        if (res.confirm) {
          let fishList = wx.getStorageSync('fishList') || [];
          const fishIndex = fishList.findIndex(fish => fish.id === this.data.fishInfo.id);

          if (fishIndex > -1) {
            const currentDate = new Date().toISOString().split('T')[0];
            
            // 更新鱼的状态为死亡
            fishList[fishIndex].status = 'dead';
            fishList[fishIndex].deadDate = currentDate;
            fishList[fishIndex].isSold = false; // 确保不被计算为销售

            wx.setStorageSync('fishList', fishList);

            this.setData({ fishInfo: fishList[fishIndex] });

            wx.showToast({ 
              title: '已标记为死亡', 
              icon: 'none',
              success: () => {
                setTimeout(() => {
                  wx.navigateBack();
                }, 1500);
              }
            });
          }
        }
      }
    });
  }
});
