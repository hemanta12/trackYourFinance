// pdfProcessor.js
const fs = require("fs");
const pdf = require("pdf-parse");
const {
  extractStatementPeriod,
  determineYearMapping,
  parseChaseStyleLine,
  isBofAStyleDateLine,
  parseBofAStyleLines,
} = require("./transactionParser"); // See next section
const { formatDate } = require("../utils/dateUtils");

exports.processPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);

  try {
    const data = await pdf(dataBuffer);
    console.log("📄 Extracted PDF Text:", data.text.slice(0, 100));

    const lines = data.text.split("\n").map((l) => l.trim());
    const transactions = [];

    // Extract statement period and determine year mapping
    const statementPeriod = extractStatementPeriod(lines);
    if (!statementPeriod) {
      console.warn("⚠️ Statement period not found. Dates may be inaccurate.");
    }
    const { startDate, endDate } = statementPeriod || {};
    const yearMapping = determineYearMapping(lines, endDate);

    let isInTransactionSection = false;
    let isInPurchasesSubSection = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Detect section start/end and sub-sections
      if (
        line.toUpperCase().includes("ACCOUNT ACTIVITY") ||
        line.toUpperCase().includes("TRANSACTIONS")
      ) {
        isInTransactionSection = true;
        isInPurchasesSubSection = false;
        continue;
      }
      if (
        isInTransactionSection &&
        line.toUpperCase().includes("PURCHASES AND ADJUSTMENTS")
      ) {
        console.log("🔍 Entered Purchases and Adjustments sub-section");
        isInPurchasesSubSection = true;
        continue;
      }
      if (
        isInPurchasesSubSection &&
        line.toUpperCase().startsWith("TOTAL PURCHASES")
      ) {
        console.log(
          "🚫 Purchases and Adjustments sub-section End Detected:",
          line
        );
        isInPurchasesSubSection = false;
        continue;
      }
      if (
        isInTransactionSection &&
        (line.toUpperCase().includes("TOTAL FEES CHARGED") ||
          line.toUpperCase().includes("TOTAL INTEREST CHARGED") ||
          line.toUpperCase().includes("TOTAL INTEREST CHARGED FOR THIS PERIOD"))
      ) {
        console.log("🚫 Transaction Section End Detected:", line);
        isInTransactionSection = false;
        isInPurchasesSubSection = false;
        continue;
      }
      if (isInTransactionSection && line.toUpperCase().startsWith("TOTAL ")) {
        console.log("⏩ Skipping total summary line:", line);
        continue;
      }
      if (!isInTransactionSection) continue;

      // Try parsing transactions using two strategies
      const singleLineTx = parseChaseStyleLine(line, yearMapping);
      if (singleLineTx) {
        transactions.push(singleLineTx);
        console.log("✅ Single-line transaction matched:", singleLineTx);
        continue;
      }
      if (isBofAStyleDateLine(line)) {
        const nextLine = lines[i + 1] || "";
        const possibleTx = parseBofAStyleLines(line, nextLine, yearMapping);
        if (possibleTx) {
          transactions.push(possibleTx);
          console.log(
            isInPurchasesSubSection
              ? "✅ Purchases and Adjustments transaction matched:"
              : "✅ Two-line BofA transaction matched:",
            possibleTx
          );
          i++; // Skip the next line as it is part of the transaction
          continue;
        }
      }
    }

    console.log("✅ Final Extracted Transactions:", transactions);
    return transactions;
  } catch (error) {
    console.error("❌ Error Processing PDF:", error);
    return [];
  }
};
