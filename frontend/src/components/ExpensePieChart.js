import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchExpenseBreakdown } from '../redux/analyticsSlice';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import styles from '../styles/ExpensePieChart.module.css';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A28DFF'];

const ExpensePieChart = () => {
  const dispatch = useDispatch();
  const expenseBreakdown = useSelector((state) => state.analytics.expenseBreakdown);

  useEffect(() => {
    dispatch(fetchExpenseBreakdown());
  }, [dispatch]);

  const formattedData = expenseBreakdown.map(item => ({
    category: item.category,
    totalAmount:  parseFloat(item.totalAmount),  // Convert to number
  }));

  if (!formattedData || formattedData.length === 0) {
    return <p className={styles.noDataMessage}>No expense data available.</p>;
  }

  return (
    <div className={styles.pieChartContainer}>
      <h3>Expense Distribution</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie 
          data={formattedData} 
          dataKey="totalAmount" 
          nameKey="category" 
          cx="50%" 
          cy="50%" 
          outerRadius={100} 
          fill="#8884d8">
            {expenseBreakdown.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ExpensePieChart;
