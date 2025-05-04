const express = require('express');
const { check } = require('express-validator');
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Register a new user
router.post(
  '/register',
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
  ],
  authController.login
);

// Get current logged in user
router.get('/me', authMiddleware, authController.getMe);

// Logout user
router.get('/logout', authMiddleware, authController.logout);

// Forgot password
router.post(
  '/forgotpassword',
  [
    check('email', 'Please include a valid email').isEmail()
  ],
  authController.forgotPassword
);

// Reset password
router.put(
  '/resetpassword/:resettoken',
  [
    check('password', 'Please enter a password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.resetPassword
);

// Update user details
router.put('/updatedetails', authMiddleware, authController.updateDetails);

// Update password
router.put(
  '/updatepassword',
  authMiddleware,
  [
    check('currentPassword', 'Current password is required').exists(),
    check('newPassword', 'Please enter a new password with 6 or more characters').isLength({ min: 6 })
  ],
  authController.updatePassword
);

module.exports = router;