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

exports.updateExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, category, payment_type, date } = req.body;

  if (!id || !amount || !category || !payment_type || !date) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  try{
    await pool.query(
      'UPDATE expenses SET amount = ?, category = ?, payment_type = ?, date=? WHERE id = ?', 
      [amount, category, payment_type,date, id]);
      const [updatedExpense] = await pool.query('SELECT * FROM expenses WHERE id = ?', [id]);
      res.status(200).json(updatedExpense[0]);
  }catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM expenses WHERE id = ?', [id]);
  res.status(200).send({ message: 'Expenses deleted successfully' });
};

