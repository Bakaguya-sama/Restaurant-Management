const RatingRepository = require('../../infrastructure_layer/rating/rating.repository');
const RatingEntity = require('../../domain_layer/rating/rating.entity');
const { User } = require('../../models');

class RatingService {
  constructor() {
    this.ratingRepository = new RatingRepository();
  }

  async getAllRatings(filters) {
    return await this.ratingRepository.findAll(filters);
  }

  async getRatingById(id) {
    return await this.ratingRepository.findById(id);
  }

  async createRating(data) {
    const ratingEntity = new RatingEntity(data);
    const validation = ratingEntity.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const customer = await User.findById(data.customer_id);
    if (!customer || customer.role !== 'customer') {
      throw new Error('Customer not found');
    }

    return await this.ratingRepository.create(data);
  }

  async updateRating(id, updateData) {
    await this.ratingRepository.findById(id);

    if (updateData.score) {
      const updatedData = { score: updateData.score, description: updateData.description };
      const ratingEntity = new RatingEntity({ ...updatedData, customer_id: 'temp' });
      const validation = ratingEntity.validate();

      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }
    }

    return await this.ratingRepository.update(id, updateData);
  }

  async deleteRating(id) {
    return await this.ratingRepository.delete(id);
  }

  async getRatingReplies(ratingId) {
    await this.ratingRepository.findById(ratingId);
    return await this.ratingRepository.getRepliesByRatingId(ratingId);
  }

  async createRatingReply(ratingId, staffId, replyText) {
    await this.ratingRepository.findById(ratingId);

    const staff = await User.findById(staffId);
    if (!staff || !['waiter', 'cashier', 'manager'].includes(staff.role)) {
      throw new Error('Staff not found');
    }

    if (!replyText || replyText.trim().length === 0) {
      throw new Error('Reply text is required');
    }

    return await this.ratingRepository.createReply({
      rating_id: ratingId,
      staff_id: staffId,
      reply_text: replyText
    });
  }

  async deleteRatingReply(replyId) {
    return await this.ratingRepository.deleteReply(replyId);
  }

  async getRatingStatistics() {
    return await this.ratingRepository.getStatistics();
  }
}

module.exports = RatingService;
