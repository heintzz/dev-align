import { create } from "zustand";
import api from "@/api/axios";

export const useNotifCountStore = create((set, get) => ({
  unreadCount: 0,
  loading: false,
  error: null,

  fetchUnreadCount: async () => {
    try {
      const { data } = await api.get("/notification/unread-count");
      if (data.success) {
        set({ unreadCount: data.data.unreadCount });
      }
    } catch (err) {
      console.error("fetchUnreadCount error:", err);
    }
  },
}));
