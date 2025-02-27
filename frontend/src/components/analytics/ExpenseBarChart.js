import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Cell,
  ReferenceLine,
  Legend,
} from "recharts";
import styles from "../../styles/components/analytics/AnalyticsChart.module.css";

// const CustomTooltip = ({ active, payload }) => {
//   if (active && payload && payload.length) {
//     const amount = payload[0].value;
//     return (
//       <div className={styles.tooltipContainer}>
//         <p className={styles.tooltipCategory}>{payload[0].payload.category}</p>
//         <p className={styles.tooltipAmount}>${Math.abs(amount).toFixed(2)}</p>
//       </div>
//     );
//   }
//   return null;
// };

const ExpenseBarChart = ({ data, title = "Expense Breakdown" }) => {
  if (!data || data.length === 0) {
    return <p className={styles.noData}>No expense data available.</p>;
  }

  const ZERO_THRESHOLD = 0.01; // Adjust based on your data precision

  const processedData = data
    .map((item) => ({
      ...item,
      totalAmount: Number(item.totalAmount), // Ensure numeric type
    }))
    .filter((item) => Math.abs(item.totalAmount) > ZERO_THRESHOLD)
    .sort((a, b) => Math.abs(b.totalAmount) - Math.abs(a.totalAmount));

  return (
    <div className={styles.chartContainer}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <div className={styles.responsiveWrapper}>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart
            data={processedData}
            layout="vertical"
            margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
          >
            <ReferenceLine x={0} stroke="#cbd5e1" />
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis
              type="number"
              tickFormatter={(val) => `$${Math.abs(val).toFixed(2)}`}
              tick={{ fill: "#64748b" }}
              axisLine={{ stroke: "#cbd5e1" }}
            />
            <YAxis
              dataKey="category"
              type="category"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#475569" }}
              width={160}
            />
            {/* <Tooltip content={<CustomTooltip />} /> */}
            <Bar
              dataKey="totalAmount"
              barSize={28}
              radius={[4, 4, 4, 4]}
              label={{
                position: (value) => (value > 0 ? "right" : "left"),
                formatter: (val) => `$${Math.abs(val).toFixed(2)}`,
                fill: "#1e293b",
                fontSize: 12,
              }}
            >
              {processedData.map((entry, index) => {
                return (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.totalAmount > 0 ? "#ef4444" : "#10b981"}
                  />
                );
              })}
            </Bar>

            <Legend
              payload={[
                { value: "Expenses", type: "rect", color: "#ef4444" },
                { value: "Credits", type: "rect", color: "#10b981" },
              ]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ExpenseBarChart;
