const DishIngredientRepository = require('../../infrastructure_layer/dishingredient/dishingredient.repository');
const DishIngredientEntity = require('../../domain_layer/dishingredient/dishingredient.entity');
const { Ingredient, Dish } = require('../../models');

class DishIngredientService {
  constructor() {
    this.dishIngredientRepository = new DishIngredientRepository();
  }

  async getDishIngredients(dishId) {
    const dish = await Dish.findById(dishId);
    if (!dish) {
      throw new Error('Dish not found');
    }

    const dishIngredients = await this.dishIngredientRepository.findByDishId(dishId);
    return dishIngredients.map(di => this.formatDishIngredientResponse(di));
  }

  async addIngredientToDish(dishId, ingredientData) {
    const dish = await Dish.findById(dishId);
    if (!dish) {
      throw new Error('Dish not found');
    }

    const ingredient = await Ingredient.findById(ingredientData.ingredient_id);
    if (!ingredient) {
      throw new Error('Ingredient not found');
    }

    const existingDishIngredient = await this.dishIngredientRepository.findByDishAndIngredient(dishId, ingredientData.ingredient_id);
    if (existingDishIngredient) {
      throw new Error('This ingredient is already added to this dish');
    }

    const created = await this.dishIngredientRepository.create({
      dish_id: dishId,
      ingredient_id: ingredientData.ingredient_id,
      quantity_required: ingredientData.quantity_required,
      unit: ingredientData.unit
    });

    return this.formatDishIngredientResponse(created);
  }

  async updateDishIngredient(dishId, ingredientId, updateData) {
    const dishIngredient = await this.dishIngredientRepository.findByDishAndIngredient(dishId, ingredientId);
    if (!dishIngredient) {
      throw new Error('This ingredient is not added to this dish');
    }

    const updated = await this.dishIngredientRepository.update(dishIngredient._id, updateData);
    return this.formatDishIngredientResponse(updated);
  }

  async removeIngredientFromDish(dishId, ingredientId) {
    const dishIngredient = await this.dishIngredientRepository.findByDishAndIngredient(dishId, ingredientId);
    if (!dishIngredient) {
      throw new Error('This ingredient is not added to this dish');
    }

    return await this.dishIngredientRepository.deleteByDishAndIngredient(dishId, ingredientId);
  }

  async deleteByDishId(dishId) {
    return await this.dishIngredientRepository.deleteByDishId(dishId);
  }

  formatDishIngredientResponse(dishIngredient) {
    const entity = new DishIngredientEntity(dishIngredient);
    return entity.formatResponse();
  }
}

module.exports = DishIngredientService;
