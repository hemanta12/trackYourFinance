const express = require("express");
const {
  getTopExpenses,
  getBudgetWarnings,
  getKPIData,
  getIncomeVsExpense,
  getExpenseBreakdownByCategory,
  getTopExpenseCategories,
  getTopMerchants,
} = require("../controllers/analyticsController");
const verifyToken = require("../middlewares/jwtMiddleware");
const router = express.Router();

router.get("/top-expenses", verifyToken, getTopExpenses);
router.get("/top-categories", verifyToken, getTopExpenseCategories);
router.get("/top-merchants", verifyToken, getTopMerchants);

router.get("/budget-warnings", verifyToken, getBudgetWarnings);

router.get("/kpi-data", verifyToken, getKPIData);
router.get("/income-vs-expense", verifyToken, getIncomeVsExpense);
router.get("/expense-breakdown", verifyToken, getExpenseBreakdownByCategory);

module.exports = router;
