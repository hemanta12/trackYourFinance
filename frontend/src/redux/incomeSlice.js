import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getIncome, addIncome } from '../services/api';

export const fetchIncome = createAsyncThunk('income/fetchIncome', async () => {
  const response = await getIncome();
  return response.data;
});

export const createIncome = createAsyncThunk('income/createIncome', async (data) => {
  const response = await addIncome(data);
  return response.data;
});

const incomeSlice = createSlice({
  name: 'income',
  initialState: { data: [], status: 'idle' },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchIncome.fulfilled, (state, action) => {
        state.data = action.payload;
        state.status = 'succeeded';
      })
      .addCase(createIncome.fulfilled, (state, action) => {
        state.data.push(action.payload);
      });
  },
});

export default incomeSlice.reducer;
