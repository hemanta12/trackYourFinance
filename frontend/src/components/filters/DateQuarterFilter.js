import React from "react";
import PropTypes from "prop-types";
import styles from "../../styles/components/filters/DateQuarterFilter.module.css";

const DateQuarterFilter = ({
  selectedYear,
  selectedQuarter,
  setSelectedYear,
  setSelectedQuarter,
  availableYears,
  clearFilters,
}) => {
  return (
    <div className={styles.filterSection}>
      <div className={styles.filterGroup}>
        <label htmlFor="yearFilter">Year:</label>
        <select
          id="yearFilter"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
        >
          <option value="All">All</option>
          {availableYears.map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>
      <div className={styles.filterGroup}>
        <label htmlFor="quarterFilter">Quarter:</label>
        <select
          id="quarterFilter"
          value={selectedQuarter}
          onChange={(e) => setSelectedQuarter(e.target.value)}
        >
          <option value="All">All</option>
          <option value="Q1">Q1</option>
          <option value="Q2">Q2</option>
          <option value="Q3">Q3</option>
          <option value="Q4">Q4</option>
        </select>
      </div>
      <button onClick={clearFilters} className={styles.clearButton}>
        Clear Filters
      </button>
    </div>
  );
};

DateQuarterFilter.propTypes = {
  selectedYear: PropTypes.string.isRequired,
  selectedQuarter: PropTypes.string.isRequired,
  setSelectedYear: PropTypes.func.isRequired,
  setSelectedQuarter: PropTypes.func.isRequired,
  availableYears: PropTypes.arrayOf(PropTypes.number).isRequired,
  clearFilters: PropTypes.func.isRequired,
};

export default DateQuarterFilter;
