const pool = require("../config/db");
const crypto = require("crypto");
const { getOrCreateMerchant } = require("./listController");

/**
 * Add new expense
 * @param {Object} req.body - Expense data
 * @param {Object} req.user - Authenticated user
 */
exports.createExpense = async (req, res) => {
  try {
    const { amount, category_id, payment_type_id, date, notes } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      "INSERT INTO expenses (user_id, amount, category_id, payment_type_id, date, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, amount, category_id, payment_type_id, date, notes]
    );

    // Fetch the complete expense record after insertion
    const [newExpense] = await pool.query(
      "SELECT * FROM expenses WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newExpense[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    console.time("Expense Query Execution Time");
    const userId = req.user.id;

    const [expenses] = await pool.query(
      `SELECT * FROM expenses 
       WHERE user_id = ? 
       ORDER BY date DESC`, // ✅ Sort by date (most recent first)
      [userId]
    );
    console.timeEnd("Expense Query Execution Time"); // ✅ Logs query time
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category_id, payment_type_id, date, notes } = req.body;
    const userId = req.user.id;

    if (!amount || !category_id || !payment_type_id || !date) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const [result] = await pool.query(
      `UPDATE expenses 
       SET amount = ?, category_id = ?, payment_type_id = ?, date = ?, notes = ? 
       WHERE id = ? AND user_id = ?`,
      [amount, category_id, payment_type_id, date, notes, id, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Expense not found or unauthorized" });
    }

    const [updatedExpense] = await pool.query(
      "SELECT * FROM expenses WHERE id = ?",
      [id]
    );

    res.json(updatedExpense[0]);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM expenses WHERE id = ?", [id]);
  res.status(200).send({ message: "Expenses deleted successfully" });
};

exports.bulkDeleteExpenses = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "No expense IDs provided." });
    }

    const userId = req.user.id;

    // Use a parameterized query with an array.
    // This example uses MySQL syntax + placeholders.
    // Adjust if you’re using something else:
    const [result] = await pool.query(
      `DELETE FROM expenses
       WHERE id IN (?) AND user_id = ?`,
      [ids, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "No expenses found or you are not authorized." });
    }

    return res
      .status(200)
      .json({
        message: "Expenses deleted successfully",
        deletedCount: result.affectedRows,
      });
  } catch (error) {
    console.error("Error in bulkDeleteExpenses:", error);
    return res.status(500).json({
      message: "Error deleting expenses",
      error: error.message,
    });
  }
};

const expenseService = require("../services/expenseService");
const logger = require("../utils/logger");

exports.saveStatementExpenses = async (req, res) => {
  try {
    const { transactions, paymentTypes, statement_id } = req.body;
    const userId = req.user.id;
    const result = await expenseService.saveStatementExpenses({
      transactions,
      paymentTypes,
      statement_id,
      userId,
    });
    res.status(201).json(result);
  } catch (error) {
    logger.error("Error saving transactions:", error);
    res
      .status(500)
      .json({ message: "Error saving transactions", error: error.message });
  }
};
