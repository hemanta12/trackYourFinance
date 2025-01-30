import React from 'react';
import IncomeForm from '../components/IncomeForm';
import IncomeList from '../components/IncomeList';
import { useSelector} from 'react-redux';


const Income = () => {
 
  const income = useSelector((state) => state.income.data);
  const loading = useSelector((state) => state.income.loading); 

  if (loading) {
    return <p>Loading income...</p>;
  }
  return (
    <div>
      <h2>Income</h2>
      <IncomeForm />
      <IncomeList income = {income} />
    </div>
  );
};

export default Income;
