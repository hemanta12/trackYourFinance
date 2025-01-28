import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/Navigation.module.css';

const Navigation = () => {
  return (
    <div className={styles.navContainer}>
      <h2 className={styles.logo}>TrackMyFinance</h2>
      <ul className={styles.navList}>
        <li>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? styles.active : ''}>
            Dashboard
          </NavLink>
        </li>
        <li>
          <NavLink to="/expenses" className={({ isActive }) => isActive ? styles.active : ''}>
            Expenses
          </NavLink>
        </li>
        <li>
          <NavLink to="/income" className={({ isActive }) => isActive ? styles.active : ''}>
            Income
          </NavLink>
        </li>
        <li>
          <NavLink to="/settings" className={({ isActive }) => isActive ? styles.active : ''}>
            Settings
          </NavLink>
        </li>
        <li>
          <NavLink to="/budgets" className={({ isActive }) => isActive ? styles.active : ''}>
            Budgets
          </NavLink>
        </li>
      </ul>
    </div>
  );
};

export default Navigation;
