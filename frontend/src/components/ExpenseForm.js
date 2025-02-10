import React, { useState, useEffect } from "react";
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

const ExpenseForm = () => {
  const [amount, setAmount] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [newPaymentType, setNewPaymentType] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // For Merchant
  const [selectedMerchant, setSelectedMerchant] = useState("");
  const [newMerchant, setNewMerchant] = useState("");

  const dispatch = useDispatch();

  const categories = useSelector((state) => state.lists.categories);
  const paymentTypes = useSelector((state) => state.lists.paymentTypes);
  const merchants = useSelector((state) => state.lists.merchants);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchPaymentTypes());
    dispatch(fetchMerchants());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!amount || !selectedCategory || !paymentType || !date) {
      setError("All fields are required.");
      return;
    }

    let merchantId;
    if (newMerchant.trim()) {
      // Create new merchant and use its id
      try {
        const result = await dispatch(addMerchantThunk(newMerchant)).unwrap();
        merchantId = result.id;
      } catch (err) {
        setError(err.message || "Failed to add merchant");
        return;
      }
    } else if (selectedMerchant) {
      merchantId = Number(selectedMerchant);
    } else {
      setError("Merchant is required.");
      return;
    }

    try {
      await dispatch(
        createExpense({
          amount: Number(amount),
          category_id: Number(selectedCategory), // Ensure it's a number
          payment_type_id: Number(paymentType), // Ensure it's a number
          date,
          notes,
          merchant_id: merchantId,
        })
      ).unwrap();
      resetForm();
    } catch (err) {
      setError("Failed to add expense. Please try again.");
    }
  };

  const resetForm = () => {
    setAmount("");
    setSelectedCategory("");
    setPaymentType("");
    setSelectedMerchant("");
    setDate(new Date().toISOString().split("T")[0]);
    setError("");
    setNotes("");
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      await dispatch(addCategoryThunk(newCategory)).unwrap();
      setNewCategory("");
      dispatch(fetchCategories());
    } catch (err) {
      setError(err.message || "Failed to add category");
    }
  };

  const handleAddPaymentType = async () => {
    if (!newPaymentType.trim()) return;

    try {
      await dispatch(addPaymentTypeThunk(newPaymentType)).unwrap();
      setNewPaymentType("");
      dispatch(fetchPaymentTypes());
    } catch (err) {
      setError(err.message || "Failed to add payment type");
    }
  };

  // New function to add a merchant
  const handleAddMerchant = async () => {
    if (!newMerchant.trim()) return;

    try {
      await dispatch(addMerchantThunk(newMerchant)).unwrap();
      setNewMerchant("");
      dispatch(fetchMerchants());
    } catch (err) {
      setError(err.message || "Failed to add merchant");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.header}>Add Expense</h2>
      <form className={styles.form} onSubmit={handleSubmit}>
        {/* Amount */}
        <div className={styles.inputGroup}>
          <FaDollarSign className={styles.icon} />
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className={styles.input}
          />
        </div>

        {/* Category */}
        <div className={styles.inputGroup}>
          <FaFolder className={styles.icon} />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.input}
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={`category-${cat.id}`} value={cat.id}>
                {cat.category}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="OR Enter new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className={styles.smallInput}
          />
          <Button type="button" onClick={handleAddCategory} variant="primary">
            <FaPlus />
            Add
          </Button>
        </div>

        {/* Payment Type */}
        <div className={styles.inputGroup}>
          <FaCreditCard className={styles.icon} />
          <select
            value={paymentType}
            onChange={(e) => setPaymentType(e.target.value)}
            className={styles.input}
          >
            <option value="">Select Payment Type</option>
            {paymentTypes.map((type) => (
              <option key={`payment-${type.id}`} value={type.id}>
                {type.payment_type}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="OR Enter new payment type"
            value={newPaymentType}
            onChange={(e) => setNewPaymentType(e.target.value)}
            className={styles.smallInput}
          />
          <Button
            type="button"
            onClick={handleAddPaymentType}
            variant="primary"
          >
            <FaPlus key="plus-icon" />
            Add
          </Button>
        </div>

        {/* Merchant */}
        <div className={styles.inputGroup}>
          <FaStore className={styles.icon} />
          <select
            value={selectedMerchant}
            onChange={(e) => setSelectedMerchant(e.target.value)}
            className={styles.input}
          >
            <option value="">Select Merchant</option>
            {merchants.map((merchant) => (
              <option key={`merchant-${merchant.id}`} value={merchant.id}>
                {merchant.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="OR Enter new merchant"
            value={newMerchant}
            onChange={(e) => setNewMerchant(e.target.value)}
            className={styles.smallInput}
          />
          <Button type="button" onClick={handleAddMerchant} variant="primary">
            <FaPlus />
            Add
          </Button>
        </div>

        {/* Date */}
        <div className={styles.inputGroup}>
          <FaCalendarAlt className={styles.icon} />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className={styles.input}
          />
        </div>

        {/* Notes */}
        <div className={styles.inputGroup}>
          <textarea
            placeholder="Add notes (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.textarea}
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" variant="success">
          Add Expense
        </Button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default ExpenseForm;
