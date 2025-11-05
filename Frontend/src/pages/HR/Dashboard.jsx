import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { getDashboardStats, getEmployeesList } from "../../services/dashboard.service";
import projectService from "../../services/project.service";

export default function HRDashboard() {
  const [timeFilter, setTimeFilter] = useState("This Month");
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'
  const [loading, setLoading] = useState(true);
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);

  // Function to fetch all employees and handle sorting/pagination in frontend
  const fetchPaginatedEmployees = async () => {
    try {
      setLoading(true);
      // Get ALL employees without pagination
      const empParams = {
        limit: 1000, // Large number to get all employees
      };
      if (positionFilter && positionFilter !== 'all') empParams.position = positionFilter;
      
      const empResponse = await getEmployeesList(empParams);
      
      // Map all employees with their project counts
      const allEmployees = empResponse.data.map(emp => ({
        name: emp.name,
        position: emp.position?.name || emp.position || '-',
        manager: emp.manager?.name || '-',
        projects: emp.projectCount || 0,
        status: emp.projectCount >= 7 ? 'busy' : emp.projectCount === 0 ? 'available' : 'moderate'
      }));

      // Sort ALL employees first
      const sortedEmployees = [...allEmployees].sort((a, b) => {
        if (sortOrder === 'desc') {
          return b.projects - a.projects || a.name.localeCompare(b.name);
        }
        return a.projects - b.projects || a.name.localeCompare(b.name);
      });

      // Set total for pagination
      setTotal(sortedEmployees.length);

      // Then get the current page's worth of employees
      const startIndex = pageIndex * pageSize;
      const endIndex = startIndex + pageSize;
      const currentPageEmployees = sortedEmployees.slice(startIndex, endIndex);

      setEmployees(currentPageEmployees);
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch employees', err);
      setLoading(false);
    }
  };

  // Initial load of dashboard data and positions
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        // Fetch initial dashboard data and positions
        const [dashboardResponse, positionsRes] = await Promise.all([
          getDashboardStats(),
          projectService.getAllPositions()
        ]);
        
        // Debug logs to track data flow
        console.log('Raw Dashboard Response:', dashboardResponse);
        console.log('Project Statistics:', dashboardResponse.data?.projectStatistics);
        
        setDashboardData(dashboardResponse.data);
        
        // normalize positions response
        let positions = [];
        if (Array.isArray(positionsRes)) positions = positionsRes;
        else if (positionsRes && positionsRes.data && positionsRes.data.positions) positions = positionsRes.data.positions;
        else if (positionsRes && positionsRes.positions) positions = positionsRes.positions;
        setPositionsList(positions || []);

        setLoading(false);
      } catch (error) {
        console.error('Error fetching initial data:', error);
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Effect for pagination, sorting, and filtering
  useEffect(() => {
    if (positionsList.length > 0) {
      fetchPaginatedEmployees();
    }
  }, [pageIndex, pageSize, positionFilter, sortOrder, positionsList]);

  // Reset to first page when filter or sort order changes
  useEffect(() => {
    setPageIndex(0);
  }, [positionFilter, sortOrder]);

  // Data untuk statistik cards
  const stats = dashboardData ? [
    {
      title: "Total Employees",
      value: dashboardData.statistics.totalEmployees.count || 0,
      trend: "up",
      subtitle: "Employee",
    },
    {
      title: "Resigned Employees",
      value: dashboardData.statistics.resignedEmployees.count || 0,
      subtitle: "Employee",
    },
  ] : [];

  // Robust parsing of project statistics from backend (handle different key naming)
  const parseProjectStatistics = (ps) => {
    const result = { completed: 0, inProgress: 0, total: 0 };
    if (!ps || typeof ps !== 'object') return result;

    // Try explicit keys first
    result.completed = Number(ps.completed ?? ps.completedCount ?? ps['Completed'] ?? 0) || 0;
    result.inProgress = Number(ps.inProgress ?? ps.in_progress ?? ps['In Progress'] ?? ps['in-progress'] ?? ps.inprogress ?? ps.ongoing ?? 0) || 0;

    // If values still zero, inspect keys heuristically
    if (result.completed === 0 || result.inProgress === 0) {
      Object.keys(ps).forEach((k) => {
        const v = Number(ps[k]) || 0;
        const lk = String(k).toLowerCase();
        if (lk.includes('completed')) result.completed = v;
        else if (lk.includes('progress') || lk.includes('ongoing') || lk.includes('in progress') || lk.includes('in-progress')) result.inProgress = v;
      });
    }

    // As a fallback, total is sum of numeric values in ps
    result.total = Object.values(ps).reduce((acc, cur) => acc + (Number(cur) || 0), 0);
    return result;
  };

  const parsedProjectStats = dashboardData ? parseProjectStatistics(dashboardData.projectStatistics) : { completed: 0, inProgress: 0, total: 0 };
  const completedCount = parsedProjectStats.completed;
  const inProgressCount = parsedProjectStats.inProgress;
  const totalProjects = parsedProjectStats.total || (completedCount + inProgressCount);

  const projectData = [
    { status: "Completed", count: completedCount, color: "#10b981" }, // green
    { status: "In Progress", count: inProgressCount, color: "#3b82f6" }, // blue
  ];

  // Data untuk top contributors
  const topContributors = dashboardData ? dashboardData.topContributors.map(tc => ({
    name: tc.name,
    position: tc.position || '-',
    projects: tc.doneCount,
    avatar: tc.name.split(' ').map(n => n[0]).join('').toUpperCase()
  })) : [];

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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={projectData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip formatter={(value) => [`${value} Projects`, '']}/>
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {projectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <div className="text-sm text-gray-500 mt-4 text-center">
            Total Projects: <span className="font-semibold">{totalProjects}</span>
          </div>
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
            <div className="flex items-center gap-3">
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="text-sm border rounded px-3 py-1.5"
              >
                <option value="desc">Most Projects</option>
                <option value="asc">Least Projects</option>
              </select>
              <select
                value={positionFilter}
                onChange={(e) => setPositionFilter(e.target.value)}
                className="text-sm border rounded px-3 py-1.5"
              >
                <option value="all">All Positions</option>
                {positionsList.map((p) => (
                  <option key={p._id || p.id || p.name} value={String(p._id || p.id || p.name)}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
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

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 border-t">
          <div className="text-sm text-gray-500">
            Page {pageIndex + 1} of {Math.ceil(total / pageSize)}
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
              disabled={pageIndex === 0}
            >
              Previous
            </button>
            <button
              className="px-3 py-1 text-sm border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() =>
                setPageIndex((p) =>
                  p + 1 < Math.ceil(total / pageSize) ? p + 1 : p
                )
              }
              disabled={pageIndex + 1 >= Math.ceil(total / pageSize)}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
