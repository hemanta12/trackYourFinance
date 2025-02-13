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
    const { amount, category_id, payment_type_id, date, notes, merchant_id } =
      req.body;
    const userId = req.user.id;

    // For manual entries, if a merchant is provided,
    // use it to create a corresponding description record.
    let descriptionId = null;
    if (merchant_id) {
      // Get the merchant's name from the merchants table
      const [merchantRows] = await pool.query(
        "SELECT name FROM merchants WHERE id = ?",
        [merchant_id]
      );
      if (merchantRows.length > 0) {
        const merchantName = merchantRows[0].name;
        // Insert this name as the full description into the descriptions table
        const [descResult] = await pool.query(
          "INSERT INTO descriptions (text) VALUES (?)",
          [merchantName]
        );
        descriptionId = descResult.insertId;
      }
    }

    const [result] = await pool.query(
      "INSERT INTO expenses (user_id, amount, category_id, payment_type_id, date, notes, merchant_id, description_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        userId,
        amount,
        category_id,
        payment_type_id,
        date,
        notes,
        merchant_id,
        descriptionId,
      ]
    );

    // Fetch the complete expense record with joined merchant and description
    const [newExpenseRows] = await pool.query(
      `SELECT e.*, m.name AS merchant_name, d.text AS full_description
       FROM expenses e
       LEFT JOIN merchants m ON e.merchant_id = m.id
       LEFT JOIN descriptions d ON e.description_id = d.id
       WHERE e.id = ?`,
      [result.insertId]
    );
    // If no row is returned, send a fallback response
    if (!newExpenseRows || newExpenseRows.length === 0) {
      return res.status(201).json({ id: result.insertId });
    }

    res.status(201).json(newExpenseRows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// In expenseController.js

exports.createMultipleExpenses = async (req, res) => {
  const userId = req.user.id;
  const expenses = req.body.expenses;

  // Validate that expenses is a non-empty array.
  if (!Array.isArray(expenses) || expenses.length === 0) {
    return res.status(400).json({ message: "No expenses provided." });
  }

  // Validate required fields for each expense.
  for (const expense of expenses) {
    const { amount, category_id, payment_type_id, date, merchant_id } = expense;
    if (!amount || !category_id || !payment_type_id || !date || !merchant_id) {
      return res
        .status(400)
        .json({ message: "Required fields missing in one or more expenses." });
    }
  }

  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const insertValues = [];

    // Loop through each expense and process it.
    for (const expense of expenses) {
      const { amount, category_id, payment_type_id, date, notes, merchant_id } =
        expense;
      let descriptionId = null;

      // If a merchant is provided, retrieve the merchant's name and insert into descriptions.
      if (merchant_id) {
        const [merchantRows] = await connection.query(
          "SELECT name FROM merchants WHERE id = ?",
          [merchant_id]
        );
        if (merchantRows.length > 0) {
          const merchantName = merchantRows[0].name;
          const [descResult] = await connection.query(
            "INSERT INTO descriptions (text) VALUES (?)",
            [merchantName]
          );
          descriptionId = descResult.insertId;
        }
      }

      // Prepare the row values.
      insertValues.push([
        userId,
        amount,
        category_id,
        payment_type_id,
        date,
        notes || "",
        merchant_id,
        descriptionId,
      ]);
    }

    // Perform a bulk insert using the prepared values.
    const [result] = await connection.query(
      "INSERT INTO expenses (user_id, amount, category_id, payment_type_id, date, notes, merchant_id, description_id) VALUES ?",
      [insertValues]
    );

    await connection.commit();

    res.status(201).json({
      message: "Expenses created successfully",
      insertedCount: result.affectedRows,
    });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ error: err.message });
  } finally {
    connection.release();
  }
};

exports.getExpenses = async (req, res) => {
  try {
    console.time("Expense Query Execution Time");
    const userId = req.user.id;
    const expenseQuery = `SELECT 
        e.*,
        DATE_FORMAT(e.date, '%m-%d-%Y') AS postedDate,
        m.name AS merchant_name,
        d.text AS full_description
      FROM expenses e
      LEFT JOIN merchants m ON e.merchant_id = m.id
      LEFT JOIN descriptions d ON e.description_id = d.id
      WHERE e.user_id = ?
      ORDER BY e.date DESC`;

    const [expenses] = await pool.query(expenseQuery, [userId]);
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

    return res.status(200).json({
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
