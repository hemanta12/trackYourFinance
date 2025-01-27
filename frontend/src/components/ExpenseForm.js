import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createExpense } from '../redux/expensesSlice';
import { 
  fetchCategories, 
  addCategoryThunk, 
  fetchPaymentTypes, 
  addPaymentTypeThunk 
} from '../redux/listSlice';
import styles from '../styles/ExpenseForm.module.css';
import { FaDollarSign, FaCalendarAlt, FaPlus, FaFolder, FaCreditCard } from 'react-icons/fa';

const ExpenseForm = () => {
    const [amount, setAmount] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState(''); 
    const [notes, setNotes] = useState('');
    const dispatch = useDispatch();    
    const categories = useSelector((state) => state.lists.categories);
    const [newCategory, setNewCategory] = useState('');
    const paymentTypes = useSelector((state) => state.lists.paymentTypes);
    const [newPaymentType, setNewPaymentType] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    useEffect(() => {
      dispatch(fetchCategories());
      dispatch(fetchPaymentTypes());
    }, [dispatch]);

    const handleSubmit = async (e) => {
      e.preventDefault();
    
      if (!amount || !selectedCategory || !paymentType || !date) {
        setError('All fields are required.');
        return;
      }
      try {
        await dispatch(createExpense({ 
          amount: Number(amount), 
          category_id: Number(selectedCategory), // Ensure it's a number
          payment_type_id: Number(paymentType), // Ensure it's a number
          date,
          notes 
        })).unwrap();
        resetForm(); 
      } catch(err) {
        setError('Failed to add expense. Please try again.');
      }
    };

    const resetForm = () => {
      setAmount('');
      setSelectedCategory('');
      setPaymentType('');
      setDate(new Date().toISOString().split('T')[0]);
      setError('');
      setNotes('');
    };

    const handleAddCategory = async () => {
      if (!newCategory.trim()) return;
    
      try {
        await dispatch(addCategoryThunk(newCategory)).unwrap();
        setNewCategory('');
        dispatch(fetchCategories());
      } catch (err) {
        setError(err.message || 'Failed to add category');
      }
    };

    const handleAddPaymentType = async () => {
      if (!newPaymentType.trim()) return;
  
      try {
        await dispatch(addPaymentTypeThunk(newPaymentType)).unwrap();
        setNewPaymentType('');
        dispatch(fetchPaymentTypes());
      } catch (err) {
        setError(err.message || 'Failed to add payment type');
      }
    };

    return (
      <div className={styles.container}>
        <h2 className={styles.header}>Add Expense</h2>
        <form className={styles.form} onSubmit={handleSubmit}>
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

          <div className={styles.inputGroup}>
            <FaFolder className={styles.icon} />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.input}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
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
            <button type="button" onClick={handleAddCategory} className={styles.addButton}>
              <FaPlus />Add
            </button>
          </div>

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
            <button type="button" onClick={handleAddPaymentType} className={styles.addButton}>
              <FaPlus key="plus-icon" />Add
            </button>
          </div>

          <div className={styles.inputGroup}>
          <FaCalendarAlt className={styles.icon} />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={styles.input}
            />
          </div>
          <div className={styles.inputGroup}>
            <textarea
              placeholder="Add notes (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className={styles.textarea}
            />
          </div>
          <button type="submit" className={styles.submitButton}>Add Expense</button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    );
};

export default ExpenseForm;