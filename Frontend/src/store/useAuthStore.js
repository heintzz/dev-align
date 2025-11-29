import { create } from "zustand";

export const useAuthStore = create((set) => ({
  token: localStorage.getItem("token") || null,
  userId: localStorage.getItem("userId") || null,
  role: localStorage.getItem("userRole") || null,
  name: localStorage.getItem("name") || null,
  email: localStorage.getItem("email") || null,

  login: (token, role, userId, name, email) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userId", userId);
    localStorage.setItem("userRole", role);
    localStorage.setItem("name", name);
    localStorage.setItem("email", email);

    set({ token, role, userId, name, email });
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("name");
    localStorage.removeItem("email");

    set({ token: null, role: null, userId: null, name: null, email: null });
  },
}));
