import { useState } from "react";

export default function StaffDashboard() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Deadline");

  // Data projects
  const projects = [
    {
      name: "Project Phoenix",
      description:
        "A complete redesign of the company's public-facing website and branding.",
      pm: "Sarah Chen",
      deadline: "2024-08-15",
      progress: 60,
      status: "In Progress",
      myTasks: 5,
    },
    {
      name: "Mobile App V2",
      description:
        "Development and launch of the second version of our flagship mobile application.",
      pm: "Alex Rodriguez",
      deadline: "2024-05-20",
      progress: 100,
      status: "Completed",
      myTasks: 8,
    },
    {
      name: "Q3 Marketing Campaign",
      description:
        "Launch a multi-channel marketing campaign for the new product features.",
      pm: "Emily White",
      deadline: "2024-06-01",
      progress: 90,
      status: "Overdue",
      myTasks: 2,
    },
  ];

  // Data tasks untuk project yang dipilih (Project Phoenix)
  const tasks = {
    toDo: [
      {
        title: "Design new homepage mockups",
        description: "Create three variations for review.",
        color: "border-l-4 border-blue-500",
      },
      {
        title: 'Write copy for "About Us" page',
        description: "Draft content and send for approval.",
        color: "border-l-4 border-blue-500",
      },
    ],
    inProgress: [
      {
        title: "Develop pricing page component",
        description: "Build the interactive pricing table.",
        color: "border-l-4 border-yellow-500",
      },
    ],
    done: [
      {
        title: "Setup project repository",
        description: "GitHub repo created and configured.",
        strikethrough: true,
        color: "border-l-4 border-green-500",
      },
      {
        title: "User research interviews",
        description: "Conducted 5 user interviews.",
        strikethrough: true,
        color: "border-l-4 border-green-500",
      },
    ],
  };

  const getStatusColor = (status) => {
    const colors = {
      "In Progress": "bg-blue-100 text-blue-700",
      Completed: "bg-green-100 text-green-700",
      Overdue: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getProgressColor = (progress) => {
    if (progress === 100) return "bg-green-500";
    if (progress >= 80) return "bg-blue-500";
    if (progress >= 50) return "bg-blue-400";
    return "bg-blue-300";
  };

  const isDeadlinePassed = (deadline) => {
    return new Date(deadline) < new Date();
  };

  const filteredProjects = projects.filter((project) => {
    if (activeFilter === "All") return true;
    return project.status === activeFilter;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Projects</h1>

        {/* Filter Tabs & Sort */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {["All", "In Progress", "Completed", "Overdue"].map((filter) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeFilter === filter
                    ? "bg-gray-700 text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option>Deadline</option>
              <option>Progress</option>
              <option>Name</option>
            </select>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {filteredProjects.map((project, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            {/* Project Header */}
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-lg font-bold text-gray-900">
                {project.name}
              </h3>
              <span
                className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                  project.status
                )}`}
              >
                {project.status}
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">{project.description}</p>

            {/* PM & Deadline */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">PM:</span>
                <span className="font-semibold text-gray-900">
                  {project.pm}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Deadline:</span>
                <span
                  className={`font-semibold ${
                    isDeadlinePassed(project.deadline) &&
                    project.status !== "Completed"
                      ? "text-red-600"
                      : "text-gray-900"
                  }`}
                >
                  {project.deadline}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-600">Progress</span>
                <span className="text-xs font-semibold text-gray-900">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full ${getProgressColor(
                    project.progress
                  )}`}
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t">
              <span className="text-sm text-gray-600">
                My Tasks:{" "}
                <span className="font-semibold text-gray-900">
                  {project.myTasks}
                </span>
              </span>
              <button className="text-sm font-medium text-blue-600 hover:text-blue-700">
                View Project
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Task Board */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Project Phoenix - My Tasks
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* To Do Column */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b-2 border-gray-300">
              To Do ({tasks.toDo.length})
            </h3>
            <div className="space-y-3">
              {tasks.toDo.map((task, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg p-4 shadow-sm ${task.color}`}
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {task.title}
                  </h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* In Progress Column */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b-2 border-gray-300">
              In Progress ({tasks.inProgress.length})
            </h3>
            <div className="space-y-3">
              {tasks.inProgress.map((task, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg p-4 shadow-sm ${task.color}`}
                >
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {task.title}
                  </h4>
                  <p className="text-sm text-gray-600">{task.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Done Column */}
          <div className="bg-gray-100 rounded-lg p-4">
            <h3 className="font-bold text-gray-900 mb-4 pb-3 border-b-2 border-gray-300">
              Done ({tasks.done.length})
            </h3>
            <div className="space-y-3">
              {tasks.done.map((task, index) => (
                <div
                  key={index}
                  className={`bg-white rounded-lg p-4 shadow-sm ${task.color}`}
                >
                  <h4
                    className={`font-semibold text-gray-900 mb-1 ${
                      task.strikethrough ? "line-through text-gray-500" : ""
                    }`}
                  >
                    {task.title}
                  </h4>
                  <p
                    className={`text-sm text-gray-600 ${
                      task.strikethrough ? "line-through text-gray-400" : ""
                    }`}
                  >
                    {task.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
