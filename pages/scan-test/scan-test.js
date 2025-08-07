const QRCodeManager = require('../../utils/managers/QRCodeManager');
const { drawQRCodeOnCanvas } = require('../../utils/qrcode-generator');

Page({
  data: {
    scanResult: '',
    showQRCode: false,
    qrcodeImageUrl: ''
  },

  onLoad: function (options) {
    console.log('扫码测试页面加载');
  },

  /**
   * 生成QR码（使用鱼的唯一ID）
   */
  onGenerateQRCode: function() {
    const self = this;
    
    wx.showLoading({
      title: '生成中...'
    });

    // 生成一个示例鱼ID用于测试
    const testFishId = 'fish_' + Math.random().toString(36).substr(2, 10);
    
    // 使用QRCodeManager生成在线QR码URL
    const qrcodeUrl = QRCodeManager.generateOnlineQRCodeUrl(testFishId, 200);
    
    setTimeout(() => {
      self.setData({
        showQRCode: true,
        qrcodeImageUrl: qrcodeUrl,
        scanResult: `测试鱼ID: ${testFishId}`
      });
      
      wx.hideLoading();
      wx.showToast({
        title: 'QR码生成成功',
        icon: 'success',
        duration: 2000
      });
    }, 500);
  },

  /**
   * 绘制简单的二维码（用于测试）
   */
  drawSimpleQRCode: function(canvasId, text, size) {
    const ctx = wx.createCanvasContext(canvasId);
    
    // 设置白色背景
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, size, size);
    
    // 设置黑色
    ctx.setFillStyle('#000000');
    
    // 绘制一个简单的测试图案
    // 这只是一个演示，实际项目中建议使用专业的二维码库
    const cellSize = size / 21;
    
    // 绘制边框
    for (let i = 0; i < 21; i++) {
      // 顶部和底部边框
      ctx.fillRect(i * cellSize, 0, cellSize, cellSize);
      ctx.fillRect(i * cellSize, 20 * cellSize, cellSize, cellSize);
      // 左侧和右侧边框
      ctx.fillRect(0, i * cellSize, cellSize, cellSize);
      ctx.fillRect(20 * cellSize, i * cellSize, cellSize, cellSize);
    }
    
    // 绘制三个定位标记
    this.drawFinderPattern(ctx, 2, 2, cellSize);
    this.drawFinderPattern(ctx, 2, 16, cellSize);
    this.drawFinderPattern(ctx, 16, 2, cellSize);
    
    // 在中间绘制文本提示
    ctx.setFillStyle('#000000');
    ctx.setFontSize(8);
    ctx.setTextAlign('center');
    ctx.fillText('TEST QR', size/2, size/2);
    
    ctx.draw();
  },

  /**
   * 绘制定位标记
   */
  drawFinderPattern: function(ctx, startX, startY, cellSize) {
    // 绘制7x7的定位标记
    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        if (i === 0 || i === 4 || j === 0 || j === 4 || (i === 2 && j === 2)) {
          ctx.fillRect((startX + j) * cellSize, (startY + i) * cellSize, cellSize, cellSize);
        }
      }
    }
  },

  /**
   * 扫码功能
   */
  onScanCode: function() {
    const self = this;
    
    wx.scanCode({
      success: (res) => {
        console.log('扫码成功:', res.result);
        self.setData({
          scanResult: res.result
        });
        
        wx.showToast({
          title: '扫码成功',
          icon: 'success',
          duration: 2000
        });
      },
      fail: (err) => {
        console.error('扫码失败:', err);
        wx.showToast({
          title: '扫码失败',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * 清除扫码结果
   */
  clearResult: function() {
    this.setData({
      scanResult: ''
    });
  },

  /**
   * 图片加载成功
   */
  onImageLoad: function(e) {
    console.log('二维码图片加载成功:', e);
    wx.showToast({
      title: '图片加载成功',
      icon: 'success',
      duration: 1000
    });
  },

  /**
   * 图片加载失败
   */
  onImageError: function(e) {
    console.error('二维码图片加载失败:', e);
    wx.showToast({
      title: '图片加载失败',
      icon: 'none',
      duration: 2000
    });
    
    // 尝试使用备用方案
    const text = encodeURIComponent('hello world');
    const backupUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${text}`;
    
    this.setData({
      qrcodeUrl: backupUrl
    });
  }
});