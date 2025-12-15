class OrderEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.order_number = data.order_number;
    this.order_type = data.order_type;
    this.order_date = data.order_date;
    this.order_time = data.order_time;
    this.status = data.status;
    this.subtotal = data.subtotal;
    this.tax = data.tax;
    this.total_amount = data.total_amount;
    this.notes = data.notes;
    this.table_id = data.table_id || null;
    this.customer_id = data.customer_id || null;
    this.staff_id = data.staff_id || null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  validate() {
    const errors = [];

    if (!this.order_number || this.order_number.trim() === '') {
      errors.push('order_number is required');
    }

    if (!this.order_type) {
      errors.push('order_type is required');
    }

    const validOrderTypes = ['dine-in-customer', 'takeaway-customer', 'dine-in-waiter', 'takeaway-staff'];
    if (this.order_type && !validOrderTypes.includes(this.order_type)) {
      errors.push('order_type must be one of: dine-in-customer, takeaway-customer, dine-in-waiter, takeaway-staff');
    }

    if (!this.order_time) {
      errors.push('order_time is required');
    }

    if (!this.status || !['pending', 'preparing', 'ready', 'served', 'completed', 'cancelled'].includes(this.status)) {
      errors.push('status must be one of: pending, preparing, ready, served, completed, cancelled');
    }

    if (this.subtotal < 0) {
      errors.push('subtotal cannot be negative');
    }

    if (this.tax < 0) {
      errors.push('tax cannot be negative');
    }

    if (this.total_amount < 0) {
      errors.push('total_amount cannot be negative');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  formatResponse() {
    return {
      id: this.id,
      order_number: this.order_number,
      order_type: this.order_type,
      order_date: this.order_date,
      order_time: this.order_time,
      status: this.status,
      subtotal: this.subtotal,
      tax: this.tax,
      total_amount: this.total_amount,
      notes: this.notes,
      table_id: this.table_id,
      customer_id: this.customer_id,
      staff_id: this.staff_id,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = OrderEntity;
