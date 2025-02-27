import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getTopExpenses,
  getBudgetWarnings,
  getKPIData,
  getIncomeVsExpense,
  getExpenseBreakdown,
  getTopCategories,
  getTopMerchants,
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

//fetch top merchants
export const fetchTopMerchants = createAsyncThunk(
  "analytics/fetchTopMerchants",
  async (params, { rejectWithValue }) => {
    try {
      const response = await getTopMerchants(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
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
  async (params, { rejectWithValue }) => {
    try {
      const response = await getKPIData(params);
      return response.data;
    } catch (error) {
      console.error("Error fetching KPI data:", error);
      return rejectWithValue({
        message: "Failed to load financial summary",
        details: error.response?.data || error.message,
      });
    }
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
      return response || [];
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
    kpiData: {
      income: 0,
      expenses: 0,
      savings: 0,
      previous_income: 0,
      previous_expenses: 0,
    },
    incomeVsExpense: [],
    expenseBreakdown: [],
    topCategories: [],
    topMerchants: [],
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
      .addCase(fetchKPIData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      // KPI Data
      .addCase(fetchKPIData.fulfilled, (state, action) => {
        state.loading = false;
        state.kpiData = {
          income: action.payload.income || 0,
          expenses: action.payload.expenses || 0,
          savings: action.payload.savings || 0,
          previous_income: action.payload.previous_income || 0,
          previous_expenses: action.payload.previous_expenses || 0,
        };
      })
      .addCase(fetchKPIData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || "Failed to load KPI data";
        // Preserve existing kpiData on error
        state.kpiData = {
          ...state.kpiData,
          income: 0,
          expenses: 0,
          savings: 0,
        };
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
      })
      .addCase(fetchTopMerchants.fulfilled, (state, action) => {
        state.topMerchants = action.payload || [];
      })
      .addCase(fetchTopMerchants.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export default analyticsSlice.reducer;
