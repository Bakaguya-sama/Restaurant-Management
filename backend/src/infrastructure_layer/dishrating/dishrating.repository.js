const mongoose = require('mongoose');
const { DishRating, Dish, Rating } = require('../../models');
const DishRatingEntity = require('../../domain_layer/dishrating/dishrating.entity');

class DishRatingRepository {
  async findAll(filters = {}) {
    const query = {};

    if (filters.dish_id) {
      query.dish_id = filters.dish_id;
    }

    if (filters.rating_id) {
      query.rating_id = filters.rating_id;
    }

    if (filters.score) {
      query.score = filters.score;
    }

    if (filters.min_score) {
      query.score = { $gte: filters.min_score };
    }

    if (filters.max_score) {
      query.score = { ...query.score, $lte: filters.max_score };
    }

    let queryBuilder = DishRating.find(query)
      .populate('dish_id', 'name category price')
      .populate('rating_id', 'customer_id invoice_id rating_date')
      .sort({ _id: -1 });

    if (filters.limit) {
      queryBuilder = queryBuilder.limit(parseInt(filters.limit));
    }

    const dishRatings = await queryBuilder.lean();

    return dishRatings.map(dr => new DishRatingEntity(dr).toJSON());
  }

  async findById(id) {
    const dishRating = await DishRating.findById(id)
      .populate('dish_id', 'name category price')
      .populate('rating_id', 'customer_id invoice_id rating_date')
      .lean();

    if (!dishRating) {
      throw new Error('Dish rating not found');
    }

    return new DishRatingEntity(dishRating).toJSON();
  }

  async findByRatingId(ratingId) {
    const dishRatings = await DishRating.find({ rating_id: ratingId })
      .populate('dish_id', 'name category price')
      .populate('rating_id', 'customer_id invoice_id rating_date')
      .lean();

    return dishRatings.map(dr => new DishRatingEntity(dr).toJSON());
  }

  async findByDishId(dishId) {
    const dishRatings = await DishRating.find({ dish_id: dishId })
      .populate('dish_id', 'name category price')
      .populate('rating_id', 'customer_id invoice_id rating_date')
      .lean();

    return dishRatings.map(dr => new DishRatingEntity(dr).toJSON());
  }

  async create(data) {
    const dishRating = new DishRating(data);
    await dishRating.save();

    const savedDishRating = await DishRating.findById(dishRating._id)
      .populate('dish_id', 'name category price')
      .populate('rating_id', 'customer_id invoice_id rating_date')
      .lean();

    return new DishRatingEntity(savedDishRating).toJSON();
  }

  async update(id, updateData) {
    const dishRating = await DishRating.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    )
      .populate('dish_id', 'name category price')
      .populate('rating_id', 'customer_id invoice_id rating_date')
      .lean();

    if (!dishRating) {
      throw new Error('Dish rating not found');
    }

    return new DishRatingEntity(dishRating).toJSON();
  }

  async delete(id) {
    const result = await DishRating.findByIdAndDelete(id);

    if (!result) {
      throw new Error('Dish rating not found');
    }

    return result;
  }

  async getAverageScoreByDish(dishId) {
    const objectId = new mongoose.Types.ObjectId(dishId);

    const result = await DishRating.aggregate([
      { $match: { dish_id: objectId } },
      { 
        $group: { 
          _id: '$dish_id', 
          averageScore: { $avg: '$score' }, 
          count: { $sum: 1 } 
        } 
      }
    ]);

    return result.length > 0 ? result[0] : null;
  }
}

module.exports = DishRatingRepository;
