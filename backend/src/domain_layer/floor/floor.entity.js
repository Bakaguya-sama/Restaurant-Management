class FloorEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.floor_name = data.floor_name;
    this.floor_number = data.floor_number;
    this.description = data.description;
    this.created_at = data.created_at;
  }

  validate() {
    const errors = [];

    if (!this.floor_name || this.floor_name.toString().trim().length === 0) {
      errors.push('floor_name is required');
    }

    if (this.floor_number === undefined || this.floor_number === null) {
      errors.push('floor_number is required');
    }

    if (typeof this.floor_number !== 'number' || this.floor_number < 0) {
      errors.push('floor_number must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  formatResponse() {
    return {
      id: this.id,
      floor_name: this.floor_name,
      floor_number: this.floor_number,
      description: this.description,
      created_at: this.created_at
    };
  }
}

module.exports = FloorEntity;
