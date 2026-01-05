const express = require("express");
const router = express.Router();
const InventoryController = require("../controllers/inventory/inventory.controller");
const { authenticateToken } = require("../middleware/auth.middleware");

router.get("/", InventoryController.listInventory);
router.post("/import", authenticateToken, InventoryController.importItems);
router.post("/export", authenticateToken, InventoryController.exportItems);
router.get("/exports", InventoryController.listExports);
router.get("/imports", InventoryController.listImports);
router.put("/:id", InventoryController.updateIngredient);

module.exports = router;
