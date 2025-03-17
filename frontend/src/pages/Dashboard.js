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
// import ExpenseBarChart from "../components/analytics/ExpenseBarChart";
import ExpensePieChart from "../components/analytics/ExpensePieChart";
import DashboardFilters from "../components/filters/DashboardFilters";
import DashboardKPI from "../components/analytics/DashboardKPI";
// import TopExpenses from "../components/analytics/TopExpenses";
import BudgetWarnings from "../components/analytics/BudgetWarnings";
// import TopExpenseCategories from "../components/analytics/TopExpenseCategories";
import UpcomingPaymentsWidget from "../components/lists/UpcomingPaymentsWidget";
import TopMerchants from "../components/analytics/TopMerchants";
import styles from "../styles/pages/Dashboard.module.css";
import profileImage from "../assets/profile_sample.png";
import Button from "../components/common/Button";

// Temporary placeholder for future recurring payments component
function RecurringPaymentsPlaceholder() {
  return (
    <div className={styles.placeholderCard}>
      <h3 className={styles.placeholderTitle}>Recurring Payments</h3>
      <p>Coming soon!</p>
    </div>
  );
}

function Dashboard() {
  const [userName, setUserName] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  const [filters, setFilters] = useState({
    viewType: "yearly",
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
  });

  const dispatch = useDispatch();

  const {
    incomeVsExpense,
    // topExpenses,
    budgetWarnings,
    kpiData,
    loading,
    // topCategories,
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
      {/* --- Top Bar / Header --- */}
      <div className={styles.topBar}>
        <div className={styles.topBarLeft}>
          <h2 className={styles.dashboardTitle}>Dashboard</h2>
          <p className={styles.welcomeText}>Welcome, {userName}!</p>
        </div>
        <div className={styles.flexSpacer}></div>

        <div className={styles.dashboardFilters}>
          <DashboardFilters
            filters={filters}
            handleFilterChange={handleFilterChange}
            getYearOptions={getYearOptions}
            getMonthOptions={getMonthOptions}
          />
        </div>

        {/* Profile Menu with Dropdown */}
        <div
          className={styles.profileMenu}
          onClick={() => setShowProfileDropdown((prev) => !prev)}
        >
          <img
            // src="https://via.placeholder.com/36"
            src={profileImage}
            alt="Profile"
            className={styles.profilePic}
          />
          <span className={styles.dropdownIcon}>▼</span>
          {showProfileDropdown && (
            <div className={styles.dropdownMenu}>
              <div className={styles.dropdownItem}>Logged in as {userName}</div>
              <div className={styles.dropdownItem}>
                <Button
                  className={styles.logoutButton}
                  variant="danger"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      <main className={styles.main}>
        {/* KPI Cards */}
        <DashboardKPI
          kpiData={kpiData}
          getPreviousPeriodLabel={getPreviousPeriodLabel}
        />

        <div className={styles.chartsRow}>
          <div className={styles.analyticsCard}>
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

          <div className={styles.analyticsCard}>
            <div className={styles.analyticsCard}>
              {/* <RecurringPaymentsPlaceholder /> */}
              <UpcomingPaymentsWidget />
            </div>
          </div>

          {/* <div className={styles.analyticsCard}>
            <RecurringPaymentsPlaceholder />
          </div> */}
        </div>

        <div className={styles.chartsRow}>
          <ExpensePieChart
            data={expenseBreakdown}
            title="Expense Breakdown by Categories"
          />

          <div className={styles.analyticsCard}>
            <BudgetWarnings warnings={budgetWarnings} />
          </div>
        </div>

        {/* Top Merchants */}
        <TopMerchants merchants={topMerchants} />
      </main>
    </div>
  );
}

export default Dashboard;
