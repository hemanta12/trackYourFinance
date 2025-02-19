// /services/statementService.js
const path = require("path");
const crypto = require("crypto");
const pool = require("../config/db");

const { extractMerchantName } = require("../services/merchantService");
const assignCategory = require("../utils/assignCategory");

// Import processors
const { processCSV } = require("../parsers/csvProcessor");
const { processPDF } = require("../parsers/pdfProcessor");

//Process an uploaded statement file.
async function processStatementUpload(user, file) {
  if (!file) {
    throw new Error("No file provided");
  }

  const filePath = file.path;
  const fileType = path.extname(file.originalname).toLowerCase();

  // Generate a unique statement ID using SHA-256
  const statementHash = crypto
    .createHash("sha256")
    .update(file.originalname + file.size + user.id)
    .digest("hex");

  const connection = await pool.getConnection();
  try {
    // Check if statement was already processed for that hash
    const [existingStatement] = await connection.query(
      "SELECT id FROM statement_uploads WHERE id = ? LIMIT 1",
      [statementHash]
    );
    // if (existingStatement.length > 0) {
    //   // Query the existing transactions for that statement.
    //   const [transactions] = await connection.query(
    //     `SELECT
    //          e.*,
    //         DATE_FORMAT(e.date, '%m-%d-%Y') AS postedDate,
    //         m.name AS merchant_name,
    //         d.text AS full_description
    //       FROM expenses e
    //       LEFT JOIN merchants m ON e.merchant_id = m.id
    //       LEFT JOIN descriptions d ON e.description_id = d.id
    //       WHERE e.statement_id = ?`,
    //     [statementHash]
    //   );
    //   // Map the duplicate data to the same structure as the fresh parser output:
    //   const mappedTransactions = transactions.map((txn) => ({
    //     postedDate: txn.postedDate,
    //     merchant: txn.full_description, // use the full description field as merchant input
    //     amount: txn.amount,
    //     // Optionally, compute refinedMerchantName and suggestedCategory here:
    //     fullDescription: txn.full_description,
    //     refinedMerchantName: txn.merchant_name,
    //     suggestedCategory: assignCategory(txn.full_description),
    //   }));
    //   return {
    //     duplicate: true,
    //     message: "This statement has already been uploaded.",
    //     statement_id: statementHash,
    //     transactions: mappedTransactions,
    //   };
    // }

    // Process the file based on its type

    // 1) Always parse
    let transactions = [];
    if (fileType === ".csv") {
      transactions = await processCSV(filePath);
    } else if (fileType === ".pdf") {
      transactions = await processPDF(filePath);
    } else {
      throw new Error("Unsupported file format");
    }

    if (transactions.length === 0) {
      console.warn("No transactions found in the uploaded file.");
    }

    // Process each transaction so that the backend computes:
    // - fullDescription: the raw text from the bank statement
    // - refinedMerchantName: using your extractMerchantName function
    transactions = transactions.map((txn) => {
      // Assume that txn.merchant holds the full bank statement text
      const fullDescription = txn.description || "";
      // console.log(
      //   "In processStatement, the fullDescription is: ",
      //   fullDescription
      // );

      const refinedMerchantName = extractMerchantName(fullDescription);

      // console.log(
      //   "In processStatement, the refinedMerchantName is: ",
      //   refinedMerchantName
      // );

      const expenseName = txn.expense_name || refinedMerchantName;
      const suggestedCategory =
        txn.suggestedCategory || assignCategory(fullDescription);

      const finalName = expenseName || expenseName.trim() || "Unknown";
      return {
        ...txn,
        expense_name: finalName,
        fullDescription, // will be stored later in descriptions table
        refinedMerchantName, // used to create or look up the merchant record
        suggestedCategory,
      };
    });

    // 3) If found in statement_uploads => set duplicate flag
    const isDuplicate = existingStatement.length > 0;

    return {
      duplicate: isDuplicate,
      message: isDuplicate
        ? "This statement has already been uploaded."
        : "New Statement ready to save.",
      statement_id: statementHash,
      transactions,
      fileName: file.originalname,
    };
  } finally {
    connection.release();
  }
}

//Process a reupload by deleting existing statement data.
async function processReuploadStatement(user, statement_id) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    console.log("statement_id in processReuploadStatement: ", statement_id);

    // Delete associated expenses
    const [deletedExpensesResult] = await connection.query(
      "DELETE FROM expenses WHERE statement_id = ? AND user_id = ?",
      [statement_id, user.id]
    );
    console.log("Deleted expenses count:", deletedExpensesResult.affectedRows);

    // Delete the statement record
    const [deletedStatementResult] = await connection.query(
      "DELETE FROM statement_uploads WHERE id = ? AND user_id = ?",
      [statement_id, user.id]
    );
    console.log(
      "Deleted statement_uploads count:",
      deletedStatementResult.affectedRows
    );

    await connection.commit();
    return { message: "Statement deleted. You can now upload it again." };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  processStatementUpload,
  processReuploadStatement,
};
