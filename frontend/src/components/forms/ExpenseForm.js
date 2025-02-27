import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createExpense } from "../../redux/expensesSlice";
import {
  fetchCategories,
  addCategoryThunk,
  fetchPaymentTypes,
  addPaymentTypeThunk,
  fetchMerchants,
  addMerchantThunk,
} from "../../redux/listSlice";
import AutoSuggestInput from "../../utils/autoSuggestInput";
import styles from "../../styles/components/forms/ExpenseForm.module.css";
import { NumericFormat } from "react-number-format";
import Button from "../common/Button";
import {
  FaDollarSign,
  FaCalendarAlt,
  FaFolder,
  FaCreditCard,
  FaStore,
} from "react-icons/fa";

const ExpenseForm = ({ onClose }) => {
  const dispatch = useDispatch();

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      expense_name: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      category_id: "",
      payment_type_id: "",
      merchant_id: "",
      notes: "",
    },
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formKey, setFormKey] = useState(0);

  //fetch options
  const categories = useSelector((state) => state.lists.categories);
  const paymentTypes = useSelector((state) => state.lists.paymentTypes);
  const merchants = useSelector((state) => state.lists.merchants);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchPaymentTypes());
    dispatch(fetchMerchants());
  }, [dispatch]);

  //submit handler
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await dispatch(
        createExpense({
          expense_name: data.expense_name,
          amount: Number(data.amount),
          category_id: Number(data.category_id),
          payment_type_id: Number(data.payment_type_id),
          date: data.date,
          notes: data.notes,
          merchant_id: Number(data.merchant_id),
        })
      ).unwrap();
      setIsSuccess(true);
      setTimeout(() => {
        reset();
        setFormKey((prev) => prev + 1);
        if (onClose && typeof onClose === "function") {
          onClose();
        }
        setIsSubmitting(false);
        setIsSuccess(false);
      }, 1500);
    } catch (error) {
      console.error("Failed to add expense:", error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Add Expense</h2>
      <span
        style={{
          fontSize: "0.9rem",
          fontWeight: "bold",
          color: "black",
          alignSelf: "center",
          backgroundColor: "white",
          width: "60%",
          padding: "0.5rem",
          marginTop: "-1rem",
          letterSpacing: "0.5px",
        }}
      >
        Tip: Start typing and click "Add" to add new category, payment type, or
        merchant
      </span>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        <div className={styles.expenseCard}>
          <div className={styles.cardRow}>
            {/* Primary Column */}
            <div className={styles.primaryColumn}>
              {/* Expense Name Field */}
              <div className={styles.field}>
                <label>
                  Expense Name{" "}
                  <span className={styles.requiredAsterisk}>*</span>:
                </label>
                <input
                  {...register("expense_name", {
                    required: "Expense name is required",
                  })}
                  className={`${styles.input} ${
                    errors.expense_name ? styles.inputError : ""
                  }`}
                  placeholder="ex: Onions"
                />
                {errors.expense_name && (
                  <span className={styles.errorMessage}>
                    {errors.expense_name.message}
                  </span>
                )}
              </div>

              {/* Amount Field */}
              <div className={styles.field}>
                <label>
                  Amount <span className={styles.requiredAsterisk}>*</span>:
                </label>
                <div className={styles.iconAndInput}>
                  {/* <FaDollarSign className={styles.icon} /> */}
                  <Controller
                    name="amount"
                    control={control}
                    rules={{ required: "Amount is required" }}
                    render={({ field: { onChange, onBlur, value, ref } }) => {
                      const hasValue =
                        value !== null && value !== undefined && value !== "";
                      return (
                        <div className={styles.clearableInputWrapper}>
                          <NumericFormat
                            value={value}
                            thousandSeparator={true}
                            prefix="$"
                            decimalScale={2}
                            fixedDecimalScale={true}
                            onValueChange={(values) =>
                              onChange(values.floatValue)
                            }
                            onBlur={onBlur}
                            placeholder="$0.00"
                            className={`${styles.input} ${
                              errors.amount ? styles.inputError : ""
                            }`}
                            getInputRef={ref}
                          />

                          {hasValue && (
                            <Button
                              variant="danger"
                              size="small"
                              className={styles.clearButton}
                              onClick={() => onChange("")}
                              aria-label="Clear amount"
                            >
                              x
                            </Button>
                          )}
                        </div>
                      );
                    }}
                  />
                </div>
                {errors.amount && (
                  <span className={styles.errorMessage}>
                    {errors.amount.message}
                  </span>
                )}
              </div>
              {/* Date Field */}
              <div className={styles.field}>
                <label>
                  Date <span className={styles.requiredAsterisk}>*</span>:
                </label>
                <div className={styles.iconAndInput}>
                  {/* <FaCalendarAlt className={styles.icon} /> */}
                  <input
                    type="date"
                    {...register("date", { required: "Date is required" })}
                    className={`${styles.input} ${
                      errors.date ? styles.inputError : ""
                    }`}
                  />
                </div>
                {errors.date && (
                  <span className={styles.errorMessage}>
                    {errors.date.message}
                  </span>
                )}
              </div>
            </div>
            {/* Secondary Column */}
            <div className={styles.secondaryColumn}>
              {/* Category Field */}
              <div className={styles.field}>
                <label>
                  Select or Add new Category
                  <span className={styles.requiredAsterisk}>*</span>:
                </label>
                <div
                  className={`
                    ${styles.iconAndInput} 
                    ${errors.category_id ? styles.hasError : ""}
                  `}
                >
                  {/* <FaFolder className={styles.icon} /> */}
                  <AutoSuggestInput
                    key={`category-${formKey}`}
                    name="category_id"
                    control={control}
                    rules={{ required: "Category is required" }}
                    options={categories.map((cat) => ({
                      label: cat.category,
                      value: cat.id,
                    }))}
                    placeholder="ex: Groceries"
                    onAddNew={async (newCategory) => {
                      const res = await dispatch(
                        addCategoryThunk(newCategory)
                      ).unwrap();
                      return { label: res.category, value: res.id };
                    }}
                  />
                </div>
                {errors.category_id && (
                  <span className={styles.errorMessage}>
                    {errors.category_id.message}
                  </span>
                )}
              </div>
              {/* Payment Type Field */}
              <div className={styles.field}>
                <label>
                  Select or Add new Payment Type
                  <span className={styles.requiredAsterisk}>*</span>:
                </label>
                <div
                  className={`
                    ${styles.iconAndInput} 
                    ${errors.payment_type_id ? styles.hasError : ""}
                  `}
                >
                  {/* <FaCreditCard className={styles.icon} /> */}
                  <AutoSuggestInput
                    key={`payment-${formKey}`}
                    name="payment_type_id"
                    control={control}
                    rules={{ required: "Payment Type is required" }}
                    options={paymentTypes.map((pt) => ({
                      label: pt.payment_type,
                      value: pt.id,
                    }))}
                    placeholder="ex: Chase"
                    onAddNew={async (newPaymentType) => {
                      const res = await dispatch(
                        addPaymentTypeThunk(newPaymentType)
                      ).unwrap();
                      return { label: res.payment_type, value: res.id };
                    }}
                  />
                </div>
                {errors.payment_type_id && (
                  <span className={styles.errorMessage}>
                    {errors.payment_type_id.message}
                  </span>
                )}
              </div>
              {/* Merchant Field */}
              <div className={styles.field}>
                <label>
                  Select or Add new Merchant
                  <span className={styles.requiredAsterisk}>*</span>:
                </label>
                <div
                  className={`
                    ${styles.iconAndInput} 
                    ${errors.merchant_id ? styles.hasError : ""}
                  `}
                >
                  {/* <FaStore className={styles.icon} /> */}
                  <AutoSuggestInput
                    key={`merchant-${formKey}`}
                    name="merchant_id"
                    control={control}
                    rules={{ required: "Merchant is required" }}
                    options={merchants.map((m) => ({
                      label: m.name,
                      value: m.id,
                    }))}
                    placeholder="ex: Safeway"
                    onAddNew={async (newMerchant) => {
                      const res = await dispatch(
                        addMerchantThunk(newMerchant)
                      ).unwrap();
                      return { label: res.name, value: res.id };
                    }}
                  />
                </div>
                {errors.merchant_id && (
                  <span className={styles.errorMessage}>
                    {errors.merchant_id.message}
                  </span>
                )}
              </div>
              {/* Notes Field */}
              <div className={styles.field}>
                <label>Notes:</label>
                <textarea
                  {...register("notes")}
                  className={styles.input}
                  placeholder="Enter notes (optional)"
                />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.buttonGroup}>
          <Button
            type="submit"
            variant="success"
            className={styles.submitButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              isSuccess ? (
                <span className={styles.checkmark}>✓</span>
              ) : (
                <span className={styles.spinner}></span>
              )
            ) : (
              "Add Expense"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
