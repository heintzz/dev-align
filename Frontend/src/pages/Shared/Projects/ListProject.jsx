import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import projectService from "../../../services/project.service";
import { useAuthStore } from "@/store/useAuthStore";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import ProjectDetailsDialog from "@/components/ProjectDetails";

import {
  Calendar,
  Users,
  Plus,
  LayoutGrid,
  Eye,
  ChevronDown,
} from "lucide-react";

const getStatusColor = (status) => {
  const statusMap = {
    "In Progress": "bg-blue-50 text-blue-700 border border-blue-200",
    Completed: "bg-emerald-50 text-emerald-700  border border-emerald-200",
    Overdue: "bg-red-50 text-red-700 border border-red-200",
  };
  return (
    statusMap[status] || "bg-slate-50 text-slate-700 border border-slate-200"
  );
};

// Format date utility
const formatDate = (dateString) => {
  if (!dateString) return "Not set";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

export default function ListProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [filters, setFilters] = useState({
    deadline: "",
    teamSize: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch projects from API on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // API - Fetch all projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      const response = await projectService.getAllProjects();
      // Response: { success: true, data: { page, perPage, total, projects: [...] } }
      const projectsList = response.data.projects || [];
      console.log("test");

      // Transform projects to add computed fields
      const transformedProjects = projectsList.map((project) => ({
        ...project,
        // Map status to display status
        displayStatus: getDisplayStatus(project.status, project.deadline),
        // Ensure teamMembers exists (may need separate API call for full details)
        teamMembers: project.teamMembers || [],
      }));

      setProjects(transformedProjects);
      setFilteredProjects(transformedProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      alert(error.message || "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  // Convert backend status to display status
  const getDisplayStatus = (status, deadline) => {
    // Backend only has: 'active', 'completed'
    if (status === "completed") return "Completed";
    if (status === "active") {
      // Check if overdue
      if (deadline && new Date(deadline) < new Date()) {
        return "Overdue";
      }
      return "In Progress";
    }
    return "In Progress";
  };

  // Filter projects based on active filter
  const filterProjects = useCallback(() => {
    let filtered = [...projects];

    // Filter by status tab
    if (activeFilter !== "All") {
      filtered = filtered.filter((p) => p.displayStatus === activeFilter);
    }

    // Filter by deadline sort
    if (filters.deadline) {
      filtered = filtered.sort((a, b) => {
        if (filters.deadline === "Earliest") {
          return new Date(a.deadline) - new Date(b.deadline);
        } else {
          return new Date(b.deadline) - new Date(a.deadline);
        }
      });
    }

    // Filter by team size sort
    if (filters.teamSize) {
      filtered = filtered.sort((a, b) => {
        const aSize = a.teamMemberCount || 0;
        const bSize = b.teamMemberCount || 0;
        if (filters.teamSize === "Smallest") {
          return aSize - bSize;
        } else {
          return bSize - aSize;
        }
      });
    }

    setFilteredProjects(filtered);
  }, [activeFilter, filters, projects]);

  useEffect(() => {
    filterProjects();
  }, [filterProjects]);

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  // Navigate to project details
  const handleViewDetails = (projectId) => {
    setSelectedProjectId(projectId);
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setSelectedProjectId(null);
  };

  const handleProjectUpdated = async (updatedProject) => {
    // Refresh projects list when project is updated/deleted
    // If caller passes updated project payload, update locally to avoid full refetch
    if (updatedProject && updatedProject._id) {
      const updatedId = updatedProject._id.toString();
      const transformedProjects = projects.map((project) => {
        if (project._id.toString() === updatedId) {
          const newProject = {
            ...project,
            ...updatedProject,
          };
          return {
            ...newProject,
            displayStatus: getDisplayStatus(
              newProject.status,
              newProject.deadline
            ),
          };
        }
        return project;
      });

      setProjects(transformedProjects);
      setFilteredProjects(transformedProjects);
    } else {
      await fetchProjects();
    }
  };

  // Navigate to project kanban board
  const handleViewKanban = (projectId) => {
    navigate(`/kanban/${projectId}`);
  };

  // Navigate to create project page
  const handleCreateProject = () => {
    navigate("/create-project");
  };

  const { role } = useAuthStore();
  const isHR = role === "hr";
  const isManager = role === "manager";

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-blue-50/30 to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                My Projects
              </h1>
              <p className="text-slate-600">
                Manage and track all your projects in one place
              </p>
            </div>

            {isManager && (
              <Button
                onClick={handleCreateProject}
                className="bg-linear-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 text-white shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-200" />
                Create New Project
              </Button>
            )}
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6 mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Status Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {["All", "In Progress", "Completed", "Overdue"].map((status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                    activeFilter === status
                      ? "bg-linear-to-r from-slate-800 to-slate-900 text-white shadow-md scale-105"
                      : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:scale-105"
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Dropdown Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Select onValueChange={(v) => handleFilterChange("deadline", v)}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                  <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Deadline" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Earliest" className="cursor-pointer">
                    Earliest First
                  </SelectItem>
                  <SelectItem value="Latest" className="cursor-pointer">
                    Latest First
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select onValueChange={(v) => handleFilterChange("teamSize", v)}>
                <SelectTrigger className="w-full sm:w-[180px] bg-white border-slate-200 hover:border-slate-300 transition-colors cursor-pointer">
                  <Users className="w-4 h-4 mr-2 text-slate-500" />
                  <SelectValue placeholder="Team Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Smallest" className="cursor-pointer">
                    Smallest First
                  </SelectItem>
                  <SelectItem value="Largest" className="cursor-pointer">
                    Largest First
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin mb-4" />
            <p className="text-slate-600 font-medium">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <LayoutGrid className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">
              No projects found
            </h3>
            <p className="text-slate-600 mb-6 text-center max-w-md">
              {isManager && projects.length === 0
                ? "Get started by creating your first project"
                : "Try adjusting your filters to see more results"}
            </p>
            {isManager && projects.length === 0 && (
              <Button
                onClick={handleCreateProject}
                className="bg-linear-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Project
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="group bg-white rounded-2xl shadow-sm border border-slate-200/50 hover:shadow-xl hover:border-slate-300/50 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Colored Top Border */}
                <div
                  className={`h-1.5 ${
                    project.displayStatus === "Completed"
                      ? "bg-linear-to-r from-emerald-500 to-emerald-600"
                      : project.displayStatus === "Overdue"
                      ? "bg-linear-to-r from-red-500 to-red-600"
                      : "bg-linear-to-r from-blue-500 to-blue-600"
                  }`}
                />

                <div className="p-6 flex flex-col flex-1">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-slate-900 leading-tight line-clamp-2 flex-1 group-hover:text-slate-700 transition-colors">
                      {project.name}
                    </h3>
                    <span
                      className={`ml-3 px-3 py-1.5 text-xs font-bold rounded-xl whitespace-nowrap ${getStatusColor(
                        project.displayStatus
                      )}`}
                    >
                      {project.displayStatus}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-slate-600 line-clamp-2 mb-6 leading-relaxed">
                    {project.description || "No description provided."}
                  </p>

                  {/* Meta Info Cards */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Deadline
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900 truncate">
                        {formatDate(project.deadline)}
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                      <div className="flex items-center gap-2 mb-1">
                        <Users className="w-4 h-4 text-slate-500" />
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                          Members
                        </span>
                      </div>
                      <p className="text-sm font-bold text-slate-900">
                        {project.teamMemberCount || 0}
                      </p>
                    </div>
                  </div>

                  {/* Actions - Pushed to bottom with mt-auto */}
                  <div className="flex gap-2 mt-auto pt-4 border-t border-slate-100">
                    <Button
                      onClick={() => handleViewDetails(project._id)}
                      variant="outline"
                      className="flex-1 group/btn cursor-pointer"
                    >
                      <Eye className="w-4 h-4 mr-2 group-hover/btn:scale-110 transition-transform" />
                      Details
                    </Button>

                    {!isHR && (
                      <Button
                        onClick={() => handleViewKanban(project._id)}
                        className="flex-1 bg-linear-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-slate-950 group/btn cursor-pointer"
                      >
                        <LayoutGrid className="w-4 h-4 mr-2 group-hover/btn:rotate-12 transition-transform" />
                        Kanban
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ProjectDetailsDialog
        projectId={selectedProjectId}
        isOpen={isDialogOpen}
        onClose={handleCloseDialog}
        onProjectUpdated={handleProjectUpdated}
      />
    </div>
  );
}
