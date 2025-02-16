const pool = require("../config/db");

// Utility functions
const checkExists = async (table, field, value, userId, excludeId = null) => {
  let query = `SELECT id FROM ${table} WHERE LOWER(${field}) = LOWER(?) AND (user_id = ? OR user_id IS NULL)`;
  const params = [value, userId];
  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }
  const [rows] = await pool.query(query, params);
  return rows.length > 0;
};

const checkOwnership = async (table, id, userId) => {
  const [rows] = await pool.query(`SELECT user_id FROM ${table} WHERE id = ?`, [
    id,
  ]);
  if (rows.length === 0) return { exists: false };
  return {
    exists: true,
    isSystemDefault: rows[0].user_id === null,
    canEdit: rows[0].user_id === null || rows[0].user_id === userId,
    isOwner: rows[0].user_id === userId,
  };
};

// Generic CRUD operations
const getItems = async (table, fields, userId) => {
  const [items] = await pool.query(
    `SELECT ${fields} FROM ${table} WHERE user_id = ? OR user_id IS NULL`,
    [userId]
  );
  return items;
};

const createItem = async (table, field, value, userId) => {
  try {
    const [result] = await pool.query(
      `INSERT INTO ${table} (${field}, user_id) VALUES (?, ?)`,
      [value.trim(), userId]
    );
    return { id: result.insertId, [field]: value.trim(), user_id: userId };
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error(`This ${field} already exists for your account`);
    }
    console.error(`Error creating item in ${table}:`, error);
    throw error;
  }
};

const updateItem = async (table, field, value, id, userId, isSystemDefault) => {
  if (isSystemDefault) {
    return createItem(table, field, value, userId);
  }

  // Check for existing entries excluding the current item
  const exists = await checkExists(table, field, value, userId, id);
  if (exists) {
    throw new Error(`This ${field} already exists for your account`);
  }

  try {
    const [result] = await pool.query(
      `UPDATE ${table} SET ${field} = ? WHERE id = ? AND user_id = ?`,
      [value, id, userId]
    );

    return result.affectedRows > 0
      ? { id, [field]: value, user_id: userId }
      : null;
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      throw new Error(`This ${field} already exists for your account`);
    }
    throw error;
  }
};

const deleteItem = async (table, id, userId) => {
  // First check if item is system default
  const [rows] = await pool.query(`SELECT user_id FROM ${table} WHERE id = ?`, [
    id,
  ]);

  if (rows.length === 0) {
    throw new Error("Item not found");
  }

  if (rows[0].user_id === null) {
    throw new Error("Cannot delete system default items");
  }

  // Only proceed if item belongs to user
  const [result] = await pool.query(
    `DELETE FROM ${table} WHERE id = ? AND user_id = ?`,
    [id, userId]
  );

  return result.affectedRows > 0;
};

// Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await getItems(
      "categories",
      "id, category",
      req.user.id
    );
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Error fetching categories" });
  }
};

exports.createCategory = async (req, res) => {
  try {
    const { category } = req.body;
    if (!category) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const exists = await checkExists(
      "categories",
      "category",
      category,
      req.user.id
    );
    if (exists) {
      return res.status(400).json({ message: "Category already exists" });
    }

    const result = await createItem(
      "categories",
      "category",
      category,
      req.user.id
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to create category" });
  }
};

exports.updateCategory = async (req, res) => {
  try {
    const ownership = await checkOwnership(
      "categories",
      req.params.id,
      req.user.id
    );

    if (!ownership.exists) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (!ownership.canEdit) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this category" });
    }

    const result = await updateItem(
      "categories",
      "category",
      req.body.category,
      req.params.id,
      req.user.id,
      ownership.isSystemDefault
    );

    if (!result) {
      return res.status(403).json({ message: "Update failed" });
    }
    res.json(result);
  } catch (error) {
    console.error("Update error:", error);
    res.setHeader("Content-Type", "application/json");
    res
      .status(500)
      .json({ message: error.message || "Error updating category" });
  }
};

