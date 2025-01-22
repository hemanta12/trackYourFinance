//React and Redux
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

//Redux actions
import { fetchIncome } from '../redux/incomeSlice';
import { fetchExpenses } from '../redux/expensesSlice';
import { fetchCategories, fetchMonths, fetchSources } from '../redux/listSlice';

//Services and Components
import { getAnalyticsData } from '../services/api';
import AnalyticsChart from '../components/AnalyticsChart';
import { exportCSV, exportPDF } from '../utils/exportUtils';

//Styles
import styles from '../styles/Dashboard.module.css';

function Dashboard() {
  //User state
  const [userName, setUserName] = useState(''); 

  //Loading states
  const [loading, setLoading] = useState(false); // Loading state
  const [noData, setNoData] = useState(false); // No data state

  //Data states
  const [expenseData, setExpenseData] = useState([]);
  const [incomeData, setIncomeData] = useState([]);

  //Filter states
  const [selectedExpenseCategory, setSelectedExpenseCategory] = useState('All');
  const [selectedExpenseMonth, setSelectedExpenseMonth] = useState('All');
  const [selectedIncomeSource, setSelectedIncomeSource] = useState('All');
  const [selectedIncomeMonth, setSelectedIncomeMonth] = useState('All');

  //Redux selectors and dispatch
  const categories = useSelector((state) => state.lists.categories);
  const sources = useSelector((state) => state.lists.sources);
  const months = useSelector((state) => state.lists.months);
  const dispatch = useDispatch();
  

  //Fetch data on page load
  useEffect(() => {

    const storedName = localStorage.getItem('userName') || 'User'; // 
    setUserName(storedName);

    dispatch(fetchIncome());
    dispatch(fetchExpenses());
    dispatch(fetchCategories());
    dispatch(fetchSources());
    dispatch(fetchMonths()); // Fetch months dynamically
  
  }, [dispatch]);

  //Fetch chart data from API
  const fetchChartData = async (type, filters, setData) => {
    setLoading(true);
    setData([]); // Clear old data

    console.log('Filters sent to backend:', {
      type,
      ...filters,
    });
    
    try {
      const response = await getAnalyticsData({ type, ...filters });
      setData(response.data.length > 0 ? response.data : []);
      setNoData(response.data.length === 0);
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error);
    } finally {
      setLoading(false);
    }
  };

  //Fetch expense data
    useEffect(() => {
      fetchChartData(
        'expenses',
        {
          category: selectedExpenseCategory !== 'All' ? selectedExpenseCategory : undefined,
          timePeriod: 
            selectedExpenseMonth === 'This Year'
            ? 'This Year' // Pass the start of the current year
            : selectedExpenseMonth !== 'All'
            ? selectedExpenseMonth
            : undefined,
        },
        setExpenseData
      );
    }, [selectedExpenseCategory, selectedExpenseMonth]);

    // Fetch income data
    useEffect(() => {
      fetchChartData(
        'income',
        {
          source: selectedIncomeSource !== 'All' ? selectedIncomeSource : undefined,
          timePeriod: 
            selectedIncomeMonth === 'This Year'
            ? 'This Year' // Pass the start of the current year
            : selectedIncomeMonth !== 'All'
            ? selectedIncomeMonth
            : undefined,
        },
        setIncomeData
      );
    }, [selectedIncomeSource, selectedIncomeMonth]);

  
 //Logout function
  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('userName'); 
    window.location.href = '/'; 
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>

        <h1 className={styles.logo}>TrackMyFinance</h1>

        <div className={styles.navLinks}>
          <button className={styles.button} onClick={() => alert('Profile Clicked')}>
            Profile
          </button>
          <button className={styles.button} onClick={handleLogout}>
            Logout
          </button>
        </div>

      </nav>

    {/* Chart Sections */}
      <main className={styles.main}>
        <h2 className={styles.welcome}>Welcome, {userName}!</h2>

        {/* Expense Chart */}
      <div className={styles.chartSection}>
        <h3>Expense Bar Chart</h3>
        <div className={styles.filters}>
          <select
            value={selectedExpenseCategory}
            onChange={(e) => setSelectedExpenseCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map((category, idx) => (
              <option key={idx} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={selectedExpenseMonth}
            
            onChange={(e) => {
              console.log('Selected Expense Month:', e.target.value); // Debug log
              setSelectedExpenseMonth(e.target.value)
            }}
          >
             <option value="This Year">This Year</option>
            {months.length > 0 ? (
              months.map((month, idx) => (
                <option key={idx} value={month}>
                  {month}
                </option>
              ))
            ) : (
              <option disabled>No months available</option>
            )}
          </select>
        </div>
        <AnalyticsChart
          data={expenseData}
          title="Expenses by Category"
          chartType="Bar"
          activeChart="expenses"
        />
        <div className={styles.exportButtons}>
          <button onClick={() => exportCSV(expenseData, 'expenses')}>Export CSV</button>
          <button onClick={() => exportPDF(expenseData, 'Expenses Report')}>Export PDF</button>
        </div>
      </div>

      {/* Income Chart */}
      <div className={styles.chartSection}>
        <h3>Income Bar Chart</h3>
        <div className={styles.filters}>
          <select
            value={selectedIncomeSource}
            onChange={(e) => {
              console.log('Selected Expense Month:', e.target.value); // Debug log
              setSelectedIncomeSource(e.target.value)
            }}
          >
            <option value="All">All Sources</option>
            {sources.map((source, idx) => (
              <option key={idx} value={source}>
                {source}
              </option>
            ))}
          </select>
          <select
            value={selectedIncomeMonth}
            onChange={(e) => setSelectedIncomeMonth(e.target.value)}
          >
            <option value="This Year">This Year</option>
            {months.length > 0 ? (
              months.map((month, idx) => (
                <option key={idx} value={month}>
                  {month}
                </option>
              ))
            ) : (
              <option disabled>No months available</option>
            )}
          </select>
        </div>
        <AnalyticsChart
          data={incomeData}
          title="Income by Source"
          chartType="Bar"
          activeChart="income"
        />
          <div className={styles.exportButtons}>
            <button onClick={() => exportCSV(incomeData, 'income')}>Export CSV</button>
            <button onClick={() => exportPDF(incomeData, 'Income Report')}>Export PDF</button>
          </div>
      </div>
      </main>
    </div>
  );
}

export default Dashboard;