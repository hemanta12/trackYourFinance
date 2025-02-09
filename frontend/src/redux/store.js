import { configureStore } from "@reduxjs/toolkit";
import incomeReducer from "./incomeSlice";
import expensesReducer from "./expensesSlice";
import listReducer from "./listSlice";
import budgetReducer from "./budgetSlice";
import analyticsReducer from "./analyticsSlice";
import authReducer from "./authSlice";

const store = configureStore({
  reducer: {
    income: incomeReducer,
    expenses: expensesReducer,
    lists: listReducer,
    budgets: budgetReducer,
    analytics: analyticsReducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export default store;
