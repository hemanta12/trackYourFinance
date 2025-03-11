import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addCategory, addPaymentType, addMerchant } from "../../services/api";
import {
  updateExpense,
  deleteExpense,
  fetchExpenses,
  bulkDeleteExpenses,
  createExpense,
} from "../../redux/expensesSlice";
import {
  fetchCategories,
  fetchPaymentTypes,
  fetchMerchants,
} from "../../redux/listSlice";
import Button from "../common/Button";
import { FaCloudDownloadAlt, FaEdit, FaTrash } from "react-icons/fa";
import styles from "../../styles/components/lists/ExpenseList.module.css";
import AutoSuggestInput from "../../utils/autoSuggestInput";

const groupExpensesByMonth = (expenses) => {
  return expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .reduce((grouped, expense) => {
      const date = new Date(expense.date);
      const monthYear = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!grouped[monthYear]) {
        grouped[monthYear] = [];
      }
      grouped[monthYear].push(expense);
      return grouped;
    }, {});
};
function getDefaultDateForMonth(monthYearString) {
  const [monthName, year] = monthYearString.split(" ");
  const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();
  const parsedYear = parseInt(year, 10);

  // Check if it's the current month/year
  const now = new Date();
  const currentMonthIndex = now.getMonth();
  const currentYear = now.getFullYear();

  if (parsedYear === currentYear && monthIndex === currentMonthIndex) {
    // If it's the current month: default date = today
    return now.toISOString().split("T")[0];
  } else {
    // Otherwise, last day of that month
    // new Date(year, monthIndex+1, 0) => last day
    const lastDay = new Date(parsedYear, monthIndex + 1, 0);
    return lastDay.toISOString().split("T")[0];
  }
}

