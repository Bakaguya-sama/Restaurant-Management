const menuRepo = require('../../infrastructure_layer/menu/menu.repository');
const { Ingredient } = require('../../models');

const VALID_CATEGORIES = ['appetizer', 'main_course', 'dessert', 'beverage'];

async function listMenu({ category, available, search } = {}) {
  const dishes = await menuRepo.listDishes({ category, search });

  const result = [];

  for (const d of dishes) {
    const dishId = d._id;
    const ingredients = await menuRepo.listDishIngredients(dishId);

    const ingredientOut = [];
    let forceUnavailable = false;
    let unavailableReason = null;

    for (const ingLink of ingredients) {
      const ing = ingLink.ingredient_id; // populated
      const required = ingLink.quantity_required;
      const unit = ingLink.unit;
      const stock = await menuRepo.getIngredientCurrentStock(ing._id);

      ingredientOut.push({ inventoryItemId: String(ing._id), name: ing.name, quantity: required, unit });

      if (stock <= 0) {
        forceUnavailable = true;
        unavailableReason = `Hết nguyên liệu: ${ing.name}`;
        // stop at first critical shortage
        break;
      }
      if (stock < required) {
        // non-zero but insufficient
        forceUnavailable = true;
        unavailableReason = 'Nguyên liệu không đủ';
        break;
      }
    }

    // Inventory shortage has priority over manual availability flag
    // If any ingredient is insufficient, we force available=false and set unavailableReason
    const availableFlag = forceUnavailable ? false : !!d.is_available;

    // Apply query filter if available specified
    if (typeof available === 'boolean') {
      if (availableFlag !== available) continue;
    }

    result.push({
      id: String(d._id),
      name: d.name,
      category: d.category,
      price: d.price,
      description: d.description || null,
      image: d.image_url || null,
      available: availableFlag,
      ...(availableFlag ? {} : { unavailableReason }),
      ingredients: ingredientOut
    });
  }

  return result;
}

async function createMenuDish({ name, category, price, description, image, ingredients }) {
  if (!name) throw { status: 400, message: 'name is required' };
  if (!category || VALID_CATEGORIES.indexOf(category) === -1) throw { status: 400, message: 'category is required or invalid' };
  if (typeof price !== 'number' || price < 0) throw { status: 400, message: 'price must be a number >= 0' };
  if (!Array.isArray(ingredients)) throw { status: 400, message: 'ingredients must be an array' };

  // Validate ingredient ids
  for (const it of ingredients) {
    if (!it.inventoryItemId || typeof it.quantity !== 'number' || it.quantity <= 0) throw { status: 400, message: 'Each ingredient must have inventoryItemId and quantity > 0' };
    const ing = await Ingredient.findById(it.inventoryItemId);
    if (!ing) throw { status: 400, message: `Ingredient not found: ${it.inventoryItemId}` };
  }

  const dish = await menuRepo.createDish({ name, category, price, description, image_url: image, is_available: true });

  for (const it of ingredients) {
    const ing = await Ingredient.findById(it.inventoryItemId);
    await menuRepo.createDishIngredient({ dishId: dish._id, ingredientId: ing._id, quantityRequired: it.quantity, unit: ing.unit });
  }

  return { id: String(dish._id) };
}

async function updateMenuDish(id, { name, category, price, description, image, ingredients }) {
  const dish = await menuRepo.findDishById(id);
  if (!dish) throw { status: 404, message: 'Dish not found' };

  if (category && VALID_CATEGORIES.indexOf(category) === -1) throw { status: 400, message: 'category invalid' };

  const updates = { name: name || dish.name, category: category || dish.category, price: (typeof price === 'number' ? price : dish.price), description: description || dish.description };
  if (image) updates.image_url = image; // keep old image if not provided

  const updated = await menuRepo.updateDish(id, updates);

  // Replace ingredients if provided
  if (Array.isArray(ingredients)) {
    // validate ingredients
    for (const it of ingredients) {
      if (!it.inventoryItemId || typeof it.quantity !== 'number' || it.quantity <= 0) throw { status: 400, message: 'Each ingredient must have inventoryItemId and quantity > 0' };
      const ing = await Ingredient.findById(it.inventoryItemId);
      if (!ing) throw { status: 400, message: `Ingredient not found: ${it.inventoryItemId}` };
    }

    await menuRepo.deleteDishIngredientsByDishId(id);
    for (const it of ingredients) {
      const ing = await Ingredient.findById(it.inventoryItemId);
      await menuRepo.createDishIngredient({ dishId: id, ingredientId: ing._id, quantityRequired: it.quantity, unit: ing.unit });
    }
  }

  return { id: String(updated._id) };
}

async function deleteMenuDish(id) {
  const dish = await menuRepo.findDishById(id);
  if (!dish) throw { status: 404, message: 'Dish not found' };
  await menuRepo.deleteDish(id);
  await menuRepo.deleteDishIngredientsByDishId(id);
  return;
}

async function patchAvailability(id, { available, reason, by = null }) {
  const dish = await menuRepo.findDishById(id);
  if (!dish) throw { status: 404, message: 'Dish not found' };

  const updates = { is_available: !!available };
  if (available === false) {
    updates.manual_unavailable_reason = reason || null;
    updates.manual_unavailable_by = by || null;
    updates.manual_unavailable_at = new Date();
  } else {
    // clearing manual reason when re-enabled
    updates.manual_unavailable_reason = null;
    updates.manual_unavailable_by = null;
    updates.manual_unavailable_at = null;
  }

  const updated = await menuRepo.updateDish(id, updates);
  return { id: String(updated._id), available: updated.is_available };
}

module.exports = {
  listMenu,
  createMenuDish,
  updateMenuDish,
  deleteMenuDish,
  patchAvailability
};
