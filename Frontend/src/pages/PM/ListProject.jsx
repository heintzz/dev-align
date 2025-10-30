import { useState, useEffect } from "react";

export default function ListProjects() {
  const [projects, setProjects] = useState([]);
  const [filteredProjects, setFilteredProjects] = useState([]);
  const [activeFilter, setActiveFilter] = useState("All");
  const [filters, setFilters] = useState({
    status: "",
    deadline: "",
    teamSize: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // TODO: Fetch projects from API on component mount
  useEffect(() => {
    fetchProjects();
  }, []);

  // TODO: API - Fetch all projects
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // const response = await projectService.getAllProjects();
      // setProjects(response.data);
      // setFilteredProjects(response.data);

      // TEMPORARY: Mock data
      const mockProjects = [
        {
          _id: "1",
          name: "HRIS System Redesign",
          description:
            "Developing a new human resources information system to improve user experience and functionality.",
          status: "In Progress",
          deadline: "2024-12-15",
          teamMembers: [
            { _id: "1", name: "John Doe" },
            { _id: "2", name: "Jane Smith" },
            { _id: "3", name: "Mike Johnson" },
          ],
        },
        {
          _id: "2",
          name: "Onboarding Process",
          description:
            "Automating the new employee onboarding process to reduce manual work and improve efficiency.",
          status: "Completed",
          deadline: "2024-10-31",
          teamMembers: [
            { _id: "4", name: "Sarah Williams" },
            { _id: "5", name: "David Brown" },
            { _id: "6", name: "Emily Davis" },
          ],
        },
        {
          _id: "3",
          name: "Mobile App Development",
          description:
            "Creating a new mobile application for employees to access company resources on-the-go.",
          status: "On Hold",
          deadline: "2025-03-01",
          teamMembers: [
            { _id: "7", name: "Chris Wilson" },
            { _id: "8", name: "Lisa Anderson" },
          ],
        },
        {
          _id: "4",
          name: "Q4 Performance Review Cycle",
          description:
            "Planning and executing the Q4 quarterly performance review process for all departments.",
          status: "Overdue",
          deadline: "2023-11-30",
          teamMembers: [
            { _id: "9", name: "Robert Taylor" },
            { _id: "10", name: "Jennifer Martinez" },
          ],
        },
      ];
      setProjects(mockProjects);
      setFilteredProjects(mockProjects);
    } catch (error) {
      console.error("Error fetching projects:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter projects based on active filter
  useEffect(() => {
    filterProjects();
  }, [activeFilter, filters, projects]);

  const filterProjects = () => {
    let filtered = [...projects];

    // Filter by status tab
    if (activeFilter !== "All") {
      filtered = filtered.filter((p) => p.status === activeFilter);
    }

    // Filter by dropdown filters
    if (filters.status) {
      filtered = filtered.filter((p) => p.status === filters.status);
    }

    if (filters.deadline) {
      filtered = filtered.sort((a, b) => {
        if (filters.deadline === "Earliest") {
          return new Date(a.deadline) - new Date(b.deadline);
        } else {
          return new Date(b.deadline) - new Date(a.deadline);
        }
      });
    }

    if (filters.teamSize) {
      filtered = filtered.sort((a, b) => {
        if (filters.teamSize === "Smallest") {
          return a.teamMembers.length - b.teamMembers.length;
        } else {
          return b.teamMembers.length - a.teamMembers.length;
        }
      });
    }

    setFilteredProjects(filtered);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: value,
    }));
  };

  const getStatusColor = (status) => {
    const colors = {
      "In Progress": "bg-blue-100 text-blue-700",
      Completed: "bg-green-100 text-green-700",
      "On Hold": "bg-yellow-100 text-yellow-700",
      Overdue: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // TODO: Navigate to project details
  const handleViewDetails = (projectId) => {
    console.log("View details for project:", projectId);
    // navigate(`/projects/${projectId}/details`);
  };

  // TODO: Navigate to project kanban board
  const handleViewKanban = (projectId) => {
    console.log("View kanban for project:", projectId);
    // navigate(`/projects/${projectId}/kanban`);
  };

  // TODO: Navigate to create project page
  const handleCreateProject = () => {
    console.log("Navigate to create project");
    // navigate('/create-project');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Projects</h1>
          <button
            onClick={handleCreateProject}
            className="px-6 py-2.5 bg-[#2C3F48] text-white rounded-lg hover:bg-[#1F2E35] font-medium"
          >
            Create New Project
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between mb-6">
          {/* Status Tabs */}
          <div className="flex gap-2">
            {["All", "In Progress", "Completed", "On Hold", "Overdue"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setActiveFilter(status)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeFilter === status
                      ? "bg-[#2C3F48] text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {status}
                </button>
              )
            )}
          </div>

          {/* Dropdown Filters */}
          <div className="flex gap-3">
            {/* <select
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Status</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Overdue">Overdue</option>
            </select> */}

            <select
              value={filters.deadline}
              onChange={(e) => handleFilterChange("deadline", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Deadline</option>
              <option value="Earliest">Earliest First</option>
              <option value="Latest">Latest First</option>
            </select>

            <select
              value={filters.teamSize}
              onChange={(e) => handleFilterChange("teamSize", e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Team Size</option>
              <option value="Smallest">Smallest First</option>
              <option value="Largest">Largest First</option>
            </select>
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
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <div
                key={project._id}
                className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-gray-900 flex-1 pr-2">
                    {project.name}
                  </h3>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${getStatusColor(
                      project.status
                    )}`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Deadline */}
                <div className="flex items-center gap-2 mb-4">
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
                  <span className="text-sm text-gray-600">
                    Dec: {formatDate(project.deadline)}
                  </span>
                </div>

                {/* Team Members */}
                <div className="flex items-center gap-2 mb-4">
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
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {project.teamMembers.length} Members
                  </span>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleViewDetails(project._id)}
                    className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                  >
                    Details
                  </button>
                  <button
                    onClick={() => handleViewKanban(project._id)}
                    className="flex-1 px-4 py-2 bg-[#2C3F48] text-white rounded-lg hover:bg-[#1F2E35] text-sm font-medium"
                  >
                    Kanban
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
