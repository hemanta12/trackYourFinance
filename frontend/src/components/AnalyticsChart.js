import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import styles from '../styles/AnalyticsChart.module.css';


const AnalyticsChart = ({ data, title, chartType, activeChart }) => {
  // Ensure data validation
  if (!Array.isArray(data) || data.length === 0) {
    return <p className={styles.noData}>No data available for the selected filters.</p>;
  }

  // Debugging
  console.log('Data passed to chart:', data);

  // Validate data structure based on active chart
  const validateData = () => {
    if (activeChart === 'expenses') {
      return data.every((item) => 'category' in item && 'total' in item);
    }
    if (activeChart === 'income') {
      return data.every((item) => 'source' in item && 'total' in item);
    }
    return false;
  };

  const isValid = validateData();
  if (!isValid) {
    console.error('Invalid data structure for chart:', { activeChart, data });
    return <p className={styles.noData}>Invalid data structure for the selected chart.</p>;
  }

  // X-Axis rendering
  const renderXAxis = () => (
    <XAxis
      dataKey={activeChart === 'expenses' ? 'category' : 'source'}
      tickFormatter={(value) => (value ? value : 'N/A')}
    />
  );

  // Tooltip and Legend
  const renderTooltip = () => (
    // <Tooltip content={<CustomTooltip />} />
    <Tooltip formatter={(value) => `$${parseFloat(value).toFixed(2)}`} />
  );
  const renderLegend = () => <Legend />;

  // Bar Chart rendering
  const renderBarChart = () => (
    <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" />
      {renderXAxis()}
      <YAxis />
      {renderTooltip()}
      {renderLegend()}
      <Bar dataKey="total" fill={activeChart === 'expenses' ? '#8884d8' : '#82ca9d'} name="Total" />
    </BarChart>
  );

  return (
    <div className={styles.chartContainer}>
      <h3>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {chartType === 'Bar' ? renderBarChart() : null}
      </ResponsiveContainer>
    </div>
  );
};

export default AnalyticsChart;
