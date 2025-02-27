import React from "react";
import styles from "../../styles/components/filters/DashboardFilters.module.css";
const DashboardFilters = ({
  filters,
  handleFilterChange,
  getYearOptions,
  getMonthOptions,
}) => {
  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterSection}>
        <h3 className={styles.filterTitle}>Date Range</h3>
        <div className={styles.filterControls}>
          <label htmlFor="view-type-select">View:</label>
          <select
            id="view-type-select"
            value={filters.viewType}
            onChange={(e) => handleFilterChange("viewType", e.target.value)}
            className={styles.filterSelect}
          >
            <option value="yearly">Yearly</option>
            <option value="monthly">Monthly</option>
          </select>

          <label htmlFor="year-select">Year:</label>
          <select
            id="year-select"
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
            <>
              <label htmlFor="month-select">Month:</label>
              <select
                id="month-select"
                value={filters.month}
                onChange={(e) =>
                  handleFilterChange("month", Number(e.target.value))
                }
                className={styles.filterSelect}
              >
                {getMonthOptions().map((mn) => (
                  <option key={mn.value} value={mn.value}>
                    {mn.label}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardFilters;
