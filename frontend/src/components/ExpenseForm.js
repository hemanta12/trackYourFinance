import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createExpense } from '../redux/expensesSlice';
import styles from '../styles/ExpenseForm.module.css';

const ExpenseForm = () => {
    const [amount, setAmount] = useState('');
    const [category, setCategory] = useState('');
    const [paymentType, setPaymentType] = useState('');
    const [error, setError] = useState(''); 
    const dispatch = useDispatch();
  
    const handleSubmit = async (e) => {
      e.preventDefault();
      try{
        await dispatch(createExpense({ amount, category, paymentType })).unwrap();
        setAmount('');
        setCategory('');
        setPaymentType('');
        setError(''); 
      }catch(err){
        setError('Failed to add expense. Please try again.');
      }
      
    };
  
    return (
      <form className={styles.form} onSubmit={handleSubmit}>
        <input
          type="number"
          placeholder="Amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className={styles.input}
        />
        <input
          type="text"
          placeholder="Payment Type"
          value={paymentType}
          onChange={(e) => setPaymentType(e.target.value)}
          className={styles.input}
        />
        <button type="submit" className={styles.button}>Add Expense</button>
         {error && <p className={styles.error}>{error}</p>}
      </form>
    );
  };
  
  export default ExpenseForm;