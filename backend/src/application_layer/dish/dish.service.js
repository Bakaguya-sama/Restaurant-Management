const DishRepository = require('../../infrastructure_layer/dish/dish.repository');
const DishIngredientService = require('../../application_layer/dishingredient/dishingredient.service');
const DishEntity = require('../../domain_layer/dish/dish.entity');
const { DishIngredient, Ingredient, OrderDetail } = require('../../models');

class DishService {
  constructor() {
    this.dishRepository = new DishRepository();
    this.dishIngredientService = new DishIngredientService();
  }

  async checkDishAvailability(dishId) {
    try {
      // Get all ingredients required for this dish
      const dishIngredients = await DishIngredient.find({ dish_id: dishId });
      
      if (dishIngredients.length === 0) {
        // No ingredients required, dish is available
        await this.updateDishAvailabilityBased(dishId, true);
        return { available: true, missingIngredients: [] };
      }

      const missingIngredients = [];

      // Check each ingredient
      for (const dishIngredient of dishIngredients) {
        const ingredient = await Ingredient.findById(dishIngredient.ingredient_id);
        
        if (!ingredient) {
          missingIngredients.push({
            name: 'Unknown',
            required: dishIngredient.quantity_required,
            available: 0
          });
          continue;
        }

        // Check if there's enough stock
        if (ingredient.quantity_in_stock < dishIngredient.quantity_required) {
          missingIngredients.push({
            name: ingredient.name,
            required: dishIngredient.quantity_required,
            available: ingredient.quantity_in_stock,
            unit: ingredient.unit
          });
        }
      }

      const isAvailable = missingIngredients.length === 0;
      await this.updateDishAvailabilityBased(dishId, isAvailable);

      return {
        available: isAvailable,
        missingIngredients
      };
    } catch (error) {
      console.error('Error checking dish availability:', error);
      return { available: false, missingIngredients: [] };
    }
  }

  async updateDishAvailabilityBased(dishId, isAvailable) {
    try {
      await this.dishRepository.update(dishId, {
        is_available: isAvailable,
        updated_at: new Date()
      });
    } catch (error) {
      console.error('Error updating dish availability:', error);
    }
  }

  async getAllDishes(filters = {}) {
    const dishes = await this.dishRepository.findAll(filters);
    
    // Check availability for each dish
    const dishesWithAvailability = await Promise.all(
      dishes.map(async (dish) => {
        const availability = await this.checkDishAvailability(dish._id || dish.id);
        return {
          ...dish.toObject ? dish.toObject() : dish,
          is_available: availability.available,
          missing_ingredients: availability.missingIngredients
        };
      })
    );
    
    return dishesWithAvailability;
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

    await this.dishIngredientService.deleteByDishId(id);

    return await this.dishRepository.delete(id);
  }

  async getDishIngredients(dishId) {
    return await this.dishIngredientService.getDishIngredients(dishId);
  }

  async addIngredientToDish(dishId, ingredientData) {
    return await this.dishIngredientService.addIngredientToDish(dishId, ingredientData);
  }

  async updateDishIngredient(dishId, ingredientId, updateData) {
    return await this.dishIngredientService.updateDishIngredient(dishId, ingredientId, updateData);
  }

  async removeIngredientFromDish(dishId, ingredientId) {
    return await this.dishIngredientService.removeIngredientFromDish(dishId, ingredientId);
  }

  async getTopDishes(limit = 3) {
    try {
      // Aggregate to count how many times each dish has been ordered
      const topDishes = await OrderDetail.aggregate([
        {
          // Only count non-cancelled orders
          $match: { status: { $ne: 'cancelled' } }
        },
        {
          // Group by dish_id and sum quantities
          $group: {
            _id: '$dish_id',
            totalOrdered: { $sum: '$quantity' },
            totalRevenue: { $sum: '$line_total' }
          }
        },
        {
          // Sort by totalOrdered descending, then by totalRevenue descending (if tied)
          $sort: { totalOrdered: -1, totalRevenue: -1 }
        },
        {
          // Limit to top N
          $limit: limit
        }
      ]);

      // Get full dish details for each top dish
      const dishesWithDetails = await Promise.all(
        topDishes.map(async (item) => {
          const dish = await this.dishRepository.findById(item._id);
          if (!dish) return null;
          
          return {
            ...dish.toObject ? dish.toObject() : dish,
            totalOrdered: item.totalOrdered,
            totalRevenue: item.totalRevenue
          };
        })
      );

      // Filter out null values (dishes that might have been deleted)
      return dishesWithDetails.filter(d => d !== null);
    } catch (error) {
      console.error('Error getting top dishes:', error);
      throw error;
    }
  }

  async formatDishResponse(dish) {
    const entity = new DishEntity(dish);
    return entity.formatResponse();
  }
}

module.exports = DishService;
