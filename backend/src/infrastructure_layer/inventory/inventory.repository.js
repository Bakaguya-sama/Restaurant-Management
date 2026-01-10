const {
  Ingredient,
  StockImport,
  StockImportDetail,
  StockExport,
  StockExportDetail,
} = require("../../models");
const mongoose = require("mongoose");

async function getBatches({ low = false, expiring = false }) {
  const match = {};

  if (expiring) {
    const now = new Date();
    const soon = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    match.expiry_date = { $lte: soon };
  }

  const pipeline = [
    { $match: match },
    {
      $lookup: {
        from: "ingredients",
        localField: "ingredient_id",
        foreignField: "_id",
        as: "ingredient",
      },
    },
    { $unwind: "$ingredient" },
    {
      $lookup: {
        from: "stockimports",
        localField: "import_id",
        foreignField: "_id",
        as: "import",
      },
    },
    { $unwind: { path: "$import", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: "suppliers",
        localField: "import.supplier_id",
        foreignField: "_id",
        as: "supplier",
      },
    },
    // Lookup exports for this batch to calculate remaining
    {
      $lookup: {
        from: "stockexportdetails",
        localField: "_id",
        foreignField: "batch_id",
        as: "exports",
      },
    },
    // Calculate remaining quantity
    {
      $addFields: {
        totalExported: {
          $sum: "$exports.quantity",
        },
        remainingQuantity: {
          $subtract: ["$quantity", { $sum: "$exports.quantity" }],
        },
      },
    },
  ];

  // Filter by remaining > 0
  pipeline.push({
    $match: {
      remainingQuantity: { $gt: 0 },
    },
  });

  if (low) {
    pipeline.push({
      $match: {
        $expr: {
          $lte: [
            "$ingredient.quantity_in_stock",
            "$ingredient.minimum_quantity",
          ],
        },
      },
    });
  }

  pipeline.push({
    $project: {
      _id: "$_id",
      import: "$import",
      supplier: "$supplier",
      ingredient_id: "$ingredient._id",
      name: "$ingredient.name",
      lastUpdated: "$ingredient.updated_at",
      quantity: "$remainingQuantity", // Use remaining, not original
      originalQuantity: "$quantity", // Keep original for reference
      unit: "$ingredient.unit",
      expiryDate: "$expiry_date",
      minimum_quantity: "$ingredient.minimum_quantity",
    },
  });

  return StockImportDetail.aggregate(pipeline);
}

async function createStockImport(items, staffId = null) {
  const importNumber = `IMP-${Date.now()}`;

  // Validate supplier exists
  const Supplier = mongoose.model("Supplier");
  const supplier = await Supplier.findById(items[0].supplierId);
  if (!supplier)
    throw {
      status: 404,
      message: `Supplier not found: ${items[0].supplierId}`,
    };

  // We'll build notes after processing items
  const stockImport = new StockImport({
    import_number: importNumber,
    supplier_id: items[0].supplierId,
    supplier_name: supplier.name,
    staff_id: staffId, // Manager who imports
    status: "completed",
  });
  await stockImport.save();

  const details = [];
  const noteParts = []; // Collect notes for each item
  let totalCost = 0; // Track total cost

  for (const it of items) {
    let ing;

    // If itemId exists, find existing ingredient
    if (it.itemId && mongoose.Types.ObjectId.isValid(it.itemId)) {
      ing = await Ingredient.findById(it.itemId);
    }

    // If ingredient not found and item has name (new ingredient), create it
    if (!ing && it.name) {
      ing = new Ingredient({
        name: it.name,
        unit: it.unit || "kg",
        quantity_in_stock: 0,
        minimum_quantity: it.minimumQuantity !== undefined ? it.minimumQuantity : 10,
        unit_price: it.unitPrice || 0,
        stock_status: "available",
      });
      await ing.save();
    }

    // If still no ingredient found, throw error
    if (!ing)
      throw { status: 404, message: `Ingredient not found: ${it.itemId}` };

    // IMPORTANT: Use unitPrice from import request, NOT from ingredient
    // The ingredient unit_price might be for dishes, not for raw ingredient purchase
    const unitPrice = it.unitPrice !== undefined ? it.unitPrice : 0;
    const lineTotal = unitPrice * it.quantity;

    const detail = new StockImportDetail({
      import_id: stockImport._id,
      ingredient_id: ing._id,
      quantity: it.quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
      expiry_date: new Date(it.expiryDate),
    });
    await detail.save();

    ing.quantity_in_stock = (ing.quantity_in_stock || 0) + it.quantity;
    ing.updated_at = new Date();
    await ing.save();

    details.push({
      id: detail._id,
      ingredientId: ing._id,
      quantity: it.quantity,
    });

    // Add to total cost
    totalCost += lineTotal;

    // Add to notes: "Thịt bò: 100kg, Cá hồi: 50kg"
    noteParts.push(`${ing.name}: ${it.quantity}${ing.unit}`);
  }

  // Update notes and total_cost in the stock import
  stockImport.notes = noteParts.join(", ");
  stockImport.total_cost = totalCost;
  await stockImport.save();

  return { import: stockImport, details };
}

