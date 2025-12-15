class DishIngredientEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.dish_id = data.dish_id;
    this.ingredient_id = data.ingredient_id;
    this.quantity_required = data.quantity_required;
    this.unit = data.unit;
  }

  validate() {
    const errors = [];

    if (!this.dish_id) {
      errors.push('dish_id is required');
    }

    if (!this.ingredient_id) {
      errors.push('ingredient_id is required');
    }

    if (this.quantity_required === undefined || this.quantity_required === null || this.quantity_required <= 0) {
      errors.push('quantity_required is required and must be positive');
    }

    if (!this.unit || this.unit.trim() === '') {
      errors.push('unit is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  formatResponse() {
    return {
      id: this.id,
      dish_id: this.dish_id,
      ingredient_id: this.ingredient_id,
      quantity_required: this.quantity_required,
      unit: this.unit
    };
  }
}

module.exports = DishIngredientEntity;
