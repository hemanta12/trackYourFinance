import React, { useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
} from "recharts";
import styles from "../../styles/components/analytics/ChartControls.module.css";

const IncomeExpenseChart = ({ data, viewType, year, month }) => {
  const [chartView, setChartView] = useState("bar");

  // If no data, show a friendly message.
  if (!data || data.length === 0) {
    return (
      <p className={styles.noData}>
        No income and expense data available for the selected filters.
      </p>
    );
  }
  // Predefined month order for full month names
  const monthOrder = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Sort the data using the predefined month order
  const sortedData = [...data].sort(
    (a, b) => monthOrder.indexOf(a.period) - monthOrder.indexOf(b.period)
  );

  // Map full month names to abbreviated names for display
  const monthMap = {
    January: "Jan",
    February: "Feb",
    March: "Mar",
    April: "Apr",
    May: "May",
    June: "Jun",
    July: "Jul",
    August: "Aug",
    September: "Sep",
    October: "Oct",
    November: "Nov",
    December: "Dec",
  };
  // Create header title based on view type.
  const title =
    viewType === "monthly"
      ? `Income vs Expense Trend for ${month}/${year}`
      : `Income vs Expense Trend for ${year}`;

  // State to track which chart view is active: "bar" or "area".

  // For the bar chart, we want the maximum value across Income and Expense.
  const maxBarValue = Math.max(
    ...data.map((d) => Math.max(d.Income || 0, d.Expense || 0))
  );

  // For the area chart, the stacked total is (Income + Expense) per period.
  const maxAreaValue = Math.max(
    ...data.map((d) => Math.max(d.Income || 0, d.Expense || 0))
  );

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>

      {/* Toggle buttons */}
      <div className={styles.chartControls}>
        <button
          onClick={() => setChartView("bar")}
          className={chartView === "bar" ? styles.active : ""}
        >
          Bar Chart
        </button>
        <button
          onClick={() => setChartView("area")}
          className={chartView === "area" ? styles.active : ""}
        >
          Overlapping Area Chart
        </button>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        {chartView === "bar" ? (
          <BarChart
            data={sortedData}
            margin={{ top: 40, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tickFormatter={(tick) => monthMap[tick] || tick}
            />
            <YAxis domain={[0, maxBarValue * 1.2]} />
            <Legend />
            {/* Display values on top of each bar */}
            <Bar
              dataKey="Income"
              fill="#48bb78"
              name="Income"
              label={{ position: "top", formatter: (v) => `$${v}` }}
            />
            <Bar
              dataKey="Expense"
              fill="#f56565"
              name="Expense"
              label={{ position: "top", formatter: (v) => `$${v}` }}
            />
          </BarChart>
        ) : (
          <AreaChart
            data={sortedData}
            margin={{ top: 40, right: 30, left: 20, bottom: 15 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="period"
              tickFormatter={(tick) => monthMap[tick] || tick}
            />
            <YAxis
              domain={[0, maxAreaValue * 1.2]}
              padding={{ top: 20, bottom: 0 }}
            />
            {/* <Tooltip formatter={(value) => `$${value}`} /> */}
            <Legend />
            {/* Two Areas with the same stackId to create a stacked effect */}
            <Area
              type="monotone"
              dataKey="Income"
              // stackId="1"
              stroke="#48bb78"
              fill="#48bb78"
              name="Income"
              label={{
                position: "top",
                padding: "20px",
                formatter: (v) => `$${v}`,
              }}
            />
            <Area
              type="monotone"
              dataKey="Expense"
              // stackId="1"
              stroke="#f56565"
              fill="#f56565"
              name="Expense"
              label={{ position: "top", formatter: (v) => `$${v}` }}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default IncomeExpenseChart;
