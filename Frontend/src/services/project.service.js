import api from "@/api/axios";

const projectService = {
  //  Get all projects
  getAllProjects: async () => {
    const response = await api.get("/project");
    return response.data;
  },

  //  Get project by ID
  getProjectById: async (projectId) => {
    try {
      const response = await api.get(`/project/${projectId}/details`);
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
    const response = await api.post("/project", projectData);
    return response.data;
  },

  //  Create project with staff assignments
  createProjectWithAssignments: async (projectData) => {
    const response = await api.post("/project/with-assignments", projectData);
    return response.data;
  },

  //  Update project
  updateProject: async (projectId, projectData) => {
    const response = await api.put(`/project/${projectId}`, projectData);
    return response.data;
  },

  //  Update project status (use existing PUT /project/:projectId endpoint)
  updateProjectStatus: async (projectId, status) => {
    const response = await api.put(`/project/${projectId}`, {
      status,
    });
    return response.data;
  },

  //  Delete project
  deleteProject: async (projectId) => {
    const response = await api.delete(`/project/${projectId}`);
    return response.data;
  },

  //  Get all skills
  getAllSkills: async () => {
    const response = await api.get("/skill");
    return response.data.data || response.data;
  },

  //  Get all positions
  getAllPositions: async () => {
    const response = await api.get("/position");
    return response.data.data || response.data;
  },

  //  Get all employees
  getAllEmployees: async () => {
    const response = await api.get("/hr/employees?limit=1000");
    return response.data.data || response.data;
  },

  // Get all tasks for a project
  getProjectTasks: async (projectId) => {
    const response = await api.get(`/project/${projectId}/tasks`);
    return response.data.data || response.data;
  },

  // Get projects assigned to the authenticated staff user
  getStaffProjects: async () => {
    const response = await api.get("/project-tasks/staff/projects");
    return response.data.data || response.data;
  },

  // Get detailed project (including tasks) for a staff user
  getStaffProjectDetail: async (projectId) => {
    const response = await api.get(
      `/project-tasks/staff/projects/${projectId}`
    );
    return response.data.data || response.data;
  },
  // Get all tasks assigned to the authenticated staff user
  getStaffTasks: async () => {
    const response = await api.get("/project-tasks/staff/tasks");
    return response.data.data || response.data;
  },
};

export default projectService;
