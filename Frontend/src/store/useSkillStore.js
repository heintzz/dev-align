import api from "@/api/axios";
import { create } from "zustand";

export const useSkillStore = create((set, get) => ({
  listSkills: [],
  loading: false,
  error: null,

  fetchSkills: async () => {
    if (get().loading || get().listSkills.length > 0) return;

    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/skill");
      console.log(data);
      set({ listSkills: data.data?.skills || [] });
    } catch (err) {
      console.error("fetchSkills error", err);
      set({ error: err.message || "Failed to fetch skills" });
    } finally {
      set({ loading: false });
    }
  },

  invalidateSkills: async () => {
    set({ listSkills: [] });
    await get().fetchSkills();
  },

  setSkills: (skills) => set({ listSkills: skills }),
}));
