'use client';

import { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { getDashboardStats, getEmployeesList } from '@/services/dashboard.service';
import projectService from '@/services/project.service';
import EmployeeTable from '@/components/EmployeeTable';
import Loading from '@/components/Loading';

export default function HRDashboard() {
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [dashboardData, setDashboardData] = useState(null);
  const [positionsList, setPositionsList] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [timeFilter, setTimeFilter] = useState('this_month');
  const [positionFilter, setPositionFilter] = useState('all');
  const [sortOrder, setSortOrder] = useState('desc');
  const [sortField, setSortField] = useState('projects');

  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 5;
  const [total, setTotal] = useState(0);

  // 📊 Fetch dashboard stats + positions
  useEffect(() => {
    (async () => {
      try {
        const queryString = `?period=${timeFilter}`;
        setLoadingState(true);
        setLoadingText('Fetch initial data...');
        const [dashboardRes, positionsRes] = await Promise.all([
          getDashboardStats(queryString),
          projectService.getAllPositions(),
        ]);

        setDashboardData(dashboardRes.data);
        // Normalize positions
        const positions = positionsRes?.positions || [];
        setPositionsList(positions);
      } catch (err) {
        console.error('Error fetching initial data:', err);
      } finally {
        setLoadingState(false);
        setLoadingText('');
      }
    })();
  }, [timeFilter]);

  // 👥 Fetch employees
  const fetchEmployees = async () => {
    setLoadingState(true);
    setLoadingText('Get the employees');
    try {
      const params = { limit: 1000 };
      if (positionFilter !== 'all') params.position = positionFilter;

      const res = await getEmployeesList(params);
      const employeesData = res.data.map((emp) => ({
        name: emp.name,
        position: emp.position?.name || emp.position || '-',
        manager: emp.manager?.name || '-',
        projects: emp.projectCount || 0,
        status: emp.projectCount >= 7 ? 'busy' : emp.projectCount === 0 ? 'available' : 'moderate',
      }));

      // Sort + paginate
      const sorted = employeesData.sort((a, b) =>
        sortOrder === 'desc'
          ? b.projects - a.projects || a.name.localeCompare(b.name)
          : a.projects - b.projects || a.name.localeCompare(b.name)
      );

      setTotal(sorted.length);
      const start = pageIndex * pageSize;
      setEmployees(sorted.slice(start, start + pageSize));
    } catch (err) {
      console.error('Failed to fetch employees', err);
    } finally {
      setLoadingState(false);
      setLoadingText('');
    }
  };

  useEffect(() => {
    if (positionsList.length > 0) fetchEmployees();
  }, [pageIndex, positionFilter, sortOrder, positionsList]);

  // Reset pagination when filter/sort changes
  useEffect(() => {
    setPageIndex(0);
  }, [positionFilter, sortOrder]);

  // 🧮 Helpers
  const stats = dashboardData
    ? [
        {
          title: 'Total Employees',
          value: dashboardData.statistics.totalEmployees.count || 0,
          subtitle: 'Employee',
        },
        {
          title: 'Resigned Employees',
          value: dashboardData.statistics.resignedEmployees.count || 0,
          subtitle: 'Employee',
        },
      ]
    : [];

  const projectStats = dashboardData?.projectStatistics || {};
  const completed = projectStats.completed ?? projectStats.Completed ?? 0;
  const inProgress =
    projectStats.inProgress ?? projectStats['In Progress'] ?? projectStats.ongoing ?? 0;
  const overdue = projectStats.overdue || 0;
  const totalProjects = completed + inProgress;

  const projectData = [
    { status: 'Completed', count: completed, color: '#10b981' },
    { status: 'In Progress', count: inProgress, color: '#3b82f6' },
    { status: 'Overdue', count: overdue, color: '#ef4444' },
  ];

  const topContributors =
    dashboardData?.topContributors?.map((tc) => ({
      name: tc.name,
      position: tc.position || '-',
      projects: tc.doneCount,
      avatar: tc.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase(),
    })) || [];

  const projectColor = (count) =>
    count === 0
      ? 'bg-green-100 text-green-800'
      : count >= 7
      ? 'bg-red-100 text-red-800'
      : 'bg-yellow-100 text-yellow-800';

  // if (loading) return <div className="p-6">Loading dashboard...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* ===== Stats ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-gray-600 text-sm font-medium mb-1">{stat.title}</h3>
            <div className="text-3xl font-bold">{stat.value}</div>
            <p className="text-xs text-gray-500 mt-1">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* ===== Charts & Contributors ===== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Project Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4">Project Statistic</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={projectData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip formatter={(v) => [`${v} Projects`, '']} />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {projectData.map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-4 text-center">
            Total Projects: <strong>{totalProjects}</strong>
          </p>
        </div>

        {/* Top Contributors */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Top Contributor</h3>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="text-sm border rounded px-2 py-1"
            >
              <option value="this_month">This Month</option>
              <option value="last_month">Last Month</option>
              <option value="this_year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>

          {topContributors.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-4">No contributors found</p>
          ) : (
            topContributors.map((c, i) => (
              <>
                <div key={i} className="flex items-center justify-between mb-3 last:mb-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold">
                      {c.avatar}
                    </div>
                    <div>
                      <div className="text-sm font-medium">{c.name}</div>
                      <div className="text-xs text-gray-500">{c.position}</div>
                    </div>
                  </div>
                  <span className="text-sm text-gray-600">{c.projects} Tasks</span>
                </div>
              </>
            ))
          )}
        </div>
      </div>

      {/* ===== Employee Table ===== */}
      <EmployeeTable
        employees={employees}
        positionsList={positionsList}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        sortField={sortField}
        setSortField={setSortField}
        positionFilter={positionFilter}
        setPositionFilter={setPositionFilter}
        projectColor={projectColor}
        pageIndex={pageIndex}
        setPageIndex={setPageIndex}
        total={total}
        pageSize={pageSize}
      />
    </div>
  );
}
