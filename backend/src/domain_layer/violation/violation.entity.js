class ViolationEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.customer_id = data.customer_id;
    this.description = data.description;
    this.violation_date = data.violation_date;
    this.violation_type = data.violation_type;
  }

  validate() {
    const errors = [];

    if (!this.customer_id) {
      errors.push('Customer ID is required');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Description is required');
    }

    const validTypes = ['no_show', 'late_cancel', 'property_damage', 'other'];
    if (this.violation_type && !validTypes.includes(this.violation_type)) {
      errors.push('Invalid violation type');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  isSevere() {
    return this.violation_type === 'property_damage';
  }

  toJSON() {
    return {
      id: this.id,
      customer_id: this.customer_id,
      description: this.description,
      violation_date: this.violation_date,
      violation_type: this.violation_type
    };
  }
}

module.exports = ViolationEntity;
