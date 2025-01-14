import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';
const token = localStorage.getItem('token');

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

export const getIncome = async () => await api.get('/incomes');
export const addIncome = async (incomeData) => api.post('/incomes', incomeData);

export const getExpenses = async () => api.get('/expenses');
export const addExpense = async (data) => api.post('/expenses', data);
