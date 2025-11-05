import api from "@/api/axios";

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
      const response = await api.get(`${API_URL}/project/${projectId}/details`);
      return response.data;
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
    const response = await api.post(`${API_URL}/project`, projectData);
    return response.data;
  },

  //  Create project with staff assignments
  createProjectWithAssignments: async (projectData) => {
    const response = await api.post(
      `${API_URL}/project/with-assignments`,
      projectData
    );
    return response.data;
  },

  //  Update project
  updateProject: async (projectId, projectData) => {
    const response = await api.put(
      `${API_URL}/project/${projectId}`,
      projectData
    );
    return response.data;
  },

  //  Update project status (use existing PUT /project/:projectId endpoint)
  updateProjectStatus: async (projectId, status) => {
    const response = await api.put(`${API_URL}/project/${projectId}`, {
      status,
    });
    return response.data;
  },

  //  Delete project
  deleteProject: async (projectId) => {
    const response = await api.delete(`${API_URL}/project/${projectId}`);
    return response.data;
  },

  //  Get team recommendations from AI service
  getTeamRecommendations: async (projectData) => {
    const AI_URL = import.meta.env.VITE_AI_URL || "http://localhost:8000";
    try {
      const response = await api.post(
        `${AI_URL}/roster-recommendations`,
        projectData
      );
      return response.data;
    } catch (error) {
      console.error("AI Service Error:", error);
      if (error.response?.status === 404) {
        throw new Error(
          "AI service is not available. Please ensure the AI service is running on port 8000."
        );
      }
      throw error;
    }
  },

  //  Get all skills
  getAllSkills: async () => {
    const response = await api.get(`${API_URL}/skill`);
    return response.data.data || response.data;
  },

  //  Get all positions
  getAllPositions: async () => {
    const response = await api.get(`${API_URL}/position`);
    return response.data.data || response.data;
  },

  //  Get all employees
  getAllEmployees: async () => {
    const response = await api.get(`${API_URL}/hr/employees?limit=1000`);
    return response.data.data || response.data;
  },

  // Get all tasks for a project
  getProjectTasks: async (projectId) => {
    const response = await api.get(`${API_URL}/project/${projectId}/tasks`);
    return response.data.data || response.data;
  },
};

export default projectService;
