import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import styles from "../../styles/components/analytics/BudgetWarnings.module.css";

const BudgetWarnings = ({ warnings }) => {
  const getStatus = (spent, amount) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return { type: "danger", message: "Over Budget!" };
    if (percentage >= 75) return { type: "warning", message: "Near Limit!" };
    return null;
  };

  const filteredWarnings =
    warnings?.filter((budget) => {
      const status = getStatus(budget.spent, budget.amount);
      return status !== null;
    }) || [];

  if (filteredWarnings.length === 0) {
    return (
      <div className={styles.analyticsCard}>
        <div className={styles.cardHeader}>
          <FaExclamationTriangle className={styles.cardIcon} />
          <h3>Budget Health</h3>
        </div>
        <div className={styles.emptyState}>
          <div className={styles.emptyIllustration}>🎉</div>
          <h4>All budgets in good standing</h4>
          <p>No categories exceeding 75% utilization</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.analyticsCard}>
      <div className={styles.cardHeader}>
        <FaExclamationTriangle className={styles.cardIcon} />
        <h3>Budget Warnings</h3>
      </div>
      <div className={styles.gridContainer}>
        {filteredWarnings.map((budget) => {
          const { type, message } = getStatus(budget.spent, budget.amount);
          const remaining = Number(budget.amount - budget.spent).toFixed(2);
          const percentage = Math.min(
            (budget.spent / budget.amount) * 100,
            100
          );

          return (
            <div
              key={budget.id}
              className={`${styles.budgetItem} ${styles[type]}`}
            >
              <div className={styles.budgetHeader}>
                <h3>{budget.category}</h3>
                <span className={styles.statusBadge}>{message}</span>
              </div>

              <div className={styles.budgetDetails}>
                <div className={styles.budgetNumbers}>
                  <div className={styles.budgetStat}>
                    <span>Budget</span>
                    <strong>${budget.amount}</strong>
                  </div>
                  <div className={styles.budgetStat}>
                    <span>Spent</span>
                    <strong>${budget.spent}</strong>
                  </div>
                  <div className={styles.budgetStat}>
                    <span>Remaining</span>
                    <strong
                      className={remaining < 0 ? styles.negativeValue : ""}
                    >
                      ${Math.max(remaining, 0).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className={styles.progressContainer}>
                  <div className={styles.progressBar}>
                    <div
                      className={styles.progressFill}
                      style={{
                        width: `${percentage}%`,
                        backgroundColor:
                          type === "danger" ? "#dc2626" : "#f59e0b",
                      }}
                    />
                  </div>
                  <div className={styles.percentage}>
                    {percentage.toFixed(1)}% Used
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetWarnings;
