// pages/fish-detail/fish-detail.js
const util = require('../../utils/util.js');
const wxbarcode = require('../../utils/wxbarcode.js');
const api = require('../../utils/api.js');

Page({
  data: {
    fishInfo: null,
    newStatus: '健康',
    newNotes: '',
    statusOptions: ['健康', '生病', '死亡', '已售出']
  },

  onLoad: function (options) {
    const fishId = options.id;
    wx.request({
      url: api.getFishDetail(fishId),
      method: 'GET',
      success: (res) => {
        if (res.statusCode === 200 && res.data) {
          console.log('API返回的原始数据:', res.data);
          this.setData({
            fishInfo: res.data
          }, () => {
            console.log('setData回调中的fishInfo:', this.data.fishInfo);
            // 使用setData回调确保数据已更新
            if (this.data.fishInfo) {
              wx.nextTick(() => {
                console.log('完整fishInfo数据:', this.data.fishInfo);
                  const barcodeData = this.data.fishInfo.barcode || this.data.fishInfo.id;
                  console.log('条形码数据源:', {barcode: this.data.fishInfo.barcode, id: this.data.fishInfo.id, barcodeData});
                // 使用传统canvas API获取上下文
                  const ctx = wx.createCanvasContext('barcode');
                  console.log('传统API获取的上下文:', ctx);
                  console.log('上下文方法:', ctx ? Object.keys(ctx) : 'null');
                  if (ctx) {
                    wx.nextTick(() => {
                       console.log('beginPath方法存在性:', typeof ctx.beginPath);
                       // 尝试直接调用beginPath测试
                       try {
                         ctx.beginPath();
                         console.log('beginPath调用成功');
                         wxbarcode.upce(ctx, barcodeData.toString(), 400, 120);
                         ctx.draw();
                       } catch (e) {
                         console.error('调用beginPath失败:', e);
                         // 手动创建兼容层
                         const compatibleCtx = new Proxy(ctx, { 
                           get(target, prop) {
                             if (prop === 'beginPath') {
                               return () => target.rect(0,0,0,0); // 使用rect替代空beginPath
                             }
                             return target[prop];
                           }
                         });
                         wxbarcode.upce(compatibleCtx, barcodeData.toString(), 400, 120);
                         ctx.draw();
                       }
                     });
                  } else {
                    console.error('无法创建传统canvas上下文');
                  }
              });
            }
          });
          // 可选择性更新本地缓存
          const fishList = wx.getStorageSync('fishList') || [];
          const fishIndex = fishList.findIndex(f => f.id === fishId);
          if (fishIndex !== -1) {
            fishList[fishIndex] = res.data;
            wx.setStorageSync('fishList', fishList);
          }
        } else {
          this.loadLocalData(fishId);
        }
      },
      fail: (err) => {
        console.error('获取详情失败', err);
        this.loadLocalData(fishId);
      }
    });
  },

  loadLocalData: function(id) {
    const fishList = wx.getStorageSync('fishList') || [];
    const fishInfo = fishList.find(f => f.id === id);

    if (fishInfo) {
      this.setData({
        fishInfo: fishInfo
      }, () => {
        // 使用setData回调确保数据已更新
        if (this.data.fishInfo) {
          wx.nextTick(() => {
            const barcodeData = this.data.fishInfo.barcode || this.data.fishInfo.id;
              const ctx = wx.createCanvasContext('barcode');
              wxbarcode.upce(ctx, barcodeData.toString(), 300, 90);
          });
        }
      });
    } else {
      wx.showToast({
        title: '未找到该鱼的信息',
        icon: 'none'
      });
    }
  },

  bindStatusChange: function(e) {
    this.setData({
      newStatus: this.data.statusOptions[e.detail.value]
    });
  },

  notesInput: function(e) {
    this.setData({
      newNotes: e.detail.value
    });
  },

  addStatusLog: function() {
    if (!this.data.newNotes) {
      wx.showToast({ title: '请填写备注', icon: 'none' });
      return;
    }

    let fishList = wx.getStorageSync('fishList') || [];
    const fishIndex = fishList.findIndex(fish => fish.id === this.data.fishInfo.id);

    if (fishIndex > -1) {
      const newLog = {
        date: util.formatTime(new Date()),
        status: this.data.newStatus,
        notes: this.data.newNotes
      };
      fishList[fishIndex].statusLog.push(newLog);
      
      // 如果状态是“已售出”，则更新销售信息
      if (this.data.newStatus === '已售出') {
        this.sellFish(); // 调用单独的销售函数
        return; // sellFish会处理后续逻辑，这里直接返回
      }

      wx.setStorageSync('fishList', fishList);
      this.setData({
        'fishInfo.statusLog': fishList[fishIndex].statusLog,
        newNotes: ''
      });
      wx.showToast({ title: '状态已更新' });
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
          if (isNaN(soldPrice)) {
            wx.showToast({ title: '请输入有效的价格', icon: 'none' });
            return;
          }

          let fishList = wx.getStorageSync('fishList') || [];
          const fishIndex = fishList.findIndex(fish => fish.id === this.data.fishInfo.id);

          if (fishIndex > -1) {
            fishList[fishIndex].isSold = true;
            fishList[fishIndex].soldDate = util.formatTime(new Date()).split(' ')[0];
            fishList[fishIndex].soldPrice = soldPrice;
            fishList[fishIndex].statusLog.push({
              date: util.formatTime(new Date()),
              status: '已售出',
              notes: `以 ${soldPrice} 元售出`
            });

            wx.setStorageSync('fishList', fishList);

            // 更新总收入
            const totalIncome = wx.getStorageSync('totalIncome') || 0;
            wx.setStorageSync('totalIncome', totalIncome + soldPrice);

            this.setData({ fishInfo: fishList[fishIndex] });

            wx.showToast({ title: '标记成功' });
          }
        }
      }
    });
  },

  scanCode: function() {
    wx.scanCode({
      success: (res) => {
        console.log(res)
        // 这里可以根据扫描到的条形码内容（res.result）来查找对应的鱼
        // 由于我们没有实际的条形码生成和扫描硬件，这里仅作演示
        wx.showToast({
          title: '扫码成功: ' + res.result,
          icon: 'none'
        })
      }
    })
  },

  takePhoto: function() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['camera'],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];

        wx.uploadFile({
          url: api.uploadFile, // a new api endpoint for file upload
          filePath: tempFilePath,
          name: 'file',
          success: (uploadRes) => {
            const photoPath = JSON.parse(uploadRes.data).url;
            let fishList = wx.getStorageSync('fishList') || [];
            const fishIndex = fishList.findIndex(fish => fish.id === this.data.fishInfo.id);

            if (fishIndex > -1) {
              fishList[fishIndex].photoPath = photoPath;
              wx.setStorageSync('fishList', fishList);

              this.setData({
                'fishInfo.photoPath': photoPath
              });

              // Update server data
              wx.request({
                url: api.updateFish(this.data.fishInfo.id),
                method: 'PUT',
                data: fishList[fishIndex],
                success: () => wx.showToast({ title: '照片上传成功' }),
                fail: () => wx.showToast({ title: '照片上传失败', icon: 'none' })
              });
            }
          },
          fail: (err) => {
            console.error('上传失败', err);
            wx.showToast({
              title: '照片上传失败',
              icon: 'none'
            });
          }
        });
      }
    });
  },

  generateBarcode: function() {
    const fishId = this.data.fishInfo.id;
    barcode.code128(wx.createCanvasContext('barcode'), fishId, 300, 150);

    // 把canvas转换成图片
    setTimeout(() => {
      wx.canvasToTempFilePath({
        canvasId: 'barcode',
        success: (res) => {
          const tempFilePath = res.tempFilePath;

          wx.uploadFile({
            url: api.uploadFile,
            filePath: tempFilePath,
            name: 'file',
            success: (uploadRes) => {
              const barcodePath = JSON.parse(uploadRes.data).url;
              let fishList = wx.getStorageSync('fishList') || [];
              const fishIndex = fishList.findIndex(f => f.id === this.data.fishInfo.id);

              if (fishIndex > -1) {
                fishList[fishIndex].barcode = barcodePath;
                wx.setStorageSync('fishList', fishList);

                this.setData({
                  'fishInfo.barcode': barcodePath
                });

                // Update server data
                wx.request({
                  url: api.updateFish(this.data.fishInfo.id),
                  method: 'PUT',
                  data: fishList[fishIndex],
                  success: () => wx.showToast({ title: '条形码上传成功' }),
                  fail: () => wx.showToast({ title: '条形码上传失败', icon: 'none' })
                });
              }
            },
            fail: (err) => {
              console.error('上传失败', err);
              wx.showToast({
                title: '条形码上传失败',
                icon: 'none'
              });
            }
          });
        },
        fail: (err) => {
          console.error(err);
          wx.showToast({
            title: '条形码生成失败',
            icon: 'none'
          });
        }
      }, this);
    }, 500); // 延迟确保canvas绘制完成
  }
});