import React, { useState, useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  createIncome,
  updateIncome,
  deleteIncome,
  fetchIncome,
} from "../../redux/incomeSlice";
import { FaEdit, FaTrash } from "react-icons/fa";
import DateQuarterFilter from "../filters/DateQuarterFilter";
import Button from "../common/Button";
import AutoSuggestInput from "../../utils/autoSuggestInput";
import { addSourceThunk, fetchSources } from "../../redux/listSlice";
import styles from "../../styles/components/lists/IncomeList.module.css";

function getDefaultDateForMonth(monthYearString) {
  const [monthName, year] = monthYearString.split(" ");
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  const parsedYear = parseInt(year, 10);

  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();

  if (parsedYear === currentYear && monthIndex === currentMonthIndex) {
    // If it's the current month, default to "today"
    return now.toISOString().split("T")[0];
  } else {
    // Otherwise, default to the last day of that month
    const lastDay = new Date(parsedYear, monthIndex + 1, 0);
    return lastDay.toISOString().split("T")[0];
  }
}

// Custom hook to get window width
const useWindowWidth = () => {
  const [width, setWidth] = useState(window.innerWidth);
  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  return width;
};

// Helper function to group incomes by month (e.g., "January 2025")
const groupIncomeByMonth = (incomeArray) => {
  return incomeArray
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .reduce((groups, incomeItem) => {
      const date = new Date(incomeItem.date);
      const monthYear = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(incomeItem);
      return groups;
    }, {});
};

