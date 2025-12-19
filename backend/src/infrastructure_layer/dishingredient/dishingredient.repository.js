const { DishIngredient, Ingredient } = require('../../models');

class DishIngredientRepository {
  async findByDishId(dishId) {
    return await DishIngredient.find({ dish_id: dishId });
  }

  async findByDishAndIngredient(dishId, ingredientId) {
    return await DishIngredient.findOne({ dish_id: dishId, ingredient_id: ingredientId });
  }

  async create(data) {
    const dishIngredient = new DishIngredient({
      dish_id: data.dish_id,
      ingredient_id: data.ingredient_id,
      quantity_required: data.quantity_required,
      unit: data.unit
    });

    return await dishIngredient.save();
  }

  async update(id, data) {
    const updateData = {};

    if (data.quantity_required !== undefined) updateData.quantity_required = data.quantity_required;
    if (data.unit !== undefined) updateData.unit = data.unit;

    return await DishIngredient.findByIdAndUpdate(id, updateData, { new: true });
  }

  async delete(id) {
    return await DishIngredient.findByIdAndDelete(id);
  }

  async deleteByDishAndIngredient(dishId, ingredientId) {
    return await DishIngredient.deleteOne({ dish_id: dishId, ingredient_id: ingredientId });
  }

  async deleteByDishId(dishId) {
    return await DishIngredient.deleteMany({ dish_id: dishId });
  }

  async findById(id) {
    return await DishIngredient.findById(id);
  }
}

module.exports = DishIngredientRepository;
