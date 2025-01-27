import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getExpenses, addExpense } from '../services/api';
import { api } from '../services/api';

export const fetchExpenses = createAsyncThunk('expenses/fetchExpenses', async () => {
  const response = await getExpenses();
  return response.data;
});

export const createExpense = createAsyncThunk('expenses/createExpense', 
  async (data) => {
    const response = await addExpense(data);
    return response.data;
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, data }) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id) => {
    await api.delete(`/expenses/${id}`);
    return id;
  }
);

export const getAnalyticsData = async () => api.get('/analytics');

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: { data: [], status: 'idle', error: null },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = 'succeeded';
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.data.findIndex(expense => expense.id === action.payload.id);
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.data = state.data.filter(expense => expense.id !== action.payload);
      });
  },
});

export default expensesSlice.reducer;
