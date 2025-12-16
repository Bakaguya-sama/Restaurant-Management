class InvoicePromotionEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.invoice_id = data.invoice_id;
    this.promotion_id = data.promotion_id;
    this.discount_applied = data.discount_applied;
  }

  validate() {
    const errors = [];

    if (!this.invoice_id) {
      errors.push('Invoice ID is required');
    }

    if (!this.promotion_id) {
      errors.push('Promotion ID is required');
    }

    if (!this.discount_applied || this.discount_applied < 0) {
      errors.push('Discount applied must be a positive number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    return {
      id: this.id,
      invoice_id: this.invoice_id,
      promotion_id: this.promotion_id,
      discount_applied: this.discount_applied
    };
  }
}

module.exports = InvoicePromotionEntity;
