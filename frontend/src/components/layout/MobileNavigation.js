import React from "react";
import { NavLink } from "react-router-dom";
import {
  FaTachometerAlt,
  FaMoneyBillWave,
  FaDollarSign,
  FaRegCreditCard,
  FaCog,
  FaChartPie,
} from "react-icons/fa";
import styles from "../../styles/components/layout/MobileNavigation.module.css";

const MobileNavigation = () => {
  return (
    <nav className={styles.mobileNav}>
      <NavLink
        to="/dashboard"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        <FaTachometerAlt />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/expenses"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        <FaMoneyBillWave />
        <span>Expenses</span>
      </NavLink>
      <NavLink
        to="/income"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        <FaDollarSign />
        <span>Income</span>
      </NavLink>
      <NavLink
        to="/recurring-bills"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        <FaRegCreditCard />
        <span>Bills</span>
      </NavLink>
      <NavLink
        to="/budgets"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        <FaChartPie />
        <span>Budgets</span>
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) => (isActive ? styles.active : "")}
      >
        <FaCog />
        <span>Settings</span>
      </NavLink>
    </nav>
  );
};

export default MobileNavigation;
