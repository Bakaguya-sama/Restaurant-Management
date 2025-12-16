const express = require('express');
const router = express.Router();
const ratingReplyController = require('../controllers/rating_reply/rating_reply.controller');

router.get('/statistics', ratingReplyController.getStatistics);
router.get('/statistics/top-staff', ratingReplyController.getTopRespondingStaff);

router.get('/', ratingReplyController.getAllReplies);
router.get('/:id', ratingReplyController.getReplyById);

router.get('/rating/:ratingId', ratingReplyController.getRepliesByRatingId);
router.get('/staff/:staffId', ratingReplyController.getRepliesByStaffId);

router.post('/', ratingReplyController.createReply);

router.put('/:id', ratingReplyController.updateReply);

router.delete('/:id', ratingReplyController.deleteReply);
router.delete('/rating/:ratingId', ratingReplyController.deleteRepliesByRatingId);

module.exports = router;
