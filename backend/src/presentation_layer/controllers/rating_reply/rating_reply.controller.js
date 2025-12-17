const ratingReplyService = require('../../../application_layer/rating_reply/rating_reply.service');

class RatingReplyController {
  async getAllReplies(req, res) {
    try {
      const filters = {
        rating_id: req.query.rating_id,
        staff_id: req.query.staff_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const replies = await ratingReplyService.getAllReplies(filters);

      res.status(200).json({
        success: true,
        count: replies.length,
        data: replies
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getReplyById(req, res) {
    try {
      const reply = await ratingReplyService.getReplyById(req.params.id);

      res.status(200).json({
        success: true,
        data: reply
      });
    } catch (error) {
      const statusCode = error.message === 'Rating reply not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRepliesByRatingId(req, res) {
    try {
      const replies = await ratingReplyService.getRepliesByRatingId(req.params.ratingId);

      res.status(200).json({
        success: true,
        count: replies.length,
        data: replies
      });
    } catch (error) {
      const statusCode = error.message === 'Rating not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRepliesByStaffId(req, res) {
    try {
      const replies = await ratingReplyService.getRepliesByStaffId(req.params.staffId);

      res.status(200).json({
        success: true,
        count: replies.length,
        data: replies
      });
    } catch (error) {
      const statusCode = error.message === 'Staff not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async createReply(req, res) {
    try {
      const reply = await ratingReplyService.createReply(req.body);

      res.status(201).json({
        success: true,
        message: 'Rating reply created successfully',
        data: reply
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateReply(req, res) {
    try {
      const reply = await ratingReplyService.updateReply(req.params.id, req.body);

      res.status(200).json({
        success: true,
        message: 'Rating reply updated successfully',
        data: reply
      });
    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 400;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteReply(req, res) {
    try {
      await ratingReplyService.deleteReply(req.params.id);

      res.status(200).json({
        success: true,
        data: {
          message: 'Rating reply deleted successfully'
        }
      });
    } catch (error) {
      const statusCode = error.message === 'Rating reply not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteRepliesByRatingId(req, res) {
    try {
      const result = await ratingReplyService.deleteRepliesByRatingId(req.params.ratingId);

      res.status(200).json({
        success: true,
        data: {
          message: `${result.deletedCount} rating replies deleted successfully`,
          deletedCount: result.deletedCount
        }
      });
    } catch (error) {
      const statusCode = error.message === 'Rating not found' ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  async getStatistics(req, res) {
    try {
      const filters = {
        staff_id: req.query.staff_id,
        start_date: req.query.start_date,
        end_date: req.query.end_date
      };

      const stats = await ratingReplyService.getStatistics(filters);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getTopRespondingStaff(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const topStaff = await ratingReplyService.getTopRespondingStaff(limit);

      res.status(200).json({
        success: true,
        count: topStaff.length,
        data: topStaff
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new RatingReplyController();