exports.deleteCategory = async (req, res) => {
  try {
    const ownership = await checkOwnership(
      "categories",
      req.params.id,
      req.user.id
    );

    if (!ownership.exists) {
      return res.status(404).json({ message: "Category not found" });
    }
    if (!ownership.isOwner) {
      return res
        .status(403)
        .json({ message: "Cannot delete system or other user categories" });
    }

    const success = await deleteItem("categories", req.params.id, req.user.id);
    if (!success) {
      return res.status(403).json({ message: "Delete failed" });
    }
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting category" });
  }
};

// Payment Types
exports.getPaymentTypes = async (req, res) => {
  try {
    const paymentTypes = await getItems(
      "payment_types",
      "id, payment_type",
      req.user.id
    );
    res.json(paymentTypes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching payment types" });
  }
};

exports.addPaymentType = async (req, res) => {
  try {
    const { paymentType } = req.body;
    if (!paymentType) {
      return res.status(400).json({ message: "Payment type is required" });
    }

    const exists = await checkExists(
      "payment_types",
      "payment_type",
      paymentType,
      req.user.id
    );
    if (exists) {
      return res.status(400).json({ message: "Payment type already exists" });
    }

    const result = await createItem(
      "payment_types",
      "payment_type",
      paymentType,
      req.user.id
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Failed to add payment type" });
  }
};

exports.updatePaymentType = async (req, res) => {
  try {
    const ownership = await checkOwnership(
      "payment_types",
      req.params.id,
      req.user.id
    );

    if (!ownership.exists) {
      return res.status(404).json({ message: "Payment type not found" });
    }
    if (!ownership.canEdit) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this payment type" });
    }

    const result = await updateItem(
      "payment_types",
      "payment_type",
      req.body.paymentType,
      req.params.id,
      req.user.id,
      ownership.isSystemDefault
    );

    if (!result) {
      return res.status(403).json({ message: "Update failed" });
    }
    res.json(result);
  } catch (error) {
    res.setHeader("Content-Type", "application/json");
    res
      .status(500)
      .json({ message: error.message || "Error updating payment type" });
  }
};

exports.deletePaymentType = async (req, res) => {
  try {
    const ownership = await checkOwnership(
      "payment_types",
      req.params.id,
      req.user.id
    );

    if (!ownership.exists) {
      return res.status(404).json({ message: "Payment type not found" });
    }
    if (!ownership.isOwner) {
      return res
        .status(403)
        .json({ message: "Cannot delete system or other user payment types" });
    }

    const success = await deleteItem(
      "payment_types",
      req.params.id,
      req.user.id
    );
    if (!success) {
      return res.status(403).json({ message: "Delete failed" });
    }
    res.json({ message: "Payment type deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting payment type" });
  }
};

// Sources
exports.getSources = async (req, res) => {
  try {
    const sources = await getItems("sources", "id, source", req.user.id);
    res.json(sources);
  } catch (error) {
    res.status(500).json({ message: "Error fetching sources" });
  }
};

exports.addSource = async (req, res) => {
  try {
    const { source } = req.body;
    if (!source || typeof source !== "string") {
      return res.status(400).json({
        message: "Source is required and must be a string",
      });
    }

    const exists = await checkExists(
      "sources",
      "source",
      source.trim(),
      req.user.id
    );
    if (exists) {
      return res
        .status(400)
        .json({ message: "Source already exists in your account" });
    }

    const result = await createItem("sources", "source", source, req.user.id);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({
      message: error.message || "Failed to add source",
    });
  }
};

exports.updateSource = async (req, res) => {
  try {
    const ownership = await checkOwnership(
      "sources",
      req.params.id,
      req.user.id
    );

    if (!ownership.exists) {
      return res.status(404).json({ message: "Source not found" });
    }
    if (!ownership.canEdit) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this source" });
    }

    const result = await updateItem(
      "sources",
      "source",
      req.body.source,
      req.params.id,
      req.user.id,
      ownership.isSystemDefault
    );

    if (!result) {
      return res.status(403).json({ message: "Update failed" });
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message || "Error updating source" });
  }
};

