class TableEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.table_number = data.table_number;
    this.capacity = data.capacity;
    this.location_id = data.location_id;
    this.status = data.status || 'free';
    this.brokenReason = data.brokenReason;
    this.created_at = data.created_at;
  }

  validate() {
    const errors = [];

    if (!this.table_number || this.table_number.toString().trim().length === 0) {
      errors.push('table_number is required');
    }

    if (!this.capacity || this.capacity <= 0) {
      errors.push('capacity must be greater than 0');
    }

    const validStatuses = ['free', 'occupied', 'reserved', 'dirty', 'broken'];
    if (!validStatuses.includes(this.status)) {
      errors.push(`Invalid status. Valid values: ${validStatuses.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isAvailable() {
    return this.status === 'free';
  }

  isBroken() {
    return this.status === 'broken';
  }

  formatResponse() {
    return {
      id: this.id,
      table_number: this.table_number,
      capacity: this.capacity,
      location_id: this.location_id,
      status: this.status,
      created_at: this.created_at,
      ...(this.brokenReason && { brokenReason: this.brokenReason })
    };
  }
}

module.exports = TableEntity;
