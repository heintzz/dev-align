import api from "@/api/axios";
import { create } from "zustand";

export const useAssigneeStore = create((set, get) => ({
  listAssigneeProject: [],
  loading: false,
  error: null,

  fetchAssigneeProject: async (projectId) => {
    // if (get().loading || get().listAssigneeProject.length > 0) return;

    set({ loading: true, error: null });
    try {
      const { data } = await api.get("/project-assignment", {
        params: {
          projectId: projectId,
        },
      });
      console.log(data);
      set({ listAssigneeProject: data.data.project.assignedEmployees || [] });
    } catch (err) {
      console.error("fetchAssigneeProject error", err);
      set({ error: err.message || "Failed to fetch assignee project" });
    } finally {
      set({ loading: false });
    }
  },

  invalidateAssigneeProject: async () => {
    set({ listAssigneeProject: [] });
    await get().fetchAssigneeProject();
  },

  setAssigneeProject: (assigneeProject) =>
    set({ listAssigneeProject: assigneeProject }),
}));
