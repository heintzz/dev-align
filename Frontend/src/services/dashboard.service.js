import api from "../api/axios";

export const getDashboardStats = async (queryString) => {
  const response = await api.get(
    queryString ? `/dashboard${queryString}` : "/dashboard"
  );
  return response.data;
};

export const getManagerDashboard = async () => {
  const response = await api.get("/dashboard/manager");
  return response.data;
};

export const getEmployeesList = async (params) => {
  const response = await api.get("/hr/employees", { params });
  return response.data;
};
