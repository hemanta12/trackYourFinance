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


/**
 * Chart component for financial analytics visualization
 * @param {Array} data - Chart data
 * @param {string} title - Chart title
 * @param {string} chartType - Type of chart to render
 * @param {string} activeChart - Current active chart (expenses/income)
 */
const AnalyticsChart = ({ data, title, chartType, activeChart }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p className={styles.noData}>No data available for the selected filters.</p>;
  }

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
