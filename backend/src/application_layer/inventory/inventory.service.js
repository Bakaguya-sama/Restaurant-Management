const inventoryRepo = require('../../infrastructure_layer/inventory/inventory.repository');
const { InventoryBatch } = require('../../domain_layer/inventory/inventory.entity');

function mapBatch(b) {
  const supplierName = b.import && b.import.supplier_name
    ? b.import.supplier_name
    : (Array.isArray(b.supplier) && b.supplier.length && b.supplier[0].name)
      ? b.supplier[0].name
      : (b.import && b.import.supplier_id ? b.import.supplier_id.toString() : null);

  return new InventoryBatch({
    id: b._id ? b._id.toString() : null,
    ingredientId: b.ingredient_id ? b.ingredient_id.toString() : null,
    name: b.name || null,
    quantity: b.quantity || 0,
    unit: b.unit || null,
    expiryDate: b.expiryDate ? new Date(b.expiryDate).toISOString().split('T')[0] : null,
    supplierName: supplierName || null,
    lastUpdated: b.lastUpdated ? new Date(b.lastUpdated).toISOString() : null
  });
}

async function listInventory({ lowStock = false, expiring = false }) {
  const batches = await inventoryRepo.getBatches({ low: lowStock, expiring });
  return batches.map(mapBatch);
}

async function importItems(items) {
  // validations same as previous controller
  if (!Array.isArray(items) || items.length === 0) throw { status: 400, message: 'items must be a non-empty array' };

  for (const it of items) {
    if (!it.itemId) throw { status: 400, message: 'itemId is required for each item' };
    if (!it.quantity || typeof it.quantity !== 'number' || it.quantity <= 0) throw { status: 400, message: 'quantity must be > 0' };
    if (!it.supplierId) throw { status: 400, message: 'supplierId is required' };
    if (!it.expiryDate || isNaN(Date.parse(it.expiryDate))) throw { status: 400, message: 'expiryDate is required and must be a valid date' };
  }

  const result = await inventoryRepo.createStockImport(items);
  return { importId: result.import._id, details: result.details };
}

async function exportItems(items) {
  if (!Array.isArray(items) || items.length === 0) throw { status: 400, message: 'items must be a non-empty array' };

  for (const it of items) {
    if (!it.itemId) throw { status: 400, message: 'itemId is required for each item' };
    if (!it.quantity || typeof it.quantity !== 'number' || it.quantity <= 0) throw { status: 400, message: 'quantity must be > 0' };
    if (!it.reason) throw { status: 400, message: 'reason is required for each exported item' };
  }

  const result = await inventoryRepo.createStockExport(items);
  return { exportId: result.export._id, details: result.details };
}

async function updateIngredient(id, body) {
  const allowed = ['name', 'unit', 'expiryDate', 'expiry_date', 'supplierId'];
  const updates = {};

  for (const key of allowed) {
    if (key === 'supplierId' && body.supplierId) {
      updates.supplier_name = undefined;
      updates.supplier_id = body.supplierId;
    }

    if ((key === 'expiryDate' || key === 'expiry_date') && body.expiryDate) {
      updates.expiry_date = body.expiryDate;
    }

    if (key !== 'supplierId' && key !== 'expiryDate' && key !== 'expiry_date' && body[key] !== undefined) {
      updates[key] = body[key];
    }
  }

  if (body.quantity_in_stock !== undefined || body.quantity !== undefined) {
    throw { status: 400, message: 'Direct quantity update is not allowed' };
  }

  const updated = await inventoryRepo.updateIngredient(id, updates);
  if (!updated) throw { status: 404, message: 'Ingredient not found' };

  return { id: updated._id, name: updated.name, unit: updated.unit, expiry_date: updated.expiry_date, supplier_id: updated.supplier_id };
}

module.exports = {
  listInventory,
  importItems,
  exportItems,
  updateIngredient
};
