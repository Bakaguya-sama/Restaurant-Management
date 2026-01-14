const express = require('express');
const router = express.Router();
const DishRatingController = require('../controllers/dishrating/dishrating.controller');

const dishRatingController = new DishRatingController();

router.get('/dish/:dishId/average', (req, res) => dishRatingController.getAverageScoreByDish(req, res));
router.get('/rating/:ratingId', (req, res) => dishRatingController.getDishRatingsByRatingId(req, res));
router.get('/dish/:dishId', (req, res) => dishRatingController.getDishRatingsByDishId(req, res));
router.get('/:id', (req, res) => dishRatingController.getDishRatingById(req, res));
router.get('/', (req, res) => dishRatingController.getAllDishRatings(req, res));
router.post('/', (req, res) => dishRatingController.createDishRating(req, res));
router.put('/:id', (req, res) => dishRatingController.updateDishRating(req, res));
router.delete('/:id', (req, res) => dishRatingController.deleteDishRating(req, res));

module.exports = router;
