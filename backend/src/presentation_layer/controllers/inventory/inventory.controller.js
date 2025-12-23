const inventoryService = require("../../../application_layer/inventory/inventory.service");

function formatSuccess(res, data, message) {
  return res.json({ success: true, data, message });
}

function formatError(res, status = 400, message = "Bad Request") {
  return res.status(status).json({ success: false, data: null, message });
}

exports.listInventory = async (req, res) => {
  try {
    const { lowStock, expiring } = req.query;
    const low = lowStock === "true" || lowStock === true;
    const exp = expiring === "true" || expiring === true;

    const result = await inventoryService.listInventory({
      lowStock: low,
      expiring: exp,
    });
    return formatSuccess(res, result, "Inventory batches retrieved");
  } catch (err) {
    console.error("listInventory error", err);
    return res
      .status(err.status || 500)
      .json({
        success: false,
        data: null,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.importItems = async (req, res) => {
  try {
    const { items } = req.body;
    const result = await inventoryService.importItems(items);
    return res
      .status(201)
      .json({ success: true, data: result, message: "Import recorded" });
  } catch (err) {
    console.error("importItems error", err);
    return res
      .status(err.status || 500)
      .json({
        success: false,
        data: null,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.exportItems = async (req, res) => {
  try {
    const { items } = req.body;
    const result = await inventoryService.exportItems(items);
    return res
      .status(201)
      .json({ success: true, data: result, message: "Export recorded" });
  } catch (err) {
    console.error("exportItems error", err);
    return res
      .status(err.status || 500)
      .json({
        success: false,
        data: null,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.listExports = async (req, res) => {
  try {
    const result = await inventoryService.listExports();
    return formatSuccess(res, result, "Export history retrieved");
  } catch (err) {
    console.error("listExports error", err);
    return res
      .status(err.status || 500)
      .json({
        success: false,
        data: null,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.listImports = async (req, res) => {
  try {
    const result = await inventoryService.listImports();
    return formatSuccess(res, result, "Import history retrieved");
  } catch (err) {
    console.error("listImports error", err);
    return res
      .status(err.status || 500)
      .json({
        success: false,
        data: null,
        message: err.message || "Internal Server Error",
      });
  }
};

exports.updateIngredient = async (req, res) => {
  try {
    const result = await inventoryService.updateIngredient(
      req.params.id,
      req.body
    );
    return formatSuccess(res, result, "Ingredient updated");
  } catch (err) {
    console.error("updateIngredient error", err);
    return res
      .status(err.status || 500)
      .json({
        success: false,
        data: null,
        message: err.message || "Internal Server Error",
      });
  }
};
