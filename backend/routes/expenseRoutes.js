const express = require('express');
const expenseController = require('../controllers/expenseController');
const verifyToken = require('../middlewares/jwtMiddleware');

const router = express.Router();

router.post('/', verifyToken, expenseController.createExpense);
router.get('/', verifyToken, expenseController.getExpenses);

module.exports = router;
