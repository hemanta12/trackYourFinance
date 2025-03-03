import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createRecurringItem } from "../../redux/recurringSlice";
import {
  fetchCategories,
  fetchPaymentTypes,
  fetchMerchants,
} from "../../redux/listSlice";
import AutoSuggestInput from "../../utils/autoSuggestInput";
import { NumericFormat } from "react-number-format";
import Button from "../common/Button";
import styles from "../../styles/components/forms/RecurringForm.module.css";

const RecurringForm = ({ onClose }) => {
  const dispatch = useDispatch();
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: "",
      amount: "",
      frequency: "monthly", // default frequency
      start_date: new Date().toISOString().split("T")[0],
      next_due_date: new Date().toISOString().split("T")[0],
      autopay_enabled: false,

      category_id: "",
      payment_type_id: "",
      merchant_id: "",

      notes: "",
    },
  });

  const categories = useSelector((state) => state.lists.categories);
  const paymentTypes = useSelector((state) => state.lists.paymentTypes);
  const merchants = useSelector((state) => state.lists.merchants);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchPaymentTypes());
    dispatch(fetchMerchants());
  }, [dispatch]);

  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        amount: Number(data.amount),
        category_id: Number(data.category_id),
        payment_type_id: Number(data.payment_type_id),
        merchant_id: data.merchant_id ? Number(data.merchant_id) : null,
        autopay_enabled: data.autopay_enabled ? 1 : 0,
      };
      await dispatch(createRecurringItem(payload)).unwrap();
      reset();
      if (onClose) onClose();
    } catch (error) {
      console.error("Failed to create recurring item:", error);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <h2>Add Recurring Bill/Subscription</h2>
        <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
          <div className={styles.twoColumn}>
            {/* Left Column */}
            <div className={styles.column}>
              {/* Title */}
              <div className={styles.field}>
                <label>Title *</label>
                <input
                  type="text"
                  {...register("title", { required: "Title is required" })}
                  className={errors.title ? styles.errorInput : ""}
                />
                {errors.title && (
                  <span className={styles.errorMessage}>
                    {errors.title.message}
                  </span>
                )}
              </div>
              {/* Amount */}
              <div className={styles.field}>
                <label>Amount *</label>
                <Controller
                  name="amount"
                  control={control}
                  rules={{ required: "Amount is required" }}
                  render={({ field: { onChange, value, ref } }) => (
                    <NumericFormat
                      value={value}
                      thousandSeparator={true}
                      prefix="$"
                      decimalScale={2}
                      fixedDecimalScale={true}
                      onValueChange={(vals) => onChange(vals.floatValue)}
                      placeholder="$0.00"
                      className={errors.amount ? styles.errorInput : ""}
                      getInputRef={ref}
                    />
                  )}
                />
                {errors.amount && (
                  <span className={styles.errorMessage}>
                    {errors.amount.message}
                  </span>
                )}
              </div>
              {/* Frequency */}
              <div className={styles.field}>
                <label>Frequency *</label>
                <select
                  {...register("frequency", {
                    required: "Frequency is required",
                  })}
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
                {errors.frequency && (
                  <span className={styles.errorMessage}>
                    {errors.frequency.message}
                  </span>
                )}
              </div>
              {/* Start Date */}
              <div className={styles.field}>
                <label>Start Date *</label>
                <input
                  type="date"
                  {...register("start_date", {
                    required: "Start date is required",
                  })}
                  className={errors.start_date ? styles.errorInput : ""}
                />
                {errors.start_date && (
                  <span className={styles.errorMessage}>
                    {errors.start_date.message}
                  </span>
                )}
              </div>
              {/* Next Due Date */}
              <div className={styles.field}>
                <label>Next Due Date *</label>
                <input
                  type="date"
                  {...register("next_due_date", {
                    required: "Next due date is required",
                  })}
                  className={errors.next_due_date ? styles.errorInput : ""}
                />
                {errors.next_due_date && (
                  <span className={styles.errorMessage}>
                    {errors.next_due_date.message}
                  </span>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className={styles.column}>
              {/* Category */}
              <div className={styles.field}>
                <label>Category *</label>
                <AutoSuggestInput
                  name="category_id"
                  control={control}
                  rules={{ required: "Category is required" }}
                  options={categories.map((cat) => ({
                    label: cat.category,
                    value: cat.id,
                  }))}
                  placeholder="Select or add new Category"
                  onAddNew={async (newCategory) => {
                    // You may implement addition logic here.
                    return { label: newCategory, value: newCategory };
                  }}
                />
              </div>

              {/* Merchant */}
              <div className={styles.field}>
                <label>Merchant *</label>
                <AutoSuggestInput
                  name="merchant_id"
                  control={control}
                  rules={{ required: "Merchant is required" }}
                  options={merchants.map((m) => ({
                    label: m.name,
                    value: m.id,
                  }))}
                  placeholder="Select or add new Merchant"
                  onAddNew={async (newMerchant) => {
                    return { label: newMerchant, value: newMerchant };
                  }}
                />
              </div>
              {/* Payment Type */}
              <div className={styles.field}>
                <label>Payment Type *</label>
                <AutoSuggestInput
                  name="payment_type_id"
                  control={control}
                  rules={{ required: "Payment type is required" }}
                  options={paymentTypes.map((pt) => ({
                    label: pt.payment_type,
                    value: pt.id,
                  }))}
                  placeholder="Select or add new Payment Type"
                  onAddNew={async (newPaymentType) => {
                    return { label: newPaymentType, value: newPaymentType };
                  }}
                />
              </div>
              {/* Autopay */}
              <div className={styles.fieldCheckbox}>
                <label>
                  <input type="checkbox" {...register("autopay_enabled")} />
                  Autopay enabled
                </label>
              </div>
            </div>
          </div>
          {/* Full width: Notes */}
          <div className={styles.field}>
            <label>Notes</label>
            <textarea {...register("notes")} placeholder="Optional notes" />
          </div>
          {/* Buttons */}
          <div className={styles.buttonGroup}>
            <Button type="submit" variant="success">
              Save
            </Button>
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RecurringForm;
