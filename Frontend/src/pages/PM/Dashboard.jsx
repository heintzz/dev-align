import { useState, useEffect } from "react";
import {
  Users,
  FolderKanban,
  CheckCircle2,
  Clock,
  ChevronLeft,
  ChevronRight,
  Search,
} from "lucide-react";
import api from "@/api/axios";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

import { toast } from "@/lib/toast";
import Loading from "@/components/Loading";

const getProjectColor = (projects) => {
  if (projects === 0)
    return "bg-green-100 text-green-700 border border-green-200";
  if (projects >= 7) return "bg-red-100 text-red-700 border border-red-200";
  return "bg-amber-100 text-amber-700 border border-amber-200";
};

const getAvatarColor = (index) => {
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-purple-500 to-pink-500",
    "from-green-500 to-emerald-500",
    "from-orange-500 to-red-500",
    "from-indigo-500 to-purple-500",
    "from-teal-500 to-green-500",
  ];
  return colors[index % colors.length];
};

export default function PMDashboard() {
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [dashboardData, setDashboardData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const itemsPerPage = 5;

  const stats = dashboardData?.data
    ? [
        {
          title: "Total Projects",
          value: dashboardData.data.statistics.totalProjects || 0,
          icon: FolderKanban,
          color: "from-blue-500 to-cyan-500",
          bgColor: "bg-blue-50",
          textColor: "text-blue-600",
        },
        {
          title: "Completed",
          value: dashboardData.data.statistics.projectsComplete || 0,
          icon: CheckCircle2,
          color: "from-green-500 to-emerald-500",
          bgColor: "bg-green-50",
          textColor: "text-green-600",
        },
        {
          title: "In Progress",
          value: dashboardData.data.statistics.projectsOnGoing || 0,
          icon: Clock,
          color: "from-orange-500 to-amber-500",
          bgColor: "bg-orange-50",
          textColor: "text-orange-600",
        },
        {
          title: "Team Members",
          value: dashboardData.data.pagination?.total || 0,
          icon: Users,
          color: "from-purple-500 to-pink-500",
          bgColor: "bg-purple-50",
          textColor: "text-purple-600",
        },
      ]
    : [];

  const teamMembers = dashboardData?.data?.team || [];
  const pagination = dashboardData?.data?.pagination || {};

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoadingState(true);
      setLoadingText("Getting the data...");
      try {
        const { data } = await api.get("/dashboard/manager", {
          params: {
            page: currentPage,
            limit: itemsPerPage,
            search: searchQuery,
            sortBy: sortBy,
          },
        });
        console.log(data);
        setDashboardData(data);
      } catch (error) {
        console.error("Error fetching manager dashboard:", error);
        toast(
          error.response?.data?.message || "Error fetching manager dashboard",
          {
            type: "error",
            position: "top-center",
            duration: 4000,
          }
        );
      } finally {
        setLoadingState(false);
        setLoadingText("");
      }
    };

    fetchDashboardData();
  }, [currentPage, searchQuery, sortBy]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (value) => {
    console.log(value);
    if (value == "no") {
      value = "";
    }
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen pb-24 pt-5 lg:px-5 lg:py-10">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Project Manager Dashboard
        </h1>
        <p className="text-gray-600">
          Overview of your projects and team performance
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`${stat.bgColor} p-3 rounded-xl`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-gray-600 text-sm font-medium">
                  {stat.title}
                </p>
                <p
                  className={`text-3xl font-bold bg-linear-to-r ${stat.color} bg-clip-text text-transparent`}
                >
                  {stat.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Team Status Section */}
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Header with Search and Filter */}
        <div className="p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                Team Status
              </h2>
              <p className="text-sm text-gray-600">
                Showing {teamMembers.length} of {pagination.total || 0} team
                members
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search team members..."
                  value={searchQuery}
                  onChange={handleSearch}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                />
              </div>

              {/* Sort Dropdown */}
              <Select value={sortBy} onValueChange={(v) => handleSort(v)}>
                <SelectTrigger className="w-40 text-sm cursor-pointer">
                  <SelectValue placeholder="Sort by Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="no" className="cursor-pointer">
                    No sort
                  </SelectItem>
                  <SelectItem value="desc" className="cursor-pointer">
                    Most Projects
                  </SelectItem>
                  <SelectItem value="asc" className="cursor-pointer">
                    Least Projects
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Employee
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">
                  Email
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">
                  Position
                </th>
                <th className="text-left py-4 px-6 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Projects
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {teamMembers.length === 0 ? (
                <tr>
                  <td colSpan="4" className="py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-12 h-12 text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        No team members found
                      </p>
                      <p className="text-sm text-gray-400">
                        Try adjusting your search criteria
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                teamMembers.map((member, index) => {
                  const avatar = (member.name || "")
                    .split(" ")
                    .map((n) => n[0] || "")
                    .join("")
                    .toUpperCase();

                  return (
                    <tr
                      key={index}
                      className="hover:bg-gray-50/50 transition-colors group"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarColor(
                              index
                            )} flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow`}
                          >
                            {avatar}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">
                              {member.name}
                            </p>
                            <p className="text-xs text-gray-500 md:hidden">
                              {member.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600 hidden md:table-cell">
                        {member.email}
                      </td>
                      <td className="py-4 px-6 hidden lg:table-cell">
                        <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                          {member.position?.name || "-"}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold ${getProjectColor(
                            member.projectCount
                          )}`}
                        >
                          {member.projectCount}{" "}
                          {member.projectCount === 1 ? "Project" : "Projects"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Page{" "}
                <span className="font-semibold">{pagination.currentPage}</span>{" "}
                of{" "}
                <span className="font-semibold">{pagination.totalPages}</span>
              </p>

              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={!pagination.hasPrevPage}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (
                        pagination.currentPage >=
                        pagination.totalPages - 2
                      ) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-10 h-10 rounded-lg text-sm font-medium transition-all ${
                            pageNum === pagination.currentPage
                              ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 cursor-not-allowed"
                              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md cursor-pointer"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(pagination.totalPages, prev + 1)
                    )
                  }
                  disabled={!pagination.hasNextPage}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-md cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
