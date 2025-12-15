const DishRepository = require('../../infrastructure_layer/dish/dish.repository');
const DishIngredientRepository = require('../../infrastructure_layer/dish/dishingredient.repository');
const DishEntity = require('../../domain_layer/dish/dish.entity');
const { Ingredient } = require('../../models');

class DishService {
  constructor() {
    this.dishRepository = new DishRepository();
    this.dishIngredientRepository = new DishIngredientRepository();
  }

  async getAllDishes(filters = {}) {
    return await this.dishRepository.findAll(filters);
  }

  async getDishById(id) {
    const dish = await this.dishRepository.findById(id);
    if (!dish) {
      throw new Error('Dish not found');
    }
    return dish;
  }

  async createDish(dishData) {
    const dishEntity = new DishEntity(dishData);
    const validation = dishEntity.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const existingDish = await this.dishRepository.findByName(dishData.name);
    if (existingDish) {
      throw new Error('Dish with this name already exists');
    }

    return await this.dishRepository.create(dishData);
  }

  async updateDish(id, updateData) {
    const existingDish = await this.dishRepository.findById(id);
    if (!existingDish) {
      throw new Error('Dish not found');
    }

    if (updateData.name && updateData.name !== existingDish.name) {
      const duplicateDish = await this.dishRepository.findByName(updateData.name);
      if (duplicateDish) {
        throw new Error('Dish with this name already exists');
      }
    }

    if (updateData.category) {
      const validCategories = ['appetizer', 'main_course', 'dessert', 'beverage'];
      if (!validCategories.includes(updateData.category)) {
        throw new Error('Invalid category');
      }
    }

    if (updateData.price !== undefined && updateData.price < 0) {
      throw new Error('Price cannot be negative');
    }

    return await this.dishRepository.update(id, updateData);
  }

  async updateDishAvailability(id, isAvailable, reason = null, staffId = null) {
    const existingDish = await this.dishRepository.findById(id);
    if (!existingDish) {
      throw new Error('Dish not found');
    }

    return await this.dishRepository.updateAvailability(id, isAvailable, reason, staffId);
  }

  async deleteDish(id) {
    const dish = await this.dishRepository.findById(id);
    if (!dish) {
      throw new Error('Dish not found');
    }

    await this.dishIngredientRepository.findByDishId(id).then(ingredients => {
      if (ingredients.length > 0) {
        return this.dishIngredientRepository.deleteByDishId(id);
      }
    });

    return await this.dishRepository.delete(id);
  }

  async getDishIngredients(dishId) {
    const dish = await this.dishRepository.findById(dishId);
    if (!dish) {
      throw new Error('Dish not found');
    }

    return await this.dishIngredientRepository.findByDishId(dishId);
  }

  async addIngredientToDish(dishId, ingredientData) {
    const dish = await this.dishRepository.findById(dishId);
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

    return await this.dishIngredientRepository.create({
      dish_id: dishId,
      ingredient_id: ingredientData.ingredient_id,
      quantity_required: ingredientData.quantity_required,
      unit: ingredientData.unit
    });
  }

  async updateDishIngredient(dishId, ingredientId, updateData) {
    const dish = await this.dishRepository.findById(dishId);
    if (!dish) {
      throw new Error('Dish not found');
    }

    const dishIngredient = await this.dishIngredientRepository.findByDishAndIngredient(dishId, ingredientId);
    if (!dishIngredient) {
      throw new Error('This ingredient is not added to this dish');
    }

    return await this.dishIngredientRepository.update(dishIngredient._id, updateData);
  }

  async removeIngredientFromDish(dishId, ingredientId) {
    const dish = await this.dishRepository.findById(dishId);
    if (!dish) {
      throw new Error('Dish not found');
    }

    const dishIngredient = await this.dishIngredientRepository.findByDishAndIngredient(dishId, ingredientId);
    if (!dishIngredient) {
      throw new Error('This ingredient is not added to this dish');
    }

    return await this.dishIngredientRepository.deleteByDishAndIngredient(dishId, ingredientId);
  }

  async formatDishResponse(dish) {
    const entity = new DishEntity(dish);
    return entity.formatResponse();
  }
}

module.exports = DishService;
