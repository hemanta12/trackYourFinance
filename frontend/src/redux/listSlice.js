import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getSources,
  addSource,
  updateSource,
  deleteSource,
  getMonths,
  getPaymentTypes,
  addPaymentType,
  updatePaymentType,
  deletePaymentType,
  getMerchants,
  addMerchant,
  updateMerchant,
  deleteMerchant,
} from "../services/api";

// Categories Thunks
export const fetchCategories = createAsyncThunk(
  "lists/fetchCategories",
  async () => {
    const response = await getCategories();
    return response.data;
  }
);

export const addCategoryThunk = createAsyncThunk(
  "lists/addCategory",
  async (category) => {
    const response = await addCategory(category);
    return response.data;
  }
);

export const updateCategoryThunk = createAsyncThunk(
  "lists/updateCategory",
  async ({ id, category }, { rejectWithValue }) => {
    try {
      const response = await updateCategory(id, category);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deleteCategoryThunk = createAsyncThunk(
  "lists/deleteCategory",
  async (id) => {
    await deleteCategory(id);
    return id;
  }
);

// Sources Thunks
export const fetchSources = createAsyncThunk("lists/fetchSources", async () => {
  const response = await getSources();
  return response.data;
});

export const addSourceThunk = createAsyncThunk(
  "lists/addSource",
  async (source) => {
    const response = await addSource(source);
    return response.data;
  }
);

export const updateSourceThunk = createAsyncThunk(
  "lists/updateSource",
  async ({ id, source }, { rejectWithValue }) => {
    try {
      const response = await updateSource(id, source);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Source update failed"
      );
    }
  }
);

export const deleteSourceThunk = createAsyncThunk(
  "lists/deleteSource",
  async (id) => {
    await deleteSource(id);
    return id;
  }
);

// Payment Types Thunks
export const fetchPaymentTypes = createAsyncThunk(
  "lists/fetchPaymentTypes",
  async () => {
    const response = await getPaymentTypes();
    return response.data;
  }
);

export const addPaymentTypeThunk = createAsyncThunk(
  "lists/addPaymentType",
  async (paymentType) => {
    const response = await addPaymentType(paymentType);
    return response.data;
  }
);

export const updatePaymentTypeThunk = createAsyncThunk(
  "lists/updatePaymentType",
  async ({ id, paymentType }, { rejectWithValue }) => {
    try {
      const response = await updatePaymentType(id, paymentType);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

export const deletePaymentTypeThunk = createAsyncThunk(
  "lists/deletePaymentType",
  async (id) => {
    await deletePaymentType(id);
    return id;
  }
);

// Fetch merchants from the backend
export const fetchMerchants = createAsyncThunk(
  "lists/fetchMerchants",
  async () => {
    const response = await getMerchants();
    return response;
  }
);

// Add a new merchant to the backend
export const addMerchantThunk = createAsyncThunk(
  "lists/addMerchant",
  async (merchantName) => {
    const response = await addMerchant(merchantName);
    return response;
  }
);

export const updateMerchantThunk = createAsyncThunk(
  "lists/updateMerchant",
  async ({ id, name }, { rejectWithValue }) => {
    try {
      const response = await updateMerchant(id, name);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response.data.message);
    }
  }
);

// Delete Merchant Thunk
export const deleteMerchantThunk = createAsyncThunk(
  "lists/deleteMerchant",
  async (id) => {
    // Implement deleteMerchant API similar to deleteCategory
    await deleteMerchant(id);
    return id;
  }
);

// Months Thunk
export const fetchMonths = createAsyncThunk("lists/fetchMonths", async () => {
  const response = await getMonths();
  return response;
});

const listSlice = createSlice({
  name: "lists",
  initialState: {
    categories: [],
    sources: [],
    paymentTypes: [],
    months: [],
    merchants: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
        state.status = "succeeded";
      })
      .addCase(addCategoryThunk.fulfilled, (state, action) => {
        state.categories.push(action.payload);
      })
      .addCase(updateCategoryThunk.fulfilled, (state, action) => {
        const index = state.categories.findIndex(
          (cat) => cat.id === action.payload.id
        );
        if (index !== -1) {
          state.categories[index] = action.payload;
        }
      })
      .addCase(deleteCategoryThunk.fulfilled, (state, action) => {
        state.categories = state.categories.filter(
          (cat) => cat.id !== action.payload
        );
      })
      // Sources
      .addCase(fetchSources.fulfilled, (state, action) => {
        state.sources = action.payload;
      })
      .addCase(addSourceThunk.fulfilled, (state, action) => {
        state.sources.push(action.payload);
      })
      .addCase(updateSourceThunk.fulfilled, (state, action) => {
        const index = state.sources.findIndex(
          (s) => s.id === action.payload.id
        );
        if (index !== -1) {
          state.sources[index] = action.payload;
        }
      })
      .addCase(deleteSourceThunk.fulfilled, (state, action) => {
        state.sources = state.sources.filter((s) => s.id !== action.payload);
      })
      // Payment Types
      .addCase(fetchPaymentTypes.fulfilled, (state, action) => {
        state.paymentTypes = action.payload;
      })
      .addCase(addPaymentTypeThunk.fulfilled, (state, action) => {
        state.paymentTypes.push(action.payload);
      })
      .addCase(updatePaymentTypeThunk.fulfilled, (state, action) => {
        const index = state.paymentTypes.findIndex(
          (p) => p.id === action.payload.id
        );
        if (index !== -1) {
          state.paymentTypes[index] = action.payload;
        }
      })
      .addCase(deletePaymentTypeThunk.fulfilled, (state, action) => {
        state.paymentTypes = state.paymentTypes.filter(
          (p) => p.id !== action.payload
        );
      })
      // Months
      .addCase(fetchMonths.fulfilled, (state, action) => {
        state.months = action.payload || [];
      })
      // Fetch merchants
      .addCase(fetchMerchants.fulfilled, (state, action) => {
        state.merchants = action.payload;
      })

      // Add new merchant
      .addCase(addMerchantThunk.fulfilled, (state, action) => {
        state.merchants.push(action.payload);
      });
  },
});

export default listSlice.reducer;
