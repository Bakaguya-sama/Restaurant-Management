const express = require('express');
const router = express.Router();
const IngredientController = require('../controllers/ingredient/ingredient.controller');

// Get all ingredients
router.get('/', IngredientController.getAllIngredients);

// Get ingredient by ID
router.get('/:id', IngredientController.getIngredientById);

// Create ingredient
router.post('/', IngredientController.createIngredient);

// Update ingredient
router.put('/:id', IngredientController.updateIngredient);

// Patch - Update only quantity
router.patch('/:id/quantity', IngredientController.updateIngredientQuantity);

// Delete ingredient
router.delete('/:id', IngredientController.deleteIngredient);

module.exports = router;