async function createStockExport(items, staffId = null) {
  const exportNumber = `EXP-${Date.now()}`;
  const stockExport = new StockExport({
    export_number: exportNumber,
    notes: items.map((i) => i.reason).join("; "),
    staff_id: staffId, // Manager who handles damaged goods
    status: "completed",
  });
  await stockExport.save();

  const details = [];

  for (const it of items) {
    let ing;
    let batches = [];

    // If batchId is provided, export from that specific batch
    if (it.batchId && mongoose.Types.ObjectId.isValid(it.batchId)) {
      const batch = await StockImportDetail.findById(it.batchId);
      if (!batch)
        throw { status: 404, message: `Batch not found: ${it.batchId}` };

      ing = await Ingredient.findById(batch.ingredient_id);
      if (!ing)
        throw { status: 404, message: `Ingredient not found for batch: ${it.batchId}` };

      // Calculate remaining for this specific batch
      const exports = await StockExportDetail.find({ batch_id: batch._id });
      const totalExported = exports.reduce((sum, e) => sum + (e.quantity || 0), 0);
      const remaining = batch.quantity - totalExported;

      if (remaining < it.quantity)
        throw { status: 400, message: `Insufficient stock in batch. Available: ${remaining}${ing.unit}` };

      batches = [{ batch, remaining }];
    }
    // Otherwise, use FIFO for normal cooking operations
    else if (it.itemId) {
      ing = await Ingredient.findById(it.itemId);
      if (!ing)
        throw { status: 404, message: `Ingredient not found: ${it.itemId}` };

      if ((ing.quantity_in_stock || 0) < it.quantity)
        throw { status: 400, message: `Insufficient stock for ${ing.name}` };

      // Deduct quantity from batches using FIFO (oldest expiry first)
      const allBatches = await StockImportDetail.find({
        ingredient_id: ing._id,
      }).sort({ expiry_date: 1, _id: 1 }); // Sort by expiry date then by ID (FIFO)

      // Calculate remaining for each batch and filter > 0
      const batchesWithRemaining = [];
      for (const batch of allBatches) {
        const exports = await StockExportDetail.find({ batch_id: batch._id });
        const totalExported = exports.reduce((sum, e) => sum + (e.quantity || 0), 0);
        const remaining = batch.quantity - totalExported;
        if (remaining > 0) {
          batchesWithRemaining.push({ batch, remaining });
        }
      }
      batches = batchesWithRemaining;
    }

    const unitPrice = ing.unit_price || 0;
    let remainingQty = it.quantity;

    for (const { batch, remaining } of batches) {
      if (remainingQty <= 0) break;

      const deductQty = Math.min(remaining, remainingQty);
      
      // Create export detail with batch_id link
      const detail = new StockExportDetail({
        export_id: stockExport._id,
        ingredient_id: ing._id,
        batch_id: batch._id,
        quantity: deductQty,
        unit_price: batch.unit_price || unitPrice,
        line_total: deductQty * (batch.unit_price || unitPrice),
      });
      await detail.save();

      remainingQty -= deductQty;
    }

    // Update ingredient total stock
    ing.quantity_in_stock = ing.quantity_in_stock - it.quantity;
    if (ing.quantity_in_stock < 0) ing.quantity_in_stock = 0;
    ing.updated_at = new Date();
    await ing.save();

    details.push({
      id: stockExport._id,
      ingredientId: ing._id,
      quantity: it.quantity,
    });
  }

  return { export: stockExport, details };
}

async function updateIngredient(id, updates) {
  return Ingredient.findByIdAndUpdate(
    id,
    { $set: updates, updated_at: new Date() },
    { new: true }
  );
}

async function getExports() {
  // Return list of stock exports with their details and ingredient info
  const exports = await StockExport.find().sort({ created_at: -1 }).lean();

  const results = [];
  for (const exp of exports) {
    const details = await StockExportDetail.find({ export_id: exp._id }).lean();
    const items = [];
    let total = 0;
    for (const d of details) {
      const ing = await Ingredient.findById(d.ingredient_id).lean();
      items.push({
        name: ing ? ing.name : "Unknown",
        quantity: d.quantity,
        unit: ing ? ing.unit : undefined,
        unit_price: d.unit_price,
        line_total: d.line_total,
      });
      total += d.line_total || 0;
    }

    results.push({
      id: exp._id.toString(),
      code: exp.export_number,
      staffId: exp.staff_id ? exp.staff_id.toString() : null,
      items,
      date: exp.export_date || exp.created_at,
      total,
      reason: exp.notes || null,
    });
  }

  return results;
}

async function getImports() {
  // Return list of stock imports with their details and ingredient info
  const imports = await StockImport.find().sort({ created_at: -1 }).lean();
  const Supplier = mongoose.model("Supplier");

  const results = [];
  for (const imp of imports) {
    const details = await StockImportDetail.find({ import_id: imp._id }).lean();
    const items = [];
    let total = 0;
    for (const d of details) {
      const ing = await Ingredient.findById(d.ingredient_id).lean();
      items.push({
        name: ing ? ing.name : "Unknown",
        quantity: d.quantity,
        unit: ing ? ing.unit : undefined,
        unit_price: d.unit_price,
        line_total: d.line_total,
        expiry_date: d.expiry_date,
      });
      total += d.line_total || 0;
    }

    // Get supplier name if exists
    let supplierName = imp.supplier_name || null;
    if (!supplierName && imp.supplier_id) {
      const supplier = await Supplier.findById(imp.supplier_id).lean();
      supplierName = supplier ? supplier.name : null;
    }

    results.push({
      id: imp._id.toString(),
      code: imp.import_number,
      supplierId: imp.supplier_id ? imp.supplier_id.toString() : null,
      supplierName,
      staffId: imp.staff_id ? imp.staff_id.toString() : null,
      items,
      date: imp.import_date || imp.created_at,
      total,
      notes: imp.notes || null,
    });
  }

  return results;
}

module.exports = {
  getBatches,
  createStockImport,
  createStockExport,
  updateIngredient,
  getExports,
  getImports,
};
