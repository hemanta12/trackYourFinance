// /services/expenseService.js
const pool = require("../config/db");
const crypto = require("crypto");
const { getOrCreateMerchant } = require("./merchantService"); // See next file
const logger = require("../utils/logger");

async function saveStatementExpenses({
  transactions,
  paymentTypes,
  statement_id,
  userId,
}) {
  if (!transactions || transactions.length === 0) {
    throw new Error("No transactions to save");
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[defaultCategory]] = await connection.query(
      'SELECT id FROM categories WHERE category = "Uncategorized" LIMIT 1'
    );
    const defaultCategoryId = defaultCategory?.id || 21;
    const paymentTypeId = Number(paymentTypes);
    if (isNaN(paymentTypeId)) {
      throw new Error("Invalid payment type ID");
    }

    const insertValues = [];
    for (let txn of transactions) {
      // Pass the connection to re-use it in getOrCreateMerchant.
      const merchantId = await getOrCreateMerchant(txn.merchant, connection);
      const transactionHash = crypto
        .createHash("sha256")
        .update(
          txn.postedDate +
            txn.merchant +
            txn.amount +
            txn.description +
            paymentTypeId
        )
        .digest("hex");

      const [existingTransactions] = await connection.query(
        `SELECT sequence_number FROM expenses 
         WHERE user_id = ? AND hash = ? AND date = ? 
         ORDER BY sequence_number DESC LIMIT 1`,
        [userId, transactionHash, txn.postedDate]
      );
      let sequenceNumber = 1;
      if (existingTransactions.length > 0) {
        sequenceNumber = existingTransactions[0].sequence_number + 1;
      }
      insertValues.push([
        userId,
        txn.amount,
        txn.postedDate,
        defaultCategoryId,
        paymentTypeId,
        merchantId,
        txn.notes || "",
        sequenceNumber,
        statement_id,
        transactionHash,
      ]);
    }
    if (insertValues.length > 0) {
      await connection.query(
        `INSERT INTO expenses 
         (user_id, amount, date, category_id, payment_type_id, merchant_id, notes, sequence_number, statement_id, hash) 
         VALUES ?`,
        [insertValues]
      );
    }
    await connection.commit();
    logger.info("Transactions successfully saved.");
    return { message: "Transactions saved successfully" };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = { saveStatementExpenses };
