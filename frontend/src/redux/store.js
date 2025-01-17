import { configureStore } from '@reduxjs/toolkit';
import incomeReducer from './incomeSlice';
import expensesReducer from './expensesSlice';
import listReducer from './listSlice';

const store = configureStore({
  reducer: {
    income: incomeReducer,
    expenses: expensesReducer,
    lists: listReducer,
  },
});

export default store;
