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
  const previousNet =
    Number(kpiData?.previous_income || 0) -
    Number(kpiData?.previous_expenses || 0);
  const netDifference = currentNet - previousNet;

  return (
    <div className={styles.kpiContainer}>
      <div className={`${styles.kpiCard} ${styles.income}`}>
        <FaMoneyBillWave className={styles.kpiIcon} />
        <h3>Income</h3>
        <p>${currentIncome.toFixed(2)}</p>
        <div className={styles.miniTrend}>
          <span
            className={
              incomeDifference >= 0
                ? styles.trendPositive
                : styles.trendNegative
            }
          >
            {incomeDifference >= 0 ? <FaArrowUp /> : <FaArrowDown />}$
            {Math.abs(incomeDifference).toFixed(2)} (
            {previousIncome !== 0
              ? `${((incomeDifference / previousIncome) * 100).toFixed(1)}%`
              : "N/A"}
            )
          </span>
          <div className={styles.comparisonText}>
            vs {getPreviousPeriodLabel()}
          </div>
        </div>
      </div>

      <div className={`${styles.kpiCard} ${styles.expenses}`}>
        <FaReceipt className={styles.kpiIcon} />
        <h3>Expenses</h3>
        <p>${currentExpenses.toFixed(2)}</p>
        <div className={styles.miniTrend}>
          <span
            className={
              expensesDifference <= 0
                ? styles.trendPositive
                : styles.trendNegative
            }
          >
            {expensesDifference <= 0 ? <FaArrowDown /> : <FaArrowUp />}$
            {Math.abs(expensesDifference).toFixed(2)} (
            {previousExpenses !== 0
              ? `${((expensesDifference / previousExpenses) * 100).toFixed(1)}%`
              : "N/A"}
            )
          </span>
          <div className={styles.comparisonText}>
            vs {getPreviousPeriodLabel()}
          </div>
        </div>
      </div>

      <div className={`${styles.kpiCard} ${styles.net}`}>
        <FaBalanceScale className={styles.kpiIcon} />
        <h3>Net</h3>
        <p>${currentNet.toFixed(2)}</p>
        <div className={styles.miniTrend}>
          <span
            className={
              netDifference >= 0 ? styles.trendPositive : styles.trendNegative
            }
          >
            {netDifference >= 0 ? <FaArrowUp /> : <FaArrowDown />}$
            {Math.abs(netDifference).toFixed(2)} (
            {previousNet !== 0
              ? `${((netDifference / Math.abs(previousNet)) * 100).toFixed(1)}%`
              : "N/A"}
            )
          </span>
          <div className={styles.comparisonText}>
            vs {getPreviousPeriodLabel()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardKPI;
