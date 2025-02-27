import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchBudgets, createOrUpdateBudget } from "../redux/budgetSlice";
import { fetchExpenses } from "../redux/expensesSlice";
import styles from "../styles/pages/BudgetPage.module.css";

const BudgetPage = () => {
  const dispatch = useDispatch();
  const budgets = useSelector((state) => state.budgets.data) || [];
  const categories = useSelector((state) => state.lists.categories);
  const expenses = useSelector((state) => state.expenses.data);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    reset_day: 1,
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const status = useSelector((state) => state.budgets.status);

  useEffect(() => {
    dispatch(fetchBudgets());
    dispatch(fetchExpenses());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    try {
      if (!formData.category_id || !formData.amount) {
        setFormError("Please fill in all required fields");
        return;
      }

      await dispatch(
        createOrUpdateBudget({
          category_id: Number(formData.category_id),
          amount: Number(formData.amount),
          reset_day: Number(formData.reset_day) || 1,
        })
      ).unwrap();

      setFormSuccess("Budget saved successfully!");
      setFormData({ category_id: "", amount: "", reset_day: 1 });
      dispatch(fetchBudgets());
    } catch (error) {
      setFormError(error.message || "Failed to save budget");
    }
  };

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

  if (status === "loading") {
    return <div>Loading budgets...</div>;
  }

  return (
    <div className={styles.budgetPage}>
      <div className={styles.formSection}>
        <div className={styles.formCard}>
          <h2>Create New Budget</h2>
          <p className={styles.formSubtitle}>
            Set up your monthly spending limits
          </p>

          <form onSubmit={handleSubmit} className={styles.budgetForm}>
            <div className={styles.inputGroup}>
              {/* Floating label for Select */}
              <div className={styles.floatingInput}>
                <select
                  id="category"
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData({ ...formData, category_id: e.target.value })
                  }
                  required
                  className={formData.category_id ? styles.filled : ""}
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.inputGroup}>
              {/* Floating label for Amount */}
              <div className={styles.floatingInput}>
                <span className={styles.currencySymbol}>$</span>
                <input
                  id="amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  required
                  min="0"
                  step="0.01"
                  placeholder=" "
                />
                <label htmlFor="amount">Monthly Budget</label>
              </div>
            </div>

            <div className={styles.inputGroup}>
              {/* Floating label for Reset Day */}
              <div className={styles.floatingInput}>
                <input
                  id="reset_day"
                  type="number"
                  value={formData.reset_day}
                  onChange={(e) =>
                    setFormData({ ...formData, reset_day: e.target.value })
                  }
                  min="1"
                  max="31"
                  placeholder=" "
                />
                <label htmlFor="reset_day">Reset Day</label>
                <span className={styles.helpText}>
                  Day of month when budget resets
                </span>
              </div>
            </div>

            {formError && (
              <div className={styles.errorMessage}>{formError}</div>
            )}
            {formSuccess && (
              <div className={styles.successMessage}>{formSuccess}</div>
            )}

            <button type="submit" className={styles.submitButton}>
              <span>Create Budget</span>
              <svg className={styles.buttonIcon} viewBox="0 0 24 24">
                <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
              </svg>
            </button>
          </form>
        </div>
      </div>

      <div className={styles.budgetListSection}>
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
                  <div className={styles.budgetHeader}>
                    <h3>{getCategoryName(budget.category_id)}</h3>
                    <span className={styles.statusBadge}>{status.message}</span>
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
                        <span className={styles.budgetLabel}>Remaining</span>
                        <span className={styles.budgetValue}>${remaining}</span>
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
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default BudgetPage;
