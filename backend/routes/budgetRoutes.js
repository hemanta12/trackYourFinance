const express = require("express");
const router = express.Router();
const {
  createOrUpdateBudget,
  getBudgets,
  checkMonthlyReset,
  deleteBudget,
} = require("../controllers/budgetController");
const verifyToken = require("../middlewares/jwtMiddleware");

router.post("/", verifyToken, createOrUpdateBudget);
router.get("/", verifyToken, getBudgets);
router.post("/reset/:id", checkMonthlyReset);
router.delete("/:id", verifyToken, deleteBudget);

module.exports = router;
