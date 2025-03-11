import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchBudgets,
  createOrUpdateBudget,
  deleteBudgetThunk,
} from "../redux/budgetSlice";
import { fetchExpenses } from "../redux/expensesSlice";
import Button from "../components/common/Button";
import styles from "../styles/pages/BudgetPage.module.css";
import { FaTrash, FaEdit } from "react-icons/fa";
import BudgetForm from "../components/forms/BudgetForm";

const BudgetPage = () => {
  const dispatch = useDispatch();
  const budgets = useSelector((state) => state.budgets.data) || [];
  const categories = useSelector((state) => state.lists.categories);
  const expenses = useSelector((state) => state.expenses.data);

  const status = useSelector((state) => state.budgets.status);

  const [editingBudgetId, setEditingBudgetId] = useState(null);
  const [editFormData, setEditFormData] = useState({
    amount: "",
    reset_day: "",
  });
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [cardFeedback, setCardFeedback] = useState("");
  const [listFeedback, setListFeedback] = useState("");

  useEffect(() => {
    dispatch(fetchBudgets());
    dispatch(fetchExpenses());
  }, [dispatch]);

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === Number(categoryId));
    return category ? category.category : "Unknown";
  };

  const calculateSpending = (categoryId) => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

    return expenses
      .filter(
        (expense) =>
          expense.category_id === categoryId &&
          new Date(expense.date) >= firstDay
      )
      .reduce((sum, expense) => sum + Number(expense.amount), 0);
  };

  const getProgressColor = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 90) return "#ff4444";
    if (percentage >= 75) return "#ffbb33";
    return "#00C851";
  };

  const getBudgetStatus = (spent, budget) => {
    const percentage = (spent / budget) * 100;
    if (percentage >= 100) return { type: "danger", message: "Over Budget!" };
    if (percentage >= 80) return { type: "warning", message: "Near Limit!" };
    return { type: "success", message: "On Track" };
  };

  const handleEditClick = (budget) => {
    setEditingBudgetId(budget.id);
    setEditFormData({
      amount: budget.amount,
      reset_day: budget.reset_day,
    });
    setCardFeedback("");
  };

  const handleCancelEdit = () => {
    setEditingBudgetId(null);
    setEditFormData({ amount: "", reset_day: "" });
    setCardFeedback("");
  };

  const handleSaveEdit = async (budget) => {
    // Validate input
    if (!editFormData.amount) {
      setCardFeedback("Amount is required.");
      return;
    }
    try {
      await dispatch(
        createOrUpdateBudget({
          category_id: budget.category_id,
          amount: Number(editFormData.amount),
          reset_day: Number(editFormData.reset_day) || 1,
        })
      ).unwrap();
      setCardFeedback("Budget updated successfully!");
      setEditingBudgetId(null);
      // Optionally, refresh budgets
      dispatch(fetchBudgets());
      setTimeout(() => setCardFeedback(""), 3000);
    } catch (error) {
      setCardFeedback(error.message || "Failed to update budget");
    }
  };

  const handleDeleteClick = (budgetId) => {
    setDeleteConfirmId(budgetId);
  };

  const handleConfirmDelete = async (budgetId) => {
    try {
      await dispatch(deleteBudgetThunk(budgetId)).unwrap();
      setListFeedback("Budget deleted successfully!");
      setDeleteConfirmId(null);
      dispatch(fetchBudgets());
      setTimeout(() => setListFeedback(""), 3000);
    } catch (error) {
      setListFeedback(error.message || "Failed to delete budget");
      setTimeout(() => setListFeedback(""), 5000);
    }
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  if (status === "loading") {
    return <div>Loading budgets...</div>;
  }

  return (
    <div className={styles.budgetPage}>
      <div className={styles.formSection}>
        <BudgetForm />
      </div>

      <div className={styles.budgetListSection}>
        {listFeedback && (
          <div className={styles.globalFeedback}>{listFeedback}</div>
        )}
        <div className={styles.budgetList}>
          {Array.isArray(budgets) &&
            budgets.map((budget) => {
              const spent = calculateSpending(budget.category_id);
              const remaining = budget.amount - spent;
              const percentage = Math.min((spent / budget.amount) * 100, 100);
              const status = getBudgetStatus(spent, budget.amount);

              return (
                <div
                  key={budget.id}
                  className={`${styles.budgetItem} ${styles[status.type]}`}
                >
                  {editingBudgetId === budget.id ? (
                    <div className={styles.editBudgetForm}>
                      <h3>{getCategoryName(budget.category_id)}</h3>
                      <div className={styles.inputGroup}>
                        <label>Budget ($):</label>
                        <input
                          type="number"
                          value={editFormData.amount}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              amount: e.target.value,
                            })
                          }
                          min="0"
                          step="1"
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <label>Reset Day:</label>
                        <input
                          type="number"
                          value={editFormData.reset_day}
                          onChange={(e) =>
                            setEditFormData({
                              ...editFormData,
                              reset_day: e.target.value,
                            })
                          }
                          min="1"
                          max="31"
                        />
                      </div>
                      <div className={styles.cardActions}>
                        <Button
                          variant="success"
                          onClick={() => handleSaveEdit(budget)}
                        >
                          Save
                        </Button>
                        <Button variant="primary" onClick={handleCancelEdit}>
                          Cancel
                        </Button>
                      </div>
                      {cardFeedback && (
                        <div className={styles.feedbackMessage}>
                          {cardFeedback}
                        </div>
                      )}
                    </div>
                  ) : (
                    // Normal display mode for the budget card
                    <>
                      <div className={styles.budgetHeader}>
                        <div className={styles.budgetTitleContainer}>
                          <h3 className={styles.budgetTitle}>
                            {getCategoryName(budget.category_id)}
                          </h3>
                          <div className={styles.cardActions}>
                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleEditClick(budget)}
                              className={styles.editButton}
                              title="Edit Budget"
                            >
                              <FaEdit />
                            </Button>

                            <Button
                              variant="primary"
                              size="small"
                              onClick={() => handleDeleteClick(budget.id)}
                              className={styles.deleteButton}
                              title="Delete Budget"
                            >
                              <FaTrash />
                            </Button>
                          </div>
                        </div>
                        <span className={styles.statusBadge}>
                          {status.message}
                        </span>
                      </div>

                      <div className={styles.budgetDetails}>
                        <div className={styles.budgetNumbers}>
                          <div className={styles.budgetNumber}>
                            <span className={styles.budgetLabel}>Budget</span>
                            <span className={styles.budgetValue}>
                              ${budget.amount}
                            </span>
                          </div>
                          <div className={styles.budgetNumber}>
                            <span className={styles.budgetLabel}>Spent</span>
                            <span className={styles.budgetValue}>${spent}</span>
                          </div>
                          <div className={styles.budgetNumber}>
                            <span className={styles.budgetLabel}>
                              Remaining
                            </span>
                            <span className={styles.budgetValue}>
                              ${remaining}
                            </span>
                          </div>
                        </div>

                        <div>
                          <div className={styles.progressBar}>
                            <div
                              className={styles.progress}
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: getProgressColor(
                                  spent,
                                  budget.amount
                                ),
                              }}
                            />
                          </div>
                          <div className={styles.percentage}>
                            {percentage.toFixed(1)}% used
                          </div>
                        </div>
                      </div>

                      {deleteConfirmId === budget.id && (
                        <div className={styles.deleteConfirmationBar}>
                          <p>Are you sure you want to delete this budget?</p>
                          <div className={styles.confirmationButtons}>
                            <Button
                              variant="danger"
                              size="small"
                              onClick={() => handleConfirmDelete(budget.id)}
                            >
                              Yes
                            </Button>
                            <Button
                              variant="secondary"
                              size="small"
                              onClick={handleCancelDelete}
                            >
                              No
                            </Button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
