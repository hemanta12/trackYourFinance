import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateExpense,
  deleteExpense,
  fetchExpenses,
  bulkDeleteExpenses,
} from "../redux/expensesSlice";
import {
  fetchCategories,
  fetchPaymentTypes,
  fetchMerchants,
} from "../redux/listSlice";
import Button from "../components/Button";
import { FaCloudDownloadAlt, FaEdit, FaTrash } from "react-icons/fa";
import styles from "../styles/ExpenseList.module.css";

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

const ExpenseList = ({ expenses = [] }) => {
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
  });

  const [scrollPosition, setScrollPosition] = useState(0);

  const tableRef = useRef(null);

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
    });
  };

  const saveEdit = async () => {
    if (
      !formData.date ||
      !formData.category_id ||
      !formData.amount ||
      !formData.payment_type_id
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
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

  const grouped = groupExpensesByMonth(expenses);
  const sortedMonths = Object.entries(grouped).sort(([a], [b]) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB - dateA;
  });

  return (
    <div className={styles.expenseSection}>
      <h2 className={styles.title}>Expenses</h2>
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

      {sortedMonths.map(([monthYear, monthExpenses]) => (
        <div key={monthYear} className={styles.monthGroup}>
          <h3 className={styles.monthTitle}>{monthYear}</h3>

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
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Amount</th>
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
                            formatDate(item.date)
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

                        {/* <td className={styles.hideOnMobile}> */}
                        {/* This cell serves as a summary for extra details */}
                        {/* {item.full_description || item.notes || "-"} */}
                        {/* </td> */}

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
                      {/* Expanded Row */}
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
      ))}
    </div>
  );
};

export default ExpenseList;
