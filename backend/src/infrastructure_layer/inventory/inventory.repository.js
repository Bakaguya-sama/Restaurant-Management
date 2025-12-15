const { Ingredient, StockImport, StockImportDetail, StockExport, StockExportDetail } = require('../../models');
const mongoose = require('mongoose');

async function getBatches({ low = false, expiring = false }) {
  const match = { quantity: { $gt: 0 } };

  if (expiring) {
    const now = new Date();
    const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    match.expiry_date = { $lte: soon };
  }

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: 'ingredients',
        localField: 'ingredient_id',
        foreignField: '_id',
        as: 'ingredient'
      }
    },
    { $unwind: '$ingredient' },
    {
      $lookup: {
        from: 'stockimports',
        localField: 'import_id',
        foreignField: '_id',
        as: 'import'
      }
    },
    { $unwind: { path: '$import', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'suppliers',
        localField: 'import.supplier_id',
        foreignField: '_id',
        as: 'supplier'
      }
    }
  ];

  if (low) {
    pipeline.push({ $match: { $expr: { $lte: ['$ingredient.quantity_in_stock', '$ingredient.minimum_quantity'] } } });
  }

  pipeline.push({
    $project: {
      _id: '$_id',
      import: '$import',
      supplier: '$supplier',
      ingredient_id: '$ingredient._id',
      name: '$ingredient.name',
      lastUpdated: '$ingredient.updated_at',
      quantity: '$quantity',
      unit: '$ingredient.unit',
      expiryDate: '$expiry_date'
    }
  });

  return StockImportDetail.aggregate(pipeline);
}

async function createStockImport(items) {
  const importNumber = `IMP-${Date.now()}`;
  const stockImport = new StockImport({ import_number: importNumber, supplier_id: items[0].supplierId, supplier_name: undefined, status: 'completed' });
  await stockImport.save();

  const details = [];

  for (const it of items) {
    const ing = await Ingredient.findById(it.itemId);
    if (!ing) throw { status: 404, message: `Ingredient not found: ${it.itemId}` };

    const unitPrice = ing.unit_price || 0;
    const lineTotal = unitPrice * it.quantity;

    const detail = new StockImportDetail({ import_id: stockImport._id, ingredient_id: ing._id, quantity: it.quantity, unit_price: unitPrice, line_total: lineTotal, expiry_date: new Date(it.expiryDate) });
    await detail.save();

    ing.quantity_in_stock = (ing.quantity_in_stock || 0) + it.quantity;
    ing.updated_at = new Date();
    await ing.save();

    details.push({ id: detail._id, ingredientId: ing._id, quantity: it.quantity });
  }

  return { import: stockImport, details };
}

async function createStockExport(items, staffId = null) {
  const exportNumber = `EXP-${Date.now()}`;
  const stockExport = new StockExport({ export_number: exportNumber, notes: items.map(i => i.reason).join('; '), status: 'completed' });
  await stockExport.save();

  const details = [];

  for (const it of items) {
    const ing = await Ingredient.findById(it.itemId);
    if (!ing) throw { status: 404, message: `Ingredient not found: ${it.itemId}` };

    if ((ing.quantity_in_stock || 0) < it.quantity) throw { status: 400, message: `Insufficient stock for ${ing.name}` };

    const unitPrice = ing.unit_price || 0;
    const lineTotal = unitPrice * it.quantity;

    const detail = new StockExportDetail({ export_id: stockExport._id, ingredient_id: ing._id, quantity: it.quantity, unit_price: unitPrice, line_total: lineTotal });
    await detail.save();

    ing.quantity_in_stock = ing.quantity_in_stock - it.quantity;
    if (ing.quantity_in_stock < 0) ing.quantity_in_stock = 0;
    ing.updated_at = new Date();
    await ing.save();

    details.push({ id: detail._id, ingredientId: ing._id, quantity: it.quantity });
  }

  return { export: stockExport, details };
}

async function updateIngredient(id, updates) {
  return Ingredient.findByIdAndUpdate(id, { $set: updates, updated_at: new Date() }, { new: true });
}

module.exports = {
  getBatches,
  createStockImport,
  createStockExport,
  updateIngredient
};
