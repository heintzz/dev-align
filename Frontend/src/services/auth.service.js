import api from "@/api/axios";

const authService = {
  login: async (email, password) => {
    try {
      const response = await api.post("/auth/login", {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Login failed" };
    }
  },

  forgotPassword: async (email) => {
    try {
      const response = await api.post("/auth/forgot-password", {
        email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to send reset link" };
    }
  },

  resetPassword: async (userId, token, password, confirmPassword) => {
    try {
      const response = await api.post("/auth/change-password", {
        userId,
        token,
        password,
        confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to reset password" };
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
  },

  getToken: () => {
    return localStorage.getItem("token");
  },

  isAuthenticated: () => {
    return !!localStorage.getItem("token");
  },
};

export default authService;
