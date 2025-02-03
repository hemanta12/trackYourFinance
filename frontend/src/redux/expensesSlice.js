import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import {
  getExpenses,
  addExpense,
  uploadStatement,
  saveExpensesFromStatement,
  reuploadTheStatement,
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

// Upload bank statement file
export const uploadBankStatement = createAsyncThunk(
  "expenses/uploadStatement",
  async (file, { rejectWithValue }) => {
    try {
      const response = await uploadStatement(file);
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
  },
  reducers: {
    setUploadedTransactions: (state, action) => {
      state.uploadedTransactions = action.payload;
    },

    resetStatementData: (state) => {
      state.statementId = null;
      state.error = null;
      state.uploadedTransactions = [];
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
export const { setUploadedTransactions, resetStatementData } =
  expensesSlice.actions;
export default expensesSlice.reducer;
