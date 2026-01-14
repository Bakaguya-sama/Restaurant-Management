class DishRatingEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.dish_id = data.dish_id;
    this.rating_id = data.rating_id;
    this.score = data.score;
    this.comment = data.comment;
  }

  validate() {
    const errors = [];

    if (!this.dish_id) {
      errors.push('Dish ID is required');
    }

    if (!this.rating_id) {
      errors.push('Rating ID is required');
    }

    if (!this.score) {
      errors.push('Score is required');
    }

    if (this.score < 1 || this.score > 5) {
      errors.push('Score must be between 1 and 5');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  toJSON() {
    const dishId = this.dish_id?._id || this.dish_id?.id || this.dish_id;
    const ratingId = this.rating_id?._id || this.rating_id?.id || this.rating_id;

    return {
      id: this.id,
      dish_id: dishId,
      rating_id: ratingId,
      score: this.score,
      comment: this.comment
    };
  }
}

module.exports = DishRatingEntity;
