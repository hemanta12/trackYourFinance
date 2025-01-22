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
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Token expired or unauthorized access
      console.warn('Token expired or unauthorized access.');

      // Clear token and user data
      localStorage.removeItem('token');
      localStorage.removeItem('userName');

      // Redirect to login page
      window.location.href = '/?session=expired';
    }
    return Promise.reject(error); // Forward error for further handling
  }
);

export const getIncome = async () => await api.get('/incomes');
export const addIncome = async (incomeData) => api.post('/incomes', incomeData);

export const getExpenses = async () => api.get('/expenses');
export const addExpense = async (data) => api.post('/expenses', data);

export const getCategories = async () => api.get('/lists/categories');
export const addCategory = async (category) => api.post('/lists/categories', { category });

export const getPaymentTypes = async () => api.get('/lists/payment-types');
export const addPaymentType = async (paymentType) => api.post('/lists/payment-types', { paymentType });

export const getSources = async () => api.get('/lists/sources');
export const addSource = async (source) => api.post('/lists/sources', { source });

export const getAnalyticsData = async (filters) =>{
  console.log('Sending filters to backend:', filters); // Debugging log
  return api.get('/analytics', { params: filters });

};
export const getMonths = async () => {
  const response = await api.get('/lists/months');
  console.log('Month received from getMonths: ' ,response.data);
  
  return response.data;
};





