import React from 'react';
import styles from '../styles/IncomeList.module.css';

const IncomeList = ({ income = [] }) => {
  return (
    <div className={styles.incomeSection}>
      <h3>Income List:</h3>
      <div className={styles.gridContainer}>
        <div className={styles.gridHeader}>Date</div>
        <div className={styles.gridHeader}>Source</div>
        <div className={styles.gridHeader}>Amount</div>
        {income.map((item) => (
          <React.Fragment key={item.id}>
            <div className={styles.gridItem}>{new Date(item.date).toLocaleDateString()}</div>
            <div className={styles.gridItem}>{item.source}</div>
            <div className={styles.gridItem}>${item.amount}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default IncomeList;
