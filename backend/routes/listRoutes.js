const express = require('express');
const router = express.Router();
const verifyToken = require('../middlewares/jwtMiddleware'); // Add middleware

// Import required controllers
// const listController = require('../controllers/listController');
const analyticsController = require('../controllers/analyticsController'); // Import this
const { 
    getCategories, 
    addCategory, 
    getPaymentTypes, 
    addPaymentType, 
    getSources, 
    addSource 
} = require('../controllers/listController');

router.get('/categories',verifyToken, getCategories);
router.post('/categories', verifyToken,addCategory);
router.get('/payment-types',verifyToken, getPaymentTypes);
router.post('/payment-types', verifyToken,addPaymentType);
router.get('/sources', verifyToken,getSources);
router.post('/sources', verifyToken,addSource);
router.get('/months', verifyToken, analyticsController.getMonths);

module.exports = router;
