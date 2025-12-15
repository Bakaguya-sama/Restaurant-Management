const DishIngredientService = require('../../../application_layer/dishingredient/dishingredient.service');

class DishIngredientController {
  constructor() {
    this.dishIngredientService = new DishIngredientService();
  }

  async getDishIngredients(req, res) {
    try {
      const ingredients = await this.dishIngredientService.getDishIngredients(req.params.id);

      res.json({
        success: true,
        data: ingredients,
        message: 'Dish ingredients retrieved successfully'
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

  async addIngredientToDish(req, res) {
    try {
      const { ingredient_id, quantity_required, unit } = req.body;

      if (!ingredient_id || !quantity_required || !unit) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'ingredient_id, quantity_required, and unit are required'
        });
      }

      const dishIngredient = await this.dishIngredientService.addIngredientToDish(req.params.id, {
        ingredient_id,
        quantity_required,
        unit
      });

      res.status(201).json({
        success: true,
        data: dishIngredient,
        message: 'Ingredient added to dish successfully'
      });
    } catch (error) {
      let statusCode = 400;
      if (error.message === 'Dish not found' || error.message === 'Ingredient not found') {
        statusCode = 404;
      } else if (error.message.includes('already')) {
        statusCode = 409;
      }

      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async updateDishIngredient(req, res) {
    try {
      const { quantity_required, unit } = req.body;

      if (quantity_required === undefined && !unit) {
        return res.status(400).json({
          success: false,
          data: null,
          message: 'At least one field (quantity_required or unit) is required'
        });
      }

      const dishIngredient = await this.dishIngredientService.updateDishIngredient(
        req.params.id,
        req.params.ingredientId,
        { quantity_required, unit }
      );

      res.json({
        success: true,
        data: dishIngredient,
        message: 'Dish ingredient updated successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Dish not found' || error.message.includes('not added') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }

  async removeIngredientFromDish(req, res) {
    try {
      await this.dishIngredientService.removeIngredientFromDish(req.params.id, req.params.ingredientId);

      res.json({
        success: true,
        data: null,
        message: 'Ingredient removed from dish successfully'
      });
    } catch (error) {
      const statusCode = error.message === 'Dish not found' || error.message.includes('not added') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        data: null,
        message: error.message
      });
    }
  }
}

module.exports = DishIngredientController;

