class OrderDetailEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.order_id = data.order_id;
    this.dish_id = data.dish_id;
    this.quantity = data.quantity;
    this.unit_price = data.unit_price;
    this.line_total = data.line_total;
    this.special_instructions = data.special_instructions || null;
    this.status = data.status;
  }

  validate() {
    const errors = [];

    if (!this.order_id) {
      errors.push('order_id is required');
    }

    if (!this.dish_id) {
      errors.push('dish_id is required');
    }

    if (!this.quantity || this.quantity <= 0) {
      errors.push('quantity is required and must be greater than 0');
    }

    if (this.unit_price === undefined || this.unit_price < 0) {
      errors.push('unit_price is required and must be non-negative');
    }

    if (this.line_total === undefined || this.line_total < 0) {
      errors.push('line_total is required and must be non-negative');
    }

    if (!this.status || !['pending', 'preparing', 'ready', 'served'].includes(this.status)) {
      errors.push('status must be one of: pending, preparing, ready, served');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  formatResponse() {
    return {
      id: this.id,
      order_id: this.order_id,
      dish_id: this.dish_id,
      quantity: this.quantity,
      unit_price: this.unit_price,
      line_total: this.line_total,
      special_instructions: this.special_instructions,
      status: this.status
    };
  }
}

module.exports = OrderDetailEntity;
