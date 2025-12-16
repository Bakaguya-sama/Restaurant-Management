class RatingEntity {
  constructor(data) {
    this.id = data._id || data.id;
    this.customer_id = data.customer_id;
    this.description = data.description;
    this.rating_date = data.rating_date;
    this.score = data.score;
  }

  validate() {
    const errors = [];

    if (!this.customer_id) {
      errors.push('Customer ID is required');
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

  isPositive() {
    return this.score >= 4;
  }

  isNegative() {
    return this.score <= 2;
  }

  isNeutral() {
    return this.score === 3;
  }

  toJSON() {
    return {
      id: this.id,
      customer_id: this.customer_id,
      description: this.description,
      rating_date: this.rating_date,
      score: this.score
    };
  }
}

module.exports = RatingEntity;
