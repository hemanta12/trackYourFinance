import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { api } from "../services/api";

export const fetchRecurringItems = createAsyncThunk(
  "recurringItems/fetchRecurringItems",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/recurring-items");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createRecurringItem = createAsyncThunk(
  "recurringItems/createRecurringItem",
  async (itemData, { rejectWithValue }) => {
    try {
      const response = await api.post("/recurring-items", itemData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateRecurringItem = createAsyncThunk(
  "recurringItems/updateRecurringItem",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/recurring-items/${id}`, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteRecurringItem = createAsyncThunk(
  "recurringItems/deleteRecurringItem",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/recurring-items/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const markRecurringItemPaid = createAsyncThunk(
  "recurringItems/markRecurringItemPaid",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/recurring-items/${id}/mark-paid`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const skipRecurringItem = createAsyncThunk(
  "recurringItems/skipRecurringItem",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/recurring-items/${id}/skip`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const toggleAutopayRecurringItem = createAsyncThunk(
  "recurringItems/toggleAutopayRecurringItem",
  async ({ id, autopay_enabled }, { rejectWithValue }) => {
    try {
      const response = await api.patch(
        `/recurring-items/${id}/toggle-autopay`,
        { autopay_enabled }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchBillPayments = createAsyncThunk(
  "billPayments/fetchBillPayments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/expenses?recurring=true");
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const recurringSlice = createSlice({
  name: "recurringItems",
  initialState: {
    data: [],
    billPayments: [],
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecurringItems.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchRecurringItems.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.data = action.payload;
      })
      .addCase(fetchRecurringItems.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(fetchBillPayments.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchBillPayments.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.billPayments = action.payload;
      })
      .addCase(fetchBillPayments.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(createRecurringItem.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(updateRecurringItem.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(deleteRecurringItem.fulfilled, (state, action) => {
        state.data = state.data.filter((item) => item.id !== action.payload);
      })
      .addCase(markRecurringItemPaid.fulfilled, (state, action) => {
        // Update the recurring item's next_due_date (and clear skipped_date)
        const index = state.data.findIndex(
          (item) => item.id === action.meta.arg
        );
        if (index !== -1) {
          state.data[index].next_due_date = action.payload.newNextDueDate;
          state.data[index].skipped_date = null;
        }
      })
      .addCase(skipRecurringItem.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (item) => item.id === action.meta.arg
        );
        if (index !== -1) {
          state.data[index].next_due_date = action.payload.newNextDueDate;
          state.data[index].skipped_date = action.payload.skippedDate;
        }
      })
      .addCase(toggleAutopayRecurringItem.fulfilled, (state, action) => {
        const { id, autopay_enabled } = action.meta.arg;
        const index = state.data.findIndex((item) => item.id === id);
        if (index !== -1) {
          state.data[index].autopay_enabled = autopay_enabled;
        }
      });
  },
});

export default recurringSlice.reducer;
