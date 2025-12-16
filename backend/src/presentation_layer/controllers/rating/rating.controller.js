const RatingService = require('../../../application_layer/rating/rating.service');

class RatingController {
  constructor() {
    this.ratingService = new RatingService();
  }

  async getAllRatings(req, res) {
    try {
      const filters = {
        customer_id: req.query.customer_id,
        score: req.query.score,
        min_score: req.query.min_score,
        max_score: req.query.max_score
      };

      const ratings = await this.ratingService.getAllRatings(filters);

      res.status(200).json({
        success: true,
        count: ratings.length,
        data: ratings
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getRatingById(req, res) {
    try {
      const rating = await this.ratingService.getRatingById(req.params.id);

      res.status(200).json({
        success: true,
        data: rating
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createRating(req, res) {
    try {
      const rating = await this.ratingService.createRating(req.body);

      res.status(201).json({
        success: true,
        data: rating
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateRating(req, res) {
    try {
      const rating = await this.ratingService.updateRating(req.params.id, req.body);

      res.status(200).json({
        success: true,
        data: rating
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteRating(req, res) {
    try {
      const result = await this.ratingService.deleteRating(req.params.id);

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

  async getRatingReplies(req, res) {
    try {
      const replies = await this.ratingService.getRatingReplies(req.params.id);

      res.status(200).json({
        success: true,
        count: replies.length,
        data: replies
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createRatingReply(req, res) {
    try {
      const { staff_id, reply_text } = req.body;

      if (!staff_id || !reply_text) {
        return res.status(400).json({
          success: false,
          message: 'Staff ID and reply text are required'
        });
      }

      const reply = await this.ratingService.createRatingReply(req.params.id, staff_id, reply_text);

      res.status(201).json({
        success: true,
        data: reply
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteRatingReply(req, res) {
    try {
      const result = await this.ratingService.deleteRatingReply(req.params.replyId);

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

  async getRatingStatistics(req, res) {
    try {
      const statistics = await this.ratingService.getRatingStatistics();

      res.status(200).json({
        success: true,
        data: statistics
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = RatingController;
