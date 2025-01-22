const pool = require('../config/db');

// Utility function to execute queries
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

        console.log('Filters received:', { type, category, source, timePeriod });

        try{
            if (type === 'expenses') {
                // Build and execute expenses query
                const expensesQuery = `
                  SELECT DATE_FORMAT(date, '%Y-%m') as date, category, SUM(amount) as total
                  FROM expenses
                  WHERE user_id = ?
                  ${category ? 'AND category = ?' : ''}
                  ${timePeriod 
                    ? timePeriod === 'This Year'
                    ? 'AND YEAR(date) = ?' 
                    : 'AND DATE_FORMAT(date, "%Y-%m") = ?' 
                    : ''}
                  GROUP BY date, category
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
                  SELECT DATE_FORMAT(date, '%Y-%m') as date, source, SUM(amount) as total
                  FROM income
                  WHERE user_id = ?
                  ${source ? 'AND source = ?' : ''}
                  ${
                    timePeriod 
                    ? timePeriod === 'This Year'
                    ? 'AND YEAR(date) = ?'
                    : 'AND DATE_FORMAT(date, "%Y-%m") = ?' 
                    : ''
                  }
                  GROUP BY date, source
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
    console.error('User ID is missing');
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
