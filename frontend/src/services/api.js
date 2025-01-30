import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const token = localStorage.getItem('token');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Token expiration handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        window.location.href = '/?session=expired';
      }
      if (error.response.status === 403) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

// Income & Expense
export const getIncome = async () => await api.get('/incomes');
export const addIncome = async (incomeData) => api.post('/incomes', incomeData);
export const getExpenses = async () => api.get('/expenses');
export const addExpense = async (data) => api.post('/expenses', data);

// Categories
export const getCategories = async () => api.get('/lists/categories');
export const addCategory = async (category) => api.post('/lists/categories', { category });
export const updateCategory = async (id, category) => api.put(`/lists/categories/${id}`, { category });
export const deleteCategory = async (id) => api.delete(`/lists/categories/${id}`);

//Payment Types
export const getPaymentTypes = () => api.get('/lists/payment-types');
export const addPaymentType = (paymentType) => api.post('/lists/payment-types', { paymentType });
export const updatePaymentType = (id, paymentType) => api.put(`/lists/payment-types/${id}`, { paymentType });
export const deletePaymentType = (id) => api.delete(`/lists/payment-types/${id}`);

//Sources
export const getSources = () => api.get('/lists/sources');
export const addSource = (source) => api.post('/lists/sources', { source });
export const updateSource = (id, source) => api.put(`/lists/sources/${id}`, { source });
export const deleteSource = (id) => api.delete(`/lists/sources/${id}`);

// Budget Management
export const getBudgets = () => api.get('/budgets');
export const createBudget = (data) => api.post('/budgets', data);
export const checkBudgetReset = (budgetId) => api.post(`/budgets/reset/${budgetId}`);

// Analytics & Reports
export const getMonths = async () => {
  const response = await api.get('/lists/months');
  
  return response.data;
};

export const getTopExpenses = () => api.get('/analytics/top-expenses');
export const getTopCategories = async () => {
  try {
    const response = await api.get('/analytics/top-categories');
    
    return response.data;
  } catch (error) {
    console.error("Error fetching top categories:", error);
    throw error;
  }
};
export const getBudgetWarnings = () => api.get('/analytics/budget-warnings');
export const getKPIData = () => api.get('/analytics/kpi-data');

export const getIncomeVsExpense = (params) => {
  const { viewType, year, month } = params;
  return api.get('/analytics/income-vs-expense', {
    params: {
      viewType,
      year,
      ...(viewType === 'monthly' && { month })
    }
  });
};

//Expense Pie chart
export const getExpenseBreakdown = async () => {
  try {
    const response = await api.get('/analytics/expense-breakdown');
    
    return response.data;  // ✅ Ensure only the `data` part is returned
  } catch (error) {
    console.error("Error in getExpenseBreakdown:", error);
    throw error;
  }
};
