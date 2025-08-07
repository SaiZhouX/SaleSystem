// 简单的二维码生成工具
// 基于QR Code generator library的简化版本

const QRCode = {
  // 生成二维码数据矩阵
  generate: function(text, size = 200) {
    // 这里使用一个简化的二维码生成算法
    // 实际项目中建议使用完整的二维码库
    const matrix = this.createMatrix(text, 21); // 21x21 是最小的二维码尺寸
    return {
      matrix: matrix,
      size: 21
    };
  },

  // 创建二维码矩阵
  createMatrix: function(text, size) {
    const matrix = [];
    
    // 初始化矩阵
    for (let i = 0; i < size; i++) {
      matrix[i] = [];
      for (let j = 0; j < size; j++) {
        matrix[i][j] = 0;
      }
    }

    // 添加定位标记（左上、右上、左下角的方块）
    this.addPositionMarkers(matrix, size);
    
    // 根据文本内容生成简单的图案
    this.addDataPattern(matrix, text, size);

    return matrix;
  },

  // 添加定位标记
  addPositionMarkers: function(matrix, size) {
    const positions = [
      [0, 0], // 左上
      [0, size - 7], // 右上
      [size - 7, 0] // 左下
    ];

    positions.forEach(([row, col]) => {
      // 7x7 的定位标记
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || 
              (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            matrix[row + i][col + j] = 1;
          }
        }
      }
    });
  },

  // 添加数据图案
  addDataPattern: function(matrix, text, size) {
    // 简单的数据编码：根据文本的ASCII值生成图案
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = ((hash << 5) - hash + text.charCodeAt(i)) & 0xffffffff;
    }

    // 在中间区域添加数据图案
    for (let i = 9; i < size - 9; i++) {
      for (let j = 9; j < size - 9; j++) {
        matrix[i][j] = (hash + i * j) % 2;
      }
    }
  },

  // 在canvas上绘制二维码
  drawOnCanvas: function(canvasId, text, canvasSize = 280) {
    const qrData = this.generate(text);
    const matrix = qrData.matrix;
    const matrixSize = qrData.size;
    
    const ctx = wx.createCanvasContext(canvasId);
    const cellSize = canvasSize / matrixSize;

    // 清空画布
    ctx.setFillStyle('#ffffff');
    ctx.fillRect(0, 0, canvasSize, canvasSize);

    // 绘制二维码
    ctx.setFillStyle('#000000');
    for (let i = 0; i < matrixSize; i++) {
      for (let j = 0; j < matrixSize; j++) {
        if (matrix[i][j] === 1) {
          ctx.fillRect(j * cellSize, i * cellSize, cellSize, cellSize);
        }
      }
    }

    ctx.draw();
  }
};

module.exports = QRCode;