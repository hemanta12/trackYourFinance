import React from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import styles from "../../styles/components/analytics/ExpensePieChart.module.css";

const ExpensePieChart = ({ data, title = "Expenses by Category" }) => {
  if (!data || data.length === 0) {
    return <p className={styles.noData}>No expense data available.</p>;
  }

  const ZERO_THRESHOLD = 0.01;
  // Process data: convert totalAmount to Number and filter out non-positive values
  const processedData = data
    .map((item) => ({
      ...item,
      totalAmount: Number(item.totalAmount),
    }))
    .filter((item) => item.totalAmount > ZERO_THRESHOLD)
    .sort((a, b) => b.totalAmount - a.totalAmount);

  if (processedData.length === 0) {
    return <p className={styles.noData}>No positive expense data available.</p>;
  }

  // Get the highest-spent category (by totalAmount)
  const highestCategory = processedData[0];

  // Define a color palette for the slices
  const COLORS = [
    "#ffab91",
    "#90caf9",
    "#f48fb1",
    "#9e9e9e",
    "#a5d6a7",
    "#ce93d8",
    "#81d4fa",
    "#b0bec5",
    "#ffe082",
  ];

  return (
    <div className={styles.container}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <div className={styles.chartContent}>
        {/* Left: Donut Chart */}
        <div className={styles.chartWrapper}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={processedData}
                dataKey="totalAmount"
                nameKey="category"
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={120}
                label={false}
              >
                {processedData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
            </PieChart>
          </ResponsiveContainer>
          {/* Center overlay displaying highest category */}
          <div className={styles.centerLabel}>
            <div className={styles.centerCategory}>
              {highestCategory.category}
            </div>
            <div className={styles.centerAmount}>
              ${highestCategory.totalAmount.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Right: Sorted Category List */}
        <div className={styles.categoryList}>
          {processedData.map((entry, index) => (
            <div key={index} className={styles.categoryItem}>
              <span
                className={styles.colorBox}
                style={{ background: COLORS[index % COLORS.length] }}
              ></span>
              <span className={styles.categoryName}>{entry.category}</span>
              <span className={styles.categoryAmount}>
                ${entry.totalAmount.toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExpensePieChart;
