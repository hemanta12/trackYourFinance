import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getBudgets, createBudget, checkBudgetReset } from '../services/api';

export const fetchBudgets = createAsyncThunk('budgets/fetchBudgets', async () => {
  const response = await getBudgets();
  return response.data;
});

export const createOrUpdateBudget = createAsyncThunk('budgets/createOrUpdateBudget', async (budget) => {
  const response = await createBudget(budget);
  return response.data;
});

export const checkBudgetResetThunk = createAsyncThunk(
  'budgets/checkReset',
  async (budgetId) => {
    const response = await checkBudgetReset(budgetId);
    return response.data;
  }
);


const budgetSlice = createSlice({
  name: 'budgets',
  initialState: {
    data: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload || [];
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(createOrUpdateBudget.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Refresh budgets after creation/update
        state.data = action.payload || [];
      })
      .addCase(checkBudgetResetThunk.fulfilled, (state, action) => {
        if (action.payload.wasReset) {
          state.status = 'reset';
        }
      });
  },
});

export default budgetSlice.reducer;