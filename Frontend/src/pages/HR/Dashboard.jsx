import { useState, useEffect } from "react";
import api from "@/api/axios";
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
  const [timeFilter, setTimeFilter] = useState("this_month");
  const [stats, setStats] = useState([]);
  const [projectData, setProjectData] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, [timeFilter]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch dashboard data with period filter
      const res = await api.get(`/dashboard?period=${timeFilter}&limit=5`);
      const data = res.data.data;

      // Set employee statistics
      setStats([
        {
          title: "Total Employees",
          value: data.statistics.totalEmployees.count,
          change: "+10.0%",
          trend: "up",
          subtitle: "Employee",
        },
        {
          title: "Resigned Employees",
          value: data.statistics.resignedEmployees.count,
          change: "-7.0%",
          trend: "down",
          subtitle: "Employee",
        },
      ]);

      // Set project statistics
      setProjectData([
        {
          status: "Completed",
          count: data.projectStatistics.completed,
          color: "#10b981",
        },
        {
          status: "In Progress",
          count: data.projectStatistics.inProgress,
          color: "#3b82f6",
        },
        {
          status: "On Hold",
          count: data.projectStatistics.onHold,
          color: "#f59e0b",
        },
        {
          status: "Rejected",
          count: data.projectStatistics.rejected,
          color: "#ef4444",
        },
      ]);

      // Set top contributors
      setTopContributors(
        data.topContributors.map((user) => ({
          name: user.name || "Unknown",
          position: user.position || "N/A",
          projects: user.doneCount,
          avatar: user.name
            ? user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
            : "?",
        }))
      );

      // Fetch employee status (workload)
      await fetchEmployeeStatus();
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  // TODO: Fetch employee status with workload
  const fetchEmployeeStatus = async () => {
    try {
      // Get employees
      const employeesRes = await api.get("/hr/employees?limit=1000");
      const employeesList = employeesRes.data?.data || employeesRes.data || [];

      // Get all project assignments (controller returns `data.data.project`)
      const assignmentsRes = await api.get("/project-assignment", {
        params: { perPage: 1000 },
      });

      // Controller returns data.data.project which can be an array of projects
      // each project has `assignedEmployees: [{_id, name, ...}]`
      const projectsPayload =
        assignmentsRes.data?.data?.project ||
        assignmentsRes.data?.project ||
        [];

      const projectsArray = Array.isArray(projectsPayload)
        ? projectsPayload
        : [projectsPayload];

      // Count active assignments per user (skip completed projects)
      const countMap = {};
      projectsArray.forEach((proj) => {
        if (!proj) return;
        const projStatus = proj.status;
        if (projStatus === "completed") return; // skip completed projects
        const assigned = proj.assignedEmployees || [];
        assigned.forEach((user) => {
          const uid = user?._id || user?.id || user;
          if (!uid) return;
          countMap[uid.toString()] = (countMap[uid.toString()] || 0) + 1;
        });
      });

      const employeesWithWorkload = employeesList.map((emp) => ({
        _id: emp._id,
        name: emp.name,
        position:
          (emp.position && (emp.position.name || emp.position)) ||
          "Not Assigned",
        manager: emp.managerId?.name || "No Manager",
        projects: countMap[emp._id?.toString()] || 0,
      }));

      setEmployees(employeesWithWorkload);
    } catch (err) {
      console.error("Error fetching employee status:", err);
    }
  };

  const getProjectColor = (projects) => {
    if (projects === 0) return "bg-green-100 text-green-800";
    if (projects >= 7) return "bg-red-100 text-red-800";
    return "bg-yellow-100 text-yellow-800";
  };

  const handleTimeFilterChange = (newFilter) => {
    setTimeFilter(newFilter);
  };

  if (loading) return <div className="p-6">Loading dashboard...</div>;

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
        {/* Project Statistic */}
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
              <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Top Contributor
            </h3>
            <select
              value={timeFilter}
              onChange={(e) => handleTimeFilterChange(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
          <div className="space-y-3">
            {topContributors.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No contributors found
              </p>
            ) : (
              topContributors.map((contributor, index) => (
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
                    {contributor.projects} Tasks
                  </div>
                </div>
              ))
            )}
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
          {employees.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              No employee data available
            </p>
          ) : (
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
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                          {employee.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()}
                        </div>
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
          )}
        </div>
      </div>
    </div>
  );
}
