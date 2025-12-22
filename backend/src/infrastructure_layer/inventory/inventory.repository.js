const {
  Ingredient,
  StockImport,
  StockImportDetail,
  StockExport,
  StockExportDetail,
} = require("../../models");
const mongoose = require("mongoose");

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
  ];

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
      quantity: "$quantity",
      unit: "$ingredient.unit",
      expiryDate: "$expiry_date",
    },
  });

  return StockImportDetail.aggregate(pipeline);
}

async function createStockImport(items) {
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
    status: "completed",
  });
  await stockImport.save();

  const details = [];
  const noteParts = []; // Collect notes for each item

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
        minimum_quantity: 0,
        unit_price: it.unitPrice || 0,
        stock_status: "available",
      });
      await ing.save();
    }

    // If still no ingredient found, throw error
    if (!ing)
      throw { status: 404, message: `Ingredient not found: ${it.itemId}` };

    const unitPrice = it.unitPrice || ing.unit_price || 0;
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

    // Add to notes: "Thịt bò: 100kg, Cá hồi: 50kg"
    noteParts.push(`${ing.name}: ${it.quantity}${ing.unit}`);
  }

  // Update notes in the stock import
  stockImport.notes = noteParts.join(", ");
  await stockImport.save();

  return { import: stockImport, details };
}

async function createStockExport(items, staffId = null) {
  const exportNumber = `EXP-${Date.now()}`;
  const stockExport = new StockExport({
    export_number: exportNumber,
    notes: items.map((i) => i.reason).join("; "),
    staff_id: staffId || undefined,
    status: "completed",
  });
  await stockExport.save();

  const details = [];

  for (const it of items) {
    const ing = await Ingredient.findById(it.itemId);
    if (!ing)
      throw { status: 404, message: `Ingredient not found: ${it.itemId}` };

    if ((ing.quantity_in_stock || 0) < it.quantity)
      throw { status: 400, message: `Insufficient stock for ${ing.name}` };

    const unitPrice = ing.unit_price || 0;
    const lineTotal = unitPrice * it.quantity;

    const detail = new StockExportDetail({
      export_id: stockExport._id,
      ingredient_id: ing._id,
      quantity: it.quantity,
      unit_price: unitPrice,
      line_total: lineTotal,
    });
    await detail.save();

    // Deduct quantity from batches using FIFO (oldest first)
    let remainingQty = it.quantity;
    const batches = await StockImportDetail.find({
      ingredient_id: ing._id,
      quantity: { $gt: 0 },
    }).sort({ expiry_date: 1, _id: 1 }); // Sort by expiry date then by ID (FIFO)

    for (const batch of batches) {
      if (remainingQty <= 0) break;

      const deductQty = Math.min(batch.quantity, remainingQty);
      batch.quantity -= deductQty;
      remainingQty -= deductQty;
      await batch.save();
    }

    // Update ingredient total stock
    ing.quantity_in_stock = ing.quantity_in_stock - it.quantity;
    if (ing.quantity_in_stock < 0) ing.quantity_in_stock = 0;
    ing.updated_at = new Date();
    await ing.save();

    details.push({
      id: detail._id,
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

module.exports = {
  getBatches,
  createStockImport,
  createStockExport,
  updateIngredient,
};

// Fetch stock export records with details and ingredient names
async function getExports({
  start_date = null,
  end_date = null,
  search = null,
} = {}) {
  const match = {};
  if (start_date || end_date) {
    match.created_at = {};
    if (start_date) match.created_at.$gte = new Date(start_date);
    if (end_date) match.created_at.$lte = new Date(end_date);
  }

  const pipeline = [];
  if (Object.keys(match).length) pipeline.push({ $match: match });

  pipeline.push({
    $lookup: {
      from: "stockexportdetails",
      let: { exportId: "$_id" },
      pipeline: [
        { $match: { $expr: { $eq: ["$export_id", "$$exportId"] } } },
        {
          $lookup: {
            from: "ingredients",
            localField: "ingredient_id",
            foreignField: "_id",
            as: "ingredient",
          },
        },
        { $unwind: { path: "$ingredient", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            quantity: 1,
            unit_price: 1,
            line_total: 1,
            ingredientName: "$ingredient.name",
          },
        },
      ],
      as: "details",
    },
  });

  // Lookup staff user (if any)
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "staff_id",
      foreignField: "_id",
      as: "staff",
    },
  });
  pipeline.push({
    $unwind: { path: "$staff", preserveNullAndEmptyArrays: true },
  });

  // Optionally filter by search term on export number, notes, or ingredient name
  if (search) {
    const regex = new RegExp(search, "i");
    pipeline.push({
      $match: {
        $or: [
          { export_number: { $regex: regex } },
          { notes: { $regex: regex } },
          { "details.ingredientName": { $regex: regex } },
        ],
      },
    });
  }

  pipeline.push({
    $addFields: {
      totalValue: {
        $sum: {
          $map: {
            input: "$details",
            as: "d",
            in: { $ifNull: ["$$d.line_total", 0] },
          },
        },
      },
    },
  });

  pipeline.push({ $sort: { created_at: -1 } });

  return StockExport.aggregate(pipeline);
}

// expose getExports
module.exports.getExports = getExports;
