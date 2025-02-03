const pool = require("../config/db");
const crypto = require("crypto");
const { getOrCreateMerchant } = require("./listController");

/**
 * Add new expense
 * @param {Object} req.body - Expense data
 * @param {Object} req.user - Authenticated user
 */
exports.createExpense = async (req, res) => {
  try {
    const { amount, category_id, payment_type_id, date, notes } = req.body;
    const userId = req.user.id;

    const [result] = await pool.query(
      "INSERT INTO expenses (user_id, amount, category_id, payment_type_id, date, notes) VALUES (?, ?, ?, ?, ?, ?)",
      [userId, amount, category_id, payment_type_id, date, notes]
    );

    // Fetch the complete expense record after insertion
    const [newExpense] = await pool.query(
      "SELECT * FROM expenses WHERE id = ?",
      [result.insertId]
    );

    res.status(201).json(newExpense[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getExpenses = async (req, res) => {
  try {
    console.time("Expense Query Execution Time");
    const userId = req.user.id;

    const [expenses] = await pool.query(
      `SELECT * FROM expenses 
       WHERE user_id = ? 
       ORDER BY date DESC`, // ✅ Sort by date (most recent first)
      [userId]
    );
    console.timeEnd("Expense Query Execution Time"); // ✅ Logs query time
    res.status(200).json(expenses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.updateExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, category_id, payment_type_id, date, notes } = req.body;
    const userId = req.user.id;

    if (!amount || !category_id || !payment_type_id || !date) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    const [result] = await pool.query(
      `UPDATE expenses 
       SET amount = ?, category_id = ?, payment_type_id = ?, date = ?, notes = ? 
       WHERE id = ? AND user_id = ?`,
      [amount, category_id, payment_type_id, date, notes, id, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Expense not found or unauthorized" });
    }

    const [updatedExpense] = await pool.query(
      "SELECT * FROM expenses WHERE id = ?",
      [id]
    );

    res.json(updatedExpense[0]);
  } catch (error) {
    console.error("Error updating expense:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  const { id } = req.params;
  await pool.query("DELETE FROM expenses WHERE id = ?", [id]);
  res.status(200).send({ message: "Expenses deleted successfully" });
};

// exports.saveStatementExpenses = async (req, res) => {
//   try {
//     const { transactions, paymentTypes, statement_id } = req.body;
//     const userId = req.user.id;
//     console.log("From backend: ", paymentTypes);

//     if (!transactions || transactions.length === 0) {
//       return res.status(400).json({ message: "No transactions to save" });
//     }

//     const connection = await pool.getConnection();
//     try {
//       await connection.beginTransaction();

//       // Fetch Default `category_id` and `payment_type_id`
//       const [[defaultCategory]] = await connection.query(
//         'SELECT id FROM categories WHERE category = "Uncategorized" LIMIT 1'
//       );

//       let defaultCategoryId = defaultCategory?.id || 21;

//       const paymentTypeId = Number(paymentTypes);
//       if (isNaN(paymentTypeId)) {
//         return res.status(400).json({ message: "Invalid payment type ID" });
//       }

//       //  Prepare bulk insert
//       const insertValues = [];
//       for (let txn of transactions) {
//         const merchantId = await getOrCreateMerchant(txn.merchant);
//         console.log("🔹 Final Insert Values:", insertValues);

//         // 🔹 **Generate Hash for the Transaction**
//         const transactionHash = crypto
//           .createHash("sha256")
//           .update(
//             txn.postedDate +
//               txn.merchant +
//               txn.amount +
//               txn.description +
//               paymentTypeId
//           )
//           .digest("hex");

//         // 🔍 **Check if transaction already exists**
//         const [existingTransactions] = await connection.query(
//           `SELECT sequence_number FROM expenses
//                     WHERE user_id = ? AND hash = ? AND date = ?
//                     ORDER BY sequence_number DESC LIMIT 1`,
//           [userId, transactionHash, txn.postedDate]
//         );

//         let sequenceNumber = 1;
//         if (existingTransactions.length > 0) {
//           sequenceNumber = existingTransactions[0].sequence_number + 1;
//         }

//         insertValues.push([
//           userId, // user_id
//           txn.amount, // amount
//           txn.postedDate, // date
//           defaultCategoryId || 21, // category_id
//           paymentTypeId, // payment_type_id
//           merchantId, // merchant_id
//           txn.notes || "", // notes
//           sequenceNumber,
//           statement_id,
//           transactionHash,
//         ]);
//       }

//       if (insertValues.length > 0) {
//         await connection.query(
//           `INSERT INTO expenses
//                       (user_id, amount, date, category_id, payment_type_id, merchant_id, notes, sequence_number, statement_id, hash)
//                    VALUES ?`,
//           [insertValues]
//         );
//       }

//       await connection.commit();
//       console.log("✅ Transactions successfully saved.");
//       res.status(201).json({ message: "Transactions saved successfully" });
//     } catch (error) {
//       await connection.rollback();
//       console.error("❌ Error saving transactions:", error);
//       res
//         .status(500)
//         .json({ message: "Error saving transactions", error: error.message });
//     } finally {
//       connection.release();
//     }
//   } catch (error) {
//     console.error("❌ Error in saveTransactions:", error);
//     res
//       .status(500)
//       .json({ message: "Error processing transactions", error: error.message });
//   }
// };
const expenseService = require("../services/expenseService");
const logger = require("../utils/logger");

exports.saveStatementExpenses = async (req, res) => {
  try {
    const { transactions, paymentTypes, statement_id } = req.body;
    const userId = req.user.id;
    const result = await expenseService.saveStatementExpenses({
      transactions,
      paymentTypes,
      statement_id,
      userId,
    });
    res.status(201).json(result);
  } catch (error) {
    logger.error("Error saving transactions:", error);
    res
      .status(500)
      .json({ message: "Error saving transactions", error: error.message });
  }
};
