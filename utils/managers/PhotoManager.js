// utils/managers/PhotoManager.js
// 统一的照片管理工具类

const { APP_CONFIG } = require('../constants/AppConstants.js');
const api = require('../api.js');

class PhotoManager {
  /**
   * 拍照或选择照片
   */
  static takePhoto() {
    return new Promise((resolve, reject) => {
      wx.chooseImage({
        count: APP_CONFIG.PHOTO_CONFIG.COUNT,
        sizeType: APP_CONFIG.PHOTO_CONFIG.SIZE_TYPE,
        sourceType: APP_CONFIG.PHOTO_CONFIG.SOURCE_TYPE,
        success: (res) => {
          const tempFilePath = res.tempFilePaths[0];
          resolve(tempFilePath);
        },
        fail: (err) => {
          console.error('选择照片失败:', err);
          reject(err);
        }
      });
    });
  }

  /**
   * 预览照片
   */
  static previewPhoto(photoPath) {
    if (!photoPath) {
      wx.showToast({
        title: '暂无照片',
        icon: 'none'
      });
      return;
    }

    wx.previewImage({
      urls: [photoPath],
      current: photoPath
    });
  }

  /**
   * 上传照片到服务器
   */
  static uploadPhoto(filePath, fishId) {
    return new Promise((resolve, reject) => {
      // 检查网络状态
      wx.getNetworkType({
        success: (res) => {
          if (res.networkType === 'none') {
            console.log('无网络连接，照片将在网络恢复后上传');
            resolve({ success: false, reason: 'no_network' });
            return;
          }

          // 上传到服务器
          wx.uploadFile({
            url: api.uploadPhoto,
            filePath: filePath,
            name: 'photo',
            formData: {
              fishId: fishId
            },
            success: (uploadRes) => {
              try {
                const result = JSON.parse(uploadRes.data);
                if (result.success) {
                  resolve({ 
                    success: true, 
                    url: result.url,
                    reason: 'upload_success'
                  });
                } else {
                  resolve({ 
                    success: false, 
                    reason: 'server_error',
                    error: result.message 
                  });
                }
              } catch (e) {
                console.error('解析上传结果失败:', e);
                resolve({ 
                  success: false, 
                  reason: 'parse_error',
                  error: e.message 
                });
              }
            },
            fail: (err) => {
              console.error('照片上传失败:', err);
              resolve({ 
                success: false, 
                reason: 'upload_failed',
                error: err.errMsg 
              });
            }
          });
        },
        fail: () => {
          resolve({ 
            success: false, 
            reason: 'network_check_failed' 
          });
        }
      });
    });
  }

  /**
   * 保存照片到鱼信息中
   */
  static async savePhotoToFish(fishId, photoPath) {
    const DataManager = require('./DataManager.js');
    const fishList = DataManager.getFishList();
    const fishIndex = fishList.findIndex(fish => fish.id === fishId);

    if (fishIndex > -1) {
      // 先保存到本地
      fishList[fishIndex].photoPath = photoPath;
      fishList[fishIndex].photoUploadStatus = 'pending';
      DataManager.saveFishList(fishList);

      // 尝试上传到服务器
      try {
        const uploadResult = await this.uploadPhoto(photoPath, fishId);
        
        if (uploadResult.success) {
          fishList[fishIndex].photoPath = uploadResult.url;
          fishList[fishIndex].photoUploadStatus = 'success';
          console.log('照片上传成功');
        } else {
          fishList[fishIndex].photoUploadStatus = 'failed';
          console.log('照片上传失败:', uploadResult.reason);
        }
        
        DataManager.saveFishList(fishList);
        return { success: true, fish: fishList[fishIndex] };
        
      } catch (error) {
        console.error('照片上传过程出错:', error);
        fishList[fishIndex].photoUploadStatus = 'failed';
        DataManager.saveFishList(fishList);
        return { success: false, error: error.message };
      }
    }

    return { success: false, error: '未找到对应的鱼信息' };
  }

  /**
   * 处理拍照流程（包含拍照、保存、上传）
   * @param {string} fishId - 鱼的ID
   * @param {boolean} saveToDatabase - 是否保存到数据库（默认true）
   */
  static async handleTakePhoto(fishId, saveToDatabase = true) {
    try {
      // 1. 拍照或选择照片
      const photoPath = await this.takePhoto();
      
      if (saveToDatabase) {
        // 2. 保存照片到鱼信息（用于详情页面）
        const result = await this.savePhotoToFish(fishId, photoPath);
        
        if (result.success) {
          wx.showToast({ 
            title: '照片已保存', 
            icon: 'success' 
          });
          return { success: true, fish: result.fish, photoPath: photoPath };
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          });
          return { success: false, error: result.error };
        }
      } else {
        // 直接返回照片路径（用于添加页面）
        wx.showToast({ 
          title: '照片已选择', 
          icon: 'success' 
        });
        return { success: true, photoPath: photoPath };
      }
      
    } catch (error) {
      console.error('拍照流程失败:', error);
      wx.showToast({
        title: '拍照失败',
        icon: 'none'
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * 简化的拍照处理（仅用于添加页面）
   */
  static async handleTakePhotoForAdd(fishId) {
    return await this.handleTakePhoto(fishId, false);
  }

  /**
   * 完整的拍照处理（用于详情页面）
   */
  static async handleTakePhotoForDetail(fishId) {
    return await this.handleTakePhoto(fishId, true);
  }
}

module.exports = PhotoManager;