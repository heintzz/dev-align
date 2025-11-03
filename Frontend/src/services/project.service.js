import api from "@/api/axios";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const projectService = {
  // TODO: API - Get all projects (for PM Dashboard)
  getAllProjects: async () => {
    try {
      const response = await api.get(`${API_URL}/project`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch projects" };
    }
  },

  // TODO: API - Get project by ID
  getProjectById: async (projectId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch project" };
    }
  },

  // TODO: API - Create new project
  createProject: async (projectData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/projects`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create project" };
    }
  },

  // NEW: Create project with staff assignments (recommended endpoint)
  createProjectWithAssignments: async (projectData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/project/with-assignments`, // Note: no /api prefix based on your routes
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to create project" };
    }
  },

  // TODO: API - Update project
  updateProject: async (projectId, projectData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        `${API_URL}/api/projects/${projectId}`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to update project" };
    }
  },

  // TODO: API - Update project status
  updateProjectStatus: async (projectId, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(
        `${API_URL}/api/projects/${projectId}/status`,
        { status },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to update project status" }
      );
    }
  },

  // TODO: API - Delete project
  deleteProject: async (projectId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `${API_URL}/api/projects/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: "Failed to delete project" };
    }
  },

  // TODO: API - Get AI team recommendations
  getTeamRecommendations: async (projectData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${API_URL}/api/projects/recommend-team`,
        projectData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to get recommendations" }
      );
    }
  },

  // Update: Get all skills (fix endpoint)
  getAllSkills: async () => {
    try {
      const token = localStorage.getItem("token");
      // Ubah dari /api/skills menjadi /api/skill
      const response = await axios.get(`${API_URL}/skill`, {
        // Asumsi route root /skill
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Sesuaikan cara mengambil data dari response.data
      return response.data.data || response.data; // Coba ambil dari data: { skills: [...] } atau root data
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch skills" };
    }
  },

  // Update: Get all positions (fix endpoint)
  getAllPositions: async () => {
    try {
      const token = localStorage.getItem("token");
      // Ubah dari /api/positions menjadi /api/position
      const response = await axios.get(`${API_URL}/position`, {
        // Asumsi route root /position
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Sesuaikan cara mengambil data
      return response.data.data || response.data; // Coba ambil dari data: { positions: [...] } atau root data
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch positions" };
    }
  },

  // TODO: API - Get all employees
  getAllEmployees: async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/hr/employees?limit=1000`, {
        // Tambah limit agar semua data diambil
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Mengambil array karyawan yang ada di response.data.data
      return response.data.data || response.data; // return array karyawan
    } catch (error) {
      throw error.response?.data || { message: "Failed to fetch employees" };
    }
  },
};

export default projectService;
