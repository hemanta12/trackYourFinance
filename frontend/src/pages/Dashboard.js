import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchKPIData, 
  fetchBudgetWarnings, 
  fetchTopExpenses,
  fetchIncomeVsExpense , 
  fetchExpenseBreakdown,
  fetchTopCategories
} from '../redux/analyticsSlice';
import { 
  FaMoneyBillWave, 
  FaReceipt, 
  FaPiggyBank, 
  FaExclamationTriangle 
} from 'react-icons/fa';
import IncomeExpenseChart from '../components/IncomeExpenseChart';
import ExpensePieChart from '../components/ExpensePieChart';
import styles from '../styles/Dashboard.module.css';

function Dashboard() {
  const [userName, setUserName] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [viewType, setViewType] = useState('monthly');

  const dispatch = useDispatch();
  const incomeVsExpense = useSelector((state) => state.analytics.incomeVsExpense);
  const topExpenses = useSelector((state) => state.analytics.topExpenses);
  const budgetWarnings = useSelector((state) => state.analytics.budgetWarnings);
  const kpiData = useSelector((state) => state.analytics.kpiData);
  const loading = useSelector((state) => state.analytics.loading);
  const error = useSelector((state) => state.analytics.error);
  const topCategories = useSelector((state) => state.analytics.topCategories);


  useEffect(() => {
    const storedName = localStorage.getItem('userName') || 'User';
    setUserName(storedName);
    dispatch(fetchKPIData());
    dispatch(fetchTopExpenses());
    dispatch(fetchBudgetWarnings());
    dispatch(fetchExpenseBreakdown());
    dispatch(fetchTopCategories());
  }, [dispatch]);

  useEffect(() => {
    if (viewType && year && (viewType === 'yearly' || month)) {
      dispatch(fetchIncomeVsExpense({ 
        viewType, 
        year: Number(year),
        ...(viewType === 'monthly' && { month: Number(month) })
      }));
    }
  }, [dispatch, viewType, year, month]);

  const handleViewTypeChange = (newViewType) => {
    setViewType(newViewType);
    dispatch(fetchIncomeVsExpense({ 
      viewType: newViewType, 
      year,
      ...(newViewType === 'monthly' && { month })
    }));
  };

  const handleYearChange = (newYear) => {
    setYear(Number(newYear));
    dispatch(fetchIncomeVsExpense({
      viewType,
      year: Number(newYear),
      ...(viewType === 'monthly' && { month })
    }));
  };

  const handleMonthChange = (newMonth) => {
    const monthNum = Number(newMonth);
    setMonth(monthNum);
    dispatch(fetchIncomeVsExpense({
      viewType: 'monthly',
      year: Number(year),
      month: monthNum
    }));
  };

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

      <main className={styles.main}>
        <h2 className={styles.welcome}>Welcome, {userName}!</h2>
        <div className={styles.dashboardGrid}>
          <div className={styles.kpiContainer}>
            <div className={`${styles.kpiCard} ${styles.income}`}>
              <FaMoneyBillWave className={styles.kpiIcon} />
              <h3>Income</h3>
              <p>${kpiData.income}</p>
            </div>
            <div className={`${styles.kpiCard} ${styles.expenses}`}>
              <FaReceipt className={styles.kpiIcon} />
              <h3>Expenses</h3>
              <p>${kpiData.expenses}</p>
            </div>
            <div className={`${styles.kpiCard} ${styles.savings}`}>
              <FaPiggyBank className={styles.kpiIcon} />
              <h3>Savings</h3>
              <p>${kpiData.savings}</p>
            </div>
          </div>

          <div className={styles.chartSection}>
            <div className={styles.chartContainer}>
            {loading && (
              <div className={styles.loadingOverlay}>
                    Fetching data...
                  </div>
                )}
                <IncomeExpenseChart 
                  data={incomeVsExpense}
                  viewType={viewType}
                  onViewTypeChange={handleViewTypeChange}
                  year={year}
                  onYearChange={handleYearChange}
                  month={month}
                  onMonthChange={handleMonthChange}
                />
              </div>
          </div>

          <div className={`${styles.analyticsCard}`}>
            <div className={styles.cardHeader}>
              <FaReceipt className={styles.cardIcon} />
              <h3>Top Expenses</h3>
            </div>
            <div className={styles.listContainer}>
              {topExpenses.length > 0 ? (
                <>
                  <div className={styles.largestExpense}>
                    <h4>Largest Expense</h4>
                    <p className={styles.expenseHighlight}>
                      {topExpenses[0].category}: <strong>${topExpenses[0].amount}</strong>
                    </p>
                  </div>
                  <ul>
                    {topExpenses.slice(1).map((expense) => (
                      <li key={expense.id}>
                        <span className={styles.category}>{expense.category}</span>
                        <span className={styles.amount}>${expense.amount}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className={styles.noDataMessage}>No expenses recorded yet.</p>
              )}
            </div>
          </div>

          <div className={`${styles.analyticsCard}`}>
            <div className={styles.cardHeader}>
              <FaExclamationTriangle className={styles.cardIcon} />
              <h3>Budget Warnings</h3>
            </div>
            <div className={styles.listContainer}>
              <ul>
                {budgetWarnings.map((budget) => (
                  <li key={budget.id}>
                    <div className={styles.warningInfo}>
                      <span className={styles.category}>{budget.category}</span>
                      <span className={styles.progress}>
                        ${budget.spent} of ${budget.amount}
                      </span>
                    </div>
                    <span 
                      className={`${styles.status} ${
                        budget.spent / budget.amount >= 0.9 
                          ? styles.danger 
                          : styles.warning
                      }`}
                    >
                      ${budget.amount - budget.spent} remaining
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className={`${styles.analyticsCard}`}>
            <div className={styles.cardHeader}>
              <h3>Top 5 Expense Categories</h3>
            </div>
            <div className={styles.listContainer}>
              {topCategories.length > 0 ? (
                <ul>
                  {topCategories.map((category, index) => (
                    <li key={index}>
                      <span className={styles.category}>{category.category}</span>
                      <span className={styles.amount}>${category.totalAmount}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noDataMessage}>No category data available.</p>
              )}
            </div>
          </div>


          <ExpensePieChart />

        </div>
      </main>
    </div>
  );
}

export default Dashboard;