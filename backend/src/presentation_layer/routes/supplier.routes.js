const express = require('express');
const router = express.Router();
const SupplierController = require('../controllers/supplier/supplier.controller');


router.get('/', SupplierController.listSuppliers);
router.post('/', SupplierController.createSupplier);
router.put('/:id', SupplierController.updateSupplier);
router.delete('/:id', SupplierController.deleteSupplier);

module.exports = router;
