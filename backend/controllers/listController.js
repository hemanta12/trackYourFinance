const pool = require('../config/db');

// Get all categories
exports.getCategories = async (req, res) => {
    try {
        const [categories] = await pool.query('SELECT category FROM categories');
        res.json(categories.map(cat => cat.category));
      } catch (error) {
        res.status(500).json({ message: 'Server error' });
      }
};

// Add a new category
exports.addCategory = async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ message: 'Category is required' });

  try {
    await pool.query('INSERT INTO categories (category) VALUES (?)', [category]);
    res.status(201).json({ message: 'Category added successfully' });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Category already exists' });
    } else {
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Get all payment types
exports.getPaymentTypes = async (req, res) => {
  try {
    const [paymentTypes] = await pool.query('SELECT payment_type FROM payment_types');
    res.json(paymentTypes.map(type => type.payment_type));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new payment type
exports.addPaymentType = async (req, res) => {
  const { paymentType } = req.body;
  if (!paymentType) return res.status(400).json({ message: 'Payment Type is required' });

  try {
    await pool.query('INSERT INTO payment_types (payment_type) VALUES (?)', [paymentType]);
    res.status(201).json({ message: 'Payment Type added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all sources
exports.getSources = async (req, res) => {
  try {
    const [sources] = await pool.query('SELECT source FROM sources');
    res.json(sources.map(src => src.source));
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Add a new source
exports.addSource = async (req, res) => {
  const { source } = req.body;
  if (!source) return res.status(400).json({ message: 'Source is required' });

  try {
    await pool.query('INSERT INTO sources (source) VALUES (?)', [source]);
    res.status(201).json({ message: 'Source added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};



