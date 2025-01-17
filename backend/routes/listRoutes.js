const express = require('express');
const router = express.Router();
const { getCategories, addCategory, getPaymentTypes, addPaymentType, getSources, addSource } = require('../controllers/listController');

router.get('/categories', getCategories);
router.post('/categories', addCategory);
router.get('/payment-types', getPaymentTypes);
router.post('/payment-types', addPaymentType);
router.get('/sources', getSources);
router.post('/sources', addSource);

module.exports = router;
