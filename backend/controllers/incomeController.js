const pool = require('../config/db');

exports.createIncome = async (req, res) => {
  try {
    const { userId, amount, source, date } = req.body;
    await pool.query('INSERT INTO income (user_id, amount, source, date) VALUES (?, ?, ?, ?)', [
      userId, amount, source, date,
    ]);
    res.status(201).json({ message: 'Income added' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getIncomes = async (req, res) => {
  try {
    const [incomes] = await pool.query('SELECT * FROM income WHERE user_id = ?', [req.user.id]);
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
