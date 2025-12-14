const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supplier/supplier.controller');

router.get('/', SupplierController.listSuppliers);
router.post('/', SupplierController.createSupplier);

module.exports = router;
