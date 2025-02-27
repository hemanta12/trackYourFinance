import React from "react";
import styles from "../../styles/components/analytics/TopExpenseCategories.module.css";
import globalStyles from "../../styles/pages/Dashboard.module.css";

const TopExpenseCategories = ({ categories }) => {
  const formatAmount = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 10000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  if (!categories || categories.length === 0) {
    return (
      <div className={globalStyles.analyticsCard}>
        <div className={globalStyles.cardHeader}>
          <h3>Top 5 Expense Categories</h3>
        </div>
        <div className={styles.noDataMessage}>
          <span className={styles.noDataIcon}>📊</span>
          <h4 className={styles.noDataText}>
            No spending categories to display
          </h4>
        </div>
      </div>
    );
  }

  return (
    <div className={globalStyles.analyticsCard}>
      <div className={globalStyles.cardHeader}>
        <h3>Top 5 Expense Categories</h3>
      </div>
      <div className={styles.listContainer}>
        <div className={styles.listHeader}>
          <span className={styles.headerText}>Category</span>
          <span className={styles.headerText}>Amount</span>
        </div>
        <ul>
          {categories.map((category, index) => (
            <li
              key={index}
              className={styles.listItem}
              style={{ "--index": index }}
            >
              <div className={styles.categoryWrapper}>
                <span className={styles.rankNumber}>{index + 1}</span>
                <span className={styles.category}>{category.category}</span>
              </div>
              <span className={styles.amount}>
                {formatAmount(category.totalAmount)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TopExpenseCategories;
