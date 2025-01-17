const pool = require('../config/db');

exports.createIncome = async (req, res) => {
  try {
    
    const { amount, source, date } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query('INSERT INTO income (user_id, amount, source, date) VALUES (?, ?, ?, ?)', [
      userId, amount, source, date || new Date(), 
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
    const formattedIncomes = incomes.map((income) => ({
      ...income,
      date: new Date(income.date).toISOString().split('T')[0],
    }));
    res.json(formattedIncomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateIncome = async (req, res) => {
  const { id } = req.params;
  const { amount, source, date } = req.body;

  if (!id || !amount || !source || !date) {
    return res.status(400).json({ message: 'All fields (id, amount, source, date) are required' });
  }

  try{
    await pool.query(
      'UPDATE income SET amount = ?, source = ?, date = ? WHERE id = ?', 
      [amount, source, date, id]
    );
    console.log({ id, amount, source, date });

    
    const [rows] = await pool.query('SELECT * FROM income WHERE id = ?', [id]);
    res.status(200).json(rows[0]); 
  }catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteIncome = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM income WHERE id = ?', [id]);
  res.status(200).send({ message: 'Income deleted successfully' });
};
