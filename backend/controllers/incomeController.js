const pool = require('../config/db');

exports.createIncome = async (req, res) => {
  try {
    
    const { amount, source, date } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query('INSERT INTO income (user_id, amount, source, date) VALUES (?, ?, ?, ?)', [
      userId, amount, source, date || new Date(), // Use current date if `date` is not provided
    ]);

   
    const [newIncome] = await pool.query('SELECT * FROM income WHERE id = ?', [result.insertId]);
    res.status(201).json(newIncome[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getIncomes = async (req, res) => {
  try {
    const userId = req.user.id; 
    const [incomes] = await pool.query('SELECT * FROM income WHERE user_id = ?', [userId]);
    res.json(incomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
