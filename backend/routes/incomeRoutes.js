const express = require('express');
const incomeController = require('../controllers/incomeController');
const verifyToken = require('../middlewares/jwtMiddleware');

const router = express.Router();

router.post('/', verifyToken, incomeController.createIncome);
router.get('/', verifyToken, incomeController.getIncomes);

module.exports = router;
