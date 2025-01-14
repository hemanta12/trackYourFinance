const pool = require('../config/db');

exports.createExpense = async (req, res) => {
  try {
    console.log('Request Body:', req.body); // Log the request body
    console.log('User ID:', req.user.id); // Log the user ID

    const {  amount, category,paymentType, date } = req.body;
    const userId = req.user.id; 

    const [result] = await pool.query('INSERT INTO expenses (user_id, amount, category, payment_type, date) VALUES (?, ?, ?, ?, ?)', [
      userId, amount, category, paymentType, date || new Date(),
    ]);
    const [newExpense] = await pool.query('SELECT * FROM expenses WHERE id = ?', [result.insertId]);


    res.status(201).json(newExpense[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    const userId = req.user.id;
    const [expenses] = await pool.query('SELECT * FROM expenses WHERE user_id = ?', [userId]);
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
