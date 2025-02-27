import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useDispatch } from "react-redux";
import {
  createMultipleExpenses,
  fetchExpenses,
} from "../../redux/expensesSlice";
import AutoSuggestInput from "../../utils/autoSuggestInput";
import styles from "../../styles/components/common/MultiExpenseModal.module.css";

// Internal component to render each expense row as a card.
const ExpenseCard = ({
  index,
  register,
  control,
  errors,
  remove,
  categoryOptions,
  paymentTypeOptions,
  merchantOptions,
  onAddNewCategory,
  onAddNewPaymentType,
  onAddNewMerchant,
}) => {
  const [advancedVisible, setAdvancedVisible] = useState(false);
  const toggleAdvanced = () => setAdvancedVisible((prev) => !prev);

  return (
    <div className={styles.expenseCard}>
      <div className={styles.cardRow}>
        <div className={styles.primaryColumn}>
          <div className={styles.field}>
            <label>Expense Name:</label>
            <input
              type="text"
              placeholder="ex: Onions"
              {...register(`expenses.${index}.expense_name`, {
                required: "Expense name required",
              })}
            />
            {errors.expenses?.[index]?.expense_name && (
              <span className={styles.errorMessage}>
                {errors.expenses[index].expense_name.message}
              </span>
            )}
          </div>
          <div className={styles.field}>
            <label>Amount:</label>
            <input
              type="number"
              placeholder="0.00"
              step="1.00"
              {...register(`expenses.${index}.amount`, {
                required: "Amount required",
              })}
            />
            {errors.expenses?.[index]?.amount && (
              <span className={styles.errorMessage}>
                {errors.expenses[index].amount.message}
              </span>
            )}
          </div>
          <div className={styles.field}>
            <label>Date:</label>
            <input
              type="date"
              {...register(`expenses.${index}.date`, {
                required: "Date required",
              })}
            />
            {errors.expenses?.[index]?.date && (
              <span className={styles.errorMessage}>
                {errors.expenses[index].date.message}
              </span>
            )}
          </div>
        </div>
        <div className={styles.secondaryColumn}>
          <div className={styles.field}>
            <label>Category:</label>
            <AutoSuggestInput
              name={`expenses.${index}.category_id`}
              control={control}
              options={categoryOptions}
              placeholder="ex: Groceries"
              onAddNew={onAddNewCategory}
            />
          </div>
          <div className={styles.field}>
            <label>Payment Type:</label>
            <AutoSuggestInput
              name={`expenses.${index}.payment_type_id`}
              control={control}
              options={paymentTypeOptions}
              placeholder="ex: Chase"
              onAddNew={onAddNewPaymentType}
            />
          </div>
          <div className={styles.field}>
            <label>Merchant:</label>
            <AutoSuggestInput
              name={`expenses.${index}.merchant_id`}
              control={control}
              options={merchantOptions}
              placeholder="ex: Safeway"
              onAddNew={onAddNewMerchant}
            />
          </div>
          <div className={styles.advancedToggle}>
            <button
              type="button"
              onClick={toggleAdvanced}
              className={styles.toggleButton}
            >
              {advancedVisible ? "Hide Advanced" : "Show Advanced"}
            </button>
          </div>
          {advancedVisible && (
            <div className={styles.field}>
              <label>Notes:</label>
              <textarea {...register(`expenses.${index}.notes`)} />
            </div>
          )}
        </div>
      </div>
      <div className={styles.removeButtonContainer}>
        {remove && (
          <button
            type="button"
            onClick={() => remove(index)}
            className={styles.removeButton}
          >
            Remove
          </button>
        )}
      </div>
    </div>
  );
};

const MultiExpenseModal = ({
  onClose,
  categoryOptions,
  paymentTypeOptions,
  merchantOptions,
  onAddNewCategory,
  onAddNewPaymentType,
  onAddNewMerchant,
}) => {
  const dispatch = useDispatch();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      expenses: [
        {
          expense_name: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          category_id: "",
          payment_type_id: "",
          merchant_id: "",
          notes: "",
        },
        {
          expense_name: "",
          amount: "",
          date: new Date().toISOString().split("T")[0],
          category_id: "",
          payment_type_id: "",
          merchant_id: "",
          notes: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "expenses",
  });

  const onSubmit = async (data) => {
    const hasErrors = data.expenses.some(
      (expense) => !expense.expense_name.trim()
    );

    if (hasErrors) {
      alert("All expenses must have a name.");
      return;
    }

    try {
      await dispatch(createMultipleExpenses(data.expenses)).unwrap();
      await dispatch(fetchExpenses());
      onClose();
    } catch (error) {
      console.error("Bulk expense creation failed:", error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <h2>Add Multiple Expenses</h2>
        <form onSubmit={handleSubmit(onSubmit)}>
          {fields.map((field, index) => (
            <ExpenseCard
              key={field.id}
              index={index}
              register={register}
              control={control}
              errors={errors}
              remove={remove}
              categoryOptions={categoryOptions}
              paymentTypeOptions={paymentTypeOptions}
              merchantOptions={merchantOptions}
              onAddNewCategory={onAddNewCategory}
              onAddNewPaymentType={onAddNewPaymentType}
              onAddNewMerchant={onAddNewMerchant}
            />
          ))}
          <div className={styles.modalActions}>
            <button
              type="button"
              onClick={() =>
                append({
                  expense_name: "",
                  amount: "",
                  date: new Date().toISOString().split("T")[0],
                  category_id: "",
                  payment_type_id: "",
                  merchant_id: "",
                  notes: "",
                })
              }
              className={styles.addRow}
            >
              Add Another Row
            </button>
            <div className={styles.submitActions}>
              <button type="submit" className={styles.submitButton}>
                Submit All
              </button>
              <button
                type="button"
                onClick={onClose}
                className={styles.cancelButton}
              >
                Cancel
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MultiExpenseModal;
