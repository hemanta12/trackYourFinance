const pool = require("../config/db");

/**
 * Helper function to calculate the next due date
 * based on the current due date and frequency.
 * Returns a MySQL DATETIME formatted string.
 */
function calculateNextDueDate(currentDate, frequency) {
  const date = new Date(currentDate);
  switch (frequency) {
    case "daily":
      date.setDate(date.getDate() + 1);
      break;
    case "weekly":
      date.setDate(date.getDate() + 7);
      break;
    case "monthly":
      date.setMonth(date.getMonth() + 1);
      break;
    case "yearly":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      break;
  }
  return date.toISOString().slice(0, 19).replace("T", " ");
}

/**
 * Create a new recurring item.
 */
exports.createRecurringItem = async (req, res) => {
  try {
    const {
      title,
      amount,
      category_id,
      frequency,
      start_date,
      next_due_date,
      autopay_enabled,
      active,
      notes,
      merchant_id,
      payment_type_id,
    } = req.body;
    const userId = req.user.id;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const [result] = await pool.query(
      `INSERT INTO recurring_items 
      (user_id, title, amount, category_id,frequency, start_date, next_due_date, autopay_enabled, active, notes, merchant_id, payment_type_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?,  ?, ?, ?, ?)`,
      [
        userId,
        title.trim(),
        amount,
        category_id,

        frequency,
        start_date,
        next_due_date,
        autopay_enabled || 0,
        active || 1,
        notes,
        merchant_id || null,
        payment_type_id,
      ]
    );

    const [newRecurring] = await pool.query(
      "SELECT * FROM recurring_items WHERE id = ?",
      [result.insertId]
    );
    res.status(201).json(newRecurring[0]);
  } catch (err) {
    console.error("Error creating recurring item:", err);
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get all recurring items for the authenticated user.
 */
exports.getRecurringItems = async (req, res) => {
  try {
    const userId = req.user.id;
    const [items] = await pool.query(
      "SELECT * FROM recurring_items WHERE user_id = ? ORDER BY next_due_date ASC",
      [userId]
    );
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Get a single recurring item by ID.
 */
exports.getRecurringItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const [items] = await pool.query(
      "SELECT * FROM recurring_items WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (!items || items.length === 0) {
      return res.status(404).json({ message: "Recurring item not found" });
    }
    res.json(items[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Update an existing recurring item.
 */
exports.updateRecurringItem = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      amount,
      category_id,
      frequency,
      start_date,
      next_due_date,
      autopay_enabled,
      active,
      notes,
      merchant_id,
      payment_type_id,
    } = req.body;
    const userId = req.user.id;

    if (!title || title.trim() === "") {
      return res.status(400).json({ message: "Title is required" });
    }

    const [result] = await pool.query(
      `UPDATE recurring_items 
       SET title = ?, amount = ?, category_id = ?, frequency = ?, start_date = ?, next_due_date = ?, autopay_enabled = ?, active = ?, notes = ?, merchant_id = ?, payment_type_id = ?
       WHERE id = ? AND user_id = ?`,
      [
        title.trim(),
        amount,
        category_id,
        frequency,
        start_date,
        next_due_date,
        autopay_enabled,
        active,
        notes,
        merchant_id || null,
        payment_type_id,
        id,
        userId,
      ]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Recurring item not found or unauthorized" });
    }
    const [updated] = await pool.query(
      "SELECT * FROM recurring_items WHERE id = ?",
      [id]
    );
    res.json(updated[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete a recurring item.
 */
exports.deleteRecurringItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const [result] = await pool.query(
      "DELETE FROM recurring_items WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Recurring item not found or unauthorized" });
    }
    res.json({ message: "Recurring item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Mark a recurring item as paid.
 * This creates an expense record from the recurring item data
 * and then updates the recurring item with the new next_due_date.
 */
exports.markRecurringItemPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Retrieve the recurring item.
    const [items] = await pool.query(
      "SELECT * FROM recurring_items WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (!items || items.length === 0) {
      return res.status(404).json({ message: "Recurring item not found" });
    }
    const recurringItem = items[0];

    // Create an expense record based on the recurring item.
    const expenseData = {
      expense_name: recurringItem.title,
      amount: recurringItem.amount,
      category_id: recurringItem.category_id,
      payment_type_id: recurringItem.payment_type_id,
      date: recurringItem.next_due_date,
      notes: recurringItem.notes,
      merchant_id: recurringItem.merchant_id,
    };

    const [expenseResult] = await pool.query(
      `INSERT INTO expenses 
      (user_id, expense_name, amount, category_id, payment_type_id, date, notes, merchant_id, recurring_item_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        expenseData.expense_name,
        expenseData.amount,
        expenseData.category_id,
        expenseData.payment_type_id,
        expenseData.date,
        expenseData.notes,
        expenseData.merchant_id,
        recurringItem.id,
      ]
    );

    // Calculate the new next_due_date.
    const newNextDueDate = calculateNextDueDate(
      recurringItem.next_due_date,
      recurringItem.frequency
    );

    // Update the recurring item: set new next_due_date and clear skipped_date.
    await pool.query(
      "UPDATE recurring_items SET next_due_date = ?, skipped_date = NULL WHERE id = ? AND user_id = ?",
      [newNextDueDate, id, userId]
    );

    res.json({
      message: "Recurring item marked as paid and expense recorded.",
      expenseId: expenseResult.insertId,
      newNextDueDate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Skip the next payment for a recurring item.
 * This records the skipped payment and updates the next_due_date.
 */
exports.skipRecurringItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const [items] = await pool.query(
      "SELECT * FROM recurring_items WHERE id = ? AND user_id = ?",
      [id, userId]
    );
    if (!items || items.length === 0) {
      return res.status(404).json({ message: "Recurring item not found" });
    }
    const recurringItem = items[0];

    // Record the skipped payment.
    const skippedDate = recurringItem.next_due_date;
    const newNextDueDate = calculateNextDueDate(
      recurringItem.next_due_date,
      recurringItem.frequency
    );

    await pool.query(
      "UPDATE recurring_items SET skipped_date = ?, next_due_date = ? WHERE id = ? AND user_id = ?",
      [skippedDate, newNextDueDate, id, userId]
    );

    res.json({
      message: "Recurring item skipped for next payment.",
      skippedDate,
      newNextDueDate,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Toggle the autopay status of a recurring item.
 */
exports.toggleAutopay = async (req, res) => {
  try {
    const { id } = req.params;
    const { autopay_enabled } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      "UPDATE recurring_items SET autopay_enabled = ? WHERE id = ? AND user_id = ?",
      [autopay_enabled, id, userId]
    );
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Recurring item not found or unauthorized" });
    }
    res.json({ message: "Autopay status updated", autopay_enabled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
