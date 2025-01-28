import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const token = localStorage.getItem('token');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Add response interceptor for token expiration
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response) {
      // Only redirect on 401 (Unauthorized), not on 403 (Forbidden)
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        window.location.href = '/?session=expired';
      }
      // For 403, just return the error for handling by components
      if (error.response.status === 403) {
        return Promise.reject(error);
      }
    }
    return Promise.reject(error);
  }
);

export const getIncome = async () => await api.get('/incomes');
export const addIncome = async (incomeData) => api.post('/incomes', incomeData);

export const getExpenses = async () => api.get('/expenses');
export const addExpense = async (data) => api.post('/expenses', data);

// Categories
export const getCategories = async () => api.get('/lists/categories');
export const addCategory = async (category) => api.post('/lists/categories', { category });
export const updateCategory = async (id, category) => api.put(`/lists/categories/${id}`, { category });
export const deleteCategory = async (id) => api.delete(`/lists/categories/${id}`);

// Payment Types
export const getPaymentTypes = async () => api.get('/lists/payment-types');
export const addPaymentType = async (paymentType) => api.post('/lists/payment-types', { paymentType });
export const updatePaymentType = async (id, paymentType) => api.put(`/lists/payment-types/${id}`, { paymentType });
export const deletePaymentType = async (id) => api.delete(`/lists/payment-types/${id}`);

// Sources
export const getSources = async () => api.get('/lists/sources');
export const addSource = async (data) => api.post('/lists/sources', data);
export const updateSource = async (id, source) => api.put(`/lists/sources/${id}`, { source });
export const deleteSource = async (id) => api.delete(`/lists/sources/${id}`);

export const getAnalyticsData = async (filters) =>{
  console.log('Sending filters to backend:', filters); // Debugging log
  return api.get('/analytics', { params: filters });

};
export const getMonths = async () => {
  const response = await api.get('/lists/months');
  console.log('Month received from getMonths: ' ,response.data);
  
  return response.data;
};

export const getBudgets = () => api.get('/budgets');
export const createBudget = (data) => api.post('/budgets', data);
// Check if budget has been reset for the current month
export const checkBudgetReset = (budgetId) => api.post(`/budgets/reset/${budgetId}`);





