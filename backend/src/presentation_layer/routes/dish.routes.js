const express = require('express');
const DishController = require('../controllers/dish/dish.controller');

const router = express.Router();
const dishController = new DishController();

router.get('/', (req, res) => dishController.getAllDishes(req, res));
router.post('/', (req, res) => dishController.createDish(req, res));
router.get('/:id', (req, res) => dishController.getDishById(req, res));
router.put('/:id', (req, res) => dishController.updateDish(req, res));
router.patch('/:id/availability', (req, res) => dishController.updateDishAvailability(req, res));
router.delete('/:id', (req, res) => dishController.deleteDish(req, res));

router.get('/:id/ingredients', (req, res) => dishController.getDishIngredients(req, res));
router.post('/:id/ingredients', (req, res) => dishController.addIngredientToDish(req, res));
router.put('/:id/ingredients/:ingredientId', (req, res) => dishController.updateDishIngredient(req, res));
router.delete('/:id/ingredients/:ingredientId', (req, res) => dishController.removeIngredientFromDish(req, res));

module.exports = router;
