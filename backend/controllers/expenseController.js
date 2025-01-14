const pool = require('../config/db');

exports.createExpense = async (req, res) => {
  try {
    const { userId, amount, source, date } = req.body;
    await pool.query('INSERT INTO expense (user_id, amount, source, date) VALUES (?, ?, ?, ?)', [
      userId, amount, source, date,
    ]);
    res.status(201).json({ message: 'Expense added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const [expenses] = await pool.query('SELECT * FROM expense WHERE user_id = ?', [req.user.id]);
    res.json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
