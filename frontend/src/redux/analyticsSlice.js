import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getTopExpenses,
  getBudgetWarnings,
  getKPIData,
  getIncomeVsExpense,
  getExpenseBreakdown,
  getTopCategories,
} from "../services/api";

// Thunks
export const fetchTopExpenses = createAsyncThunk(
  "analytics/fetchTopExpenses",
  async (params) => {
    const response = await getTopExpenses(params);
    return response.data;
  }
);

export const fetchTopCategories = createAsyncThunk(
  "analytics/fetchTopCategories",
  async (params) => {
    try {
      const response = await getTopCategories(params);

      return response || []; // Ensure response is always an array
    } catch (error) {
      console.error("Error fetching top categories:", error);
      throw error;
    }
  }
);

export const fetchBudgetWarnings = createAsyncThunk(
  "analytics/fetchBudgetWarnings",
  async (params) => {
    const response = await getBudgetWarnings(params);
    return response.data;
  }
);

export const fetchKPIData = createAsyncThunk(
  "analytics/fetchKPIData",
  async (params) => {
    const response = await getKPIData(params);
    return response.data;
  }
);

export const fetchIncomeVsExpense = createAsyncThunk(
  "analytics/fetchIncomeVsExpense",
  async (params) => {
    try {
      const response = await getIncomeVsExpense(params);
      return response.data;
    } catch (error) {
      console.error("Error fetching income vs expense data:", error);
      throw error;
    }
  }
);
// Fetch Expense Breakdown by Category
export const fetchExpenseBreakdown = createAsyncThunk(
  "analytics/fetchExpenseBreakdown",
  async (params) => {
    try {
      const response = await getExpenseBreakdown(params);

      return response || []; // ✅ Ensure response is always an array
    } catch (error) {
      console.error("Error fetching expense breakdown:", error);
      throw error; // ✅ Ensure Redux correctly catches the error
    }
  }
);

// Slice
const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    topExpenses: [],
    budgetWarnings: [],
    kpiData: { income: 0, expenses: 0, savings: 0 },
    incomeVsExpense: [],
    expenseBreakdown: [],
    topCategories: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Top Expenses
      .addCase(fetchTopExpenses.fulfilled, (state, action) => {
        state.topExpenses = action.payload;
      })
      // Budget Warnings
      .addCase(fetchBudgetWarnings.fulfilled, (state, action) => {
        state.budgetWarnings = action.payload;
      })
      // KPI Data
      .addCase(fetchKPIData.fulfilled, (state, action) => {
        state.kpiData = action.payload;
      })
      // Income vs Expense
      .addCase(fetchIncomeVsExpense.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchIncomeVsExpense.fulfilled, (state, action) => {
        state.loading = false;
        state.incomeVsExpense = action.payload;
      })
      .addCase(fetchIncomeVsExpense.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(fetchExpenseBreakdown.fulfilled, (state, action) => {
        state.expenseBreakdown = action.payload || [];
      })
      .addCase(fetchExpenseBreakdown.rejected, (state, action) => {
        state.error = action.error.message;
      })
      .addCase(fetchTopCategories.fulfilled, (state, action) => {
        state.topCategories = action.payload || [];
      })
      .addCase(fetchTopCategories.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default analyticsSlice.reducer;
