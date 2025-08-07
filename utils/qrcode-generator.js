// 基于标准算法的二维码生成器
// 适用于微信小程序

// QR码生成器
function QRCodeGenerator(text) {
  this.text = text;
  this.size = 0;
  this.modules = [];
}

QRCodeGenerator.prototype.generate = function() {
  // 使用固定的21x21尺寸（Version 1）
  this.size = 21;
  this.modules = [];
  
  // 初始化模块矩阵
  for (let i = 0; i < this.size; i++) {
    this.modules[i] = [];
    for (let j = 0; j < this.size; j++) {
      this.modules[i][j] = false;
    }
  }
  
  // 添加功能图案
  this.addFinderPatterns();
  this.addSeparators();
  this.addTimingPatterns();
  this.addDarkModule();
  
  // 添加数据
  this.addData();
  
  return this;
};

// 添加定位图案（Finder Patterns）
QRCodeGenerator.prototype.addFinderPatterns = function() {
  const positions = [[0, 0], [this.size - 7, 0], [0, this.size - 7]];
  
  positions.forEach(([startRow, startCol]) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const row = startRow + r;
        const col = startCol + c;
        
        // 外边框
        if (r === 0 || r === 6 || c === 0 || c === 6) {
          this.modules[row][col] = true;
        }
        // 内部中心3x3方块
        else if (r >= 2 && r <= 4 && c >= 2 && c <= 4) {
          this.modules[row][col] = true;
        }
        // 其他位置为白色
        else {
          this.modules[row][col] = false;
        }
      }
    }
  });
};

// 添加分隔符
QRCodeGenerator.prototype.addSeparators = function() {
  // 左上角分隔符
  for (let i = 0; i < 8; i++) {
    if (i < 7) this.modules[7][i] = false;
    if (i < 7) this.modules[i][7] = false;
  }
  
  // 右上角分隔符
  for (let i = 0; i < 8; i++) {
    this.modules[7][this.size - 8 + i] = false;
    if (i > 0) this.modules[i][this.size - 8] = false;
  }
  
  // 左下角分隔符
  for (let i = 0; i < 8; i++) {
    this.modules[this.size - 8 + i][7] = false;
    if (i > 0) this.modules[this.size - 8][i] = false;
  }
};

// 添加时序图案
QRCodeGenerator.prototype.addTimingPatterns = function() {
  for (let i = 8; i < this.size - 8; i++) {
    this.modules[6][i] = (i % 2 === 0);
    this.modules[i][6] = (i % 2 === 0);
  }
};

// 添加暗模块
QRCodeGenerator.prototype.addDarkModule = function() {
  this.modules[4 * 1 + 9][8] = true;
};

// 添加数据
QRCodeGenerator.prototype.addData = function() {
  // 简化的数据编码
  const data = this.text;
  let bitIndex = 0;
  
  // 从右下角开始，按列向上填充
  for (let col = this.size - 1; col > 0; col -= 2) {
    if (col === 6) col--; // 跳过时序列
    
    for (let count = 0; count < this.size; count++) {
      for (let c = 0; c < 2; c++) {
        const actualCol = col - c;
        const row = ((col + 1) % 4 < 2) ? (this.size - 1 - count) : count;
        
        if (row >= 0 && row < this.size && actualCol >= 0 && actualCol < this.size) {
          if (this.modules[row][actualCol] === null || this.isEmpty(row, actualCol)) {
            // 根据文本内容生成数据位
            const charIndex = Math.floor(bitIndex / 8) % data.length;
            const bitPos = bitIndex % 8;
            const charCode = data.charCodeAt(charIndex);
            const bit = (charCode >> (7 - bitPos)) & 1;
            
            this.modules[row][actualCol] = bit === 1;
            bitIndex++;
          }
        }
      }
    }
  }
};

// 检查位置是否为空（可以填充数据）
QRCodeGenerator.prototype.isEmpty = function(row, col) {
  // 检查是否在功能图案区域
  // 定位图案区域
  if ((row < 9 && col < 9) || 
      (row < 9 && col >= this.size - 8) || 
      (row >= this.size - 8 && col < 9)) {
    return false;
  }
  
  // 时序图案
  if (row === 6 || col === 6) {
    return false;
  }
  
  return true;
};

// 获取模块状态
QRCodeGenerator.prototype.isDark = function(row, col) {
  return this.modules[row][col];
};

// 在canvas上绘制
function drawQRCodeOnCanvas(canvasId, text, canvasSize) {
  const qr = new QRCodeGenerator(text);
  qr.generate();
  
  const ctx = wx.createCanvasContext(canvasId);
  const moduleSize = canvasSize / qr.size;
  
  // 设置白色背景
  ctx.setFillStyle('#ffffff');
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // 绘制黑色模块
  ctx.setFillStyle('#000000');
  for (let row = 0; row < qr.size; row++) {
    for (let col = 0; col < qr.size; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(col * moduleSize, row * moduleSize, moduleSize, moduleSize);
      }
    }
  }
  
  ctx.draw();
}

module.exports = {
  drawQRCodeOnCanvas
};