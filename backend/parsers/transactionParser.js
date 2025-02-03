// transactionParser.js
const { formatDate } = require("../utils/dateUtils");

/**
 * Extract the statement period from PDF lines.
 */
exports.extractStatementPeriod = (lines) => {
  const chasePeriodRegex =
    /(Opening\/Closing Date|Statement Period:|Period:)?\s*(\d{2}\/\d{2}\/\d{2})\s*-\s*(\d{2}\/\d{2}\/\d{2})/i;
  const boaPeriodRegex =
    /^(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2}\s*-\s*(January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},\s+(\d{4})$/i;

  for (let line of lines) {
    console.log("🔍 Checking line for statement period:", line);
    const chaseMatch = line.match(chasePeriodRegex);
    if (chaseMatch) {
      const [, , startDateStr, endDateStr] = chaseMatch;
      const [sMonth, sDay, sYearShort] = startDateStr.split("/");
      const [eMonth, eDay, eYearShort] = endDateStr.split("/");
      const startDate = new Date(`20${sYearShort}-${sMonth}-${sDay}`);
      const endDate = new Date(`20${eYearShort}-${eMonth}-${eDay}`);
      console.log("✅ Extracted Statement Period (Chase):", {
        startDate,
        endDate,
      });
      return { startDate, endDate };
    }
    const boaMatch = line.match(boaPeriodRegex);
    if (boaMatch) {
      const [_, startMonth, endMonth, yearStr] = boaMatch;
      const endYear = parseInt(yearStr, 10);
      let startYear = endYear;
      if (/december/i.test(startMonth) && /january/i.test(endMonth)) {
        startYear = endYear - 1;
      }
      // Split line to get day parts (this assumes a predictable format)
      const parts = line.split(" ");
      const startDay = parts[1].replace("-", "");
      const endDay = parts[3].replace(",", "");
      const startDate = new Date(`${startMonth} ${startDay}, ${startYear}`);
      const endDate = new Date(`${endMonth} ${endDay}, ${endYear}`);
      console.log("✅ Extracted Statement Period (BoA):", {
        startDate,
        endDate,
      });
      return { startDate, endDate };
    }
  }
  console.warn("⚠️ Statement period not found. Dates may be inaccurate.");
  return null;
};

/**
 * Determine year mapping based on the statement period.
 */
exports.determineYearMapping = (lines, endDate) => {
  if (!endDate) {
    const currentYear = new Date().getFullYear();
    console.warn(
      "⚠️ No statement period found. Defaulting to current year:",
      currentYear
    );
    return (month) => currentYear;
  }
  return (month) => {
    const monthNumber = new Date(`${month} 1, 2000`).getMonth() + 1;
    const endMonthNumber = endDate.getMonth() + 1;
    if (endMonthNumber === 1 && monthNumber === 12) {
      return endDate.getFullYear() - 1;
    }
    return monthNumber > endMonthNumber
      ? endDate.getFullYear() - 1
      : endDate.getFullYear();
  };
};

exports.parseChaseStyleLine = (line, yearMapping) => {
  const regex = /^(\d{2}\/\d{2})\s+(.*?)([+-]?\d*\.\d{2})$/;
  const match = line.match(regex);
  if (!match) return null;
  const [_, dateStr, merchant, amountStr] = match;
  const [month, day] = dateStr.split("/").map(Number);
  const year = yearMapping(month);
  const fullDate = formatDate(year, month, day);
  const amount = parseFloat(amountStr);
  if (isNaN(amount)) return null;
  return { postedDate: fullDate, merchant: merchant.trim(), amount };
};

exports.isBofAStyleDateLine = (line) => {
  const re = /^(\d{2}\/\d{2})\s*(\d{2}\/\d{2})(.*)$/;
  return re.test(line);
};

exports.parseBofAStyleLines = (line1, line2, yearMapping) => {
  const re = /^(\d{2}\/\d{2})\s*(\d{2}\/\d{2})(.*)$/;
  const match = line1.match(re);
  if (!match) return null;
  const [_, transDateStr, postedDateStr, description] = match;
  const [transMonth, transDay] = transDateStr.split("/").map(Number);
  const transactionDate = formatDate(
    yearMapping(transMonth),
    transMonth,
    transDay
  );
  const [postMonth, postDay] = postedDateStr.split("/").map(Number);
  const postedDate = formatDate(yearMapping(postMonth), postMonth, postDay);
  const amtRe = /^([+-]?\d*\.\d{2})$/;
  const amtMatch = line2.match(amtRe);
  if (!amtMatch) return null;
  const amount = parseFloat(amtMatch[1]);
  if (isNaN(amount)) return null;
  return { transactionDate, postedDate, merchant: description.trim(), amount };
};
