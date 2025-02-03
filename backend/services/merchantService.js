// /services/merchantService.js
const pool = require("../config/db");

async function getOrCreateMerchant(merchantName, connection) {
  const [rows] = await connection.query(
    "SELECT id FROM merchants WHERE name = ? LIMIT 1",
    [merchantName]
  );
  if (rows.length > 0) {
    return rows[0].id;
  } else {
    const [result] = await connection.query(
      "INSERT INTO merchants (name) VALUES (?)",
      [merchantName]
    );
    return result.insertId;
  }
}

module.exports = { getOrCreateMerchant };
