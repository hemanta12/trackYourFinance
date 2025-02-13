import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDispatch, useSelector } from "react-redux";
import { createExpense } from "../redux/expensesSlice";
import {
  fetchCategories,
  addCategoryThunk,
  fetchPaymentTypes,
  addPaymentTypeThunk,
  fetchMerchants,
  addMerchantThunk,
} from "../redux/listSlice";
import AutoSuggestInput from "../utils/autoSuggestInput";
import styles from "../styles/ExpenseForm.module.css";
import Button from "../components/Button";

import {
  FaDollarSign,
  FaCalendarAlt,
  FaPlus,
  FaFolder,
  FaCreditCard,
  FaStore,
} from "react-icons/fa";

const ExpenseForm = ({ onClose }) => {
  const dispatch = useDispatch();

  const { control, register, handleSubmit, reset } = useForm({
    defaultValues: {
      amount: "",
      date: new Date().toISOString().split("T")[0],
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
      await dispatch(
        createExpense({
          amount: Number(data.amount),
          category_id: Number(data.category_id),
          payment_type_id: Number(data.payment_type_id),
          date: data.date,
          notes: data.notes,
          merchant_id: Number(data.merchant_id),
        })
      ).unwrap();
      reset();
      onClose();
    } catch (error) {
      console.error("Failed to add expense:", error);
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Add Expense</h2>

      <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
        {/* Amount */}
        <div className={styles.inputGroup}>
          <FaDollarSign className={styles.icon} />
          <input
            type="number"
            step="0.01"
            placeholder="Enter amount"
            {...register("amount", { required: "Amount is required" })}
            className={styles.input}
          />
        </div>
        {/* Category */}
        <div className={styles.inputGroup}>
          <FaFolder className={styles.icon} />
          <AutoSuggestInput
            name="category_id"
            control={control}
            options={categories.map((cat) => ({
              label: cat.category,
              value: cat.id,
            }))}
            placeholder="Select or add category"
            onAddNew={async (newCategory) => {
              const res = await dispatch(
                addCategoryThunk(newCategory)
              ).unwrap();
              return { label: res.category, value: res.id };
            }}
          />
        </div>
        {/* Payment Type */}
        <div className={styles.inputGroup}>
          <FaCreditCard className={styles.icon} />
          <AutoSuggestInput
            name="payment_type_id"
            control={control}
            options={paymentTypes.map((pt) => ({
              label: pt.payment_type,
              value: pt.id,
            }))}
            placeholder="Select or add payment type"
            onAddNew={async (newPaymentType) => {
              const res = await dispatch(
                addPaymentTypeThunk(newPaymentType)
              ).unwrap();
              return { label: res.payment_type, value: res.id };
            }}
          />
        </div>
        {/* Merchant */}
        <div className={styles.inputGroup}>
          <FaStore className={styles.icon} />
          <AutoSuggestInput
            name="merchant_id"
            control={control}
            options={merchants.map((m) => ({
              label: m.name,
              value: m.id,
            }))}
            placeholder="Select or add merchant"
            onAddNew={async (newMerchant) => {
              const res = await dispatch(
                addMerchantThunk(newMerchant)
              ).unwrap();
              return { label: res.name, value: res.id };
            }}
          />
        </div>
        {/* Date */}
        <div className={styles.inputGroup}>
          <FaCalendarAlt className={styles.icon} />
          <input
            type="date"
            {...register("date", { required: "Date is required" })}
            className={styles.input}
          />
        </div>
        {/* Notes */}
        <div className={styles.inputGroup}>
          <textarea
            placeholder="Add notes (optional)"
            {...register("notes")}
            className={styles.textarea}
          />
        </div>
        {/* Action Button */}
        <div className={styles.buttonGroup}>
          <Button
            type="submit"
            variant="success"
            className={styles.submitButton}
          >
            Add Expense
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ExpenseForm;
