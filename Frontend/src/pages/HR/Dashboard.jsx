import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function HRDashboard() {
  const [timeFilter, setTimeFilter] = useState("This Month");

  // Data untuk statistik cards
  const stats = [
    {
      title: "Total Employees",
      value: 856,
      change: "+10.0%",
      trend: "up",
      subtitle: "Employee",
    },
    {
      title: "Resigned Employees",
      value: 17,
      change: "-7.0%",
      trend: "down",
      subtitle: "Employee",
    },
    {
      title: "Overallocated Employees",
      value: 17,
      change: "",
      trend: "",
      subtitle: "Employee",
    },
  ];

  // Data untuk chart project statistic
  const projectData = [
    { status: "Completed", count: 45, color: "#3b82f6" },
    { status: "In Progress", count: 28, color: "#10b981" },
    { status: "On Hold", count: 15, color: "#f59e0b" },
    { status: "Rejected", count: 8, color: "#ef4444" },
  ];

  // Data untuk top contributors
  const topContributors = [
    {
      name: "Robert Yuya",
      position: "Fullstack Developer",
      projects: 6,
      avatar: "RY",
    },
    { name: "Renaldo", position: "Project Manager", projects: 5, avatar: "R" },
    {
      name: "Purbaya Ferry",
      position: "Project Manager",
      projects: 6,
      avatar: "PF",
    },
    {
      name: "Smith Armstrong",
      position: "Backend Developer",
      projects: 4,
      avatar: "SA",
    },
    {
      name: "Deo Abraham",
      position: "Frontend Developer",
      projects: 3,
      avatar: "DA",
    },
  ];

  // Data untuk employee status table
  const employees = [
    {
      name: "Markus Kulcane",
      position: "Frontend",
      manager: "Leo Stanton",
      projects: 0,
      status: "available",
    },
    {
      name: "Marcus Culhane",
      position: "Backend",
      manager: "Purbaya",
      projects: 7,
      status: "busy",
    },
    {
      name: "Leo Stanton",
      position: "Project Manager",
      manager: "Leo Stanton",
      projects: 3,
      status: "moderate",
    },
  ];

  const getProjectColor = (projects) => {
    if (projects === 0) return "bg-green-100 text-green-800";
    if (projects >= 7) return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-gray-600 text-sm font-medium">
                {stat.title}
              </h3>
              {stat.change && (
                <span
                  className={`text-xs px-2 py-1 rounded ${
                    stat.trend === "up"
                      ? "bg-green-100 text-green-600"
                      : "bg-red-100 text-red-600"
                  }`}
                >
                  {stat.change}
                </span>
              )}
            </div>
            <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.subtitle}</div>
          </div>
        ))}
      </div>

      {/* Project Statistic & Top Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Project Statistic - 2 columns */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Project Statistic
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#516e9cff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Contributors - 1 column */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Contributor
            </h3>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option>This Month</option>
              <option>Last Month</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="space-y-3">
            {topContributors.map((contributor, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                    {contributor.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {contributor.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      {contributor.position}
                    </div>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  {contributor.projects} Projects
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Status Table */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Employee Status
          </h3>
          <button className="flex items-center gap-2 text-sm text-gray-600 border rounded px-3 py-1.5 hover:bg-gray-50">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
              />
            </svg>
            Filter & Short
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Employee Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Position
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Manager
                </th>
                <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                  Project Availability
                </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <tr key={index} className="border-b hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-300"></div>
                      <span className="text-sm font-medium text-gray-900">
                        {employee.name}
                      </span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {employee.position}
                  </td>
                  <td className="py-4 px-4 text-sm text-gray-600">
                    {employee.manager}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getProjectColor(
                        employee.projects
                      )}`}
                    >
                      {employee.projects} Projects
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
