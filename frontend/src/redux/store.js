import { configureStore } from '@reduxjs/toolkit';
import incomeReducer from './incomeSlice';
import expensesReducer from './expensesSlice';

const store = configureStore({
  reducer: {
    income: incomeReducer,
    expenses: expensesReducer,
  },
});

export default store;
