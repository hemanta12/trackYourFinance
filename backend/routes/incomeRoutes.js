const express = require('express');
const incomeController = require('../controllers/incomeController');
const verifyToken = require('../middlewares/jwtMiddleware');

const router = express.Router();

router.post('/', verifyToken, incomeController.createIncome);
router.get('/', verifyToken, incomeController.getIncomes);

router.put('/:id', verifyToken, incomeController.updateIncome);
router.delete('/:id', verifyToken,incomeController.deleteIncome);

module.exports = router;
