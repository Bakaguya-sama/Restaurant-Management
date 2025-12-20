const { RatingReply, Rating } = require('../../models');
const RatingReplyEntity = require('../../domain_layer/rating_reply/rating_reply.entity');

class RatingReplyRepository {
  async findAll(filters = {}) {
    const query = {};

    if (filters.rating_id) {
      query.rating_id = filters.rating_id;
    }

    if (filters.staff_id) {
      query.staff_id = filters.staff_id;
    }

    if (filters.start_date && filters.end_date) {
      query.reply_date = {
        $gte: new Date(filters.start_date),
        $lte: new Date(filters.end_date)
      };
    }

    const replies = await RatingReply.find(query)
      .populate('rating_id', 'score description customer_id')
      .populate('staff_id', 'full_name email role')
      .sort({ reply_date: -1 });

    return replies.map(reply => new RatingReplyEntity(reply));
  }

  async findById(id) {
    const reply = await RatingReply.findById(id)
      .populate('rating_id', 'score description customer_id')
      .populate('staff_id', 'full_name email role');

    if (!reply) return null;

    return new RatingReplyEntity(reply);
  }

  async findByRatingId(ratingId) {
    const replies = await RatingReply.find({ rating_id: ratingId })
      .populate('staff_id', 'full_name email role')
      .sort({ reply_date: -1 });

    return replies.map(reply => new RatingReplyEntity(reply));
  }

  async findByStaffId(staffId) {
    const replies = await RatingReply.find({ staff_id: staffId })
      .populate('rating_id', 'score description customer_id')
      .sort({ reply_date: -1 });

    return replies.map(reply => new RatingReplyEntity(reply));
  }

  async create(replyData) {
    const reply = new RatingReply(replyData);
    await reply.save();

    return await this.findById(reply._id);
  }

  async update(id, updates) {
    const reply = await RatingReply.findByIdAndUpdate(
      id,
      { ...updates },
      { new: true, runValidators: true }
    )
    .populate('rating_id', 'score description customer_id')
    .populate('staff_id', 'full_name email role');

    if (!reply) return null;

    return new RatingReplyEntity(reply);
  }

  async delete(id) {
    const reply = await RatingReply.findByIdAndDelete(id);
    return reply ? new RatingReplyEntity(reply) : null;
  }

  async deleteByRatingId(ratingId) {
    const result = await RatingReply.deleteMany({ rating_id: ratingId });
    return result.deletedCount;
  }

  async getStatistics(filters = {}) {
    const matchStage = {};

    if (filters.staff_id) {
      matchStage.staff_id = filters.staff_id;
    }

    if (filters.start_date && filters.end_date) {
      matchStage.reply_date = {
        $gte: new Date(filters.start_date),
        $lte: new Date(filters.end_date)
      };
    }

    const stats = await RatingReply.aggregate([
      ...(Object.keys(matchStage).length > 0 ? [{ $match: matchStage }] : []),
      {
        $facet: {
          total: [{ $count: 'count' }],
          by_staff: [
            {
              $group: {
                _id: '$staff_id',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } }
          ],
          recent: [
            { $sort: { reply_date: -1 } },
            { $limit: 10 },
            {
              $lookup: {
                from: 'users',
                localField: 'staff_id',
                foreignField: '_id',
                as: 'staff'
              }
            },
            {
              $lookup: {
                from: 'ratings',
                localField: 'rating_id',
                foreignField: '_id',
                as: 'rating'
              }
            }
          ]
        }
      }
    ]);

    return {
      total: stats[0].total[0]?.count || 0,
      by_staff: stats[0].by_staff,
      recent_replies: stats[0].recent
    };
  }

  async getTopRespondingStaff(limit = 10) {
    const topStaff = await RatingReply.aggregate([
      {
        $group: {
          _id: '$staff_id',
          total_replies: { $sum: 1 },
          latest_reply: { $max: '$reply_date' }
        }
      },
      { $sort: { total_replies: -1 } },
      { $limit: limit },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staff'
        }
      },
      { $unwind: '$staff' },
      {
        $project: {
          _id: 0,
          staff_id: '$_id',
          staff_name: '$staff.full_name',
          staff_role: '$staff.role',
          total_replies: 1,
          latest_reply: 1
        }
      }
    ]);

    return topStaff;
  }

  async checkRatingExists(ratingId) {
    const rating = await Rating.findById(ratingId);
    return !!rating;
  }

  async checkStaffExists(staffId) {
    const { User } = require('../../models');
    const staff = await User.findById(staffId);
    return !!staff && ['waiter', 'cashier', 'manager'].includes(staff.role);
  }
}

module.exports = new RatingReplyRepository();
