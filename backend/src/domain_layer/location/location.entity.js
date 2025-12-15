class LocationEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.name = data.name;
    this.floor_id = data.floor_id;
    this.description = data.description;
    this.created_at = data.created_at;
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.toString().trim().length === 0) {
      errors.push('name is required');
    }

    if (!this.floor_id) {
      errors.push('floor_id is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  formatResponse() {
    return {
      id: this.id,
      name: this.name,
      floor_id: this.floor_id ? (this.floor_id._id ? this.floor_id._id.toString() : this.floor_id.toString()) : null,
      description: this.description,
      created_at: this.created_at
    };
  }
}

module.exports = LocationEntity;
