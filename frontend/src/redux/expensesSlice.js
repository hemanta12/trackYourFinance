import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getExpenses,
  addExpense,
  uploadStatement,
  saveExpensesFromStatement,
  reuploadTheStatement,
  bulkDeleteExpenses as bulkDeleteService,
  createMultipleExpenses as createMultipleExpensesApi,
} from "../services/api";
import { api } from "../services/api";

export const fetchExpenses = createAsyncThunk(
  "expenses/fetchExpenses",
  async () => {
    const response = await getExpenses();
    return response.data;
  }
);

export const createExpense = createAsyncThunk(
  "expenses/createExpense",
  async (data) => {
    const response = await addExpense(data);
    return response.data;
  }
);

export const createMultipleExpenses = createAsyncThunk(
  "expenses/createMultipleExpenses",
  async (expenses, { rejectWithValue }) => {
    try {
      const response = await createMultipleExpensesApi(expenses);
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Bulk expense creation failed"
      );
    }
  }
);

export const updateExpense = createAsyncThunk(
  "expenses/updateExpense",
  async ({ id, data }) => {
    const response = await api.put(`/expenses/${id}`, data);
    return response.data;
  }
);

export const deleteExpense = createAsyncThunk(
  "expenses/deleteExpense",
  async (id) => {
    await api.delete(`/expenses/${id}`);
    return id;
  }
);

// Bulk delete imported expenses
export const bulkDeleteExpenses = createAsyncThunk(
  "expenses/bulkDeleteExpenses",
  async (ids, { rejectWithValue }) => {
    try {
      const response = await bulkDeleteService(ids);
      return { ids, ...response.data };
      // 'response.data' might contain 'deletedCount'
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Bulk delete failed"
      );
    }
  }
);

// Upload bank statement file
export const uploadBankStatement = createAsyncThunk(
  "expenses/uploadStatement",
  async (file, { rejectWithValue, dispatch }) => {
    try {
      dispatch(setUploadProgress(0));
      // Simulate gradual upload progress
      // for (let i = 1; i <= 90; i += 10) {
      //   await new Promise((resolve) => setTimeout(resolve, 300));
      //   dispatch(setUploadProgress(i));
      //   console.log(`Fake Upload Progress: ${i}%`);
      // }
      const config = {
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          console.log(`Upload Progress: ${percentCompleted}%`);
          dispatch(setUploadProgress(percentCompleted));
        },
      };
      const response = await uploadStatement(file, config);
      dispatch(setUploadProgress(100));
      return response;
    } catch (error) {
      return rejectWithValue({
        message: error.message,
        statement_id: error.statement_id || null,
      });
    }
  }
);
export const reuploadStatement = createAsyncThunk(
  "expenses/reuploadStatement",
  async (statementId, { rejectWithValue }) => {
    try {
      const result = await reuploadTheStatement(statementId);
      return result;
    } catch (error) {
      // Provide a fallback to avoid returning `undefined`
      const fallbackMessage = "Reupload failed. Unknown error.";
      // If it's a JS `Error`, it typically has `error.message`.
      // If it's an Axios error, check `error.response?.data?.message`.
      return rejectWithValue(
        error?.response?.data?.message || error?.message || fallbackMessage
      );
    }
  }
);

// Save imported transactions to database
export const saveStatementExpenses = createAsyncThunk(
  "expenses/saveStatementExpenses",
  async ({ transactions, paymentTypes, statementId }, { rejectWithValue }) => {
    try {
      return await saveExpensesFromStatement(
        transactions,
        paymentTypes,
        statementId
      );
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const getAnalyticsData = async () => api.get("/analytics");

const expensesSlice = createSlice({
  name: "expenses",
  initialState: {
    data: [],
    uploadedTransactions: [],
    statementId: null,
    status: "idle",
    error: null,
    uploadProgress: 0,
  },
  reducers: {
    setUploadedTransactions: (state, action) => {
      state.uploadedTransactions = action.payload;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },

    resetStatementData: (state) => {
      state.statementId = null;
      state.error = null;
      state.uploadedTransactions = [];
      state.uploadProgress = 0;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.data = action.payload.transactions || action.payload;
        state.status = "succeeded";
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.data.push(action.payload);
      })
      .addCase(createMultipleExpenses.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createMultipleExpenses.fulfilled, (state, action) => {
        state.status = "succeeded";
        // Optionally update state.data or trigger a re-fetch.
      })
      .addCase(createMultipleExpenses.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        const index = state.data.findIndex(
          (expense) => expense.id === action.payload.id
        );
        if (index !== -1) {
          state.data[index] = action.payload;
        }
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.data = state.data.filter(
          (expense) => expense.id !== action.payload
        );
      })
      .addCase(bulkDeleteExpenses.fulfilled, (state, action) => {
        const { ids } = action.payload;
        state.data = state.data.filter((expense) => !ids.includes(expense.id));
      })
      .addCase(bulkDeleteExpenses.rejected, (state, action) => {
        state.error = action.payload;
      })
      .addCase(uploadBankStatement.fulfilled, (state, action) => {
        if (action.payload.duplicate) {
          state.error = action.payload.message;
        } else {
          state.error = null;
        }
        state.uploadedTransactions = action.payload.transactions || [];
        state.statementId = action.payload.statement_id || null;
      })
      .addCase(uploadBankStatement.rejected, (state, action) => {
        state.error = action.payload.message || "Unexpected error";

        state.statementId = action.payload.statement_id || null;
        state.uploadedTransactions = [];
      })
      .addCase(reuploadStatement.fulfilled, (state) => {
        state.error = null;
        state.statementId = null;
      })
      .addCase(saveStatementExpenses.fulfilled, (state, action) => {
        state.uploadedTransactions = [];
        state.statementId = null;
      })
      .addCase(saveStatementExpenses.rejected, (state, action) => {
        state.error = action.payload;
      });
  },
});
export const {
  setUploadedTransactions,
  resetStatementData,
  setUploadProgress,
} = expensesSlice.actions;
export default expensesSlice.reducer;
