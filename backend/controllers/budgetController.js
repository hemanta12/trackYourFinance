const pool = require("../config/db");

// Create or update a budget
exports.createOrUpdateBudget = async (req, res) => {
  try {
    const { category_id, amount, reset_day } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!category_id || !amount) {
      return res.status(400).json({
        message: "Category and amount are required",
        received: { category_id, amount, reset_day },
      });
    }

    // Validate numeric values
    if (isNaN(Number(amount)) || (reset_day && isNaN(Number(reset_day)))) {
      return res.status(400).json({
        message: "Amount and reset day must be numbers",
      });
    }

    // Check if budget exists
    const [existingBudget] = await pool.query(
      "SELECT id FROM budgets WHERE user_id = ? AND category_id = ?",
      [userId, category_id]
    );

    if (existingBudget.length > 0) {
      // Update existing budget
      await pool.query(
        "UPDATE budgets SET amount = ?, reset_day = ? WHERE id = ?",
        [Number(amount), reset_day || 1, existingBudget[0].id]
      );
      const [updatedBudget] = await pool.query(
        "SELECT * FROM budgets WHERE id = ?",
        [existingBudget[0].id]
      );
      res.json(updatedBudget[0]);
    } else {
      // Create new budget
      const [result] = await pool.query(
        "INSERT INTO budgets (user_id, category_id, amount, reset_day) VALUES (?, ?, ?, ?)",
        [userId, category_id, Number(amount), reset_day || 1]
      );
      const [newBudget] = await pool.query(
        "SELECT * FROM budgets WHERE id = ?",
        [result.insertId]
      );
      res.status(201).json(newBudget[0]);
    }
  } catch (error) {
    console.error("Error in createOrUpdateBudget:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBudgets = async (req, res) => {
  try {
    const [budgets] = await pool.query(
      `SELECT b.*, c.category 
       FROM budgets b
       LEFT JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ?`,
      [req.user.id]
    );
    res.json(budgets);
  } catch (error) {
    console.error("Error in getBudgets:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkMonthlyReset = async (req, res) => {
  try {
    const { id } = req.params;
    const [budget] = await pool.query(
      "SELECT reset_day, last_reset FROM budgets WHERE id = ?",
      [id]
    );

    const today = new Date();
    const resetDay = budget.reset_day || 1;
    const lastReset = new Date(budget.last_reset);

    // Check if reset is needed
    if (
      today.getDate() >= resetDay &&
      (today.getMonth() > lastReset.getMonth() ||
        today.getFullYear() > lastReset.getFullYear())
    ) {
      // Update last_reset timestamp
      await pool.query("UPDATE budgets SET last_reset = NOW() WHERE id = ?", [
        id,
      ]);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error checking monthly reset:", error);
    throw error;
  }
};

exports.deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Delete the budget only if it belongs to the current user
    await pool.query("DELETE FROM budgets WHERE id = ? AND user_id = ?", [
      id,
      userId,
    ]);

    res.json({ message: "Budget deleted successfully" });
  } catch (error) {
    console.error("Error deleting budget:", error);
    res.status(500).json({ message: "Server error" });
  }
};
