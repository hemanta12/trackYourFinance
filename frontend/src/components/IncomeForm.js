import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createIncome } from '../redux/incomeSlice';
import styles from '../styles/IncomeForm.module.css';

const IncomeForm = () => {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        await dispatch(createIncome({ amount, source })).unwrap();
        setAmount('');
        setSource('');
        setError('');
      } catch (err) {
        setError('Failed to add income. Please try again.');
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
            placeholder="Source"
            value={source}
            onChange={(e) => setSource(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Add Income</button>
          {error && <p className={styles.error}>{error}</p>}
        </form>
      );

};

export default IncomeForm;