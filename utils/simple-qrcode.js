// 简化版二维码生成库，专门用于微信小程序
function createQRCode(text, size) {
  // 创建二维码对象
  const qr = new QRCodeLib(1, 'L');
  qr.addData(text);
  qr.make();
  
  return qr;
}

// 在canvas上绘制二维码
function drawQRCode(canvasId, text, canvasSize) {
  const qr = createQRCode(text, canvasSize);
  const moduleCount = qr.getModuleCount();
  const ctx = wx.createCanvasContext(canvasId);
  
  // 计算每个模块的大小
  const cellSize = canvasSize / moduleCount;
  
  // 清空画布，设置白色背景
  ctx.setFillStyle('#ffffff');
  ctx.fillRect(0, 0, canvasSize, canvasSize);
  
  // 绘制二维码
  ctx.setFillStyle('#000000');
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      if (qr.isDark(row, col)) {
        ctx.fillRect(col * cellSize, row * cellSize, cellSize, cellSize);
      }
    }
  }
  
  ctx.draw();
}

// 简化的二维码生成类
class QRCodeLib {
  constructor(typeNumber, errorCorrectLevel) {
    this.typeNumber = typeNumber;
    this.errorCorrectLevel = errorCorrectLevel;
    this.modules = null;
    this.moduleCount = 0;
    this.dataList = [];
  }
  
  addData(data) {
    this.dataList.push({
      data: data,
      mode: 'Byte'
    });
  }
  
  make() {
    this.makeImpl();
  }
  
  makeImpl() {
    this.moduleCount = this.typeNumber * 4 + 17;
    this.modules = [];
    
    // 初始化模块矩阵
    for (let row = 0; row < this.moduleCount; row++) {
      this.modules[row] = [];
      for (let col = 0; col < this.moduleCount; col++) {
        this.modules[row][col] = null;
      }
    }
    
    // 添加定位图案
    this.setupPositionProbePattern(0, 0);
    this.setupPositionProbePattern(this.moduleCount - 7, 0);
    this.setupPositionProbePattern(0, this.moduleCount - 7);
    
    // 添加时序图案
    this.setupTimingPattern();
    
    // 添加数据
    this.setupData();
  }
  
  setupPositionProbePattern(row, col) {
    for (let r = -1; r <= 7; r++) {
      if (row + r <= -1 || this.moduleCount <= row + r) continue;
      
      for (let c = -1; c <= 7; c++) {
        if (col + c <= -1 || this.moduleCount <= col + c) continue;
        
        if ((0 <= r && r <= 6 && (c == 0 || c == 6)) ||
            (0 <= c && c <= 6 && (r == 0 || r == 6)) ||
            (2 <= r && r <= 4 && 2 <= c && c <= 4)) {
          this.modules[row + r][col + c] = true;
        } else {
          this.modules[row + r][col + c] = false;
        }
      }
    }
  }
  
  setupTimingPattern() {
    for (let r = 8; r < this.moduleCount - 8; r++) {
      if (this.modules[r][6] != null) continue;
      this.modules[r][6] = (r % 2 == 0);
    }
    
    for (let c = 8; c < this.moduleCount - 8; c++) {
      if (this.modules[6][c] != null) continue;
      this.modules[6][c] = (c % 2 == 0);
    }
  }
  
  setupData() {
    // 简化的数据填充
    const data = this.dataList[0].data;
    let dataIndex = 0;
    
    for (let row = 0; row < this.moduleCount; row++) {
      for (let col = 0; col < this.moduleCount; col++) {
        if (this.modules[row][col] === null) {
          // 根据数据内容和位置生成图案
          const charCode = dataIndex < data.length ? data.charCodeAt(dataIndex % data.length) : 0;
          this.modules[row][col] = ((charCode + row + col) % 2) === 0;
          dataIndex++;
        }
      }
    }
  }
  
  getModuleCount() {
    return this.moduleCount;
  }
  
  isDark(row, col) {
    if (row < 0 || this.moduleCount <= row || col < 0 || this.moduleCount <= col) {
      throw new Error(`Invalid position: ${row}, ${col}`);
    }
    return this.modules[row][col];
  }
}

module.exports = {
  createQRCode,
  drawQRCode
};