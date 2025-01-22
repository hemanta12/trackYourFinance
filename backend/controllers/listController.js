const pool = require('../config/db');

// Utility function for queries
const executeQuery = async (query, params, res, successMessage) => {
  try {
    const [result] = await pool.query(query, params);
    if (successMessage) {
      console.log('Query executed successfully:', query, params);
      res.status(201).json({ message: successMessage });
    } else {
      return result;
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      res.status(400).json({ message: 'Entry already exists' });
    } else {
      console.error('Error executing query:', query, params, error);
      res.status(500).json({ message: 'Server error' });
    }
  }
};

// Get all categories
exports.getCategories = async (req, res) => {
  const categories = await executeQuery('SELECT category FROM categories', [], res);
  if (categories) res.json(categories.map(cat => cat.category));
};

// Add a new category
exports.addCategory = async (req, res) => {
  const { category } = req.body;
  if (!category) return res.status(400).json({ message: 'Category is required' });
  executeQuery('INSERT INTO categories (category) VALUES (?)', [category], res, 'Category added successfully');
};

// Get all payment types
exports.getPaymentTypes = async (req, res) => {
  const paymentTypes = await executeQuery('SELECT payment_type FROM payment_types', [], res);
  if (paymentTypes) res.json(paymentTypes.map(type => type.payment_type));
};

// Add a new payment type
exports.addPaymentType = async (req, res) => {
  const { paymentType } = req.body;
  if (!paymentType) return res.status(400).json({ message: 'Payment Type is required' });
  executeQuery('INSERT INTO payment_types (payment_type) VALUES (?)', [paymentType], res, 'Payment Type added successfully');
};

// Get all sources
exports.getSources = async (req, res) => {
  const sources = await executeQuery('SELECT source FROM sources', [], res);
  if (sources) res.json(sources.map(src => src.source));
};

// Add a new source
exports.addSource = async (req, res) => {
  const { source } = req.body;
  if (!source) return res.status(400).json({ message: 'Source is required' });
  executeQuery('INSERT INTO sources (source) VALUES (?)', [source], res, 'Source added successfully');
};
