import { create } from "zustand";
import api from "@/api/axios";

export const usePositionStore = create((set, get) => ({
  listPositions: [],
  loading: false,
  error: null,

  fetchPositions: async () => {
    if (get().loading || get().listPositions.length > 0) return;

    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/position");
      set({ listPositions: data.data.positions });
    } catch (err) {
      console.error("Error fetching positions:", err);
      set({ error: err.message || "Failed to fetch skills" });
    } finally {
      set({ loading: false });
    }
  },

  invalidatePositions: async () => {
    set({ listPositions: [] });
    await get().fetchPositions();
  },

  setPositions: (position) => set({ listPositions: position }),
}));
