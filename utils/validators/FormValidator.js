// utils/validators/FormValidator.js
// 统一的表单验证工具类

const { APP_CONFIG } = require('../constants/AppConstants.js');

class FormValidator {
  /**
   * 验证价格
   */
  static validatePrice(price, fieldName = '价格') {
    if (!price && price !== 0) {
      return { valid: false, message: `请输入${fieldName}` };
    }

    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) {
      return { valid: false, message: `请输入有效的${fieldName}` };
    }

    if (numPrice < APP_CONFIG.VALIDATION.PRICE.MIN) {
      return { valid: false, message: `${fieldName}不能小于${APP_CONFIG.VALIDATION.PRICE.MIN}元` };
    }

    if (numPrice > APP_CONFIG.VALIDATION.PRICE.MAX) {
      return { valid: false, message: `${fieldName}不能大于${APP_CONFIG.VALIDATION.PRICE.MAX}元` };
    }

    return { valid: true, value: numPrice };
  }

  /**
   * 验证数量
   */
  static validateQuantity(quantity, fieldName = '数量') {
    if (!quantity && quantity !== 0) {
      return { valid: false, message: `请输入${fieldName}` };
    }

    const numQuantity = parseInt(quantity);
    if (isNaN(numQuantity)) {
      return { valid: false, message: `请输入有效的${fieldName}` };
    }

    if (numQuantity < APP_CONFIG.VALIDATION.QUANTITY.MIN) {
      return { valid: false, message: `${fieldName}不能小于${APP_CONFIG.VALIDATION.QUANTITY.MIN}` };
    }

    if (numQuantity > APP_CONFIG.VALIDATION.QUANTITY.MAX) {
      return { valid: false, message: `${fieldName}不能大于${APP_CONFIG.VALIDATION.QUANTITY.MAX}` };
    }

    return { valid: true, value: numQuantity };
  }

  /**
   * 验证日期
   */
  static validateDate(date, fieldName = '日期') {
    if (!date) {
      return { valid: false, message: `请选择${fieldName}` };
    }

    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      return { valid: false, message: `请输入有效的${fieldName}` };
    }

    // 检查日期是否在合理范围内（不能是未来日期）
    const today = new Date();
    today.setHours(23, 59, 59, 999); // 设置为今天的最后一刻
    
    if (dateObj > today) {
      return { valid: false, message: `${fieldName}不能是未来日期` };
    }

    // 检查日期是否过于久远（比如不能早于2020年）
    const minDate = new Date('2020-01-01');
    if (dateObj < minDate) {
      return { valid: false, message: `${fieldName}不能早于2020年1月1日` };
    }

    return { valid: true, value: date };
  }

  /**
   * 验证文本字段
   */
  static validateText(text, fieldName = '文本', required = true, maxLength = 100) {
    if (required && (!text || text.trim() === '')) {
      return { valid: false, message: `请输入${fieldName}` };
    }

    if (text && text.length > maxLength) {
      return { valid: false, message: `${fieldName}不能超过${maxLength}个字符` };
    }

    return { valid: true, value: text ? text.trim() : '' };
  }

  /**
   * 验证添加鱼信息表单
   */
  static validateAddFishForm(formData) {
    const errors = [];

    // 验证进货日期
    const dateValidation = this.validateDate(formData.purchaseDate, '进货日期');
    if (!dateValidation.valid) {
      errors.push(dateValidation.message);
    }

    // 验证进货价格
    const priceValidation = this.validatePrice(formData.purchasePrice, '进货价格');
    if (!priceValidation.valid) {
      errors.push(priceValidation.message);
    }

    // 验证备注（可选）
    if (formData.notes) {
      const notesValidation = this.validateText(formData.notes, '备注', false, 200);
      if (!notesValidation.valid) {
        errors.push(notesValidation.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      data: errors.length === 0 ? {
        purchaseDate: dateValidation.value,
        purchasePrice: priceValidation.value,
        notes: formData.notes ? formData.notes.trim() : ''
      } : null
    };
  }

  /**
   * 验证批量添加鱼信息表单
   */
  static validateBatchAddFishForm(formData) {
    const errors = [];

    // 验证进货日期
    const dateValidation = this.validateDate(formData.purchaseDate, '进货日期');
    if (!dateValidation.valid) {
      errors.push(dateValidation.message);
    }

    // 验证平均价格
    const priceValidation = this.validatePrice(formData.averagePrice, '平均价格');
    if (!priceValidation.valid) {
      errors.push(priceValidation.message);
    }

    // 验证数量
    const quantityValidation = this.validateQuantity(formData.quantity, '鱼数量');
    if (!quantityValidation.valid) {
      errors.push(quantityValidation.message);
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      data: errors.length === 0 ? {
        purchaseDate: dateValidation.value,
        averagePrice: priceValidation.value,
        quantity: quantityValidation.value
      } : null
    };
  }

  /**
   * 验证销售价格
   */
  static validateSellPrice(price) {
    return this.validatePrice(price, '销售价格');
  }

  /**
   * 验证支出表单
   */
  static validateExpenseForm(formData) {
    const errors = [];

    // 验证支出项目
    const itemValidation = this.validateText(formData.item, '支出项目', true, 50);
    if (!itemValidation.valid) {
      errors.push(itemValidation.message);
    }

    // 验证金额
    const amountValidation = this.validatePrice(formData.amount, '支出金额');
    if (!amountValidation.valid) {
      errors.push(amountValidation.message);
    }

    // 验证日期
    const dateValidation = this.validateDate(formData.date, '支出日期');
    if (!dateValidation.valid) {
      errors.push(dateValidation.message);
    }

    // 验证备注（可选）
    if (formData.notes) {
      const notesValidation = this.validateText(formData.notes, '备注', false, 200);
      if (!notesValidation.valid) {
        errors.push(notesValidation.message);
      }
    }

    return {
      valid: errors.length === 0,
      errors: errors,
      data: errors.length === 0 ? {
        item: itemValidation.value,
        amount: amountValidation.value,
        date: dateValidation.value,
        notes: formData.notes ? formData.notes.trim() : ''
      } : null
    };
  }

  /**
   * 显示验证错误信息
   */
  static showValidationErrors(errors) {
    if (errors && errors.length > 0) {
      wx.showToast({
        title: errors[0], // 显示第一个错误
        icon: 'none',
        duration: 2000
      });
      return true;
    }
    return false;
  }

  /**
   * 通用表单验证处理
   */
  static handleFormValidation(validationResult) {
    if (!validationResult.valid) {
      this.showValidationErrors(validationResult.errors);
      return false;
    }
    return true;
  }
}

module.exports = FormValidator;