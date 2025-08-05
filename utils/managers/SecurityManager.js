/**
 * 安全管理器 - 处理生物识别认证和敏感数据保护
 */
const SecurityManager = {
  /**
   * 是否显示敏感数据（金额）
   */
  showSensitiveData: false,

  /**
   * 掩码敏感数据
   * @param {string|number} value - 需要掩码的值
   * @returns {string} - 掩码后的字符串
   */
  maskSensitiveData(value) {
    if (!this.showSensitiveData) {
      return '******';
    }
    return value;
  },

  /**
   * 执行人脸识别验证
   * @returns {Promise} - 返回验证结果的Promise
   */
  performFaceID() {
    return new Promise((resolve, reject) => {
      // 检测系统环境
      const systemInfo = wx.getSystemInfoSync();
      const isIOS = systemInfo.platform === 'ios';
      
      if (isIOS) {
        // iOS设备使用微信官方的生物认证API
        wx.startSoterAuthentication({
          requestAuthModes: ['facial'], // 请求使用人脸识别
          challenge: 'fish-sales-system-auth-' + Date.now(), // 挑战因子，防重放攻击
          authContent: '请进行Face ID验证以查看金额',
          success: (res) => {
            console.log('人脸识别成功', res);
            this.showSensitiveData = true;
            resolve(true);
            wx.showToast({
              title: '验证成功',
              icon: 'success'
            });
          },
          fail: (err) => {
            console.error('人脸识别失败', err);
            
            // 如果是因为设备不支持，提供备用方案
            if (err.errCode === 90001 || err.errCode === 90002 || err.errCode === 90003) {
              wx.showToast({
                title: '设备不支持人脸识别',
                icon: 'none',
                duration: 2000
              });
              
              // 延迟显示密码验证
              setTimeout(() => {
                this._passwordVerify(resolve, reject);
              }, 2000);
            } else {
              wx.showToast({
                title: '验证失败',
                icon: 'none'
              });
              reject(err);
            }
          }
        });
      } else {
        // 非iOS设备使用SOTER认证
        wx.checkIsSupportSoterAuthentication({
          success: (res) => {
            const supportMode = res.supportMode || [];
            if (supportMode.includes('facial')) {
              // 开始人脸识别
              wx.startSoterAuthentication({
                requestAuthModes: ['facial'],
                challenge: 'fish-sales-system-auth',
                authContent: '请验证身份以查看金额',
                success: (authRes) => {
                  console.log('人脸识别成功', authRes);
                  this.showSensitiveData = true;
                  resolve(true);
                },
                fail: (err) => {
                  console.error('人脸识别失败', err);
                  wx.showToast({
                    title: '验证失败',
                    icon: 'none'
                  });
                  reject(err);
                }
              });
            } else if (supportMode.includes('fingerPrint')) {
              // 如果支持指纹但不支持人脸
              wx.startSoterAuthentication({
                requestAuthModes: ['fingerPrint'],
                challenge: 'fish-sales-system-auth',
                authContent: '请验证身份以查看金额',
                success: (authRes) => {
                  console.log('指纹识别成功', authRes);
                  this.showSensitiveData = true;
                  resolve(true);
                },
                fail: (err) => {
                  console.error('指纹识别失败', err);
                  wx.showToast({
                    title: '验证失败',
                    icon: 'none'
                  });
                  reject(err);
                }
              });
            } else {
              // 如果不支持生物认证，使用密码验证
              this._passwordVerify(resolve, reject);
            }
          },
          fail: (err) => {
            console.error('检查生物认证支持失败', err);
            // 如果检查失败，使用密码验证
            this._passwordVerify(resolve, reject);
          }
        });
      }
    });
  },
  
  /**
   * 使用密码验证（备用方案）
   * @private
   */
  _passwordVerify(resolve, reject) {
    wx.showModal({
      title: '验证',
      content: '请输入查看密码',
      editable: true,
      placeholderText: '请输入密码',
      success: (res) => {
        if (res.confirm) {
          // 这里可以添加实际的密码验证逻辑
          // 为了演示，我们使用一个固定密码 "123456"
          if (res.content === '123456') {
            this.showSensitiveData = true;
            resolve(true);
            wx.showToast({
              title: '验证成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '密码错误',
              icon: 'error'
            });
            reject(new Error('密码错误'));
          }
        } else {
          reject(new Error('用户取消验证'));
        }
      },
      fail: (err) => {
        console.error('显示密码输入框失败', err);
        reject(err);
      }
    });
  },

  /**
   * 重置安全状态
   */
  resetSecurityState() {
    this.showSensitiveData = false;
  }
};

module.exports = SecurityManager;