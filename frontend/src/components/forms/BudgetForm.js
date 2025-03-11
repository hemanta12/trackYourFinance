import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createOrUpdateBudget, fetchBudgets } from "../../redux/budgetSlice";
import Button from "../common/Button";
import styles from "../../styles/pages/BudgetPage.module.css";

const BudgetForm = () => {
  const dispatch = useDispatch();
  const categories = useSelector((state) => state.lists.categories);
  const [formData, setFormData] = useState({
    category_id: "",
    amount: "",
    reset_day: 1,
  });
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formData.category_id || !formData.amount) {
      setFormError("Please fill in all required fields");
      return;
    }

    try {
      await dispatch(
        createOrUpdateBudget({
          category_id: Number(formData.category_id),
          amount: Number(formData.amount),
          reset_day: Number(formData.reset_day) || 1,
        })
      ).unwrap();
      setFormSuccess("Budget saved successfully!");
      // Clear the form after success
      setFormData({ category_id: "", amount: "", reset_day: 1 });
      // Refresh budgets
      dispatch(fetchBudgets());
      setTimeout(() => setFormSuccess(""), 5000);
    } catch (error) {
      setFormError(error.message || "Failed to save budget");
    }
  };

  return (
    <div className={styles.formSection}>
      <div className={styles.formCard}>
        <h2>Create New Budget</h2>
        <p className={styles.formSubtitle}>
          Set up your monthly spending limits
        </p>
        <form onSubmit={handleSubmit} className={styles.budgetForm}>
          <div className={styles.inputGroup}>
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

          {formError && <div className={styles.errorMessage}>{formError}</div>}
          {formSuccess && (
            <div className={styles.successMessage}>{formSuccess}</div>
          )}

          <Button
            className={styles.submitButton}
            variant="success"
            type="submit"
          >
            <span>Create Budget</span>
            <svg className={styles.buttonIcon} viewBox="0 0 24 24">
              <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z" />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
};

export default BudgetForm;
