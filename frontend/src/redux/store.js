import { configureStore } from '@reduxjs/toolkit';
import incomeReducer from './incomeSlice';
import expensesReducer from './expensesSlice';
import listReducer from './listSlice';
import budgetReducer from './budgetSlice'; // Add this
import analyticsReducer from './analyticsSlice'; // Add this

const store = configureStore({
  reducer: {
    income: incomeReducer,
    expenses: expensesReducer,
    lists: listReducer,
    budgets: budgetReducer,     // Add this
    analytics: analyticsReducer, // Add this
  },
});

export default store;
