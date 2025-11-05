import api from '../api/axios';

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard');
  return response.data;
};

export const getManagerDashboard = async () => {
  const response = await api.get('/dashboard/manager');
  return response.data;
};

export const getEmployeesList = async (params) => {
  const response = await api.get('/hr/employees', { params });
  return response.data;
};