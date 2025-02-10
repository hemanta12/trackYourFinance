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

function extractMerchantName(fullDescription) {
  if (!fullDescription || typeof fullDescription !== "string") {
    return "Unknown Merchant";
  }

  // Normalize description for matching
  const descriptionLower = fullDescription.toLowerCase();

  // Predefined mapping for subscriptions (extend as needed)
  const subscriptions = {
    youtubepremium: "YouTube Premium",
    netflix: "Netflix",
    spotify: "Spotify",
    "amazon prime": "Amazon Prime",
  };

  // Check if the description contains any known subscription keyword
  for (const key in subscriptions) {
    if (descriptionLower.includes(key)) {
      return subscriptions[key];
    }
  }

  // Predefined mapping for grocery stores (extend as needed)
  const groceries = {
    safeway: "Safeway",
    "99ranch": "99 Ranch Market",
    "whole foods": "Whole Foods",
  };

  for (const key in groceries) {
    if (descriptionLower.includes(key)) {
      return groceries[key];
    }
  }

  // Heuristic: if there are special characters like '*' or '#' in the description,
  // split on those and take the first segment, which is often the merchant name.
  const splitChars = ["*", "#"];
  for (const char of splitChars) {
    if (fullDescription.includes(char)) {
      const parts = fullDescription.split(char);
      if (parts.length > 0) {
        // Further clean up the part by trimming spaces and removing extra tokens
        const candidate = parts[0].trim();
        if (candidate) {
          return candidate;
        }
      }
    }
  }

  // Additional heuristic: remove common location tokens (e.g., state abbreviations)
  // and return the first few words. This example splits by space and returns
  // the first three words.
  const words = fullDescription.split(" ");
  if (words.length >= 3) {
    return words.slice(0, 3).join(" ").trim();
  }

  // Fallback if none of the above worked
  return "Unknown Merchant";
}

module.exports = { getOrCreateMerchant, extractMerchantName };
