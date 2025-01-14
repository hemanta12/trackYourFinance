import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchIncome } from '../redux/incomeSlice';
import { fetchExpenses } from '../redux/expensesSlice';
import styles from '../styles/Dashboard.module.css';

function Dashboard() {
  const [userName, setUserName] = useState(''); 

  const dispatch = useDispatch();
  const income = useSelector((state) => state.income.data);
  const expenses = useSelector((state) => state.expenses.data);
  
  // Calculate totals
  const totalIncome = income.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const netMoney = totalIncome - totalExpenses;


  useEffect(() => {
    
    const storedName = localStorage.getItem('userName') || 'User'; // 
    setUserName(storedName);

    // Fetch income and expenses on component mount
    dispatch(fetchIncome());
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    localStorage.removeItem('userName'); 
    window.location.href = '/'; 
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>

        <h1 className={styles.logo}>TrackMyFinance</h1>

        <div className={styles.navLinks}>
          <button className={styles.button} onClick={() => alert('Profile Clicked')}>
            Profile
          </button>
          <button className={styles.button} onClick={handleLogout}>
            Logout
          </button>
        </div>

      </nav>

      <main className={styles.main}>
        <h2 className={styles.welcome}>Welcome, {userName}!</h2>
        <div className={styles.metricsGrid}>
          <div className={styles.card}>
            <h3>Total Income</h3>
            <p className={styles.income_amount}>${totalIncome.toFixed(2)}</p>
          </div>
          <div className={styles.card}>
            <h3>Total Expenses</h3>
            <p className={styles.expense_amount}>${totalExpenses.toFixed(2)}</p>
          </div>
          <div className={styles.card}>
            <h3>Net Money</h3>
            <p className={styles.net_amount}>${netMoney.toFixed(2)}</p>
          </div>
        </div>
      </main>

      
    </div>
  );
}

export default Dashboard;