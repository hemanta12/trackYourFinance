import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchKPIData,
  fetchBudgetWarnings,
  fetchTopExpenses,
  fetchIncomeVsExpense,
  fetchExpenseBreakdown,
  fetchTopCategories,
} from "../redux/analyticsSlice";
import {
  FaMoneyBillWave,
  FaReceipt,
  FaPiggyBank,
  FaExclamationTriangle,
} from "react-icons/fa";
import IncomeExpenseChart from "../components/IncomeExpenseChart";
import ExpensePieChart from "../components/ExpensePieChart";
import styles from "../styles/Dashboard.module.css";

function Dashboard() {
  const [userName, setUserName] = useState("");
  // --- KPI Filter State (for KPI cards only) ---
  const [kpiYear, setKpiYear] = useState(new Date().getFullYear());

  // --- Trend Filter State (for Income vs Expense & related cards) ---
  const [trendViewType, setTrendViewType] = useState("yearly"); // 'monthly' or 'yearly'
  const [trendYear, setTrendYear] = useState(new Date().getFullYear());
  const [trendMonth, setTrendMonth] = useState(new Date().getMonth() + 1);

  const dispatch = useDispatch();

  const incomeVsExpense = useSelector(
    (state) => state.analytics.incomeVsExpense
  );
  const topExpenses = useSelector((state) => state.analytics.topExpenses);
  const budgetWarnings = useSelector((state) => state.analytics.budgetWarnings);
  const kpiData = useSelector((state) => state.analytics.kpiData);
  const loading = useSelector((state) => state.analytics.loading);
  const topCategories = useSelector((state) => state.analytics.topCategories);

  // Helper to create a list of year options.
  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    // Example: allow years from 5 years ago to next year.
    for (let i = currentYear - 5; i <= currentYear + 1; i++) {
      options.push(i);
    }
    return options;
  };

  const getMonthOptions = () => {
    return [
      { value: 1, label: "January" },
      { value: 2, label: "February" },
      { value: 3, label: "March" },
      { value: 4, label: "April" },
      { value: 5, label: "May" },
      { value: 6, label: "June" },
      { value: 7, label: "July" },
      { value: 8, label: "August" },
      { value: 9, label: "September" },
      { value: 10, label: "October" },
      { value: 11, label: "November" },
      { value: 12, label: "December" },
    ];
  };

  // --- Fetch KPI Data based on the KPI filter ---
  useEffect(() => {
    const storedName = localStorage.getItem("userName") || "User";
    setUserName(storedName);
    dispatch(fetchKPIData({ year: kpiYear }));
  }, [dispatch, kpiYear]);

  // --- Fetch Trend Data based on the Trend filter ---
  useEffect(() => {
    const params = {
      viewType: trendViewType,
      year: trendYear,
      ...(trendViewType === "monthly" && { month: trendMonth }),
    };
    dispatch(fetchIncomeVsExpense(params));
    dispatch(fetchTopExpenses(params));
    dispatch(fetchBudgetWarnings(params));
    dispatch(fetchExpenseBreakdown(params));
    dispatch(fetchTopCategories(params));
  }, [dispatch, trendViewType, trendYear, trendMonth]);

  // Handlers for the filter changes
  const handleKPIYearChange = (e) => {
    setKpiYear(Number(e.target.value));
  };

  const handleTrendViewTypeChange = (e) => {
    setTrendViewType(e.target.value);
  };

  const handleTrendYearChange = (e) => {
    setTrendYear(Number(e.target.value));
  };

  const handleTrendMonthChange = (e) => {
    setTrendMonth(Number(e.target.value));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/";
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navLinks}>
          <button
            className={styles.button}
            onClick={() => alert("Profile Clicked")}
          >
            Profile
          </button>
          <button className={styles.button} onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className={styles.main}>
        <h2 className={styles.welcome}>Welcome, {userName}!</h2>

        {/* --- Filters Container --- */}
        <div className={styles.filtersContainer}>
          {/* KPI Filter */}
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>KPI Filter</h3>
            <div className={styles.filterControls}>
              <label htmlFor="kpi-year-select">Year:</label>
              <select
                id="kpi-year-select"
                value={kpiYear}
                onChange={handleKPIYearChange}
                className={styles.filterSelect}
              >
                {getYearOptions().map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Trend Filter (single set for analytics) */}
          <div className={styles.filterSection}>
            <h3 className={styles.filterTitle}>Trend Filter</h3>
            <div className={styles.filterControls}>
              <label htmlFor="trend-view-select">View:</label>
              <select
                id="trend-view-select"
                value={trendViewType}
                onChange={handleTrendViewTypeChange}
                className={styles.filterSelect}
              >
                <option value="yearly">Yearly</option>
                <option value="monthly">Monthly</option>
              </select>

              <label htmlFor="trend-year-select">Year:</label>
              <select
                id="trend-year-select"
                value={trendYear}
                onChange={handleTrendYearChange}
                className={styles.filterSelect}
              >
                {getYearOptions().map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>

              {trendViewType === "monthly" && (
                <>
                  <label htmlFor="trend-month-select">Month:</label>
                  <select
                    id="trend-month-select"
                    value={trendMonth}
                    onChange={handleTrendMonthChange}
                    className={styles.filterSelect}
                  >
                    {getMonthOptions().map((mn) => (
                      <option key={mn.value} value={mn.value}>
                        {mn.label}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>
        </div>

        <div className={styles.dashboardGrid}>
          {/* KPI Cards */}
          <div className={styles.kpiContainer}>
            <div className={`${styles.kpiCard} ${styles.income}`}>
              <FaMoneyBillWave className={styles.kpiIcon} />
              <h3>Income</h3>
              <p>${Number(kpiData.income).toFixed(2)}</p>
            </div>
            <div className={`${styles.kpiCard} ${styles.expenses}`}>
              <FaReceipt className={styles.kpiIcon} />
              <h3>Expenses</h3>
              <p>${Number(kpiData.expenses).toFixed(2)}</p>
            </div>
            <div className={`${styles.kpiCard} ${styles.savings}`}>
              <FaPiggyBank className={styles.kpiIcon} />
              <h3>Savings</h3>
              <p>${Number(kpiData.savings).toFixed(2)}</p>
            </div>
          </div>

          {/* Income vs Expense Chart */}
          <div className={styles.chartSection}>
            {loading && (
              <div className={styles.loadingOverlay}>Fetching data...</div>
            )}
            <IncomeExpenseChart
              data={incomeVsExpense}
              viewType={trendViewType}
              year={trendYear}
              month={trendMonth}
            />
          </div>

          {/* Analytics Cards */}
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
                      {topExpenses[0].category}:{" "}
                      <strong>${topExpenses[0].amount}</strong>
                    </p>
                  </div>
                  <ul>
                    {topExpenses.slice(1).map((expense) => (
                      <li key={expense.id}>
                        <span className={styles.category}>
                          {expense.category}
                        </span>
                        <span className={styles.amount}>${expense.amount}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className={styles.noDataMessage}>
                  No expenses recorded yet.
                </p>
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
                      <span className={styles.category}>
                        {category.category}
                      </span>
                      <span className={styles.amount}>
                        ${category.totalAmount}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className={styles.noDataMessage}>
                  No category data available.
                </p>
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
