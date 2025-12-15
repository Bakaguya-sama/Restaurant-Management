class PromotionEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.name = data.name;
    this.promotion_type = data.promotion_type;
    this.discount_value = data.discount_value;
    this.minimum_order_amount = data.minimum_order_amount;
    this.promo_code = data.promo_code;
    this.start_date = data.start_date;
    this.end_date = data.end_date;
    this.is_active = data.is_active;
    this.max_uses = data.max_uses;
    this.current_uses = data.current_uses;
    this.created_at = data.created_at;
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Promotion name is required');
    }

    const validTypes = ['percentage', 'fixed_amount'];
    if (!this.promotion_type || !validTypes.includes(this.promotion_type)) {
      errors.push('Invalid promotion type');
    }

    if (this.discount_value === undefined || this.discount_value === null) {
      errors.push('Discount value is required');
    }

    if (this.promotion_type === 'percentage' && (this.discount_value < 0 || this.discount_value > 100)) {
      errors.push('Percentage discount must be between 0 and 100');
    }

    if (this.promotion_type === 'fixed_amount' && this.discount_value < 0) {
      errors.push('Fixed amount discount must be positive');
    }

    if (!this.start_date) {
      errors.push('Start date is required');
    }

    if (!this.end_date) {
      errors.push('End date is required');
    }

    if (this.start_date && this.end_date && new Date(this.start_date) >= new Date(this.end_date)) {
      errors.push('End date must be after start date');
    }

    if (this.minimum_order_amount !== undefined && this.minimum_order_amount < 0) {
      errors.push('Minimum order amount must be non-negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isValidNow() {
    const now = new Date();
    return this.is_active && 
           new Date(this.start_date) <= now && 
           new Date(this.end_date) >= now;
  }

  canBeUsed() {
    if (!this.isValidNow()) {
      return false;
    }

    if (this.max_uses === -1) {
      return true;
    }

    return this.current_uses < this.max_uses;
  }

  calculateDiscount(orderAmount) {
    if (!this.canBeUsed()) {
      return 0;
    }

    if (orderAmount < this.minimum_order_amount) {
      return 0;
    }

    if (this.promotion_type === 'percentage') {
      return (orderAmount * this.discount_value) / 100;
    }

    return this.discount_value;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      promotion_type: this.promotion_type,
      discount_value: this.discount_value,
      minimum_order_amount: this.minimum_order_amount,
      promo_code: this.promo_code,
      start_date: this.start_date,
      end_date: this.end_date,
      is_active: this.is_active,
      max_uses: this.max_uses,
      current_uses: this.current_uses,
      created_at: this.created_at
    };
  }
}

module.exports = PromotionEntity;
