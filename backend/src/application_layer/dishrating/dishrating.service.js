const DishRatingRepository = require('../../infrastructure_layer/dishrating/dishrating.repository');
const DishRatingEntity = require('../../domain_layer/dishrating/dishrating.entity');
const { Dish, Rating } = require('../../models');

class DishRatingService {
  constructor() {
    this.dishRatingRepository = new DishRatingRepository();
  }

  async getAllDishRatings(filters) {
    return await this.dishRatingRepository.findAll(filters);
  }

  async getDishRatingById(id) {
    return await this.dishRatingRepository.findById(id);
  }

  async getDishRatingsByRatingId(ratingId) {
    const rating = await Rating.findById(ratingId);
    if (!rating) {
      throw new Error('Rating not found');
    }

    return await this.dishRatingRepository.findByRatingId(ratingId);
  }

  async getDishRatingsByDishId(dishId) {
    const dish = await Dish.findById(dishId);
    if (!dish) {
      throw new Error('Dish not found');
    }

    return await this.dishRatingRepository.findByDishId(dishId);
  }

  async createDishRating(data) {
    const dishRatingEntity = new DishRatingEntity(data);
    const validation = dishRatingEntity.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const dish = await Dish.findById(data.dish_id);
    if (!dish) {
      throw new Error('Dish not found');
    }

    const rating = await Rating.findById(data.rating_id);
    if (!rating) {
      throw new Error('Rating not found');
    }

    return await this.dishRatingRepository.create(data);
  }

  async updateDishRating(id, updateData) {
    const existingDishRating = await this.dishRatingRepository.findById(id);

    if (updateData.score || updateData.comment) {
      const validationData = {
        score: updateData.score || existingDishRating.score,
        comment: updateData.comment,
        dish_id: existingDishRating.dish_id,
        rating_id: existingDishRating.rating_id
      };
      const dishRatingEntity = new DishRatingEntity(validationData);
      const validation = dishRatingEntity.validate();

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
    }

    return await this.dishRatingRepository.update(id, updateData);
  }

  async deleteDishRating(id) {
    return await this.dishRatingRepository.delete(id);
  }

  async getAverageScoreByDish(dishId) {
    const dish = await Dish.findById(dishId);
    if (!dish) {
      throw new Error('Dish not found');
    }

    return await this.dishRatingRepository.getAverageScoreByDish(dishId);
  }
}

module.exports = DishRatingService;