const IncomeList = ({ income = [] }) => {
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    source_id: "",
    amount: "",
    notes: "",
  });
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedQuarter, setSelectedQuarter] = useState("All");

  const dispatch = useDispatch();
  const sources = useSelector((state) => state.lists.sources);
  const [expandedRow, setExpandedRow] = useState(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isSmallScreen = windowWidth <= 768;

  const [addIncomeInfo, setAddIncomeInfo] = useState(null);
  const [newIncomeForm, setNewIncomeForm] = useState({
    date: "",
    source_id: "",
    amount: "",
    notes: "",
  });
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    dispatch(fetchSources());
    dispatch(fetchIncome());
  }, [dispatch]);

  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    income.forEach((item) => {
      const year = new Date(item.date).getFullYear();
      yearsSet.add(year);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [income]);

  const filteredIncome = useMemo(() => {
    return income.filter((item) => {
      const dateObj = new Date(item.date);
      const itemYear = dateObj.getFullYear();
      const itemMonth = dateObj.getMonth() + 1; // months are 0-based
      if (selectedYear !== "All" && Number(selectedYear) !== itemYear) {
        return false;
      }
      if (selectedQuarter !== "All") {
        let minMonth, maxMonth;
        switch (selectedQuarter) {
          case "Q1":
            minMonth = 1;
            maxMonth = 3;
            break;
          case "Q2":
            minMonth = 4;
            maxMonth = 6;
            break;
          case "Q3":
            minMonth = 7;
            maxMonth = 9;
            break;
          case "Q4":
            minMonth = 10;
            maxMonth = 12;
            break;
          default:
            break;
        }
        if (itemMonth < minMonth || itemMonth > maxMonth) {
          return false;
        }
      }
      return true;
    });
  }, [income, selectedYear, selectedQuarter]);

  const getSourceName = (sourceId) => {
    const source = sources.find((s) => s.id === Number(sourceId));
    return source ? source.source : "Unknown";
  };

  const handleEdit = (id, currentData) => {
    setEditingId(id);
    setFormData({
      date: currentData.date.split("T")[0],
      source_id: currentData.source_id,
      amount: currentData.amount,
      notes: currentData.notes || "",
    });
  };

  const saveEdit = async () => {
    if (!formData.date || !formData.source_id || !formData.amount) {
      alert("All fields are required");
      return;
    }

    try {
      const updateData = {
        amount: Number(formData.amount),
        source_id: Number(formData.source_id),
        date: formData.date,
        notes: formData.notes || "",
      };

      await dispatch(
        updateIncome({
          id: editingId,
          data: updateData,
        })
      ).unwrap();

      setEditingId(null);
      dispatch(fetchIncome());
    } catch (error) {
      console.error("Failed to update income:", error);
      alert(error.response?.data?.message || "Failed to update income");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteIncome(id)).unwrap();
      dispatch(fetchIncome());
    } catch (error) {
      console.error("Failed to delete income:", error);
    }
  };

  // Helper to format dates responsively: mm-dd for small screens, mm-dd-yyyy otherwise
  const formatDateResponsive = (dateString) => {
    const date = new Date(dateString);
    // Adjust for timezone offset
    date.setMinutes(date.getMinutes() + date.getTimezoneOffset());
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    if (isSmallScreen) {
      return `${month}-${day}`;
    } else {
      const year = date.getFullYear();
      return `${month}-${day}-${year}`;
    }
  };

  // Toggle expanded row for small screens to show notes
  const toggleExpand = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  // Group and sort incomes by month
  const groupedIncome = groupIncomeByMonth(filteredIncome);
  const sortedMonthGroups = Object.entries(groupedIncome).sort(
    ([monthA], [monthB]) => {
      const dateA = new Date("1 " + monthA);
      const dateB = new Date("1 " + monthB);
      return dateB - dateA;
    }
  );

  const handleAddIncomeClick = (monthYear) => {
    const defaultDate = getDefaultDateForMonth(monthYear);

    setAddIncomeInfo({ monthYear, defaultDate });

    setNewIncomeForm({
      date: defaultDate,
      source_id: "",
      amount: "",
      notes: "",
    });
  };

  const handleCreateIncome = async () => {
    const { date, source_id, amount, notes } = newIncomeForm;
    if (!date || !source_id || !amount) {
      alert("Please fill out all required fields (date, source, amount).");
      return;
    }
    try {
      await dispatch(
        createIncome({
          date,
          source_id: Number(source_id),
          amount: Number(amount),
          notes: notes || "",
        })
      ).unwrap();
      setSuccessMessage("Income added successfully!");
      dispatch(fetchIncome()); // refresh the list
      // Optionally reset the form:
      setNewIncomeForm({
        ...newIncomeForm,
        amount: "",
        notes: "",
      });
    } catch (err) {
      console.error("Failed to create income:", err);
      alert("Could not create income");
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Clear filter handler
  const clearFilters = () => {
    setSelectedYear("All");
    setSelectedQuarter("All");
  };

  return (
    <div className={styles.incomeSection}>
      <h2 className={styles.title}>Income List</h2>

      <DateQuarterFilter
        selectedYear={selectedYear}
        selectedQuarter={selectedQuarter}
        setSelectedYear={setSelectedYear}
        setSelectedQuarter={setSelectedQuarter}
        availableYears={availableYears}
        clearFilters={clearFilters}
      />

      {sortedMonthGroups.map(([monthYear, incomeItems]) => {
        const transactionCount = incomeItems.length;
        const totalAmount = incomeItems.reduce(
          (sum, item) => sum + Number(item.amount),
          0
        );

        const isAdding = addIncomeInfo && addIncomeInfo.monthYear === monthYear;
        return (
          <div key={monthYear} className={styles.monthGroup}>
            <div className={styles.monthHeader}>
              <h3 className={styles.monthTitle}>{monthYear}</h3>
              <span className={styles.monthTotals}>
                {transactionCount} transaction
                {transactionCount !== 1 ? "s" : ""} | Total: $
                {totalAmount.toFixed(2)}
              </span>
            </div>

            <Button
              className={styles.addIncomeButton}
              size="small"
              onClick={() => handleAddIncomeClick(monthYear)}
            >
              + New
            </Button>

            {/* Success message if we just added something */}
            {isAdding && successMessage && (
              <div className={styles.successMessage}>{successMessage}</div>
            )}

            {isAdding && (
              <div className={styles.addIncomeFormContainer}>
                <h4>Adding New Income for {monthYear}</h4>

                <div className={styles.newIncomeRow}>
                  <div className={styles.inlineInputsLeft}>
                    {/* Amount */}
                    <input
                      type="number"
                      placeholder="Amount"
                      value={newIncomeForm.amount}
                      onChange={(e) =>
                        setNewIncomeForm({
                          ...newIncomeForm,
                          amount: e.target.value,
                        })
                      }
                      className={styles.editField}
                    />
                    {/* Date */}
                    <input
                      type="date"
                      value={newIncomeForm.date}
                      onChange={(e) =>
                        setNewIncomeForm({
                          ...newIncomeForm,
                          date: e.target.value,
                        })
                      }
                      className={styles.editField}
                    />
                  </div>

                  <div className={styles.inlineInputsRight}>
                    {/* Source */}

                    <AutoSuggestInput
                      name="source_id"
                      options={sources.map((s) => ({
                        label: s.source,
                        value: s.id,
                      }))}
                      placeholder="Select or Add new Source"
                      value={newIncomeForm.source_id}
                      onChange={(newVal) => {
                        setNewIncomeForm({
                          ...newIncomeForm,
                          source_id: newVal,
                        });
                      }}
                      onAddNew={async (newSourceName) => {
                        const newSource = await dispatch(
                          addSourceThunk(newSourceName)
                        ).unwrap();

                        await dispatch(fetchSources());

                        return {
                          label: newSource.source,
                          value: newSource.id,
                        };
                      }}
                    />

                    {/* Notes */}
                    <input
                      type="text"
                      placeholder="Notes"
                      value={newIncomeForm.notes}
                      onChange={(e) =>
                        setNewIncomeForm({
                          ...newIncomeForm,
                          notes: e.target.value,
                        })
                      }
                      className={styles.editField}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className={styles.inlineActionButtons}>
                    <Button
                      classNames={styles.inlineSaveButton}
                      variant="success"
                      onClick={handleCreateIncome}
                    >
                      Save
                    </Button>
                    <Button
                      classNames={styles.inlineCancelButton}
                      variant="secondary"
                      onClick={() => setAddIncomeInfo(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className={styles.tableWrapper}>
              <table className={styles.incomeTable}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Source</th>
                    <th>Amount</th>
                    {!isSmallScreen && <th>Notes</th>}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {incomeItems.map((item) => {
                    const isEditing = editingId === item.id;

                    return (
                      <React.Fragment key={`income-${item.id}`}>
                        <tr
                          className={isEditing ? styles.editingRow : ""}
                          onClick={() => {
                            if (!isEditing && isSmallScreen)
                              toggleExpand(item.id);
                          }}
                          style={{
                            cursor:
                              isSmallScreen && !isEditing
                                ? "pointer"
                                : "default",
                          }}
                        >
                          <td>
                            {isEditing ? (
                              <input
                                type="date"
                                value={formData.date}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    date: e.target.value,
                                  })
                                }
                                className={styles.editField}
                              />
                            ) : (
                              formatDateResponsive(item.date)
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <select
                                value={formData.source_id}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    source_id: e.target.value,
                                  })
                                }
                                className={styles.editField}
                              >
                                {sources.map((source) => (
                                  <option
                                    key={`source-${source.id}`}
                                    value={source.id}
                                  >
                                    {source.source}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              getSourceName(item.source_id)
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <input
                                type="number"
                                value={formData.amount}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    amount: e.target.value,
                                  })
                                }
                                className={styles.editField}
                              />
                            ) : (
                              `$${item.amount}`
                            )}
                          </td>
                          {!isSmallScreen && (
                            <td>
                              {isEditing ? (
                                <textarea
                                  value={formData.notes}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      notes: e.target.value,
                                    })
                                  }
                                  className={styles.editField}
                                />
                              ) : (
                                item.notes || "-"
                              )}
                            </td>
                          )}
                          <td className={styles.actionCell}>
                            {isEditing ? (
                              <>
                                <Button
                                  onClick={saveEdit}
                                  className={styles.saveButton}
                                >
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingId(null)}
                                  className={styles.cancelButton}
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  onClick={() => handleEdit(item.id, item)}
                                  className={styles.editButton}
                                >
                                  <FaEdit className={styles.icon} />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(item.id)}
                                  className={styles.deleteButton}
                                >
                                  <FaTrash className={styles.icon} />
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>

                        {isSmallScreen && expandedRow === item.id && (
                          <tr className={styles.expandedRow}>
                            <td colSpan={4}>
                              <strong>Notes:</strong> {item.notes || "No notes"}
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default IncomeList;
