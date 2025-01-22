import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getIncome, addIncome } from '../services/api';
import { api } from '../services/api';


export const fetchIncome = createAsyncThunk('income/fetchIncome', async () => {
  const response = await getIncome();
  return response.data;
});

export const createIncome = createAsyncThunk('income/createIncome', async (data) => {
  const response = await addIncome(data);
  return response.data;
});

export const updateIncome = createAsyncThunk('income/updateIncome', async ({ id, data }, { rejectWithValue }) => {
  try {
    const response = await api.put(`/incomes/${id}`, data);
    return { id, data: { ...data, date: response.data.date } };
  } catch (error) {
    return rejectWithValue(error.response.data);
  }
});


export const deleteIncome = createAsyncThunk('income/deleteIncome', async (id) => {
  await api.delete(`/incomes/${id}`);
  return id;
});

export const getAnalyticsData = async () => api.get('/analytics');


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
      })
      .addCase(updateIncome.fulfilled, (state, action) => {
        const index = state.data.findIndex((item) => item.id === action.payload.id);
        if (index !== -1) state.data[index] = action.payload.data;
      })
      .addCase(deleteIncome.fulfilled, (state, action) => {
        state.data = state.data.filter((item) => item.id !== action.payload);
      });
  },
});

export default incomeSlice.reducer;
