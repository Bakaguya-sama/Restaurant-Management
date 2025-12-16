const { Rating, RatingReply } = require('../../models');
const RatingEntity = require('../../domain_layer/rating/rating.entity');

class RatingRepository {
  async findAll(filters = {}) {
    const query = {};

    if (filters.customer_id) {
      query.customer_id = filters.customer_id;
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

    const ratings = await Rating.find(query)
      .populate('customer_id', 'full_name email phone membership_level')
      .sort({ rating_date: -1 })
      .lean();

    return ratings.map(r => new RatingEntity(r).toJSON());
  }

  async findById(id) {
    const rating = await Rating.findById(id)
      .populate('customer_id', 'full_name email phone membership_level')
      .lean();

    if (!rating) {
      throw new Error('Rating not found');
    }

    return new RatingEntity(rating).toJSON();
  }

  async create(data) {
    const rating = new Rating(data);
    await rating.save();

    const savedRating = await Rating.findById(rating._id)
      .populate('customer_id', 'full_name email phone membership_level')
      .lean();

    return new RatingEntity(savedRating).toJSON();
  }

  async update(id, updateData) {
    const rating = await Rating.findByIdAndUpdate(
      id,
      { ...updateData },
      { new: true, runValidators: true }
    )
      .populate('customer_id', 'full_name email phone membership_level')
      .lean();

    if (!rating) {
      throw new Error('Rating not found');
    }

    return new RatingEntity(rating).toJSON();
  }

  async delete(id) {
    const result = await Rating.findByIdAndDelete(id);

    if (!result) {
      throw new Error('Rating not found');
    }

    await RatingReply.deleteMany({ rating_id: id });

    return { message: 'Rating deleted successfully' };
  }

  async getRepliesByRatingId(ratingId) {
    const replies = await RatingReply.find({ rating_id: ratingId })
      .populate('staff_id', 'full_name email role')
      .sort({ reply_date: -1 })
      .lean();

    return replies;
  }

  async createReply(data) {
    const reply = new RatingReply(data);
    await reply.save();

    const populatedReply = await RatingReply.findById(reply._id)
      .populate('staff_id', 'full_name email role')
      .lean();

    return populatedReply;
  }

  async deleteReply(replyId) {
    const result = await RatingReply.findByIdAndDelete(replyId);

    if (!result) {
      throw new Error('Reply not found');
    }

    return { message: 'Reply deleted successfully' };
  }

  async getStatistics() {
    const total = await Rating.countDocuments();

    const averageScore = await Rating.aggregate([
      {
        $group: {
          _id: null,
          average: { $avg: '$score' }
        }
      }
    ]);

    const byScore = await Rating.aggregate([
      {
        $group: {
          _id: '$score',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    const positive = await Rating.countDocuments({ score: { $gte: 4 } });
    const neutral = await Rating.countDocuments({ score: 3 });
    const negative = await Rating.countDocuments({ score: { $lte: 2 } });

    return {
      total,
      average_score: averageScore[0]?.average || 0,
      positive,
      neutral,
      negative,
      by_score: byScore
    };
  }
}

module.exports = RatingRepository;
