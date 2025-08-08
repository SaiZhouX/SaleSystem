// 使用QRCode Monkey API作为唯一的QR码生成接口
// 适用于微信小程序

/**
 * 在canvas上绘制QR码
 * 使用QRCode Monkey API生成QR码图片，然后绘制到canvas上
 * @param {string} canvasId - canvas的ID
 * @param {string} text - 要编码的文本
 * @param {number} canvasSize - canvas的大小
 */
function drawQRCodeOnCanvas(canvasId, text, canvasSize) {
  const encodedData = encodeURIComponent(text);
  const qrCodeUrl = `https://api.qrcode-monkey.com/qr/custom?data=${encodedData}&size=${canvasSize}&download=false`;
  
  // 使用微信的downloadFile和drawImage方法在canvas上绘制QR码
  wx.downloadFile({
    url: qrCodeUrl,
    success: function(res) {
      if (res.statusCode === 200) {
        const ctx = wx.createCanvasContext(canvasId);
        
        // 设置白色背景
        ctx.setFillStyle('#ffffff');
        ctx.fillRect(0, 0, canvasSize, canvasSize);
        
        // 绘制下载的QR码图片
        ctx.drawImage(res.tempFilePath, 0, 0, canvasSize, canvasSize);
        ctx.draw();
        
        console.log('QR码绘制成功');
      } else {
        console.error('QR码图片下载失败:', res.statusCode);
      }
    },
    fail: function(error) {
      console.error('QR码API请求失败:', error);
    }
  });
}

module.exports = {
  drawQRCodeOnCanvas
};
