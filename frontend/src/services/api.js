import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api";
// const token = localStorage.getItem("token");

export const api = axios.create({
  baseURL: API_BASE_URL,
});

// Token expiration handler
api.interceptors.request.use(
  (config) => {
    // Retrieve the current token from localStorage.
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // Optionally, remove the header if token is not present.
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Response interceptor to handle token expiration.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("userName");
        window.location.href = "/?session=expired";
      }
      if (error.response.status === 403) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Income & Expense
export const getIncome = async () => await api.get("/incomes");
export const addIncome = async (incomeData) => api.post("/incomes", incomeData);
export const getExpenses = async () => api.get("/expenses");
export const addExpense = async (data) => api.post("/expenses", data);

// Categories
export const getCategories = async () => api.get("/lists/categories");
export const addCategory = async (category) =>
  api.post("/lists/categories", { category });
export const updateCategory = async (id, category) =>
  api.put(`/lists/categories/${id}`, { category });
export const deleteCategory = async (id) =>
  api.delete(`/lists/categories/${id}`);

//Payment Types
export const getPaymentTypes = () => api.get("/lists/payment-types");
export const addPaymentType = (paymentType) =>
  api.post("/lists/payment-types", { paymentType });
export const updatePaymentType = (id, paymentType) =>
  api.put(`/lists/payment-types/${id}`, { paymentType });
export const deletePaymentType = (id) =>
  api.delete(`/lists/payment-types/${id}`);

//Sources
export const getSources = () => api.get("/lists/sources");
export const addSource = (source) => api.post("/lists/sources", { source });
export const updateSource = (id, source) =>
  api.put(`/lists/sources/${id}`, { source });
export const deleteSource = (id) => api.delete(`/lists/sources/${id}`);

// Budget Management
export const getBudgets = () => api.get("/budgets");
export const createBudget = (data) => api.post("/budgets", data);
export const checkBudgetReset = (budgetId) =>
  api.post(`/budgets/reset/${budgetId}`);

// Analytics & Reports
export const getMonths = async () => {
  const response = await api.get("/lists/months");

  return response.data;
};

export const getTopExpenses = (params) =>
  api.get("/analytics/top-expenses", { params });
export const getTopCategories = async (params) => {
  try {
    const response = await api.get("/analytics/top-categories", { params });

    return response.data;
  } catch (error) {
    console.error("Error fetching top categories:", error);
    throw error;
  }
};
export const getBudgetWarnings = (params) =>
  api.get("/analytics/budget-warnings", { params });
export const getKPIData = (params) =>
  api.get("/analytics/kpi-data", { params });

export const getIncomeVsExpense = (params) => {
  const { viewType, year, month } = params;
  return api.get("/analytics/income-vs-expense", {
    params: {
      viewType,
      year,
      ...(viewType === "monthly" && { month }),
    },
  });
};

//Expense Pie chart
export const getExpenseBreakdown = async (params) => {
  try {
    const response = await api.get("/analytics/expense-breakdown", { params });

    return response.data;
  } catch (error) {
    console.error("Error in getExpenseBreakdown:", error);
    throw error;
  }
};

// Upload bank statement (CSV/PDF)
export const uploadStatement = async (formData) => {
  try {
    const response = await api.post("/upload/statement", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data;
  } catch (error) {
    // If a duplicate is detected, return an object with a duplicate flag
    if (error.response?.status === 409) {
      return {
        duplicate: true,
        message: error.response.data.message,
        statement_id: error.response.data.statement_id || null,
      };
    }

    throw new Error(
      error.response?.data?.message || "An unexpected error occurred."
    );
  }
};

export const reuploadTheStatement = async (statementId) => {
  try {
    console.log("🚀 In reuploadTheStatement, about to POST /upload/reupload");
    const response = await api.post("/upload/reupload", {
      statement_id: statementId,
    });
    console.log("✅ /upload/reupload success:", response.data);
    return response.data;
  } catch (error) {
    // If error.response?.data?.message is undefined, you end up throwing an empty error
    const msg =
      error.response?.data?.message || "Error reprocessing statement.";
    console.error("❌ /upload/reupload error:", msg);
    throw new Error(msg);
  }
};

// Save imported expenses to the database
export const saveExpensesFromStatement = async (
  transactions,
  paymentTypes,
  statementId
) => {
  try {
    const response = await api.post("/expenses/save-statement-expenses", {
      transactions,
      paymentTypes,
      statement_id: statementId,
    });
    return response.data;
  } catch (error) {
    console.error(
      "🚨 API Error:",
      error.response?.data?.message || "Unknown error"
    );
    throw new Error(error.response?.data?.message || "Something went wrong");
  }
};

// Fetch merchants
export const getMerchants = async () => {
  const response = await api.get("/lists/merchants");
  return response.data;
};

// Add a new merchant
export const addMerchant = async (merchantName) => {
  const response = await api.post("/lists/merchants", { name: merchantName });
  return response.data;
};
