import React from 'react';
import styles from '../styles/ExpenseList.module.css';

const ExpenseList = ({ expenses = [] }) => {
  return (
    <div className={styles.expenseSection}>
      <h3>Expenses List:</h3>
      <div className={styles.gridContainer}>
        <div className={styles.gridHeader}>Date</div>
        <div className={styles.gridHeader}>Category</div>
        <div className={styles.gridHeader}>Amount</div>
        <div className={styles.gridHeader}>Payment Type</div>
        {expenses.map((item) => (
          <React.Fragment key={item.id}>
            <div className={styles.gridItem}>{new Date(item.date).toLocaleDateString()}</div>
            <div className={styles.gridItem}>{item.category}</div>
            <div className={styles.gridItem}>${item.amount}</div>
            <div className={styles.gridItem}>{item.paymentType}</div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
