import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createIncome } from '../redux/incomeSlice';
import { addSourceThunk, fetchSources } from '../redux/listSlice';
import styles from '../styles/IncomeForm.module.css';
import { FaDollarSign, FaCalendarAlt, FaPlus, FaPen } from 'react-icons/fa';


const IncomeForm = () => {
  const [amount, setAmount] = useState('');
  const [source, setSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); 
  const [error, setError] = useState('');
  const sources = useSelector((state) => state.lists.sources);
  const [newSource, setNewSource] = useState('');
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(fetchSources());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !source || !date) {
      setError('All fields are required.');
      return;
    }
    try {
        await dispatch(createIncome({ amount, source, date })).unwrap();
        setAmount('');
        setSource('');
        setDate(new Date().toISOString().split('T')[0]); 
        setError('');
      } catch (err) {
        setError('Failed to add income. Please try again.');
      }
  };


  const handleAddSource = async () => {
    if (newSource.trim()) {
      try {
          await dispatch(addSourceThunk(newSource)).unwrap(); 
          setNewSource(''); 
        } catch (err) {
          alert('Failed to add source. Please try again.');
        }
      } else {
        alert('Source cannot be empty.');
      }
  };


    return (
      <div className={styles.container}>
        <h2 className={styles.header}>Add Income</h2>
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
            <FaPen className={styles.icon} />
            <select 
                value={source} 
                onChange={(e) => setSource(e.target.value)} 
                className={styles.input}
            >
              <option value="">Select Source</option>
              {sources.map((src, index) => (
                <option key={index} value={src}>{src}</option>
              ))}
            </select>
              <input
                type="text"
                placeholder="OR Enter new source"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                className={styles.smallInput}
              />
            <button type="button" onClick={handleAddSource} className={styles.addButton}>
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
            <button type="submit" className={styles.submitButton}>Add Income</button>
            {error && <p className={styles.error}>{error}</p>}
          </form>
          </div>
      );
};

export default IncomeForm;