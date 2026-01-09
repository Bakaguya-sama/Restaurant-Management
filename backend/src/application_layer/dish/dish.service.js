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
      const dish = await this.dishRepository.findById(dishId);
      
      if (!dish.is_available && dish.manual_unavailable_by) {
        return { available: false, missingIngredients: [] };
      }

      const dishIngredients = await DishIngredient.find({ dish_id: dishId });
      
      if (dishIngredients.length === 0) {
        await this.updateDishAvailabilityBased(dishId, false);
        return { available: false, missingIngredients: [] };
      }

      const missingIngredients = [];

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
      const hasIngredients = await this.dishRepository.hasDishIngredients(dishId);
      const finalAvailability = isAvailable && hasIngredients;

      await this.dishRepository.update(dishId, {
        is_available: finalAvailability,
        updated_at: new Date()
      });
    } catch (error) {
      console.error('Error updating dish availability:', error);
    }
  }

  async getAllDishes(filters = {}) {
    const dishes = await this.dishRepository.findAll(filters);
    
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
    
    await this.checkDishAvailability(id);
    const updatedDish = await this.dishRepository.findById(id);
    
    return updatedDish;
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

    const dishDataWithAvailability = {
      ...dishData,
      is_available: false
    };

    return await this.dishRepository.create(dishDataWithAvailability);
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

    if (isAvailable) {
      const hasIngredients = await this.dishRepository.hasDishIngredients(id);
      if (!hasIngredients) {
        throw new Error(`Cannot enable dish "${existingDish.name}": Please attach at least one ingredient before enabling availability`);
      }

      const availability = await this.checkDishAvailability(id);
      if (!availability.available && availability.missingIngredients.length > 0) {
        const missingList = availability.missingIngredients
          .map(ing => `${ing.name} (need: ${ing.required} ${ing.unit}, have: ${ing.available})`)
          .join(', ');
        throw new Error(`Cannot enable dish "${existingDish.name}": Insufficient ingredient stock - ${missingList}`);
      }
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
      const topDishes = await OrderDetail.aggregate([
        {
          $match: { status: { $ne: 'cancelled' } }
        },
        {
          $group: {
            _id: '$dish_id',
            totalOrdered: { $sum: '$quantity' },
            totalRevenue: { $sum: '$line_total' }
          }
        },
        {
          $sort: { totalOrdered: -1, totalRevenue: -1 }
        },
        {
          $limit: limit
        }
      ]);

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
