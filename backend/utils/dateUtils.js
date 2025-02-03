// dateUtils.js
exports.formatDate = (year, month, day) => {
  const mm = month.toString().padStart(2, "0");
  const dd = day.toString().padStart(2, "0");
  return `${year}-${mm}-${dd}`;
};
