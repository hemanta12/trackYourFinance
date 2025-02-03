import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import styles from "../styles/AnalyticsChart.module.css";

const IncomeExpenseChart = ({ data, viewType, year, month }) => {
  if (!data || data.length === 0) {
    return (
      <p className={styles.noData}>
        No income and expense data available for the selected filters.
      </p>
    );
  }

  // Create a header title based on the filter.
  const title =
    viewType === "monthly"
      ? `Income vs Expense Trend for ${month}/${year}`
      : `Income vs Expense Trend for ${year}`;

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="period" />
          <YAxis />
          <Tooltip formatter={(value) => `$${value}`} />
          <Legend />
          <Bar dataKey="Income" fill="#48bb78" name="Income" />
          <Bar dataKey="Expense" fill="#f56565" name="Expense" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
