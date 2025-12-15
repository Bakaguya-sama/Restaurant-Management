class FloorEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.floor_name = data.floor_name || data.name;
    this.floor_number = data.floor_number || data.level;
    this.description = data.description;
    this.created_at = data.created_at;
  }

  validate() {
    const errors = [];

    if (!this.floor_name || this.floor_name.toString().trim().length === 0) {
      errors.push('Floor name is required');
    }

    if (this.floor_number === undefined || this.floor_number === null) {
      errors.push('Floor level is required');
    }

    if (typeof this.floor_number !== 'number' || this.floor_number < 0) {
      errors.push('Floor level must be a non-negative number');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  formatResponse() {
    return {
      id: this.id,
      name: this.floor_name,
      level: this.floor_number,
      description: this.description
    };
  }
}

module.exports = FloorEntity;
