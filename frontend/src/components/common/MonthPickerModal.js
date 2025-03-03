import React, { useState } from "react";
import styles from "../../styles/components/common/MonthPickerModal.module.css";
import { FaChevronLeft, FaChevronRight, FaTimes } from "react-icons/fa";
import Button from "../common/Button";

const months = [
  { name: "January", index: 0 },
  { name: "February", index: 1 },
  { name: "March", index: 2 },
  { name: "April", index: 3 },
  { name: "May", index: 4 },
  { name: "June", index: 5 },
  { name: "July", index: 6 },
  { name: "August", index: 7 },
  { name: "September", index: 8 },
  { name: "October", index: 9 },
  { name: "November", index: 10 },
  { name: "December", index: 11 },
];

const MonthPickerModal = ({ currentYear, onClose, onSelectMonth }) => {
  const [year, setYear] = useState(currentYear);

  const handleMonthClick = (monthIndex) => {
    onSelectMonth(year, monthIndex);
    onClose();
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.header}>
          <Button
            onClick={() => setYear(year - 1)}
            variant="secondary"
            size="small"
          >
            <FaChevronLeft />
          </Button>
          <div className={styles.yearDisplay}>{year}</div>
          <Button
            onClick={() => setYear(year + 1)}
            variant="secondary"
            size="small"
          >
            <FaChevronRight />
          </Button>
          <Button
            onClick={onClose}
            variant="danger"
            size="small"
            className={styles.closeButton}
          >
            <FaTimes />
          </Button>
        </div>
        <div className={styles.monthGrid}>
          {months.map((month) => (
            <div
              key={month.index}
              className={styles.monthCell}
              onClick={() => handleMonthClick(month.index)}
            >
              {month.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MonthPickerModal;
