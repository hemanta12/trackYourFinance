import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { 
  getCategories, 
  addCategory, 
  getPaymentTypes, 
  addPaymentType, 
  getSources, 
  addSource , getMonths
} from '../services/api';

export const fetchCategories = createAsyncThunk('lists/fetchCategories', async () => {
  const response = await getCategories();
  return response.data;
});

export const addCategoryThunk = createAsyncThunk('lists/addCategory', async (category) => {
  await addCategory(category);
  return category;
});

export const fetchPaymentTypes = createAsyncThunk('lists/fetchPaymentTypes', async () => {
  const response = await getPaymentTypes();
  return response.data;
});

export const addPaymentTypeThunk = createAsyncThunk('lists/addPaymentType', async (paymentType) => {
  await addPaymentType(paymentType);
  return paymentType;
});

export const fetchSources = createAsyncThunk('lists/fetchSources', async () => {
  const response = await getSources();
  return response.data;
});

export const addSourceThunk = createAsyncThunk('lists/addSource', async (source) => {
  await addSource(source);
  return source;
});

// Thunk to fetch months
export const fetchMonths = createAsyncThunk('lists/fetchMonths', async () => {
  const response = await getMonths();
  return response;
});


const listSlice = createSlice({
  name: 'lists',
  initialState: {
    categories: [],
    paymentTypes: [],
    sources: [],
    months: [], // Add months to the state
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchMonths.fulfilled, (state, action) => {
        state.months = ['All', ...(action.payload || [])]; 
      })
      .addCase(addCategoryThunk.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(fetchPaymentTypes.fulfilled, (state, action) => {
        state.paymentTypes = action.payload;
      })
      .addCase(addPaymentTypeThunk.fulfilled, (state, action) => {
        state.paymentTypes.push(action.payload);
      })
      .addCase(fetchSources.fulfilled, (state, action) => {
        state.sources = action.payload;
      })
      .addCase(addSourceThunk.fulfilled, (state, action) => {
        state.sources.push(action.payload);
        
      });
  },
});

export default listSlice.reducer;
