const menuService = require('../../../application_layer/menu/menu.service');

function success(res, data, message) {
  return res.json({ success: true, data, message });
}

function error(res, status = 400, message = 'Bad Request') {
  return res.status(status).json({ success: false, data: null, message });
}

/**
 * Example responses and requests are included inline for each handler.
 */

exports.getMenu = async (req, res) => {
  try {
    const { category, search } = req.query;
    let { available } = req.query;
    if (typeof available !== 'undefined') available = available === 'true' || available === true;

    const data = await menuService.listMenu({ category, search, available });
    return success(res, data, 'Menu retrieved');
  } catch (err) {
    console.error('getMenu error', err);
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message || 'Internal Server Error' });
  }
};

exports.createMenu = async (req, res) => {
  try {
    const payload = req.body;
    const result = await menuService.createMenuDish(payload);
    return res.status(201).json({ success: true, data: result, message: 'Dish created' });
  } catch (err) {
    console.error('createMenu error', err);
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message || 'Internal Server Error' });
  }
};

exports.updateMenu = async (req, res) => {
  try {
    const id = req.params.id;
    const payload = req.body;
    const result = await menuService.updateMenuDish(id, payload);
    return success(res, result, 'Dish updated');
  } catch (err) {
    console.error('updateMenu error', err);
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message || 'Internal Server Error' });
  }
};

exports.deleteMenu = async (req, res) => {
  try {
    const id = req.params.id;
    await menuService.deleteMenuDish(id);
    return res.json({ success: true, message: 'Xóa món ăn thành công' });
  } catch (err) {
    console.error('deleteMenu error', err);
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message || 'Internal Server Error' });
  }
};

exports.patchAvailability = async (req, res) => {
  try {
    const id = req.params.id;
    // Support `available` or `is_available` keys from clients
    let { available, reason } = req.body;
    if (typeof available === 'undefined' && typeof req.body.is_available !== 'undefined') {
      available = req.body.is_available;
    }
    // Accept string and numeric booleans from clients and coerce them
    if (typeof available === 'string') {
      const v = available.trim().toLowerCase();
      if (v === 'true' || v === '1') available = true;
      else if (v === 'false' || v === '0') available = false;
    } else if (typeof available === 'number') {
      if (available === 1) available = true;
      else if (available === 0) available = false;
    }
    if (typeof available !== 'boolean') throw { status: 400, message: 'available must be boolean' };
    // If you have auth, pass staff id as 'by'
    const result = await menuService.patchAvailability(id, { available, reason, by: null });
    return success(res, result, 'Availability updated');
  } catch (err) {
    console.error('patchAvailability error', err);
    return res.status(err.status || 500).json({ success: false, data: null, message: err.message || 'Internal Server Error' });
  }
};

/**
 * Samples:
 * GET /api/v1/menu?category=main_course&available=true&search=beef
 * Response: { success: true, data: [ { id, name, category, price, description, image, available, ingredients: [...] } ] }
 *
 * POST /api/v1/menu
 * Body: { name, category, price, description, image, ingredients: [{ inventoryItemId, quantity }] }
 * Response: { success: true, data: { id } }
 *
 * PUT /api/v1/menu/:id
 * Body: same as POST (image optional)
 * Response: { success: true, data: { id } }
 *
 * DELETE /api/v1/menu/:id
 * Response: { success: true, message: 'Xóa món ăn thành công' }
 *
 * PATCH /api/v1/menu/:id/availability
 * Body: { available: true|false, reason?: string }
 * Response: { success: true, data: { id, available } }
 */
