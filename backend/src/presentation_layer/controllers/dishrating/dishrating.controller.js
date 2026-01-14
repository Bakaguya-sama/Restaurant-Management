const DishRatingService = require('../../../application_layer/dishrating/dishrating.service');

class DishRatingController {
  constructor() {
    this.dishRatingService = new DishRatingService();
  }

  async getAllDishRatings(req, res) {
    try {
      const filters = {
        dish_id: req.query.dish_id,
        rating_id: req.query.rating_id,
        score: req.query.score,
        min_score: req.query.min_score,
        max_score: req.query.max_score,
        limit: req.query.limit
      };

      const dishRatings = await this.dishRatingService.getAllDishRatings(filters);

      res.status(200).json({
        success: true,
        count: dishRatings.length,
        data: dishRatings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getDishRatingById(req, res) {
    try {
      const dishRating = await this.dishRatingService.getDishRatingById(req.params.id);

      res.status(200).json({
        success: true,
        data: dishRating
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getDishRatingsByRatingId(req, res) {
    try {
      const dishRatings = await this.dishRatingService.getDishRatingsByRatingId(req.params.ratingId);

      res.status(200).json({
        success: true,
        count: dishRatings.length,
        data: dishRatings
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getDishRatingsByDishId(req, res) {
    try {
      const dishRatings = await this.dishRatingService.getDishRatingsByDishId(req.params.dishId);

      res.status(200).json({
        success: true,
        count: dishRatings.length,
        data: dishRatings
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createDishRating(req, res) {
    try {
      const dishRating = await this.dishRatingService.createDishRating(req.body);

      res.status(201).json({
        success: true,
        data: dishRating
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateDishRating(req, res) {
    try {
      const dishRating = await this.dishRatingService.updateDishRating(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: dishRating
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteDishRating(req, res) {
    try {
      const result = await this.dishRatingService.deleteDishRating(req.params.id);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async getAverageScoreByDish(req, res) {
    try {
      const result = await this.dishRatingService.getAverageScoreByDish(req.params.dishId);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = DishRatingController;
