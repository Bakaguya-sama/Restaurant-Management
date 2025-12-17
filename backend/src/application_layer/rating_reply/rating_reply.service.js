const ratingReplyRepository = require('../../infrastructure_layer/rating_reply/rating_reply.repository');
const RatingReplyEntity = require('../../domain_layer/rating_reply/rating_reply.entity');

class RatingReplyService {
  async getAllReplies(filters = {}) {
    return await ratingReplyRepository.findAll(filters);
  }

  async getReplyById(id) {
    const reply = await ratingReplyRepository.findById(id);

    if (!reply) {
      throw new Error('Rating reply not found');
    }

    return reply;
  }

  async getRepliesByRatingId(ratingId) {
    const ratingExists = await ratingReplyRepository.checkRatingExists(ratingId);
    if (!ratingExists) {
      throw new Error('Rating not found');
    }

    return await ratingReplyRepository.findByRatingId(ratingId);
  }

  async getRepliesByStaffId(staffId) {
    const staffExists = await ratingReplyRepository.checkStaffExists(staffId);
    if (!staffExists) {
      throw new Error('Staff not found');
    }

    return await ratingReplyRepository.findByStaffId(staffId);
  }

  async createReply(replyData) {
    const entity = new RatingReplyEntity(replyData);
    const validation = entity.validate();

    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }

    const ratingExists = await ratingReplyRepository.checkRatingExists(replyData.rating_id);
    if (!ratingExists) {
      throw new Error('Rating not found');
    }

    const staffExists = await ratingReplyRepository.checkStaffExists(replyData.staff_id);
    if (!staffExists) {
      throw new Error('Staff not found');
    }

    return await ratingReplyRepository.create(replyData);
  }

  async updateReply(id, updates) {
    const existingReply = await ratingReplyRepository.findById(id);
    if (!existingReply) {
      throw new Error('Rating reply not found');
    }

    if (updates.reply_text !== undefined) {
      if (!updates.reply_text || updates.reply_text.trim() === '') {
        throw new Error('Reply text cannot be empty');
      }
      if (updates.reply_text.length > 1000) {
        throw new Error('Reply text must not exceed 1000 characters');
      }
    }

    if (updates.rating_id) {
      const ratingExists = await ratingReplyRepository.checkRatingExists(updates.rating_id);
      if (!ratingExists) {
        throw new Error('Rating not found');
      }
    }

    if (updates.staff_id) {
      const staffExists = await ratingReplyRepository.checkStaffExists(updates.staff_id);
      if (!staffExists) {
        throw new Error('Staff not found');
      }
    }

    return await ratingReplyRepository.update(id, updates);
  }

  async deleteReply(id) {
    const existingReply = await ratingReplyRepository.findById(id);
    if (!existingReply) {
      throw new Error('Rating reply not found');
    }

    return await ratingReplyRepository.delete(id);
  }

  async deleteRepliesByRatingId(ratingId) {
    const ratingExists = await ratingReplyRepository.checkRatingExists(ratingId);
    if (!ratingExists) {
      throw new Error('Rating not found');
    }

    const deletedCount = await ratingReplyRepository.deleteByRatingId(ratingId);
    return { deletedCount };
  }

  async getStatistics(filters = {}) {
    return await ratingReplyRepository.getStatistics(filters);
  }

  async getTopRespondingStaff(limit = 10) {
    return await ratingReplyRepository.getTopRespondingStaff(limit);
  }
}

module.exports = new RatingReplyService();
