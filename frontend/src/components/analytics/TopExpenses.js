import React from "react";
import { FaReceipt } from "react-icons/fa";
import styles from "../../styles/components/analytics/TopExpenses.module.css";
import globalStyles from "../../styles/pages/Dashboard.module.css";

const TopExpenses = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return <p className={styles.noDataMessage}>No expenses recorded yet.</p>;
  }

  return (
    <div className={globalStyles.analyticsCard}>
      <div className={globalStyles.cardHeader}>
        <FaReceipt className={globalStyles.cardIcon} />
        <h3>Top Expenses</h3>
      </div>
      <div className={styles.listContainer}>
        <div className={styles.largestExpense}>
          <h4>Largest Expense</h4>
          <p className={styles.expenseHighlight}>
            {expenses[0].category}: <strong>${expenses[0].amount}</strong>
          </p>
        </div>
        <ul>
          {expenses.slice(1).map((expense) => (
            <li key={expense.id} className={styles.listItem}>
              <span className={styles.category}>{expense.category}</span>
              <span className={styles.amount}>${expense.amount}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TopExpenses;
