import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import styles from '../styles/AnalyticsChart.module.css';

const IncomeExpenseChart = ({ data, viewType, onViewTypeChange, year, onYearChange,month, onMonthChange }) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({length: 5}, (_, i) => currentYear - i);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  
   // Add no data check
   if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div className={styles.chartContainer}>

        <div className={styles.chartHeader}>
          <h3>Income vs Expenses Over Time</h3>
          
          <div className={styles.filters}>
          <select 
            value={viewType} 
            onChange={(e) => onViewTypeChange(e.target.value)}
            // className={styles.viewTypeSelect}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly View</option>
          </select>

          <select
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            // className={styles.yearSelect}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {viewType === 'monthly' && (
            <select
              value={month}
              // className={styles.monthSelect}
              onChange={(e) => onMonthChange(e.target.value)}
            >
              {months.map((m, index) => (
                <option key={index} value={index + 1}>
                  {`${m}`}
                </option>
              ))}
            </select>
          )}
         </div>
        </div>
        <div className={styles.noDataMessage}>
            No transactions found for {months[month - 1]} {year}
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chartContainer}>

      <div className={styles.chartHeader}>
        <h3>Income vs Expenses Over Time</h3>

        <div className={styles.filters}>
          <select 
            value={viewType} 
            onChange={(e) => onViewTypeChange(e.target.value)}
            // className={styles.viewTypeSelect}
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly View</option>
          </select>

          <select
            value={year}
            onChange={(e) => onYearChange(e.target.value)}
            // className={styles.yearSelect}
          >
            {years.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          {viewType === 'monthly' && (
            <select
              value={month}
              // className={styles.monthSelect}
              onChange={(e) => onMonthChange(e.target.value)}
            >
              {months.map((m, index) => (
                <option key={index} value={index + 1}>
                  {`${m}`}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="Income" 
            stroke="#82ca9d" 
            strokeWidth={2}
          />
          <Line 
            type="monotone" 
            dataKey="Expense" 
            stroke="#8884d8" 
            strokeWidth={2}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;