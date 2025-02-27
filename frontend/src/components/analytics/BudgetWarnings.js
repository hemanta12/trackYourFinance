import React from "react";
import { FaExclamationTriangle } from "react-icons/fa";
import styles from "../../styles/components/analytics/BudgetWarnings.module.css";

const BudgetWarnings = ({ warnings }) => {
  // Determine status based on percentage spent
  const getStatus = (spent, amount) => {
    const percentage = (spent / amount) * 100;
    if (percentage >= 100) return { type: "danger" };
    if (percentage >= 75) return { type: "warning" };
    return null;
  };

  const filteredWarnings =
    warnings?.filter((budget) => getStatus(budget.spent, budget.amount)) || [];

  if (filteredWarnings.length === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.header}>
          <FaExclamationTriangle className={styles.icon} />
          <h3>Budget Health</h3>
        </div>
        <div className={styles.emptyState}>
          <span className={styles.illustration}>🎉</span>
          <h4>All budgets are healthy</h4>
          <p>No category exceeds 75% of its budget</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <FaExclamationTriangle className={styles.icon} />
        <h3>Budget Health</h3>
      </div>
      <div className={styles.warningsList}>
        {filteredWarnings.map((budget) => {
          const status = getStatus(budget.spent, budget.amount);
          const type = status ? status.type : "";
          const percentage = Math.min(
            (budget.spent / budget.amount) * 100,
            100
          );
          const remaining = (budget.amount - budget.spent).toFixed(2);

          return (
            <div
              key={budget.id}
              className={`${styles.budgetItem} ${styles[type]}`}
            >
              <div className={styles.infoRow}>
                <div className={styles.categoryName}>{budget.category}</div>
                <div className={styles.spentInfo}>
                  ${budget.spent} of ${budget.amount} (left: ${remaining})
                </div>
              </div>
              <div className={styles.progressContainer}>
                <div className={styles.progressBar}>
                  <div
                    className={styles.progressFill}
                    style={{
                      width: `${percentage}%`,
                      backgroundColor:
                        type === "danger" ? "#e57373" : "#ffb74d",
                    }}
                  />
                </div>
                <div className={styles.percentage}>
                  {percentage.toFixed(1)}% Used
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
