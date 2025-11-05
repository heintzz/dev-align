import { useState, useEffect } from "react";
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
import { getDashboardStats, getEmployeesList } from "../../services/dashboard.service";
import projectService from "../../services/project.service";

export default function HRDashboard() {
  const [timeFilter, setTimeFilter] = useState("This Month");
  const [dashboardData, setDashboardData] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [positionsList, setPositionsList] = useState([]);
  const [positionFilter, setPositionFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // fetch dashboard stats and positions in parallel
        const [dashResponse, positionsRes] = await Promise.all([
          getDashboardStats(),
          projectService.getAllPositions()
        ]);

        // fetch employees separately so we can include the position filter
        const empParams = { page: 1, limit: 10 };
        if (positionFilter && positionFilter !== 'all') empParams.position = positionFilter;
        const empResponse = await getEmployeesList(empParams);
        
        console.log('Dashboard data:', dashResponse.data);
        console.log('Employee statistics:', {
          total: dashResponse.data.statistics.totalEmployees.count,
          resigned: dashResponse.data.statistics.resignedEmployees.count
        });
        setDashboardData(dashResponse.data);
        setEmployees(empResponse.data.map(emp => ({
          name: emp.name,
          position: emp.position?.name || emp.position || '-',
          manager: emp.manager?.name || '-',
          projects: emp.projectCount || 0,
          status: emp.projectCount >= 7 ? 'busy' : emp.projectCount === 0 ? 'available' : 'moderate'
        })));
        // normalize positions response
        let positions = [];
        if (Array.isArray(positionsRes)) positions = positionsRes;
        else if (positionsRes && positionsRes.data && positionsRes.data.positions) positions = positionsRes.data.positions;
        else if (positionsRes && positionsRes.positions) positions = positionsRes.positions;
        setPositionsList(positions || []);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // refetch employees when positionFilter changes
  useEffect(() => {
    const fetchEmployeesForFilter = async () => {
      try {
        const empParams = { page: 1, limit: 10 };
        if (positionFilter && positionFilter !== 'all') empParams.position = positionFilter;
        const empResponse = await getEmployeesList(empParams);
        setEmployees(empResponse.data.map(emp => ({
          name: emp.name,
          position: emp.position?.name || emp.position || '-',
          manager: emp.manager?.name || '-',
          projects: emp.projectCount || 0,
          status: emp.projectCount >= 7 ? 'busy' : emp.projectCount === 0 ? 'available' : 'moderate'
        })));
      } catch (err) {
        console.error('Failed to fetch employees for position filter', err);
      }
    };

    // only fetch when positions list is already loaded (avoid double calls on mount)
    if (positionsList.length > 0) fetchEmployeesForFilter();
  }, [positionFilter, positionsList]);

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

  // Data untuk chart project statistic
  const projectData = dashboardData ? [
    { status: "Completed", count: dashboardData.projectStatistics.completed || 0, color: "#3b82f6" },
    { status: "In Progress", count: dashboardData.projectStatistics.in_progress || dashboardData.projectStatistics.inProgress || 5, color: "#10b981" },
  ] : [];

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
            <div className="flex items-center">
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
      </div>
    </div>
  );
}
