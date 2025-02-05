import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  updateExpense,
  deleteExpense,
  fetchExpenses,
} from "../redux/expensesSlice";
import {
  fetchCategories,
  fetchPaymentTypes,
  fetchMerchants,
} from "../redux/listSlice";
import styles from "../styles/ExpenseList.module.css";

const groupExpensesByMonth = (expenses) => {
  return expenses
    .slice()
    .sort((a, b) => new Date(b.date) - new Date(a.date)) // ✅ Sort by date descending
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
  const groupedExpenses = groupExpensesByMonth(expenses);

  const sortedMonths = Object.entries(groupedExpenses).sort(([a], [b]) => {
    const dateA = new Date(a);
    const dateB = new Date(b);
    return dateB - dateA; // ✅ Newer months come first
  });

  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    date: "",
    category_id: "",
    amount: "",
    payment_type_id: "",
    notes: "",
  });

  const dispatch = useDispatch();
  const categories = useSelector((state) => state.lists.categories);
  const paymentTypes = useSelector((state) => state.lists.paymentTypes);
  const merchants = useSelector((state) => state.lists.merchants);

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

  return (
    <div className={styles.expenseSection}>
      <h2 className={styles.title}>Expenses</h2>

      {sortedMonths.map(([monthYear, monthExpenses]) => (
        <div key={monthYear} className={styles.monthGroup}>
          <h3 className={styles.monthTitle}>{monthYear}</h3>

          <div className={styles.tableWrapper}>
            <table className={styles.expenseTable}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Merchant</th>
                  <th>Category</th>
                  <th>Amount</th>
                  <th>Payment Type</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {monthExpenses.map((item, index) => {
                  const isEditing = editingId === item.id;

                  return (
                    <tr
                      key={`expense-${item.id || index}`}
                      className={isEditing ? styles.editingRow : ""}
                    >
                      {/* Date */}
                      <td>
                        {isEditing ? (
                          <input
                            type="date"
                            value={formData.date}
                            onChange={(e) =>
                              setFormData({ ...formData, date: e.target.value })
                            }
                            className={styles.editField}
                          />
                        ) : (
                          formatDate(item.date)
                        )}
                      </td>

                      {/* Merchant */}
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

                      {/* Category */}
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

                      {/* Amount */}
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

                      {/* Payment Type */}
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

                      {/* Notes */}
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

                      {/* Actions */}
                      <td className={styles.actionCell}>
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className={styles.saveButton}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className={styles.cancelButton}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEdit(item.id, item)}
                              className={styles.editButton}
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className={styles.deleteButton}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
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
