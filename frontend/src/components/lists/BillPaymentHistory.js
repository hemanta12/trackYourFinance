import React, { useState, useEffect, useMemo } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateExpense, deleteExpense } from "../../redux/expensesSlice";
import DateQuarterFilter from "../filters/DateQuarterFilter";
import Button from "../common/Button";
import { fetchBillPayments } from "../../redux/recurringSlice";
import { FaInfoCircle, FaEdit, FaTrash } from "react-icons/fa";
import styles from "../../styles/components/lists/BillPaymentHistory.module.css";

// Helper function to group payments by "Month Year" (e.g., "January 2025")
const groupPaymentsByMonth = (paymentArray) => {
  return paymentArray
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .reduce((groups, payment) => {
      const date = new Date(payment.date);
      const monthYear = date.toLocaleString("default", {
        month: "long",
        year: "numeric",
      });
      if (!groups[monthYear]) {
        groups[monthYear] = [];
      }
      groups[monthYear].push(payment);
      return groups;
    }, {});
};

const BillPaymentHistory = () => {
  // Local state for payments, loading, error
  const dispatch = useDispatch();

  const { billPayments, status, error } = useSelector(
    (state) => state.recurring
  );

  // Redux lists for mapping IDs to friendly names
  const categories = useSelector((state) => state.lists.categories);
  const paymentTypes = useSelector((state) => state.lists.paymentTypes);
  const merchants = useSelector((state) => state.lists.merchants);

  // Filters for year and quarter
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedQuarter, setSelectedQuarter] = useState("All");

  // For small screens, we can toggle an expanded row to show more details
  const [expandedRow, setExpandedRow] = useState(null);

  // For inline editing
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    expense_name: "",
    amount: "",
    notes: "",
    category_id: "",
    payment_type_id: "",
    merchant_id: "",
  });

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchBillPayments());
    }
  }, [status, dispatch]);

  // Build a dynamic set of all years in the data
  const availableYears = useMemo(() => {
    const yearsSet = new Set();
    billPayments.forEach((pay) => {
      const year = new Date(pay.date).getFullYear();
      yearsSet.add(year);
    });
    return Array.from(yearsSet).sort((a, b) => b - a);
  }, [billPayments]);

  // Filter logic for year and quarter
  const filteredPayments = useMemo(() => {
    return billPayments.filter((p) => {
      const dateObj = new Date(p.date);
      const itemYear = dateObj.getFullYear();
      const itemMonth = dateObj.getMonth() + 1; // 1-based
      // Year filter
      if (selectedYear !== "All" && Number(selectedYear) !== itemYear) {
        return false;
      }
      // Quarter filter
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
  }, [billPayments, selectedYear, selectedQuarter]);

  // Group filtered payments by "Month Year"
  const groupedPayments = useMemo(
    () => groupPaymentsByMonth(filteredPayments),
    [filteredPayments]
  );

  // Sort month groups (e.g., "January 2025") in descending order by date
  const sortedMonthGroups = useMemo(() => {
    return Object.entries(groupedPayments).sort(([monthA], [monthB]) => {
      const dateA = new Date("1 " + monthA);
      const dateB = new Date("1 " + monthB);
      return dateB - dateA;
    });
  }, [groupedPayments]);

  // Helper functions to get display names for category, paymentType, merchant
  const getCategoryName = (id) => {
    const cat = categories.find((c) => Number(c.id) === Number(id));
    return cat ? cat.category : "Unknown";
  };
  const getPaymentTypeName = (id) => {
    const pt = paymentTypes.find((pt) => Number(pt.id) === Number(id));
    return pt ? pt.payment_type : "Unknown";
  };
  const getMerchantName = (id) => {
    const m = merchants.find((m) => Number(m.id) === Number(id));
    return m ? m.name : "Unknown ";
  };

  // Edit functions
  const handleEdit = (payment) => {
    setEditingId(payment.id);
    setFormData({
      date: new Date(payment.date).toISOString().slice(0, 10),
      expense_name: payment.expense_name || payment.title,
      amount: payment.amount,
      notes: payment.notes || "",
      category_id: payment.category_id || "", // New field for Category
      payment_type_id: payment.payment_type_id || "", // New field for Payment Type
      merchant_id: payment.merchant_id || "", // New field for Merchant
    });
  };

  const saveEdit = async () => {
    if (
      !formData.date ||
      !formData.expense_name ||
      !formData.amount ||
      !formData.category_id ||
      !formData.payment_type_id
    ) {
      alert("Please fill out all required fields.");
      return;
    }
    try {
      await dispatch(
        updateExpense({
          id: editingId,
          data: formData,
        })
      ).unwrap();
      setEditingId(null);
      setFormData({
        date: "",
        expense_name: "",
        amount: "",
        notes: "",
        category_id: "",
        payment_type_id: "",
        merchant_id: "",
      });
      // Refresh the bill payments list
      dispatch(fetchBillPayments());
    } catch (error) {
      console.error("Failed to update expense:", error);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormData({
      date: "",
      expense_name: "",
      amount: "",
      notes: "",
      category_id: "",
      payment_type_id: "",
      merchant_id: "",
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this payment?")) {
      try {
        await dispatch(deleteExpense(id)).unwrap();
        dispatch(fetchBillPayments());
      } catch (error) {
        console.error("Failed to delete payment:", error);
      }
    }
  };

  // Toggle expanded row for small screens
  const toggleExpand = (id) => {
    setExpandedRow((prev) => (prev === id ? null : id));
  };

  // For the user to manually clear filters
  const clearFilters = () => {
    setSelectedYear("All");
    setSelectedQuarter("All");
  };

  // For each month group, compute total and transaction count
  const computeMonthTotals = (monthPayments) => {
    const transactionCount = monthPayments.length;
    const totalAmount = monthPayments.reduce(
      (sum, item) => sum + Number(item.amount),
      0
    );

    return { transactionCount, totalAmount };
  };
  // Helper to format a date
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString();
  };

  return (
    <div className={styles.billHistorySection}>
      <h2 className={styles.title}>Bill Payment History</h2>

      {/* DateQuarterFilter for year/quarter selection */}
      <DateQuarterFilter
        selectedYear={selectedYear}
        selectedQuarter={selectedQuarter}
        setSelectedYear={setSelectedYear}
        setSelectedQuarter={setSelectedQuarter}
        availableYears={availableYears}
        clearFilters={clearFilters}
      />

      {status === "loading" && <p>Loading...</p>}
      {status === "failed" && <p className={styles.error}>Error: {error}</p>}

      {status === "succeeded" &&
        sortedMonthGroups.map(([monthYear, monthPayments]) => {
          const { transactionCount, totalAmount } =
            computeMonthTotals(monthPayments);
          return (
            <div key={monthYear} className={styles.monthGroup}>
              <div className={styles.monthHeader}>
                <h3 className={styles.monthTitle}>{monthYear}</h3>
                <span className={styles.monthTotals}>
                  {transactionCount} transaction
                  {transactionCount !== 1 ? "s" : ""} | Total: $
                  {Number(totalAmount).toFixed(2)}
                </span>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.historyTable}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Name</th>
                      <th>Amount</th>
                      <th>Merchant</th>
                      <th>Category</th>
                      <th>Payment Type</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {monthPayments.map((payment) => {
                      const isEditing = editingId === payment.id;
                      const isExpanded = expandedRow === payment.id;
                      return (
                        <React.Fragment key={payment.id}>
                          <tr
                            style={{ cursor: "pointer" }}
                            onClick={() => {
                              // Do not trigger row expand when editing
                              if (!isEditing) toggleExpand(payment.id);
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
                                formatDate(payment.date)
                              )}
                            </td>
                            <td>
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={formData.expense_name}
                                  onChange={(e) =>
                                    setFormData({
                                      ...formData,
                                      expense_name: e.target.value,
                                    })
                                  }
                                  className={styles.editField}
                                />
                              ) : (
                                payment.expense_name || payment.title
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
                                  step="1"
                                />
                              ) : (
                                `$${Number(payment.amount).toFixed(2)}`
                              )}
                            </td>
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
                                  {merchants.map((m) => (
                                    <option key={m.id} value={m.id}>
                                      {m.name}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                payment.merchant_name ||
                                getMerchantName(payment.merchant_id)
                              )}
                            </td>
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
                                  {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                      {c.category}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                payment.category_name ||
                                getCategoryName(payment.category_id)
                              )}
                            </td>
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
                                  {paymentTypes.map((pt) => (
                                    <option key={pt.id} value={pt.id}>
                                      {pt.payment_type}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                payment.payment_type_name ||
                                getPaymentTypeName(payment.payment_type_id)
                              )}
                            </td>
                            <td className={styles.actionCell}>
                              {isEditing ? (
                                <>
                                  <Button onClick={saveEdit} variant="success">
                                    Save
                                  </Button>
                                  <Button
                                    onClick={cancelEdit}
                                    variant="secondary"
                                  >
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button
                                    onClick={() => handleEdit(payment)}
                                    variant="info"
                                    size="small"
                                  >
                                    <FaEdit />
                                  </Button>
                                  <Button
                                    onClick={() => handleDelete(payment.id)}
                                    variant="danger"
                                    size="small"
                                  >
                                    <FaTrash />
                                  </Button>
                                </>
                              )}
                            </td>
                          </tr>
                          {isExpanded && !isEditing && (
                            <tr className={styles.expandedRow}>
                              <td
                                colSpan={7}
                                className={styles.expandedContent}
                              >
                                <p>
                                  <strong>Notes:</strong>{" "}
                                  {payment.notes || "No notes"}
                                </p>
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

export default BillPaymentHistory;
