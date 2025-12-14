const mongoose = require('mongoose');
const { Dish, DishIngredient, Ingredient, StockImportDetail } = require('../../models');

async function listDishes({ category, search } = {}) {
  const filter = {};
  if (category) filter.category = category;
  if (search) filter.name = { $regex: search, $options: 'i' };
  return Dish.find(filter).sort({ name: 1 });
}

async function findDishById(id) {
  return Dish.findById(id);
}

async function createDish(payload) {
  const d = new Dish(payload);
  await d.save();
  return d;
}

async function updateDish(id, updates) {
  updates.updated_at = new Date();
  return Dish.findByIdAndUpdate(id, { $set: updates }, { new: true });
}

async function deleteDish(id) {
  await Dish.findByIdAndDelete(id);
}

async function listDishIngredients(dishId) {
  return DishIngredient.find({ dish_id: dishId }).populate('ingredient_id');
}

async function deleteDishIngredientsByDishId(dishId) {
  return DishIngredient.deleteMany({ dish_id: dishId });
}

async function createDishIngredient({ dishId, ingredientId, quantityRequired, unit }) {
  const di = new DishIngredient({ dish_id: dishId, ingredient_id: ingredientId, quantity_required: quantityRequired, unit });
  await di.save();
  return di;
}

async function getIngredientCurrentStock(ingredientId) {
  const res = await StockImportDetail.aggregate([
    { $match: { ingredient_id: new mongoose.Types.ObjectId(ingredientId), quantity: { $gt: 0 } } },
    { $group: { _id: '$ingredient_id', total: { $sum: '$quantity' } } }
  ]);
  return (res[0] && res[0].total) || 0;
}

module.exports = {
  listDishes,
  findDishById,
  createDish,
  updateDish,
  deleteDish,
  listDishIngredients,
  deleteDishIngredientsByDishId,
  createDishIngredient,
  getIngredientCurrentStock
};
