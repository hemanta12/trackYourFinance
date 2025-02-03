// csvProcessor.js
const fs = require("fs");
const csvParser = require("csv-parser");

exports.processCSV = (filePath) => {
  return new Promise((resolve, reject) => {
    const transactions = [];
    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        transactions.push({
          postedDate: row["Posted Date"] || row["Date"],
          merchant: row["Description"] || row["Merchant"],
          amount: parseFloat(row["Amount"]),
        });
      })
      .on("end", () => resolve(transactions))
      .on("error", (err) => reject(err));
  });
};
