// /services/statementService.js
const path = require("path");
const crypto = require("crypto");
const pool = require("../config/db");

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
    // Check if statement was already processed
    const [existingStatement] = await connection.query(
      "SELECT id FROM statement_uploads WHERE id = ? LIMIT 1",
      [statementHash]
    );
    if (existingStatement.length > 0) {
      const errorObj = new Error("This statement has already been uploaded.");
      errorObj.status = 409;
      errorObj.statement_id = statementHash;
      throw errorObj;
    }

    // Process the file based on its type
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

    // Insert the statement record into the database
    await connection.query(
      "INSERT INTO statement_uploads (id, user_id, filename) VALUES (?, ?, ?)",
      [statementHash, user.id, file.originalname]
    );

    return { statement_id: statementHash, transactions };
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
