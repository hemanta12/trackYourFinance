// /services/expenseService.js
const pool = require("../config/db");
const crypto = require("crypto");
const {
  getOrCreateMerchant,
  extractMerchantName,
} = require("./merchantService"); // See next file
const logger = require("../utils/logger");
const assignCategory = require("../utils/assignCategory");
const { log } = require("console");

async function saveStatementExpenses({
  transactions,
  paymentTypes,
  statementId,
  userId,
  forceUpdate = false,
  fileName = null,
}) {
  if (!transactions || transactions.length === 0) {
    throw new Error("No transactions to save");
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // 1) If the user forced an update (and it's duplicate),
    //    remove old data (including the row in `statement_uploads`).
    if (forceUpdate) {
      await connection.query(
        "DELETE FROM expenses WHERE statement_id = ? AND user_id = ?",
        [statementId, userId]
      );
      await connection.query(
        "DELETE FROM statement_uploads WHERE id = ? AND user_id = ?",
        [statementId, userId]
      );
    }

    // 2) Now insert a new row in `statement_uploads`.
    //    (Provided we want a statement_uploads record for every confirm/save.)
    const safeFileName = fileName || "Unknown File";
    await connection.query(
      "INSERT INTO statement_uploads (id, user_id, filename) VALUES (?, ?, ?)",
      [statementId, userId, safeFileName]
    );

    // 3) Prepare for expense insertion
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
      const fullDescription = txn.description || "";

      // console.log(
      //   "In save statement, the fullDescription is: ",
      //   fullDescription
      // );

      // Use our custom helper to extract the refined merchant name
      const refinedMerchantName =
        txn.refinedMerchantName || extractMerchantName(fullDescription);
      // console.log(
      //   "In save statement, the refinedMerchantName is: ",
      //   refinedMerchantName
      // );

      const expenseName = txn.expenseName?.trim() || refinedMerchantName;

      // Determine the category name based on the full description
      const suggestedCategory =
        txn.suggestedCategory || assignCategory(fullDescription);

      // Query the database to get the category id for the suggested category.
      // If not found, create the new category.
      let categoryId;

      // Query the database to get the category id for the suggested category
      const [categoryRows] = await connection.query(
        "SELECT id FROM categories WHERE category = ? LIMIT 1",
        [suggestedCategory]
      );
      if (categoryRows.length > 0) {
        categoryId = categoryRows[0].id;
      } else {
        const [insertResult] = await connection.query(
          "INSERT INTO categories (category, user_id) VALUES (?, ?)",
          [suggestedCategory, userId]
        );
        categoryId = insertResult.insertId;
      }
      // Insert the full description into the `descriptions` table
      const [descResult] = await connection.query(
        "INSERT INTO descriptions (text) VALUES (?)",
        [fullDescription]
      );
      const descriptionId = descResult.insertId;

      // Pass the connection to re-use it in getOrCreateMerchant.
      const merchantId = await getOrCreateMerchant(
        refinedMerchantName,
        connection
      );

      const transactionHash = crypto
        .createHash("sha256")
        .update(
          txn.postedDate +
            fullDescription +
            txn.amount +
            txn.refinedMerchantName +
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
        categoryId,
        paymentTypeId,
        merchantId,
        txn.notes || "",
        sequenceNumber,
        statementId,
        transactionHash,
        descriptionId,
        expenseName,
      ]);
    }
    if (insertValues.length > 0) {
      await connection.query(
        `INSERT INTO expenses 
         (user_id, amount, date, category_id, payment_type_id, merchant_id, notes, sequence_number, statement_id, hash, description_id, expense_name) 
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
