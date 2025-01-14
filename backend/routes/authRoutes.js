const express = require('express');
const passport = require('passport');
const authController = require('../controllers/authController');

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', authController.login);

// Google OAuth: Initiate Google login
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Google OAuth: Handle callback from Google
router.get(
  '/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    // Redirect to a dashboard or desired route after successful login
    console.log('Google OAuth successful, user:', req.user); // Log user info
    res.send('Google OAuth login successful!'); // Simplified response
    // res.redirect('/dashboard');
  }
);

module.exports = router;
