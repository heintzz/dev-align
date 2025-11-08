import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";
import {
  ChevronDown,
  Search,
  Users,
  Mail,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  UserCircle,
  ArrowDownAZ,
  ArrowDownZa,
} from "lucide-react";

import Loading from "@/components/Loading";
import { toast } from "@/lib/toast";

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

export default function ManagerTeam() {
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("true");
  const [employees, setEmployees] = useState([]);
  const [directManager, setDirectManager] = useState(null);
  const [userRole, setUserRole] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("asc");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const getEmployees = async () => {
    setLoadingState(true);
    setLoadingText("Getting team members...");
    try {
      const { data } = await api.get("/hr/colleagues", {
        params: {
          page: currentPage,
          limit: pageSize,
          search: debouncedSearch,
          sortBy,
          sortOrder,
        },
      });

      setEmployees(data.data.colleagues);
      setDirectManager(data.data.directManager || null);
      setUserRole(data.data.userRole);
      setTotalItems(
        data.data.pagination?.totalItems || data.data.totalColleagues
      );
      setTotalPages(data.data.pagination?.totalPages || 1);
    } catch (error) {
      console.error("Error fetching colleagues:", error);
      toast(error.response?.data?.message || "Error fetching colleagues", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    getEmployees();
  }, [currentPage, pageSize, debouncedSearch, sortBy, sortOrder]);

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
    setCurrentPage(1);
  };

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen p-5">
      <Loading status={loadingState} fullscreen text={loadingText} />
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              {userRole === "manager" ? "My Team" : "Colleagues"}
            </h1>
            <p className="text-gray-600 text-sm mt-1">
              {totalItems} {totalItems === 1 ? "member" : "members"} in your
              team
            </p>
          </div>
        </div>
      </div>

      {/* Direct Manager Card */}
      {directManager && (
        <div className="mb-6 bg-linear-to-r from-purple-50 to-pink-50 rounded-2xl border border-purple-200 p-6 shadow-md">
          <div className="flex items-center gap-2 mb-4">
            <UserCircle className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">Your Manager</h3>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-lg font-bold shadow-lg">
              {getInitials(directManager.name)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-gray-900 text-lg">
                {directManager.name}
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="flex items-center gap-1.5 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  {directManager.email}
                </div>
                {directManager.position && (
                  <div className="flex items-center gap-1.5 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    {directManager.position.name}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Card */}
      <div className="bg-white rounded-2xl shadow-lg shadow-gray-200/50 border border-gray-100 overflow-hidden">
        {/* Filters & Search */}
        <div className="p-6 border-b border-gray-100 bg-linear-to-r from-gray-50 to-white">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1 items-center text-center">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-11 border-gray-200 focus:ring-2 focus:ring-blue-500 rounded-xl"
              />
            </div>

            <Select
              value={String(pageSize)}
              onValueChange={(value) => {
                setPageSize(Number(value));
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full lg:w-32 h-11 rounded-xl border-gray-200 cursor-pointer">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5" className="cursor-pointer">
                  5 per page
                </SelectItem>
                <SelectItem value="10" className="cursor-pointer">
                  10 per page
                </SelectItem>
                <SelectItem value="20" className="cursor-pointer">
                  20 per page
                </SelectItem>
                <SelectItem value="50" className="cursor-pointer">
                  50 per page
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/80 border-b border-gray-200">
              <tr>
                <th className="text-left py-4 px-6">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Employee
                    {sortBy === "name" ? (
                      sortOrder === "asc" ? (
                        <ArrowDownAZ className="w-4 h-4" />
                      ) : (
                        <ArrowDownZa className="w-4 h-4" />
                      )
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-gray-400" /> // neutral state
                    )}
                  </button>
                </th>

                <th className="hidden md:table-cell text-left py-4 px-6">
                  <button
                    onClick={() => handleSort("email")}
                    className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Email
                    {sortBy === "email" ? (
                      sortOrder === "asc" ? (
                        <ArrowDownAZ className="w-4 h-4" />
                      ) : (
                        <ArrowDownZa className="w-4 h-4" />
                      )
                    ) : (
                      <ArrowUpDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </th>

                <th className="hidden lg:table-cell text-left py-4 px-6">
                  <span className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Position
                  </span>
                </th>
                <th className="text-left py-4 px-6">
                  <span className="font-semibold text-gray-700 text-xs uppercase tracking-wider">
                    Skills
                  </span>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={4} className="h-64 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <Users className="w-16 h-16 text-gray-300" />
                      <div>
                        <p className="text-gray-500 font-medium">
                          No team members found
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Try adjusting your search criteria
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                employees.map((employee, index) => (
                  <tr
                    key={employee.id}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full bg-linear-to-br ${getAvatarColor(
                            index
                          )} flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:shadow-lg transition-shadow`}
                        >
                          {getInitials(employee.name)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {employee.name}
                          </p>
                          <p className="text-xs text-gray-500 md:hidden">
                            {employee.email}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="hidden md:table-cell py-4 px-6">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail className="w-4 h-4 text-gray-400" />
                        {employee.email}
                      </div>
                    </td>

                    <td className="hidden lg:table-cell py-4 px-6">
                      {employee.position ? (
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                        >
                          <Briefcase className="w-3 h-3 mr-1.5" />
                          {employee.position.name}
                        </Badge>
                      ) : (
                        <span className="text-gray-400 text-sm">-</span>
                      )}
                    </td>

                    <td className="py-4 px-6">
                      {employee.skills && employee.skills.length > 0 ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              className="h-9 px-3 rounded-lg border-gray-200 hover:bg-gray-50 transition-colors"
                            >
                              <Badge
                                variant="secondary"
                                className="mr-2 bg-purple-100 text-purple-700 hover:bg-purple-200"
                              >
                                {employee.skills[0].name}
                              </Badge>
                              {employee.skills.length > 1 && (
                                <span className="text-xs text-gray-500 mr-1">
                                  +{employee.skills.length - 1}
                                </span>
                              )}
                              <ChevronDown className="h-4 w-4 text-gray-500 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="w-56">
                            <div className="px-2 py-1.5 text-xs font-semibold text-gray-500 uppercase">
                              All Skills
                            </div>
                            {employee.skills.map((skill, skillIndex) => (
                              <DropdownMenuItem
                                key={skillIndex}
                                className="cursor-default focus:bg-purple-50"
                              >
                                <Badge
                                  variant="secondary"
                                  className="bg-purple-100 text-purple-700"
                                >
                                  {skill.name}
                                </Badge>
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : (
                        <span className="text-gray-400 text-sm">No skills</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/80 border-t border-gray-100">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                Showing{" "}
                <span className="font-semibold">
                  {(currentPage - 1) * pageSize + 1}
                </span>{" "}
                to{" "}
                <span className="font-semibold">
                  {Math.min(currentPage * pageSize, totalItems)}
                </span>{" "}
                of <span className="font-semibold">{totalItems}</span> members
              </p>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  disabled={currentPage === 1}
                  className="rounded-xl cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="hidden sm:flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <Button
                        key={i}
                        variant={
                          pageNum === currentPage ? "default" : "outline"
                        }
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg ${
                          pageNum === currentPage
                            ? "bg-linear-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-200 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="rounded-xl cursor-pointer"
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
