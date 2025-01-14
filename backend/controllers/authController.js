const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

exports.register = async (req, res) => {
  // try {
  //   const { email, name, password } = req.body;
  //   const hashedPassword = await bcrypt.hash(password, 10);

  //   await pool.query('INSERT INTO users (email, name, password) VALUES (?, ?, ?)', [
  //     email, name, hashedPassword,
  //   ]);

  //   res.status(201).json({ message: 'User registered' });
  // } catch (err) {
  //   res.status(500).json({ error: err.message });
  // }

  try {
    const { email, name, password } = req.body;
    if (!password) {
      return res.status(400).json({ message: 'Password is required for registration' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert the new user and get the result
    const [result] = await pool.query(
      'INSERT INTO users (email, name, password) VALUES (?, ?, ?)',
      [email, name, hashedPassword]
    );

    // Return the userId from the result
    res.status(201).json({ message: 'User registered', userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);

    const user = users[0];
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (!user.password) return res.status(400).json({ message: 'This account requires Google login' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: 'Invalid password' });

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
