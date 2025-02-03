const pool = require("../config/db");

/**
 * Executes SQL queries safely with error handling
 */
const executeQuery = async (query, params, res) => {
  try {
    const [result] = await pool.query(query, params);
    return result;
  } catch (error) {
    console.error("Database query error:", error);
    res.status(500).json({ message: "Internal server error" });
    return null;
  }
};

exports.getMonths = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const monthsQuery = `
      SELECT DISTINCT DATE_FORMAT(date, '%Y-%m') as month
      FROM (
        SELECT date FROM expenses WHERE user_id = ?
        UNION
        SELECT date FROM income WHERE user_id = ?
      ) as all_dates
      ORDER BY month ASC
    `;
    const months = await executeQuery(monthsQuery, [userId, userId], res);

    if (months) {
      return res.json(months.map((item) => item.month));
    }
  } catch (error) {
    console.error("Error fetching months:", error);
    res.status(500).json({ message: "Error fetching months" });
  }
};

exports.getTopExpenses = async (req, res) => {
  const userId = req.user.id;
  const { year, month } = req.query;

  let query = `
      SELECT e.*, c.category
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ? 
  `;

  const params = [userId];

  if (year) {
    query += " AND YEAR(e.date) = ? ";
    params.push(year);
  }
  if (month) {
    query += " AND MONTH(e.date) = ? ";
    params.push(month);
  }

  query += " ORDER BY e.amount DESC LIMIT 3";

  try {
    const [expenses] = await pool.query(query, params);
    res.status(200).json(expenses);
  } catch (error) {
    console.error("Error fetching top expenses:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBudgetWarnings = async (req, res) => {
  const userId = req.user.id;
  const { year, month } = req.query;

  let dateCondition = "";
  const params = [];

  if (year) {
    dateCondition += " AND YEAR(date) = ? ";
    params.push(year);
  }
  if (month) {
    dateCondition += " AND MONTH(date) = ? ";
    params.push(month);
  }

  try {
    const [budgets] = await pool.query(
      `SELECT b.*, c.category, 
              (SELECT SUM(amount) FROM expenses 
               WHERE user_id = b.user_id 
               AND category_id = b.category_id ${dateCondition})  AS spent 
       FROM budgets b 
       JOIN categories c ON b.category_id = c.id
       WHERE b.user_id = ? 
       HAVING spent / b.amount >= 0.8`,
      [...params, userId]
    );
    res.status(200).json(budgets);
  } catch (error) {
    console.error("Error fetching budget warnings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getKPIData = async (req, res) => {
  const userId = req.user.id;

  const year = req.query.year || new Date().getFullYear();
  // const today = new Date();
  // const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

  try {
    const [totalIncome] = await pool.query(
      `SELECT SUM(amount) as total FROM income WHERE user_id = ? AND YEAR(date) = ?`,
      [userId, year]
    );

    const [totalExpenses] = await pool.query(
      `SELECT SUM(amount) as total FROM expenses WHERE user_id = ? AND YEAR(date) = ?`,
      [userId, year]
    );

    const income = totalIncome[0].total || 0;
    const expenses = totalExpenses[0].total || 0;

    res.status(200).json({
      income,
      expenses,
      savings: income - expenses,
    });
  } catch (error) {
    console.error("Error fetching KPI data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getIncomeVsExpense = async (req, res) => {
  const userId = req.user.id;
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const viewType = req.query.viewType || "monthly";
  const year = Number(req.query.year) || currentYear;
  const month =
    viewType === "monthly" ? Number(req.query.month) || currentMonth : null;

  if (isNaN(year) || (viewType === "monthly" && isNaN(month))) {
    return res.status(400).json({
      message: "Invalid year or month parameters",
      received: { year: req.query.year, month: req.query.month },
    });
  }

  try {
    let query;
    let params;

    switch (viewType) {
      case "yearly":
        query = `
        SELECT 
          period,
          type,
          SUM(amount) as amount
        FROM (
          SELECT 
            DATE_FORMAT(date, '%M') as monthNum,
            DATE_FORMAT(date, '%M') as period,
            'Income' as type,
            amount
          FROM income 
          WHERE user_id = ? AND YEAR(date) = ?
          UNION ALL
          SELECT 
            DATE_FORMAT(date, '%M') as monthNum,
            DATE_FORMAT(date, '%M') as period,
            'Expense' as type,
            amount
          FROM expenses 
          WHERE user_id = ? AND YEAR(date) = ?
        ) as combined
        GROUP BY monthNum, period, type
        ORDER BY STR_TO_DATE(monthNum, '%M') ASC, type DESC`;
        params = [userId, parseInt(year), userId, parseInt(year)];
        break;

      case "monthly":
        query = `
          SELECT 
            period,
            type,
            SUM(amount) as amount
          FROM (
            SELECT 
              DATE_FORMAT(date, '%Y-%m-%d') as dateKey,
              DAY(date) as period,
              'Income' as type,
              amount
            FROM income 
            WHERE user_id = ? 
              AND YEAR(date) = ? 
              AND MONTH(date) = ?
            UNION ALL
            SELECT 
              DATE_FORMAT(date, '%Y-%m-%d') as dateKey,
              DAY(date) as period,
              'Expense' as type,
              amount
            FROM expenses 
            WHERE user_id = ? 
              AND YEAR(date) = ? 
              AND MONTH(date) = ?
          ) as combined
          GROUP BY dateKey, period, type
          ORDER BY CAST(period AS SIGNED) ASC`;
        params = [
          userId,
          parseInt(year),
          parseInt(month),
          userId,
          parseInt(year),
          parseInt(month),
        ];
        break;

      default:
        return res.status(400).json({ message: "Invalid view type" });
    }

    const [results] = await pool.query(query, params);

    if (!results.length) {
      return res.json([]);
    }

    const periods = [...new Set(results.map((item) => item.period))];
    const formattedData = periods.map((period) => ({
      period: viewType === "monthly" ? `Day ${period}` : period,
      Income:
        results.find((r) => r.period === period && r.type === "Income")
          ?.amount || 0,
      Expense:
        results.find((r) => r.period === period && r.type === "Expense")
          ?.amount || 0,
    }));

    res.json(formattedData);
  } catch (error) {
    console.error("Error fetching income vs expense:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getTopExpenseCategories = async (req, res) => {
  const userId = req.user.id;
  const { year, month } = req.query;

  let query = `
    SELECT c.category, SUM(e.amount) AS totalAmount
    FROM expenses e
    JOIN categories c ON e.category_id = c.id
    WHERE e.user_id = ?
  `;
  const params = [userId];

  if (year) {
    query += " AND YEAR(e.date) = ? ";
    params.push(year);
  }
  if (month) {
    query += " AND MONTH(e.date) = ? ";
    params.push(month);
  }

  query += `
    GROUP BY c.category
    ORDER BY totalAmount DESC
    LIMIT 5
  `;

  try {
    const [results] = await pool.query(query, params);
    res.json(results);
  } catch (error) {
    console.error("Error fetching top expense categories:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getExpenseBreakdownByCategory = async (req, res) => {
  const userId = req.user.id;
  const { year, month } = req.query;

  let joinCondition = " AND e.user_id = ? ";
  const params = [userId];

  if (year) {
    joinCondition += " AND YEAR(e.date) = ? ";
    params.push(year);
  }
  if (month) {
    joinCondition += " AND MONTH(e.date) = ? ";
    params.push(month);
  }

  try {
    const [results] = await pool.query(
      `SELECT c.category, COALESCE(SUM(e.amount), 0) AS totalAmount
       FROM categories c
       LEFT JOIN expenses e ON c.id = e.category_id ${joinCondition}
       WHERE c.user_id = ? OR c.user_id IS NULL
       GROUP BY c.category
       ORDER BY totalAmount DESC`,
      [...params, userId]
    );

    res.json(results);
  } catch (error) {
    console.error("Error fetching expense breakdown:", error);
    res.status(500).json({ message: "Server error" });
  }
};
