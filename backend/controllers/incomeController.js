const pool = require('../config/db');

/**
 * Add new income
 * @param {Object} req.body - Income data
 * @param {Object} req.user - Authenticated user
 */
exports.createIncome = async (req, res) => {
  try {
    const { amount, source_id, date, notes } = req.body;
    const userId = req.user.id;

    // First insert the income record
    const [result] = await pool.query(
      'INSERT INTO income (user_id, amount, source_id, date, notes) VALUES (?, ?, ?, ?, ?)',
      [userId, amount, source_id, date, notes]
    );

    // Then fetch the complete income record with source info
    const [newIncome] = await pool.query(
      `SELECT i.*, s.source 
       FROM income i 
       LEFT JOIN sources s ON i.source_id = s.id 
       WHERE i.id = ?`,
      [result.insertId]
    );

    if (!newIncome[0]) {
      throw new Error('Failed to fetch created income record');
    }

    // Return the complete record
    res.status(201).json(newIncome[0]);
  } catch (err) {
    console.error('Error creating income:', err);
    res.status(500).json({ 
      error: err.message,
      message: 'Failed to create income record' 
    });
  }
};

exports.getIncomes = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    // Fetch incomes with source info
    const [incomes] = await pool.query(
      `SELECT i.*, s.source 
       FROM income i 
       LEFT JOIN sources s ON i.source_id = s.id 
       WHERE i.user_id = ?`,
      [userId]
    );

    const formattedIncomes = incomes.map(income => ({
      ...income,
      date: new Date(income.date).toISOString().split('T')[0]
    }));

    res.json(formattedIncomes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateIncome = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, source_id, date, notes } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!amount || !source_id || !date) {
      return res.status(400).json({ message: 'Required fields missing' });
    }

    // Update with proper fields
    const [result] = await pool.query(
      `UPDATE income 
       SET amount = ?, source_id = ?, date = ?, notes = ? 
       WHERE id = ? AND user_id = ?`,
      [amount, source_id, date, notes, id, userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Income not found or unauthorized' });
    }

    // Fetch updated record with source info
    const [updatedIncome] = await pool.query(
      `SELECT i.*, s.source 
       FROM income i 
       LEFT JOIN sources s ON i.source_id = s.id 
       WHERE i.id = ?`,
      [id]
    );

    res.json(updatedIncome[0]);
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.deleteIncome = async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM income WHERE id = ?', [id]);
  res.status(200).send({ message: 'Income deleted successfully' });
};
