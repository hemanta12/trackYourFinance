/**
 * Analytics Controller
 * Handles data aggregation and analysis for financial data
 */
const pool = require('../config/db');

/**
 * Executes SQL queries safely with error handling
 */
const executeQuery = async (query, params, res) => {
    try {
      const [result] = await pool.query(query, params);
      return result;
    } catch (error) {
      console.error('Database query error:', error);
      res.status(500).json({ message: 'Internal server error' });
      return null;
    }
  };

// Retrieves analytics data based on specified filters
// Supports both expense and income analysis with time-based filtering
exports.getAnalytics = async (req, res) => {
        const { category, timePeriod, type, source } = req.query;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }
        try{
            if (type === 'expenses') {
                // Build and execute expenses query
                const expensesQuery = `
                  SELECT DATE_FORMAT(e.date, '%Y-%m') as date, 
                         c.category as category, 
                         SUM(e.amount) as total
                  FROM expenses e
                  JOIN categories c ON e.category_id = c.id
                  WHERE e.user_id = ?
                  ${category ? 'AND e.category_id = ?' : ''}
                  ${timePeriod 
                    ? timePeriod === 'This Year'
                      ? 'AND YEAR(e.date) = ?' 
                      : 'AND DATE_FORMAT(e.date, "%Y-%m") = ?' 
                    : ''}
                  GROUP BY date, c.category
                  ORDER BY date ASC
                `;
            
                const params = [userId];
                if (category) params.push(category);
                if (timePeriod) {
                    if (timePeriod=== 'This Year') {
                      params.push(new Date().getFullYear()); 
                    } else {
                      params.push(timePeriod);
                    }
                }

                const expenses = await executeQuery(expensesQuery, params, res);
                return res.json(expenses);
              }
          
              if (type === 'income') {
                // Fetch income data
                const incomeQuery = `
                  SELECT DATE_FORMAT(i.date, '%Y-%m') as date, 
                         s.source as source, 
                         SUM(i.amount) as total
                  FROM income i
                  JOIN sources s ON i.source_id = s.id
                  WHERE i.user_id = ?
                  ${source ? 'AND i.source_id = ?' : ''}
                  ${timePeriod ? 'AND DATE_FORMAT(i.date, "%Y-%m") = ?' : ''}
                  GROUP BY date, s.source
                  ORDER BY date ASC
                `;
              
                const params = [userId];
                if (source) params.push(source);
                if (timePeriod) {
                  if (timePeriod === 'This Year') {
                    params.push(new Date().getFullYear()); 
                  } else {
                    params.push(timePeriod);
                  }
                }
          
                const income = await executeQuery(incomeQuery, params, res);
                return res.json(income);
              }

            res.status(400).json({ message: 'Invalid type parameter' });
    } catch (error) {
        console.error('Error fetching analytics data:', error);
        res.status(500).json({ message: 'Error fetching analytics data', error });
    }
  };



// Retrieves distinct months from both expense and income records
exports.getMonths = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(400).json({ message: 'User ID is required' });
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
    console.log('Fetched Months:', months);

    if (months) {
      return res.json(months.map((item) => item.month));
    }
  } catch (error) {
    console.error('Error fetching months:', error);
    res.status(500).json({ message: 'Error fetching months' });
  }
};
