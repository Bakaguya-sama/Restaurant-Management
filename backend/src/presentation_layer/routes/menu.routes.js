const express = require('express');
const router = express.Router();
const MenuController = require('../controllers/menu/menu.controller');

router.get('/', MenuController.getMenu);
router.post('/', MenuController.createMenu);
router.put('/:id', MenuController.updateMenu);
router.delete('/:id', MenuController.deleteMenu);
router.patch('/:id/availability', MenuController.patchAvailability);

module.exports = router;
