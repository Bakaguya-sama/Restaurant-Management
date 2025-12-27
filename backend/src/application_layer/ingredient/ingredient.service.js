const ingredientRepo = require('../../infrastructure_layer/ingredient/ingredient.repository');

async function getAllIngredients() {
  const ingredients = await ingredientRepo.findAll();
  return ingredients.map(ing => ({
    id: ing.id,
    name: ing.name,
    unit: ing.unit,
    quantity_in_stock: ing.quantity_in_stock,
    minimum_quantity: ing.minimum_quantity,
    unit_price: ing.unit_price,
    supplier_id: ing.supplier_id,
    expiry_date: ing.expiry_date,
    stock_status: ing.stock_status,
    expiry_status: ing.expiry_status,
    createdAt: ing.createdAt,
    updatedAt: ing.updatedAt,
  }));
}

async function getIngredientById(id) {
  const ingredient = await ingredientRepo.findById(id);
  if (!ingredient) {
    throw { status: 404, message: 'Ingredient not found' };
  }
  
  return {
    id: ingredient.id,
    name: ingredient.name,
    unit: ingredient.unit,
    quantity_in_stock: ingredient.quantity_in_stock,
    minimum_quantity: ingredient.minimum_quantity,
    unit_price: ingredient.unit_price,
    supplier_id: ingredient.supplier_id,
    expiry_date: ingredient.expiry_date,
    stock_status: ingredient.stock_status,
    expiry_status: ingredient.expiry_status,
    createdAt: ingredient.createdAt,
    updatedAt: ingredient.updatedAt,
  };
}

async function createIngredient(data) {
  if (!data.name) {
    throw { status: 400, message: 'Ingredient name is required' };
  }
  if (!data.unit) {
    throw { status: 400, message: 'Ingredient unit is required' };
  }
  if (!data.unit_price && data.unit_price !== 0) {
    throw { status: 400, message: 'Ingredient unit_price is required' };
  }
  if (!data.supplier_id) {
    throw { status: 400, message: 'Ingredient supplier_id is required' };
  }
  
  const existing = await ingredientRepo.findByName(data.name);
  if (existing) {
    throw { status: 400, message: 'Ingredient with this name already exists' };
  }
  
  const ingredient = await ingredientRepo.create({
    name: data.name,
    unit: data.unit,
    quantity_in_stock: data.quantity_in_stock || 0,
    minimum_quantity: data.minimum_quantity || 0,
    unit_price: data.unit_price,
    supplier_id: data.supplier_id,
    expiry_date: data.expiry_date,
    stock_status: data.stock_status,
    expiry_status: data.expiry_status,
  });
  
  return {
    id: ingredient.id,
    name: ingredient.name,
    unit: ingredient.unit,
    quantity_in_stock: ingredient.quantity_in_stock,
    minimum_quantity: ingredient.minimum_quantity,
    unit_price: ingredient.unit_price,
    supplier_id: ingredient.supplier_id,
    expiry_date: ingredient.expiry_date,
    stock_status: ingredient.stock_status,
    expiry_status: ingredient.expiry_status,
    createdAt: ingredient.createdAt,
    updatedAt: ingredient.updatedAt,
  };
}

async function updateIngredient(id, data) {
  const existing = await ingredientRepo.findById(id);
  if (!existing) {
    throw { status: 404, message: 'Ingredient not found' };
  }
  
  if (data.name && data.name !== existing.name) {
    const duplicate = await ingredientRepo.findByName(data.name);
    if (duplicate) {
      throw { status: 400, message: 'Ingredient with this name already exists' };
    }
  }
  
  const ingredient = await ingredientRepo.update(id, {
    name: data.name,
    unit: data.unit,
    quantity_in_stock: data.quantity_in_stock,
    minimum_quantity: data.minimum_quantity,
    unit_price: data.unit_price,
    supplier_id: data.supplier_id,
    expiry_date: data.expiry_date,
    stock_status: data.stock_status,
    expiry_status: data.expiry_status,
  });
  
  return {
    id: ingredient.id,
    name: ingredient.name,
    unit: ingredient.unit,
    quantity_in_stock: ingredient.quantity_in_stock,
    minimum_quantity: ingredient.minimum_quantity,
    unit_price: ingredient.unit_price,
    supplier_id: ingredient.supplier_id,
    expiry_date: ingredient.expiry_date,
    stock_status: ingredient.stock_status,
    expiry_status: ingredient.expiry_status,
    createdAt: ingredient.createdAt,
    updatedAt: ingredient.updatedAt,
  };
}

async function deleteIngredient(id) {
  const existing = await ingredientRepo.findById(id);
  if (!existing) {
    throw { status: 404, message: 'Ingredient not found' };
  }
  
  const deleted = await ingredientRepo.deleteById(id);
  if (!deleted) {
    throw { status: 400, message: 'Failed to delete ingredient' };
  }
  
  return { message: 'Ingredient deleted successfully' };
}

module.exports = {
  getAllIngredients,
  getIngredientById,
  createIngredient,
  updateIngredient,
  deleteIngredient,
};
