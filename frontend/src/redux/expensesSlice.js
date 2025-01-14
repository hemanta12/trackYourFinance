import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getExpenses, addExpense } from '../services/api';

export const fetchExpenses = createAsyncThunk('expenses/fetchExpenses', async () => {
  const response = await getExpenses();
  return response.data;
});

export const createExpense = createAsyncThunk('expenses/createExpense', async (data) => {
  const response = await addExpense(data);
  return response.data;
});

const expensesSlice = createSlice({
  name: 'expenses',
  initialState: { data: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = 'succeeded';
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.data.push(action.payload);
      });
  },
});

export default expensesSlice.reducer;
