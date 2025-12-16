const express = require('express');
const router = express.Router();
const RatingController = require('../controllers/rating/rating.controller');

const ratingController = new RatingController();

router.get('/statistics', (req, res) => ratingController.getRatingStatistics(req, res));
router.get('/:id/replies', (req, res) => ratingController.getRatingReplies(req, res));
router.get('/:id', (req, res) => ratingController.getRatingById(req, res));
router.get('/', (req, res) => ratingController.getAllRatings(req, res));
router.post('/', (req, res) => ratingController.createRating(req, res));
router.post('/:id/replies', (req, res) => ratingController.createRatingReply(req, res));
router.put('/:id', (req, res) => ratingController.updateRating(req, res));
router.delete('/:id', (req, res) => ratingController.deleteRating(req, res));
router.delete('/replies/:replyId', (req, res) => ratingController.deleteRatingReply(req, res));

module.exports = router;
