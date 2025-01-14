import React, { useState, useEffect } from 'react';
import styles from '../styles/Dashboard.module.css';

function Dashboard() {
  const [userName, setUserName] = useState(''); // Stores the user's name

  useEffect(() => {
    // Simulate fetching the user's name from localStorage or a backend response
    const storedName = localStorage.getItem('userName') || 'User'; // Replace 'User' with default fallback
    setUserName(storedName);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove auth token
    localStorage.removeItem('userName'); // Remove user name if stored
    window.location.href = '/'; // Redirect to login page
  };

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <h1 className={styles.logo}>MyApp</h1>
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
      </main>
    </div>
  );
}

export default Dashboard;