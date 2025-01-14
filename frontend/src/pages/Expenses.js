import React from 'react';
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import { useSelector } from 'react-redux';

const Expenses = () => {
    const expenses = useSelector((state) => state.expenses.data);
    const loading = useSelector((state) => state.expenses.loading); 
  
    if (loading) {
      return <p>Loading expenses...</p>;
    }
  
  return (
    <div>
      <h2>Expenses</h2>
      <ExpenseForm />
      <ExpenseList expenses={expenses} />
    </div>
  );
};

export default Expenses;
