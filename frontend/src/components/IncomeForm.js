import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createIncome } from '../redux/incomeSlice';
import { addSourceThunk, fetchSources } from '../redux/listSlice';
import styles from '../styles/IncomeForm.module.css';
import { FaDollarSign, FaCalendarAlt, FaPlus, FaPen } from 'react-icons/fa';


const IncomeForm = () => {
  const [amount, setAmount] = useState('');
  const [selectedSource, setSelectedSource] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [newSource, setNewSource] = useState('');
  
  const dispatch = useDispatch();
  const sources = useSelector((state) => state.lists.sources);

  useEffect(() => {
    dispatch(fetchSources());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount || !selectedSource || !date) {
      setError('All fields are required.');
      return;
    }
    try {
      await dispatch(createIncome({ 
        amount: Number(amount),
      source_id: Number(selectedSource), // Ensure it's a number
        date,
        notes 
      })).unwrap();
      resetForm();
    } catch(err) {
      setError('Failed to add income');
    }
  };

  const resetForm = () => {
    setAmount('');
    setSelectedSource('');
    setDate(new Date().toISOString().split('T')[0]);
    setError('');
    setNotes('');
  };

  const handleAddSource = async () => {
    if (!newSource.trim()) return;
    try {
      await dispatch(addSourceThunk(newSource)).unwrap();
      setNewSource('');
      dispatch(fetchSources());
    } catch (err) {
      setError(err.message || 'Failed to add source');
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
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className={styles.input}
          >
            <option value="">Select Source</option>
            {sources.map(src => (
              <option key={`source-${src.id}`} value={src.id}>
                {src.source}
              </option>
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
            <span key="source-icon"><FaPlus /></span>
            <span key="source-text">Add</span>
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

        <button type="submit" className={styles.submitButton}>
          Add Income
        </button>
        {error && <p className={styles.error}>{error}</p>}
      </form>
    </div>
  );
};

export default IncomeForm;