const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const authController = new AuthController();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refreshToken(req, res));
router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));
router.get('/me', authenticateToken, (req, res) => authController.getCurrentUser(req, res));
router.post('/change-password', authenticateToken, (req, res) => authController.changePassword(req, res));

module.exports = router;
