import React from "react";
import styles from "../../styles/components/analytics/TopMerchants.module.css";
import globalStyles from "../../styles/pages/Dashboard.module.css";

const TopMerchants = ({ merchants }) => {
  const formatAmount = (amount) => {
    if (amount >= 1000000) return `$${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 10000) return `$${(amount / 1000).toFixed(1)}K`;
    return `$${amount.toLocaleString()}`;
  };

  if (!merchants || merchants.length === 0) {
    return (
      <div className={globalStyles.analyticsCard}>
        <div className={globalStyles.cardHeader}>
          <h3>Top Merchants</h3>
        </div>
        <div className={styles.noDataMessage}>
          <span className={styles.noDataIcon}>🏪</span>
          <h4 className={styles.noDataText}>No merchant data available</h4>
        </div>
      </div>
    );
  }

  return (
    <div className={globalStyles.analyticsCard}>
      <div className={globalStyles.cardHeader}>
        <h3>Top 5 Merchants</h3>
      </div>
      <div className={styles.listContainer}>
        <div className={styles.listHeader}>
          <span className={styles.headerText}>Merchant</span>
          <span className={styles.headerText}>Amount</span>
        </div>
        <ul>
          {merchants.map((merchant, index) => (
            <li
              key={merchant.id || index}
              className={styles.listItem}
              style={{ "--index": index }}
            >
              <div className={styles.merchantWrapper}>
                <span className={styles.rankNumber}>{index + 1}</span>
                <span className={styles.merchantName}>{merchant.name}</span>
              </div>
              <span className={styles.amount}>
                {formatAmount(merchant.totalSpent)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TopMerchants;