exports.deleteSource = async (req, res) => {
  try {
    const ownership = await checkOwnership(
      "sources",
      req.params.id,
      req.user.id
    );

    if (!ownership.exists) {
      return res.status(404).json({ message: "Source not found" });
    }
    if (!ownership.isOwner) {
      return res
        .status(403)
        .json({ message: "Cannot delete system or other user sources" });
    }

    const success = await deleteItem("sources", req.params.id, req.user.id);
    if (!success) {
      return res.status(403).json({ message: "Delete failed" });
    }
    res.json({ message: "Source deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting source" });
  }
};

// Fetch merchants
exports.getMerchants = async (req, res) => {
  try {
    const [merchants] = await pool.query("SELECT * FROM merchants");
    res.json(merchants);
  } catch (error) {
    console.error("❌ Error fetching merchants:", error);
    res.status(500).json({ message: "Error fetching merchants" });
  }
};

// Add new merchant
exports.addMerchant = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ message: "Merchant name is required" });
    }

    // Use existing checkExists utility
    const exists = await checkExists("merchants", "name", name, req.user.id);
    if (exists) {
      return res.status(409).json({ message: "Merchant already exists" });
    }

    const [result] = await pool.query(
      "INSERT INTO merchants (name, user_id) VALUES (?, ?)",
      [name.trim(), req.user.id]
    );
    res.status(201).json({ id: result.insertId, name });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: `Merchant already exists` });
    }
    res.status(500).json({ message: "Error adding merchant" });
  }
};

// Update Merchant
exports.updateMerchant = async (req, res) => {
  try {
    const { name } = req.body;
    const merchantId = req.params.id;

    // Reuse ownership check pattern
    const ownership = await checkOwnership(
      "merchants",
      merchantId,
      req.user.id
    );
    if (!ownership.exists)
      return res.status(404).json({ message: "Not found" });
    if (!ownership.canEdit)
      return res.status(403).json({ message: "Unauthorized" });

    // Duplicate check with exclusion
    const exists = await checkExists(
      "merchants",
      "name",
      name,
      req.user.id,
      merchantId
    );
    if (exists) return res.status(409).json({ message: "Merchant exists" });

    // Update the merchant name
    await pool.query(
      "UPDATE merchants SET name = ? WHERE id = ? AND user_id = ?",
      [name.trim(), merchantId, req.params.id]
    );
    res.json({ id: req.params.id, name: name.trim() });
  } catch (error) {
    res
      .status(500)
      .json({ message: error.message || "Error updating merchant" });
  }
};

// Delete Merchant
exports.deleteMerchant = async (req, res) => {
  try {
    // Check if the merchant exists
    const [rows] = await pool.query("SELECT * FROM merchants WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0) {
      return res.status(404).json({ message: "Merchant not found" });
    }

    // Optionally: Check if the merchant is associated with any transactions before deleting

    // Delete the merchant
    await pool.query("DELETE FROM merchants WHERE id = ?", [req.params.id]);
    res.json({ message: "Merchant deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting merchant:", error);
    res.status(500).json({ message: "Error deleting merchant" });
  }
};

// Get or Create Merchant for Transactions
exports.getOrCreateMerchant = async (merchantName) => {
  try {
    const [existing] = await pool.query(
      "SELECT id FROM merchants WHERE name = ?",
      [merchantName]
    );
    if (existing.length > 0) return existing[0].id;

    const [inserted] = await pool.query(
      "INSERT INTO merchants (name) VALUES (?)",
      [merchantName]
    );
    return inserted.insertId;
  } catch (error) {
    console.error("❌ Error handling merchant:", error);
    throw error;
  }
};
