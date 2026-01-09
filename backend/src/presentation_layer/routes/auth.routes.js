const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth/auth.controller');
const PasswordResetController = require('../controllers/auth/password.reset.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const authController = new AuthController();
const passwordResetController = new PasswordResetController();

router.post('/register', (req, res) => authController.register(req, res));
router.post('/login', (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refreshToken(req, res));
router.post('/logout', authenticateToken, (req, res) => authController.logout(req, res));
router.get('/me', authenticateToken, (req, res) => authController.getCurrentUser(req, res));
router.post('/change-password', authenticateToken, (req, res) => authController.changePassword(req, res));
router.post('/forgot-password', (req, res) => passwordResetController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => passwordResetController.resetPassword(req, res));
router.post('/verify-email', (req, res) => authController.verifyEmail(req, res));
router.post('/resend-verification', (req, res) => authController.resendVerificationEmail(req, res));
router.patch('/email-verification', authenticateToken, (req, res) => authController.updateEmailVerification(req, res));

module.exports = router;