const ExpenseList = ({
  expenses = [],
  filterCategory = "",
  filterPayment = "",
  filterMerchant = "",
}) => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.lists.categories);
  const paymentTypes = useSelector((state) => state.lists.paymentTypes);
  const merchants = useSelector((state) => state.lists.merchants);

  const [editingId, setEditingId] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkMode, setBulkMode] = useState(false);
  const [formData, setFormData] = useState({
    date: "",
    category_id: "",
    amount: "",
    payment_type_id: "",
    notes: "",
    expense_name: "",
  });

  const [scrollPosition, setScrollPosition] = useState(0);

  const [addExpenseInfo, setAddExpenseInfo] = useState(null);
  const [newExpenseForm, setNewExpenseForm] = useState({
    date: "",
    category_id: "",
    payment_type_id: "",
    merchant_id: "",
    amount: "",
    notes: "",
  });
  const [successMessage, setSuccessMessage] = useState(null);

  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const isSmallScreen = windowWidth <= 768;

  useEffect(() => {
    function handleResize() {
      setWindowWidth(window.innerWidth);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const tableRef = useRef(null);

  const handleCreateExpense = async () => {
    const {
      date,
      category_id,
      payment_type_id,
      merchant_id,
      amount,
      notes,
      expense_name,
    } = newExpenseForm;

    if (
      !date ||
      !category_id ||
      !payment_type_id ||
      !merchant_id ||
      !amount ||
      !expense_name
    ) {
      alert("Please fill out all required fields");
      return;
    }

    try {
      await dispatch(
        createExpense({
          date,
          category_id: Number(category_id),
          payment_type_id: Number(payment_type_id),
          merchant_id: Number(merchant_id),
          amount: Number(amount),
          notes,
          expense_name,
        })
      ).unwrap();

      // If successful, reset the new expense row
      setNewExpenseForm({
        date: addExpenseInfo.defaultDate,
        category_id: addExpenseInfo.defaultCategory,
        payment_type_id: addExpenseInfo.defaultPayment,
        merchant_id: addExpenseInfo.defaultMerchant,
        amount: "",
        notes: "",
        expense_name: "",
      });
      // Show success message
      setSuccessMessage("Expense added successfully!");
      // Optionally refetch or rely on the slice update
      dispatch(fetchExpenses());
    } catch (err) {
      console.error("Failed to create expense:", err);
      alert("Could not create expense");
    }
  };

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Preserve scroll position during re-renders
  useEffect(() => {
    const savedPosition = sessionStorage.getItem("tableScroll");
    if (savedPosition && tableRef.current) {
      tableRef.current.scrollLeft = parseInt(savedPosition);
    }
  }, []);

  const handleScroll = (e) => {
    setScrollPosition(e.target.scrollLeft);
  };

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchPaymentTypes());
    dispatch(fetchMerchants());
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleEdit = (id, currentData) => {
    setEditingId(id);
    setFormData({
      date: currentData.date.split("T")[0],
      category_id: currentData.category_id,
      amount: currentData.amount,
      payment_type_id: currentData.payment_type_id,
      notes: currentData.notes || "",
      expense_name: currentData.expense_name,
    });
  };

  const saveEdit = async () => {
    if (
      !formData.date ||
      !formData.category_id ||
      !formData.amount ||
      !formData.payment_type_id ||
      !formData.expense_name
    ) {
      alert("All fields are required");
      return;
    }
    try {
      const updateData = {
        amount: Number(formData.amount),
        category_id: Number(formData.category_id),
        payment_type_id: Number(formData.payment_type_id),
        date: formData.date,
        notes: formData.notes || "",
        expense_name: formData.expense_name,
      };
      await dispatch(
        updateExpense({ id: editingId, data: updateData })
      ).unwrap();
      setEditingId(null);
      dispatch(fetchExpenses());
    } catch (error) {
      console.error("Failed to update expense:", error);
      alert(error.response?.data?.message || "Failed to update expense");
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteExpense(id)).unwrap();
      dispatch(fetchExpenses());
    } catch (error) {
      console.error("Failed to delete expense:", error);
    }
  };

  const toggleBulkMode = () => {
    if (bulkMode) setSelectedIds([]);
    setBulkMode((prev) => !prev);
  };

  const toggleSelect = (expenseId) => {
    setSelectedIds((prevSelected) =>
      prevSelected.includes(expenseId)
        ? prevSelected.filter((id) => id !== expenseId)
        : [...prevSelected, expenseId]
    );
  };

  const handleSelectAll = () => {
    const allIds = expenses.map((ex) => ex.id);
    setSelectedIds(allIds);
  };

  const handleClearSelection = () => {
    setSelectedIds([]);
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await dispatch(bulkDeleteExpenses(selectedIds)).unwrap();
      setSelectedIds([]);
      setBulkMode(false);
    } catch (error) {
      console.error("Bulk delete failed:", error);
      alert(error);
    }
  };

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

  const getPaymentTypeName = (paymentTypeId) => {
    const paymentType = paymentTypes.find(
      (p) => p.id === Number(paymentTypeId)
    );
    return paymentType ? paymentType.payment_type : "Unknown";
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === Number(categoryId));
    return category ? category.category : "Unknown";
  };

  const getMerchantName = (merchantId) => {
    const merchant = merchants.find((m) => m.id === Number(merchantId));
    return merchant ? merchant.name : "Unknown Merchant";
  };

  const toggleExpand = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  function handleAddExpenseClick(monthYear) {
    const defaultDate = getDefaultDateForMonth(monthYear);
    // We also want to take currently selected filterCategory, filterPayment, filterMerchant
    // and store them, so we can use them when we actually show the form:
    setAddExpenseInfo({
      monthYear,
      defaultDate,
      defaultCategory: filterCategory,
      defaultPayment: filterPayment,
      defaultMerchant: filterMerchant,
    });

    setNewExpenseForm({
      date: defaultDate,
      category_id: filterCategory || "",
      payment_type_id: filterPayment || "",
      merchant_id: filterMerchant || "",
      amount: "",
      notes: "",
      expense_name: "",
    });
  }

  // 1) Filter the expenses based on the props
  const filteredExpenses = expenses.filter((exp) => {
    if (filterCategory && Number(exp.category_id) !== Number(filterCategory))
      return false;
    if (filterPayment && Number(exp.payment_type_id) !== Number(filterPayment))
      return false;
    if (filterMerchant && Number(exp.merchant_id) !== Number(filterMerchant))
      return false;
    return true;
  });

  // 2) Now group the filtered expenses by month
  const grouped = groupExpensesByMonth(filteredExpenses);

  const sortedMonths = Object.entries(grouped).sort(([a], [b]) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB - dateA;
  });

  return (
    <div className={styles.expenseSection}>
      <h2 className={styles.title}>List of Expenses</h2>

      <div className={styles.legendContainer}>
        <span className={styles.legendItem}>
          <FaCloudDownloadAlt
            style={{ marginRight: "4px", color: "#348ceb" }}
          />
          = Imported from a bank statement
        </span>
      </div>

      <Button onClick={toggleBulkMode} variant="primary">
        {bulkMode ? "Cancel Multiple Select" : "Select Multiple"}
      </Button>

      {bulkMode && (
        <div className={styles.bulkActions}>
          <Button
            onClick={handleSelectAll}
            disabled={expenses.length === 0}
            variant="primary"
          >
            Select All
          </Button>
          <Button
            onClick={handleClearSelection}
            disabled={selectedIds.length === 0}
            variant="primary"
          >
            Clear Selection
          </Button>
          <Button
            onClick={handleBulkDelete}
            disabled={selectedIds.length === 0}
            variant="danger"
          >
            Delete Selected
          </Button>
        </div>
      )}

      {sortedMonths.map(([monthYear, monthExpenses]) => {
        const transactionCount = monthExpenses.length;
        const totalAmount = monthExpenses.reduce(
          (sum, item) => sum + Number(item.amount),
          0
        );
        const isAdding =
          addExpenseInfo && addExpenseInfo.monthYear === monthYear;

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
              className={styles.addExpenseButton}
              variant="primary"
              size="small"
              onClick={() => handleAddExpenseClick(monthYear)}
            >
              + New
            </Button>

            {isAdding && successMessage && (
              <div className={styles.successMessage}>✅ {successMessage}</div>
            )}

            {/* If we are adding an expense for this month, display the inline form */}
            {isAdding && (
              <div className={styles.addExpenseFormContainer}>
                <h4>Adding a New Expense for {monthYear}</h4>
                {successMessage && (
                  <div className={styles.successMessage}>
                    ✅ {successMessage} - New entry is selected below!
                  </div>
                )}

                <div className={styles.newExpenseRow}>
                  <div className={styles.inlineInputsLeft}>
                    <input
                      type="text"
                      placeholder="Expense Name"
                      value={newExpenseForm.expense_name}
                      onChange={(e) =>
                        setNewExpenseForm({
                          ...newExpenseForm,
                          expense_name: e.target.value,
                        })
                      }
                      className={styles.editField}
                    />

                    <input
                      type="date"
                      value={newExpenseForm.date}
                      onChange={(e) =>
                        setNewExpenseForm({
                          ...newExpenseForm,
                          date: e.target.value,
                        })
                      }
                      className={styles.editField}
                    />

                    <input
                      type="number"
                      placeholder="Amount"
                      value={newExpenseForm.amount}
                      onChange={(e) =>
                        setNewExpenseForm({
                          ...newExpenseForm,
                          amount: e.target.value,
                        })
                      }
                      className={styles.editField}
                    />
                  </div>

                  <div className={styles.inlineInputsRight}>
                    {/* Category AutoSuggest */}
                    <AutoSuggestInput
                      name="category_id"
                      options={categories.map((cat) => ({
                        label: cat.category,
                        value: cat.id,
                      }))}
                      placeholder="Select or Add new Category"
                      value={newExpenseForm.category_id}
                      onChange={(newVal) => {
                        setNewExpenseForm({
                          ...newExpenseForm,
                          category_id: newVal,
                        });
                      }}
                      onAddNew={async (newCategoryName) => {
                        // Call API to add new category
                        const newCategory = await addCategory(newCategoryName);
                        await dispatch(fetchCategories());
                        return {
                          label: newCategory.category,
                          value: newCategory.id,
                        };
                      }}
                    />

                    {/* Payment Type AutoSuggest */}
                    <AutoSuggestInput
                      name="payment_type_id"
                      options={paymentTypes.map((pt) => ({
                        label: pt.payment_type,
                        value: pt.id,
                      }))}
                      placeholder="Select or Add new Payment"
                      value={newExpenseForm.payment_type_id}
                      onChange={(newVal) =>
                        setNewExpenseForm({
                          ...newExpenseForm,
                          payment_type_id: newVal,
                        })
                      }
                      onAddNew={async (newPaymentName) => {
                        // Call API to add new payment type
                        const newPayment = await addPaymentType(newPaymentName);
                        await dispatch(fetchPaymentTypes());
                        return {
                          label: newPayment.payment_type,
                          value: newPayment.id,
                        };
                      }}
                    />

                    {/* Merchant AutoSuggest */}
                    <AutoSuggestInput
                      name="merchant_id"
                      options={merchants.map((m) => ({
                        label: m.name,
                        value: m.id,
                      }))}
                      placeholder="Select or Add new Merchant"
                      value={newExpenseForm.merchant_id}
                      onChange={(newVal) =>
                        setNewExpenseForm({
                          ...newExpenseForm,
                          merchant_id: newVal,
                        })
                      }
                      onAddNew={async (newMerchantName) => {
                        // Call API to add new merchant
                        const newMerchant = await addMerchant(newMerchantName);
                        await dispatch(fetchMerchants());
                        return {
                          label: newMerchant.name,
                          value: newMerchant.id,
                        };
                      }}
                    />

                    <input
                      type="text"
                      placeholder="Notes"
                      value={newExpenseForm.notes}
                      onChange={(e) =>
                        setNewExpenseForm({
                          ...newExpenseForm,
                          notes: e.target.value,
                        })
                      }
                      className={styles.editField}
                    />
                  </div>

                  {/* Action buttons */}
                  <div className={styles.inlineActionButtons}>
                    <Button
                      variant="success"
                      onClick={handleCreateExpense}
                      classNames={styles.inlineSaveButton}
                    >
                      Save
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setAddExpenseInfo(null)}
                      classNames={styles.inlineCancelButton}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div
              className={styles.tableWrapper}
              ref={tableRef}
              onScroll={handleScroll}
              style={{
                scrollLeft: scrollPosition,
                overflowX: "auto",
              }}
            >
              <table className={styles.expenseTable}>
                <thead>
                  <tr>
                    {bulkMode && <th>Select</th>}
                    <th>Date</th>
                    <th>Name</th>
                    <th>Amount</th>
                    <th>Merchant</th>
                    <th>Category</th>
                    <th>Payment Type</th>
                    {/* <th className={styles.hideOnMobile}>Details</th> */}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {monthExpenses.map((item, index) => {
                    const isEditing = editingId === item.id;
                    const isChecked = selectedIds.includes(item.id);
                    const isExpanded = expandedRow === item.id;
                    return (
                      <React.Fragment key={`expense-${item.id || index}`}>
                        <tr
                          className={isEditing ? styles.editingRow : ""}
                          onClick={() => toggleExpand(item.id)}
                          style={{ cursor: "pointer" }}
                        >
                          {bulkMode && (
                            <td>
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onClick={(e) => e.stopPropagation()}
                                onChange={() => toggleSelect(item.id)}
                              />
                            </td>
                          )}

                          {/* Date Column */}
                          <td>
                            {item.statement_id && (
                              <span
                                title="Imported from a statement"
                                className={styles.importedIndicator}
                              >
                                <FaCloudDownloadAlt
                                  style={{
                                    marginRight: "4px",
                                    color: "#348ceb",
                                  }}
                                />
                              </span>
                            )}
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

                          {/* Name Column */}
                          <td>
                            {isEditing ? (
                              <input
                                type="text"
                                value={formData.expense_name}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    name: e.target.value,
                                  })
                                }
                                className={styles.editField}
                              />
                            ) : (
                              item.expense_name
                            )}
                          </td>

                          {/* Amount Column */}
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
                                min="0"
                                step="0.01"
                                className={styles.editField}
                              />
                            ) : (
                              `$${item.amount}`
                            )}
                          </td>

                          {/* Merchant Column */}
                          <td>
                            {isEditing ? (
                              <select
                                value={formData.merchant_id}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    merchant_id: e.target.value,
                                  })
                                }
                                className={styles.editField}
                              >
                                {merchants.map((merchant) => (
                                  <option
                                    key={`merchant-${merchant.id}`}
                                    value={merchant.id}
                                  >
                                    {merchant.name}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              getMerchantName(item.merchant_id)
                            )}
                          </td>

                          {/* Category Column */}
                          <td>
                            {isEditing ? (
                              <select
                                value={formData.category_id}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    category_id: e.target.value,
                                  })
                                }
                                className={styles.editField}
                              >
                                {categories.map((cat) => (
                                  <option key={`cat-${cat.id}`} value={cat.id}>
                                    {cat.category}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              getCategoryName(item.category_id)
                            )}
                          </td>

                          {/* Payment Type Column */}
                          <td>
                            {isEditing ? (
                              <select
                                value={formData.payment_type_id}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    payment_type_id: e.target.value,
                                  })
                                }
                                className={styles.editField}
                              >
                                {paymentTypes.map((type) => (
                                  <option
                                    key={`paytype-${type.id}`}
                                    value={type.id}
                                  >
                                    {type.payment_type}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              getPaymentTypeName(item.payment_type_id)
                            )}
                          </td>

                          {/* Action Column */}
                          <td className={styles.actionCell}>
                            {isEditing ? (
                              <>
                                <Button onClick={saveEdit} variant="success">
                                  Save
                                </Button>
                                <Button
                                  onClick={() => setEditingId(null)}
                                  variant="primary"
                                >
                                  Cancel
                                </Button>
                              </>
                            ) : (
                              <>
                                <Button
                                  onClick={() => handleEdit(item.id, item)}
                                  variant="warning"
                                  aria-label="Edit"
                                  className={styles.actionButton}
                                >
                                  <FaEdit className={styles.icon} />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(item.id)}
                                  variant="danger"
                                  aria-label="Delete"
                                  className={styles.actionButton}
                                >
                                  <FaTrash className={styles.icon} />
                                </Button>
                              </>
                            )}
                          </td>
                        </tr>

                        {isExpanded && !isEditing && (
                          <tr className={styles.expandedRow}>
                            <td colSpan={bulkMode ? 8 : 7}>
                              <div className={styles.expandedContent}>
                                <strong>Description:</strong>{" "}
                                {item.full_description || "N/A"}
                                <br />
                                <strong>Notes:</strong> {item.notes || "N/A"}
                              </div>
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
      {/* ))} */}
    </div>
  );
};

export default ExpenseList;
