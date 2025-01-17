import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createExpense } from '../redux/expensesSlice';
import { fetchCategories, addCategoryThunk, fetchPaymentTypes, addPaymentTypeThunk } from '../redux/listSlice';
import styles from '../styles/ExpenseForm.module.css';
import { FaDollarSign, FaCalendarAlt, FaPlus, FaFolder, FaCreditCard } from 'react-icons/fa';

const ExpenseForm = () => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [error, setError] = useState(''); 
    const dispatch = useDispatch();    
    const categories = useSelector((state) => state.lists.categories);
    const [newCategory, setNewCategory] = useState('');
    const paymentTypes = useSelector((state) => state.lists.paymentTypes);
    const [newPaymentType, setNewPaymentType] = useState('');

    const sources = useSelector((state) => state.lists.sources);

    useEffect(() => {
      dispatch(fetchCategories());
      dispatch(fetchPaymentTypes());
    }, [dispatch]);
  
    const handleSubmit = async (e) => {
      e.preventDefault();
    
      if (!amount || !category || !paymentType || !date) {
        setError('All fields are required.');
        return;
      }
      try{
        await dispatch(createExpense({ amount, category, paymentType, date })).unwrap();
        setAmount('');
        setCategory('');
        setPaymentType('');
        setDate(new Date().toISOString().split('T')[0]); 
        setError(''); 
      }catch(err){
        setError('Failed to add expense. Please try again.');
      }
      
    };
   
  
    const handleAddCategory = async() => {
      if (newCategory.trim()) {
        try {
          await dispatch(addCategoryThunk(newCategory)).unwrap();
          setNewCategory('');
        } catch (err) {
          console.error('Failed to add category:', err);
          alert('Failed to add category. Please try again.');
        }
      }
    };
    const handleAddPaymentType = async () => {
      if (newPaymentType.trim()) {
        await dispatch(addPaymentTypeThunk(newPaymentType)).unwrap();
        setNewPaymentType('');
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={styles.input}
            >
              <option value="">Select Category</option>
              {categories.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
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
              {paymentTypes.map((type, index) => (
                <option key={index} value={type}>{type}</option>
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
            <FaPlus /> Add
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
          <button type="submit" className={styles.submitButton}>Add Expense</button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      </div>
    );
  };
  
  export default ExpenseForm;