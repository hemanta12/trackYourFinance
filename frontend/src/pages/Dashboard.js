import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  fetchKPIData,
  fetchBudgetWarnings,
  fetchTopExpenses,
  fetchIncomeVsExpense,
  fetchExpenseBreakdown,
  fetchTopCategories,
  fetchTopMerchants,
} from "../redux/analyticsSlice";
import IncomeExpenseChart from "../components/analytics/IncomeExpenseChart";
import ExpenseBarChart from "../components/analytics/ExpenseBarChart";
import DashboardFilters from "../components/filters/DashboardFilters";
import DashboardKPI from "../components/analytics/DashboardKPI";
import TopExpenses from "../components/analytics/TopExpenses";
import BudgetWarnings from "../components/analytics/BudgetWarnings";
import TopExpenseCategories from "../components/analytics/TopExpenseCategories";
import TopMerchants from "../components/analytics/TopMerchants";
import styles from "../styles/pages/Dashboard.module.css";

function Dashboard() {
  const [userName, setUserName] = useState("");

  const [filters, setFilters] = useState({
    viewType: "yearly",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const dispatch = useDispatch();

  const {
    incomeVsExpense,
    topExpenses,
    budgetWarnings,
    kpiData,
    loading,
    topCategories,
    topMerchants,
    expenseBreakdown,
  } = useSelector((state) => state.analytics);

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

  // --- Fetch Trend Data based on the Trend filter ---
  useEffect(() => {
    const storedName = localStorage.getItem("userName") || "User";
    setUserName(storedName);
    const params = {
      viewType: filters.viewType,
      year: filters.year,
      ...(filters.viewType === "monthly" && { month: filters.month }),
    };

    dispatch(fetchKPIData(params)); // Modified to accept month
    dispatch(fetchIncomeVsExpense(params));
    dispatch(fetchTopExpenses(params));
    dispatch(fetchBudgetWarnings(params));
    dispatch(fetchExpenseBreakdown(params));
    dispatch(fetchTopCategories(params));
    dispatch(fetchTopMerchants(params));
  }, [dispatch, filters]);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    window.location.href = "/";
  };

  const getPreviousPeriodLabel = () => {
    if (filters.viewType === "yearly") {
      return `${filters.year - 1}`;
    }

    // Handle year transition for January
    if (filters.month === 1) {
      const prevYear = filters.year - 1;
      const prevMonth = 12;
      return `${
        getMonthOptions().find((m) => m.value === prevMonth)?.label
      } ${prevYear}`;
    }

    const prevMonth = filters.month - 1;
    return `${getMonthOptions().find((m) => m.value === prevMonth)?.label}`;
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
        <DashboardFilters
          filters={filters}
          handleFilterChange={handleFilterChange}
          getYearOptions={getYearOptions}
          getMonthOptions={getMonthOptions}
        />

        <div className={styles.dashboardGrid}>
          {/* KPI Cards */}
          <DashboardKPI
            kpiData={kpiData}
            getPreviousPeriodLabel={getPreviousPeriodLabel}
          />
          {/* Income vs Expense Chart */}
          <div className={styles.chartSection}>
            {loading && (
              <div className={styles.loadingOverlay}>Fetching data...</div>
            )}
            <IncomeExpenseChart
              data={incomeVsExpense}
              viewType={filters.viewType}
              year={filters.year}
              month={filters.month}
            />
          </div>
          {/* Analytics Cards */}
          {/* Top Expenses */}
          <TopExpenses expenses={topExpenses} />
          {/* Top Merchants */}
          <TopMerchants merchants={topMerchants} />
          {/* Budget Warnings */}
          <BudgetWarnings warnings={budgetWarnings} />
          {/* Top 5 Expense Categories */}
          <TopExpenseCategories categories={topCategories} />
          {/* Expense Breakdown */}
          <ExpenseBarChart
            data={expenseBreakdown}
            title="Expense Breakdown by Categories"
          />
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
