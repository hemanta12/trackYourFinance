const express = require('express');
const router = express.Router();
const { createOrUpdateBudget, getBudgets, checkMonthlyReset } = require('../controllers/budgetController');
const verifyToken = require('../middlewares/jwtMiddleware');



router.post('/', verifyToken, createOrUpdateBudget);
router.get('/', verifyToken, getBudgets);
router.post('/reset/:id', checkMonthlyReset);

module.exports = router;