import api from "@/api/axios";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const projectService = {
  //  Get all projects
  getAllProjects: async () => {
    const response = await api.get(`${API_URL}/project`);
    return response.data;
  },

  //  Get project by ID
  getProjectById: async (projectId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(
        `${API_URL}/project/${projectId}/details`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Ambil struktur sesuai API doc
      const data = response.data.data;

      // Satukan semua info dalam satu objek biar mudah dipakai
      return {
        ...data.project,
        managerDetails: data.managerDetails,
        staffDetails: data.staffDetails,
        techLeadStaffIds: data.techLeadStaffIds,
        allStaffIds: data.allStaffIds,
      };
    } catch (error) {
      throw (
        error.response?.data || { message: "Failed to fetch project details" }
      );
    }
  },

  //  Alias for easier import
  getProjectDetails: async (projectId) => {
    return await projectService.getProjectById(projectId);
  },

  //  Create new project
  createProject: async (projectData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(`${API_URL}/project`, projectData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });
    return response.data;
  },

  //  Create project with staff assignments
  createProjectWithAssignments: async (projectData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/project/with-assignments`,
      projectData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  //  Update project
  updateProject: async (projectId, projectData) => {
    const token = localStorage.getItem("token");
    const response = await axios.put(
      `${API_URL}/project/${projectId}`,
      projectData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  //  Update project status
  updateProjectStatus: async (projectId, status) => {
    const token = localStorage.getItem("token");
    const response = await axios.patch(
      `${API_URL}/project/${projectId}/status`,
      { status },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  //  Delete project
  deleteProject: async (projectId) => {
    const token = localStorage.getItem("token");
    const response = await axios.delete(`${API_URL}/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  },

  //  Get team recommendations
  getTeamRecommendations: async (projectData) => {
    const token = localStorage.getItem("token");
    const response = await axios.post(
      `${API_URL}/project/recommend-team`,
      projectData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  },

  //  Get all skills
  getAllSkills: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/skill`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || response.data;
  },

  //  Get all positions
  getAllPositions: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/position`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || response.data;
  },

  //  Get all employees
  getAllEmployees: async () => {
    const token = localStorage.getItem("token");
    const response = await axios.get(`${API_URL}/hr/employees?limit=1000`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data.data || response.data;
  },
};

export default projectService;
