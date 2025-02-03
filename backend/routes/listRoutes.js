const express = require('express');
const verifyToken = require('../middlewares/jwtMiddleware');
const analyticsController = require('../controllers/analyticsController');
const { 
    getCategories, 
    createCategory,
    updateCategory,
    deleteCategory, 
    getPaymentTypes, 
    addPaymentType,
    updatePaymentType,
    deletePaymentType,
    getSources, 
    addSource,
    updateSource,
    deleteSource , 
    getMerchants, 
    addMerchant
} = require('../controllers/listController');

const router = express.Router();

// Categories routes
router.get('/categories', verifyToken, getCategories);
router.post('/categories', verifyToken, createCategory);
router.put('/categories/:id', verifyToken, updateCategory);
router.delete('/categories/:id', verifyToken, deleteCategory);

// Payment types routes
router.get('/payment-types', verifyToken, getPaymentTypes);
router.post('/payment-types', verifyToken, addPaymentType);
router.put('/payment-types/:id', verifyToken, updatePaymentType);
router.delete('/payment-types/:id', verifyToken, deletePaymentType);

// Sources routes
router.get('/sources', verifyToken, getSources);
router.post('/sources', verifyToken, addSource);
router.put('/sources/:id', verifyToken, updateSource);
router.delete('/sources/:id', verifyToken, deleteSource);

router.get('/months', verifyToken, analyticsController.getMonths);

router.get('/merchants', verifyToken, getMerchants);
router.post('/merchants', verifyToken, addMerchant);


module.exports = router;
