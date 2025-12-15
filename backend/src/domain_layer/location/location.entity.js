class LocationEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.name = data.name;
    this.floor_name = data.floor_id?.floor_name || null;
    this.floor_id = data.floor_id?._id || data.floor_id?.id || data.floor_id;
    this.description = data.description;
    this.created_at = data.created_at;
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.toString().trim().length === 0) {
      errors.push('Location name is required');
    }

    if (!this.floor_id) {
      errors.push('Floor ID is required');
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
      floor: this.floor_name,
      floor_id: this.floor_id,
      description: this.description,
      createdAt: this.created_at
    };
  }
}

module.exports = LocationEntity;
