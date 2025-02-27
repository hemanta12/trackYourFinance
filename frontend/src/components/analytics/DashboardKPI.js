import React from "react";
import {
  FaMoneyBillWave,
  FaReceipt,
  FaBalanceScale,
  FaArrowUp,
  FaArrowDown,
} from "react-icons/fa";
import styles from "../../styles/components/analytics/DashboardKPI.module.css";

const DashboardKPI = ({ kpiData, getPreviousPeriodLabel }) => {
  const currentIncome = Number(kpiData?.income || 0);
  const previousIncome = Number(kpiData?.previous_income || 0);
  const incomeDifference = currentIncome - previousIncome;

  const currentExpenses = Number(kpiData?.expenses || 0);
  const previousExpenses = Number(kpiData?.previous_expenses || 0);
  const expensesDifference = currentExpenses - previousExpenses;

  const currentNet = currentIncome - currentExpenses;
  const previousNet = previousIncome - previousExpenses;
  const netDifference = currentNet - previousNet;

  // Utility to format money
  const formatCurrency = (value) => `$${value.toFixed(2)}`;

  // Return a small difference component
  const renderTrend = (difference, prevValue) => {
    if (prevValue === 0) {
      // If previous value is 0, we can't compute a valid percentage
      return "N/A";
    }
    const pct = ((difference / Math.abs(prevValue)) * 100).toFixed(1);
    return `${Math.abs(difference).toFixed(2)} (${pct}%)`;
  };

  return (
    <div className={styles.kpiContainer}>
      {/* INCOME CARD */}
      <div className={styles.kpiCard}>
        <div className={styles.cardHeader}>
          {/* Icon in a circle */}
          <div className={`${styles.iconCircle} ${styles.incomeCircle}`}>
            <FaMoneyBillWave className={styles.kpiIcon} />
          </div>
          <span className={styles.kpiTitle}>Income</span>
        </div>
        <div className={styles.kpiValue}>{formatCurrency(currentIncome)}</div>
        <div className={styles.kpiFooter}>
          {/* Difference & arrow */}
          <span
            className={
              incomeDifference >= 0
                ? styles.trendPositive
                : styles.trendNegative
            }
          >
            {incomeDifference >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {renderTrend(incomeDifference, previousIncome)}
          </span>
          <span className={styles.vsText}>vs {getPreviousPeriodLabel()}</span>
        </div>
      </div>

      {/* EXPENSES CARD */}
      <div className={styles.kpiCard}>
        <div className={styles.cardHeader}>
          <div className={`${styles.iconCircle} ${styles.expenseCircle}`}>
            <FaReceipt className={styles.kpiIcon} />
          </div>
          <span className={styles.kpiTitle}>Expenses</span>
        </div>
        <div className={styles.kpiValue}>{formatCurrency(currentExpenses)}</div>
        <div className={styles.kpiFooter}>
          <span
            className={
              expensesDifference <= 0
                ? styles.trendPositive
                : styles.trendNegative
            }
          >
            {expensesDifference <= 0 ? <FaArrowDown /> : <FaArrowUp />}
            {renderTrend(expensesDifference, previousExpenses)}
          </span>
          <span className={styles.vsText}>vs {getPreviousPeriodLabel()}</span>
        </div>
      </div>

      {/* NET CARD */}
      <div className={styles.kpiCard}>
        <div className={styles.cardHeader}>
          <div className={`${styles.iconCircle} ${styles.netCircle}`}>
            <FaBalanceScale className={styles.kpiIcon} />
          </div>
          <span className={styles.kpiTitle}>Net</span>
        </div>
        <div className={styles.kpiValue}>{formatCurrency(currentNet)}</div>
        <div className={styles.kpiFooter}>
          <span
            className={
              netDifference >= 0 ? styles.trendPositive : styles.trendNegative
            }
          >
            {netDifference >= 0 ? <FaArrowUp /> : <FaArrowDown />}
            {renderTrend(netDifference, previousNet)}
          </span>
          <span className={styles.vsText}>vs {getPreviousPeriodLabel()}</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardKPI;
