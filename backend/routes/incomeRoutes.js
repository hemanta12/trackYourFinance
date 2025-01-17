const express = require('express');
const incomeController = require('../controllers/incomeController');
const verifyToken = require('../middlewares/jwtMiddleware');

const router = express.Router();

router.post('/', verifyToken, incomeController.createIncome);
router.get('/', verifyToken, incomeController.getIncomes);

router.put('/:id', incomeController.updateIncome);
router.delete('/:id', incomeController.deleteIncome);

module.exports = router;
