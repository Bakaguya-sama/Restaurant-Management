class DishEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.name = data.name;
    this.description = data.description;
    this.category = data.category;
    this.price = data.price;
    this.image_url = data.image_url;
    this.is_available = data.is_available !== undefined ? data.is_available : true;
    this.manual_unavailable_reason = data.manual_unavailable_reason || null;
    this.manual_unavailable_by = data.manual_unavailable_by || null;
    this.manual_unavailable_at = data.manual_unavailable_at || null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('name is required');
    }

    if (!this.category || !['appetizer', 'main_course', 'dessert', 'beverage'].includes(this.category)) {
      errors.push('category is required and must be one of: appetizer, main_course, dessert, beverage');
    }

    if (this.price === undefined || this.price === null || this.price < 0) {
      errors.push('price is required and must be non-negative');
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
      description: this.description,
      category: this.category,
      price: this.price,
      image_url: this.image_url,
      is_available: this.is_available,
      manual_unavailable_reason: this.manual_unavailable_reason,
      manual_unavailable_by: this.manual_unavailable_by,
      manual_unavailable_at: this.manual_unavailable_at,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = DishEntity;
