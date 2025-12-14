class TableEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.table_number = data.table_number || data.number;
    this.capacity = data.capacity || data.seats;
    this.location_id = data.location_id || data.area;
    this.status = data.status || 'free';
    this.brokenReason = data.brokenReason;
    this.created_at = data.created_at;
  }

  validate() {
    const errors = [];

    if (!this.table_number || this.table_number.toString().trim().length === 0) {
      errors.push('Table number is required');
    }

    if (!this.capacity || this.capacity <= 0) {
      errors.push('Capacity must be greater than 0');
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

//   canChangeStatus(newStatus) {
//     const validTransitions = {
//       'free': ['occupied', 'reserved', 'dirty'],
//       'occupied': ['free', 'reserved', 'dirty', 'broken'],
//       'reserved': ['free', 'occupied', 'dirty', 'broken'],
//       'dirty': ['free', 'broken'],
//       'broken': ['dirty']
//     };

//     return validTransitions[this.status]?.includes(newStatus) || false;
//   }

  formatResponse() {
    return {
      id: this.id,
      number: this.table_number,
      seats: this.capacity,
      status: this.status,
      ...(this.brokenReason && { brokenReason: this.brokenReason })
    };
  }
}

module.exports = TableEntity;
