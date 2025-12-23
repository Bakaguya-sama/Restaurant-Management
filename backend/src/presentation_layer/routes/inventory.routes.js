const express = require("express");
const router = express.Router();
const InventoryController = require("../controllers/inventory/inventory.controller");

router.get("/", InventoryController.listInventory);
router.post("/import", InventoryController.importItems);
router.post("/export", InventoryController.exportItems);
router.get("/exports", InventoryController.listExports);
router.get("/imports", InventoryController.listImports);
router.put("/:id", InventoryController.updateIngredient);

module.exports = router;
