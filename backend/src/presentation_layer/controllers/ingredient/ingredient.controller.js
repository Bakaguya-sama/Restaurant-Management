const ingredientService = require('../../../application_layer/ingredient/ingredient.service');

function formatSuccess(res, data, message, status = 200) {
  return res.status(status).json({ success: true, data, message });
}

function formatError(res, status = 400, message = 'Bad Request') {
  return res.status(status).json({ success: false, data: null, message });
}

exports.getAllIngredients = async (req, res) => {
  try {
    const ingredients = await ingredientService.getAllIngredients();
    return formatSuccess(res, ingredients, 'Ingredients retrieved successfully');
  } catch (err) {
    console.error('getAllIngredients error:', err);
    return formatError(res, err.status || 500, err.message || 'Internal Server Error');
  }
};

exports.getIngredientById = async (req, res) => {
  try {
    const { id } = req.params;
    const ingredient = await ingredientService.getIngredientById(id);
    return formatSuccess(res, ingredient, 'Ingredient retrieved successfully');
  } catch (err) {
    console.error('getIngredientById error:', err);
    return formatError(res, err.status || 500, err.message || 'Internal Server Error');
  }
};

exports.createIngredient = async (req, res) => {
  try {
    const { name, unit, quantity_in_stock, minimum_quantity, unit_price, supplier_name, supplier_contact, expiry_date, stock_status, expiry_status } = req.body;
    const ingredient = await ingredientService.createIngredient({
      name,
      unit,
      quantity_in_stock,
      minimum_quantity,
      unit_price,
      supplier_name,
      supplier_contact,
      expiry_date,
      stock_status,
      expiry_status,
    });
    return formatSuccess(res, ingredient, 'Ingredient created successfully', 201);
  } catch (err) {
    console.error('createIngredient error:', err);
    return formatError(res, err.status || 500, err.message || 'Internal Server Error');
  }
};

exports.updateIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, unit, quantity_in_stock, minimum_quantity, unit_price, supplier_name, supplier_contact, expiry_date, stock_status, expiry_status } = req.body;
    const ingredient = await ingredientService.updateIngredient(id, {
      name,
      unit,
      quantity_in_stock,
      minimum_quantity,
      unit_price,
      supplier_name,
      supplier_contact,
      expiry_date,
      stock_status,
      expiry_status,
    });
    return formatSuccess(res, ingredient, 'Ingredient updated successfully');
  } catch (err) {
    console.error('updateIngredient error:', err);
    return formatError(res, err.status || 500, err.message || 'Internal Server Error');
  }
};

exports.updateIngredientQuantity = async (req, res) => {
  try {
    const { id } = req.params;
    const { quantity_in_stock } = req.body;
    
    if (quantity_in_stock === undefined || quantity_in_stock === null) {
      return formatError(res, 400, 'quantity_in_stock is required');
    }
    
    if (typeof quantity_in_stock !== 'number' || quantity_in_stock < 0) {
      return formatError(res, 400, 'quantity_in_stock must be a non-negative number');
    }
    
    const ingredient = await ingredientService.updateIngredient(id, {
      quantity_in_stock,
    });
    return formatSuccess(res, ingredient, 'Ingredient quantity updated successfully');
  } catch (err) {
    console.error('updateIngredientQuantity error:', err);
    return formatError(res, err.status || 500, err.message || 'Internal Server Error');
  }
};

exports.deleteIngredient = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await ingredientService.deleteIngredient(id);
    return formatSuccess(res, result, 'Ingredient deleted successfully');
  } catch (err) {
    console.error('deleteIngredient error:', err);
    return formatError(res, err.status || 500, err.message || 'Internal Server Error');
  }
};
