const express = require("express");
const expenseController = require("../controllers/expenseController");
const verifyToken = require("../middlewares/jwtMiddleware");

const router = express.Router();

router.post("/", verifyToken, expenseController.createExpense);
router.get("/", verifyToken, expenseController.getExpenses);

router.put("/:id", verifyToken, expenseController.updateExpense);
router.delete("/:id", verifyToken, expenseController.deleteExpense);

router.post("/bulk", verifyToken, expenseController.createMultipleExpenses);

router.post("/bulk-delete", verifyToken, expenseController.bulkDeleteExpenses);
router.post(
  "/save-statement-expenses",
  verifyToken,
  expenseController.saveStatementExpenses
);

module.exports = router;
