const express = require('express');
const { getAnalytics } = require('../controllers/analyticsController');
const verifyToken = require('../middlewares/jwtMiddleware');
const router = express.Router();

router.get('/analytics', verifyToken, getAnalytics);

module.exports = router;
