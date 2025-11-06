import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import projectService from '../../services/project.service';
import ProjectDetailsDialog from './ProjectDetails';
import { useAuthStore } from '@/store/useAuthStore';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function ListProjects() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState('All');
  const [filters, setFilters] = useState({
    deadline: '',
    teamSize: '',
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
      console.log('test');

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
      console.error('Error fetching projects:', error);
      alert(error.message || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  };

  // Convert backend status to display status
  const getDisplayStatus = (status, deadline) => {
    // Backend only has: 'active', 'completed'
    if (status === 'completed') return 'Completed';
    if (status === 'active') {
      // Check if overdue
      if (deadline && new Date(deadline) < new Date()) {
        return 'Overdue';
      }
      return 'In Progress';
    }
    return 'In Progress';
  };

  // Filter projects based on active filter
  const filterProjects = useCallback(() => {
    let filtered = [...projects];

    // Filter by status tab
    if (activeFilter !== 'All') {
      filtered = filtered.filter((p) => p.displayStatus === activeFilter);
    }

    // Filter by deadline sort
    if (filters.deadline) {
      filtered = filtered.sort((a, b) => {
        if (filters.deadline === 'Earliest') {
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
        if (filters.teamSize === 'Smallest') {
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

  const getStatusColor = (status) => {
    const colors = {
      'In Progress': 'bg-blue-100 text-blue-700',
      Completed: 'bg-green-100 text-green-700',
      Overdue: 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-700';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
            displayStatus: getDisplayStatus(newProject.status, newProject.deadline),
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
    navigate('/create-project');
  };

  const { role } = useAuthStore();
  const isHR = role === 'hr';
  const isManager = role === 'manager';

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          {isManager && (
            <button
              onClick={handleCreateProject}
              className="px-6 py-2.5 bg-[#2C3F48] text-white rounded-lg hover:bg-[#1F2E35] font-medium cursor-pointer"
            >
              Create New Project
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {['All', 'In Progress', 'Completed', 'Overdue'].map((status) => (
              <button
                key={status}
                onClick={() => setActiveFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  activeFilter === status
                    ? 'bg-[#2C3F48] text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Dropdown Filters */}
          <div className="flex gap-3">
            <Select onValueChange={(v) => handleFilterChange('deadline', v)}>
              <SelectTrigger className="w-[180px] cursor-pointer">
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

            <Select onValueChange={(v) => handleFilterChange('teamSize', v)}>
              <SelectTrigger className="w-[180px] cursor-pointer">
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

        {/* Projects Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No projects found.</p>
            {isManager && projects.length === 0 && (
              <button
                onClick={handleCreateProject}
                className="mt-4 px-6 py-2 bg-[#2C3F48] text-white rounded-lg hover:bg-[#1F2E35]"
              >
                Create Your First Project
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="flex flex-col bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all duration-300 p-5"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 leading-snug line-clamp-1">
                    {project.name}
                  </h3>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(
                      project.displayStatus
                    )}`}
                  >
                    {project.displayStatus}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {project.description || 'No description provided.'}
                </p>

                {/* Meta Info */}
                <div className="flex flex-col gap-2 text-sm text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="truncate">
                      <strong className="text-gray-700">Deadline:</strong>{' '}
                      {formatDate(project.deadline)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 text-gray-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0zM7 10a2 2 0 11-4 0 2 2 0z"
                      />
                    </svg>
                    <span>
                      <strong className="text-gray-700">Members:</strong>{' '}
                      {project.teamMemberCount || 0}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-auto flex gap-3 pt-3 border-t border-gray-100">
                  <button
                    onClick={() => handleViewDetails(project._id)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    Details
                  </button>

                  {!isHR && (
                    <button
                      onClick={() => handleViewKanban(project._id)}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-[#2C3F48] rounded-lg hover:bg-[#1F2E35] transition-colors cursor-pointer"
                    >
                      Kanban
                    </button>
                  )}
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
