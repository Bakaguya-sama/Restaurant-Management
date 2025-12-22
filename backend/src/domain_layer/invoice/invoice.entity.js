class InvoiceEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.invoice_number = data.invoice_number;
    this.order_id = data.order_id;
    this.staff_id = data.staff_id;
    this.customer_id = data.customer_id;
    this.invoice_date = data.invoice_date;
    this.subtotal = data.subtotal;
    this.tax = data.tax;
    this.discount_amount = data.discount_amount;
    this.customerSelectedPoints = data.customer_selected_points || 0;
    this.pointsDiscount = data.points_discount || 0;
    this.total_amount = data.total_amount;
    this.payment_method = data.payment_method;
    this.payment_status = data.payment_status;
    this.paid_at = data.paid_at;
    this.created_at = data.created_at;
    this.order = data.order;
    this.staff = data.staff;
    this.customer = data.customer;
    this.promotions = data.promotions;
  }

  validate() {
    const errors = [];

    if (!this.invoice_number || this.invoice_number.trim().length === 0) {
      errors.push("Invoice number is required");
    }

    if (!this.order_id) {
      errors.push("Order ID is required");
    }

    if (!this.staff_id) {
      errors.push("Staff ID is required");
    }

    if (
      this.subtotal === undefined ||
      this.subtotal === null ||
      this.subtotal < 0
    ) {
      errors.push("Valid subtotal is required");
    }

    if (this.tax !== undefined && this.tax < 0) {
      errors.push("Tax must be non-negative");
    }

    if (this.discount_amount !== undefined && this.discount_amount < 0) {
      errors.push("Discount amount must be non-negative");
    }

    if (
      this.total_amount === undefined ||
      this.total_amount === null ||
      this.total_amount < 0
    ) {
      errors.push("Valid total amount is required");
    }

    const validPaymentMethods = ["cash", "card", "transfer", "e-wallet"];
    if (
      !this.payment_method ||
      !validPaymentMethods.includes(this.payment_method)
    ) {
      errors.push("Invalid payment method");
    }

    const validPaymentStatuses = ["pending", "paid", "cancelled"];
    if (
      this.payment_status &&
      !validPaymentStatuses.includes(this.payment_status)
    ) {
      errors.push("Invalid payment status");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  calculateTotals(subtotal, taxRate = 0, discountAmount = 0) {
    const tax = subtotal * (taxRate / 100);
    const total = subtotal + tax - discountAmount;

    return {
      subtotal: subtotal,
      tax: Math.round(tax * 100) / 100,
      discount_amount: discountAmount,
      total_amount: Math.round(total * 100) / 100,
    };
  }

  isPaid() {
    return this.payment_status === "paid";
  }

  isPending() {
    return this.payment_status === "pending";
  }

  isCancelled() {
    return this.payment_status === "cancelled";
  }

  toJSON() {
    return {
      id: this.id,
      invoice_number: this.invoice_number,
      order_id: this.order_id,
      staff_id: this.staff_id,
      customer_id: this.customer_id,
      invoice_date: this.invoice_date,
      subtotal: this.subtotal,
      tax: this.tax,
      discount_amount: this.discount_amount,
      customerSelectedPoints: this.customerSelectedPoints,
      pointsDiscount: this.pointsDiscount,
      total_amount: this.total_amount,
      payment_method: this.payment_method,
      payment_status: this.payment_status,
      paid_at: this.paid_at,
      created_at: this.created_at,
      order: this.order,
      staff: this.staff,
      customer: this.customer,
      promotions: this.promotions,
    };
  }
}

module.exports = InvoiceEntity;
