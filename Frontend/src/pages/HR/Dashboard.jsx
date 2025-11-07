"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  getDashboardStats,
  getEmployeesList,
} from "@/services/dashboard.service";
import projectService from "@/services/project.service";
import EmployeeTable from "@/components/EmployeeTable";
import Loading from "@/components/Loading";
import {
  Card,
  CardHeader,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserMinus,
  TrendingUp,
  BarChart3,
  Award,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function HRDashboard() {
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [positionsList, setPositionsList] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [timeFilter, setTimeFilter] = useState("this_month");
  const [positionFilter, setPositionFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("desc");
  const [sortField, setSortField] = useState("projects");

  const [pageIndex, setPageIndex] = useState(0);
  const pageSize = 5;
  const [total, setTotal] = useState(0);

  // Fetch dashboard stats + positions
  useEffect(() => {
    (async () => {
      try {
        const queryString = `?period=${timeFilter}`;
        setLoadingState(true);
        setLoadingText("Loading dashboard data...");
        const [dashboardRes, positionsRes] = await Promise.all([
          getDashboardStats(queryString),
          projectService.getAllPositions(),
        ]);

        setDashboardData(dashboardRes.data);
        const positions = positionsRes?.positions || [];
        setPositionsList(positions);
      } catch (err) {
        console.error("Error fetching initial data:", err);
      } finally {
        setLoadingState(false);
        setLoadingText("");
      }
    })();
  }, [timeFilter]);

  // Fetch employees
  const fetchEmployees = async () => {
    setLoadingState(true);
    setLoadingText("Loading employees...");
    try {
      const params = { limit: 1000 };
      if (positionFilter !== "all") params.position = positionFilter;

      const res = await getEmployeesList(params);
      const employeesData = res.data.map((emp) => ({
        name: emp.name,
        position: emp.position?.name || emp.position || "-",
        manager: emp.manager?.name || "-",
        projects: emp.projectCount || 0,
        status:
          emp.projectCount >= 7
            ? "busy"
            : emp.projectCount === 0
            ? "available"
            : "moderate",
      }));

      // Sort + paginate
      const sorted = employeesData.sort((a, b) =>
        sortOrder === "desc"
          ? b.projects - a.projects || a.name.localeCompare(b.name)
          : a.projects - b.projects || a.name.localeCompare(b.name)
      );

      setTotal(sorted.length);
      const start = pageIndex * pageSize;
      setEmployees(sorted.slice(start, start + pageSize));
    } catch (err) {
      console.error("Failed to fetch employees", err);
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    if (positionsList.length > 0) fetchEmployees();
  }, [pageIndex, positionFilter, sortOrder, positionsList]);

  // Reset pagination when filter/sort changes
  useEffect(() => {
    setPageIndex(0);
  }, [positionFilter, sortOrder]);

  // Helpers
  const stats = dashboardData
    ? [
        {
          title: "Total Employees",
          value: dashboardData.statistics.totalEmployees.count || 0,
          subtitle: "Active employees in the organization",
          icon: Users,
          color: "blue",
          gradient: "from-blue-500 to-cyan-500",
        },
        {
          title: "Resigned Employees",
          value: dashboardData.statistics.resignedEmployees.count || 0,
          subtitle: "Employees who left the organization",
          icon: UserMinus,
          color: "red",
          gradient: "from-red-500 to-pink-500",
        },
      ]
    : [];

  const projectStats = dashboardData?.projectStatistics || {};
  const completed = projectStats.completed ?? projectStats.Completed ?? 0;
  const inProgress =
    projectStats.inProgress ??
    projectStats["In Progress"] ??
    projectStats.ongoing ??
    0;
  const overdue = projectStats.overdue || 0;
  const totalProjects = completed + inProgress;

  const projectData = [
    { status: "Completed", count: completed, color: "#10b981" },
    { status: "In Progress", count: inProgress, color: "#3b82f6" },
    { status: "Overdue", count: overdue, color: "#ef4444" },
  ];

  const topContributors =
    dashboardData?.topContributors?.map((tc) => ({
      name: tc.name,
      position: tc.position || "-",
      projects: tc.doneCount,
      avatar: tc.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase(),
    })) || [];

  const projectColor = (count) =>
    count === 0
      ? "bg-green-100 text-green-800"
      : count >= 7
      ? "bg-red-100 text-red-800"
      : "bg-yellow-100 text-yellow-800";

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          HR Dashboard
        </h1>
        <p className="text-gray-600 mt-1">
          Overview of employees, projects, and top contributors
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <Card
              key={i}
              className="border-gray-200 shadow-lg hover:shadow-xl transition-all overflow-hidden"
            >
              <div className={cn("h-2 bg-gradient-to-r", stat.gradient)} />
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2">
                      <h2 className="text-4xl font-bold text-gray-900">
                        {stat.value}
                      </h2>
                      <span className="text-sm text-gray-500">employees</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">{stat.subtitle}</p>
                  </div>
                  <div
                    className={cn(
                      "p-4 rounded-xl bg-gradient-to-br",
                      stat.gradient,
                      "shadow-lg"
                    )}
                  >
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts & Contributors */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Project Chart */}
        <Card className="lg:col-span-2 border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Project Statistics</CardTitle>
                <CardDescription className="text-sm">
                  Overview of project status distribution
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={projectData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="status"
                  tick={{ fill: "#6b7280", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "#6b7280", fontSize: 12 }} />
                <Tooltip
                  formatter={(v) => [`${v} Projects`, ""]}
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {projectData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
              {projectData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600">
                    {item.status}:{" "}
                    <span className="font-semibold text-gray-900">
                      {item.count}
                    </span>
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-center text-gray-600">
                Total Projects:{" "}
                <span className="font-bold text-gray-900">{totalProjects}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Contributors */}
        <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Award className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <CardTitle className="text-lg">Top Contributors</CardTitle>
                  <CardDescription className="text-sm">
                    Most active team members
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="mb-4">
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="this_month">This Month</SelectItem>
                  <SelectItem value="last_month">Last Month</SelectItem>
                  <SelectItem value="this_year">This Year</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {topContributors.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-500">
                <TrendingUp className="w-12 h-12 mb-3 text-gray-400" />
                <p className="text-sm font-medium">No contributors found</p>
                <p className="text-xs text-gray-400 mt-1">
                  Data will appear when available
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {topContributors.map((c, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold shadow-md">
                          {c.avatar}
                        </div>
                        {i === 0 && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center border-2 border-white">
                            <Award className="w-3 h-3 text-yellow-900" />
                          </div>
                        )}
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-gray-900">
                          {c.name}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Briefcase className="w-3 h-3" />
                          {c.position}
                        </div>
                      </div>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-purple-100 text-purple-700 font-semibold px-3 py-1"
                    >
                      {c.projects} {c.projects === 1 ? "Task" : "Tasks"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Employee Table */}
      <Card className="border-gray-200 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <Users className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <CardTitle className="text-lg">Employee Overview</CardTitle>
              <CardDescription className="text-sm">
                Manage and monitor employee workload and assignments
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
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
        </CardContent>
      </Card>
    </div>
  );
}
