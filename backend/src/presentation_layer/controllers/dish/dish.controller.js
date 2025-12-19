const DishService = require('../../../application_layer/dish/dish.service');
const DishIngredientController = require('../dishingredient/dishingredient.controller');

class DishController {
  constructor() {
    this.dishService = new DishService();
    this.dishIngredientController = new DishIngredientController();
  }

  async getAllDishes(req, res) {
    try {
      const { category, is_available, search } = req.query;
      const filters = {};

      if (category) filters.category = category;
      if (is_available !== undefined) filters.is_available = is_available === 'true';
      if (search) filters.search = search;

      const dishes = await this.dishService.getAllDishes(filters);
      const formattedDishes = await Promise.all(
        dishes.map(dish => this.dishService.formatDishResponse(dish))
      );

      res.json({
        success: true,
        data: formattedDishes,
        message: 'Dishes retrieved successfully'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        data: null,
        message: error.message || 'Error fetching dishes'
      });
    }
  }

  async getDishById(req, res) {
    try {
      const dish = await this.dishService.getDishById(req.params.id);
      const formatted = await this.dishService.formatDishResponse(dish);

      res.json({
        success: true,
        data: formatted,
        message: 'Dish retrieved successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Dish not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async createDish(req, res) {
    try {
      const { name, description, category, price, image_url } = req.body;

      if (!name || !category || price === undefined) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'name, category, and price are required'
        });
      }

      const dish = await this.dishService.createDish({
        name,
        description,
        category,
        price,
        image_url
      });

      const formatted = await this.dishService.formatDishResponse(dish);

      res.status(201).json({
        success: true,
        data: formatted,
        message: 'Dish created successfully'
      });
    } catch (error) {
      const statusCode = error.message.includes('already exists') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async updateDish(req, res) {
    try {
      const { name, description, category, price, image_url } = req.body;

      if (!name || !category || price === undefined) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'name, category, and price are required'
        });
      }

      const dish = await this.dishService.updateDish(req.params.id, {
        name,
        description,
        category,
        price,
        image_url
      });

      const formatted = await this.dishService.formatDishResponse(dish);

      res.json({
        success: true,
        data: formatted,
        message: 'Dish updated successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Dish not found' ? 404 :
                        error.message.includes('already exists') ? 409 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async updateDishAvailability(req, res) {
    try {
      const { is_available, reason } = req.body;

      if (is_available === undefined) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'is_available is required'
        });
      }

      if (!is_available && !reason) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'reason is required when marking dish as unavailable'
        });
      }

      const dish = await this.dishService.updateDishAvailability(
        req.params.id,
        is_available,
        reason,
        req.user ? req.user.id : null
      );

      const formatted = await this.dishService.formatDishResponse(dish);

      res.json({
        success: true,
        data: formatted,
        message: 'Dish availability updated successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Dish not found' ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async deleteDish(req, res) {
    try {
      const dish = await this.dishService.deleteDish(req.params.id);
      const formatted = await this.dishService.formatDishResponse(dish);

      res.json({
        success: true,
        data: formatted,
        message: 'Dish deleted successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Dish not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async getDishIngredients(req, res) {
    return this.dishIngredientController.getDishIngredients(req, res);
  }

  async addIngredientToDish(req, res) {
    return this.dishIngredientController.addIngredientToDish(req, res);
  }

  async updateDishIngredient(req, res) {
    return this.dishIngredientController.updateDishIngredient(req, res);
  }

  async removeIngredientFromDish(req, res) {
    return this.dishIngredientController.removeIngredientFromDish(req, res);
  }

  async bulkReplaceDishIngredients(req, res) {
    return this.dishIngredientController.bulkReplaceDishIngredients(req, res);
  }
}
module.exports = DishController;