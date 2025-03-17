import React from "react";
import styles from "../../styles/components/filters/DashboardFilters.module.css";

const DashboardFilters = ({
  filters,
  handleFilterChange,
  getYearOptions,
  getMonthOptions,
}) => {
  return (
    <div className={styles.filtersInlineWrapper}>
      {/* <span className={styles.filterTitle}>Date Range:</span> */}

      <select
        value={filters.viewType}
        onChange={(e) => handleFilterChange("viewType", e.target.value)}
        className={styles.filterSelect}
      >
        <option value="yearly">Yearly</option>
        <option value="monthly">Monthly</option>
      </select>

      <select
        value={filters.year}
        onChange={(e) => handleFilterChange("year", Number(e.target.value))}
        className={styles.filterSelect}
      >
        {getYearOptions().map((yr) => (
          <option key={yr} value={yr}>
            {yr}
          </option>
        ))}
      </select>

      {filters.viewType === "monthly" && (
        <select
          value={filters.month}
          onChange={(e) => handleFilterChange("month", Number(e.target.value))}
          className={styles.filterSelect}
        >
          {getMonthOptions().map((mn) => (
            <option key={mn.value} value={mn.value}>
              {mn.label}
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default DashboardFilters;
