import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  ListTodo,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  Calendar,
  User,
  RefreshCw,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import projectService from "@/services/project.service";

import Loading from "@/components/Loading";
import { toast } from "@/lib/toast";

const normalizeStatus = (status) => {
  if (!status) return "Unknown";
  const statusLower = String(status).toLowerCase();
  if (statusLower.includes("todo")) return "To Do";
  if (
    statusLower.includes("in_progress") ||
    statusLower.includes("in progress") ||
    statusLower.includes("inprogress")
  ) {
    return "In Progress";
  }
  if (statusLower.includes("done") || statusLower.includes("completed")) {
    return "Done";
  }
  return status;
};

const getStatusConfig = (status) => {
  const configs = {
    "To Do": {
      className: "bg-slate-50 text-slate-700 border border-slate-200",
      dotColor: "bg-slate-500",
    },
    "In Progress": {
      className: "bg-blue-50 text-blue-700 border border-blue-200",
      dotColor: "bg-blue-500",
    },
    Done: {
      className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
      dotColor: "bg-emerald-500",
    },
  };
  return (
    configs[status] || {
      className: "bg-slate-50 text-slate-700 border border-slate-200",
      dotColor: "bg-slate-500",
    }
  );
};

const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function StaffDashboard() {
  const [allTasks, setAllTasks] = useState([]);
  const [filterProject, setFilterProject] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const loadTasks = async () => {
    try {
      setLoadingState(true);
      setLoadingText("Getting the task");
      const response = await projectService.getStaffTasks();
      setAllTasks(response || []);
    } catch (err) {
      console.error("Failed to load staff tasks:", err);
      toast(err.response.data.message || "Failed to load staff tasks", {
        type: "error",
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const projects = useMemo(() => {
    const projectMap = new Map(
      allTasks.map((task) => [String(task.projectId), task.projectName])
    );
    return Array.from(projectMap).map(([id, name]) => ({ id, name }));
  }, [allTasks]);

  const { filteredTasks, pagedTasks, totalPages, currentPage } = useMemo(() => {
    const filtered = allTasks.filter((task) => {
      if (
        filterProject !== "all" &&
        String(task.projectId) !== String(filterProject)
      ) {
        return false;
      }

      if (filterStatus !== "all") {
        const statusLower = String(task.status).toLowerCase();
        if (filterStatus === "todo" && !statusLower.includes("todo")) {
          return false;
        }
        if (
          filterStatus === "in_progress" &&
          !(
            statusLower.includes("in_progress") ||
            statusLower.includes("in progress") ||
            statusLower.includes("inprogress")
          )
        ) {
          return false;
        }
        if (
          filterStatus === "done" &&
          !(statusLower.includes("done") || statusLower.includes("completed"))
        ) {
          return false;
        }
      }

      return true;
    });

    const total = Math.max(1, Math.ceil(filtered.length / pageSize));
    const current = Math.min(page, total);
    const paged = filtered.slice((current - 1) * pageSize, current * pageSize);

    return {
      filteredTasks: filtered,
      pagedTasks: paged,
      totalPages: total,
      currentPage: current,
    };
  }, [allTasks, filterProject, filterStatus, page]);

  const statusCounts = useMemo(() => {
    const counts = { todo: 0, in_progress: 0, done: 0 };
    allTasks.forEach((task) => {
      const status = normalizeStatus(task.status);
      if (status === "To Do") counts.todo++;
      else if (status === "In Progress") counts.in_progress++;
      else if (status === "Done") counts.done++;
    });
    return counts;
  }, [allTasks]);

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [filterProject, filterStatus]);

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-24">
      <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <ListTodo className="w-10 h-10 text-slate-400" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">
        No tasks found
      </h3>
      <p className="text-slate-600 text-center max-w-md">
        {filteredTasks.length === 0 && allTasks.length > 0
          ? "Try adjusting your filters to see more tasks"
          : "You don't have any tasks assigned yet"}
      </p>
    </div>
  );

  return (
    <div className="min-h-screen p-5">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">My Tasks</h1>
            <p className="text-slate-600">
              {allTasks.length} total tasks assigned to you
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">Total</p>
                <p className="text-3xl font-bold text-slate-900">
                  {allTasks.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">To Do</p>
                <p className="text-3xl font-bold text-slate-900">
                  {statusCounts.todo}
                </p>
              </div>
              <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-slate-500 rounded-full" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  In Progress
                </p>
                <p className="text-3xl font-bold text-blue-600">
                  {statusCounts.in_progress}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500 mb-1">
                  Completed
                </p>
                <p className="text-3xl font-bold text-emerald-600">
                  {statusCounts.done}
                </p>
              </div>
              <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-emerald-500 rounded-full" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-sm border border-slate-200/50 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter by Project
              </label>
              <Select value={filterProject} onValueChange={setFilterProject}>
                <SelectTrigger className="w-full bg-white cursor-pointer">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">
                    All Projects
                  </SelectItem>
                  {projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id}
                      className="cursor-pointer"
                    >
                      {project.name || "Unnamed"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                <Filter className="w-4 h-4 inline mr-2" />
                Filter by Status
              </label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-full bg-white cursor-pointer">
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">
                    All Statuses
                  </SelectItem>
                  <SelectItem value="todo" className="cursor-pointer">
                    To Do
                  </SelectItem>
                  <SelectItem value="in_progress" className="cursor-pointer">
                    In Progress
                  </SelectItem>
                  <SelectItem value="done" className="cursor-pointer">
                    Done
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end text-end ">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={loadTasks}
                className=" ml-2 p-1 text-slate-500 hover:text-slate-700 cursor-pointer"
              >
                <RefreshCw />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {filteredTasks.length === 0 ? (
        renderEmpty()
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-2xl shadow-sm border border-slate-200/50 overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      #
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Task Title
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Assigned By
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Assigned At
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-100">
                  {pagedTasks.map((task, index) => {
                    const status = normalizeStatus(task.status);
                    const statusConfig = getStatusConfig(status);
                    const rowNumber = (currentPage - 1) * pageSize + index + 1;

                    return (
                      <tr
                        key={task.assignmentId || task.taskId || index}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-500">
                          {rowNumber}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                          {task.title || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <Link
                            to={`/kanban/${task.projectId}`}
                            className="text-slate-700 hover:text-slate-900 font-medium hover:underline"
                          >
                            {task.projectName || "-"}
                          </Link>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full ${statusConfig.className}`}
                          >
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`}
                            />
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                          {task.createdBy?.name || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                          {formatDateTime(task.assignedAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <Link
                            to={`/kanban/${task.projectId}`}
                            className="inline-flex items-center gap-1 text-sm font-medium text-slate-700 hover:text-slate-900"
                          >
                            View Kanban
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4 mb-6">
            {pagedTasks.map((task, index) => {
              const status = normalizeStatus(task.status);
              const statusConfig = getStatusConfig(status);
              const rowNumber = (currentPage - 1) * pageSize + index + 1;

              return (
                <div
                  key={task.assignmentId || task.taskId || index}
                  className="bg-white rounded-xl shadow-sm border border-slate-200/50 p-4 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold text-slate-500">
                          #{rowNumber}
                        </span>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-full ${statusConfig.className}`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`}
                          />
                          {status}
                        </span>
                      </div>
                      <h3 className="font-semibold text-slate-900 mb-1">
                        {task.title || "-"}
                      </h3>
                      <Link
                        to={`/kanban/${task.projectId}`}
                        className="text-sm text-slate-600 hover:text-slate-900 hover:underline"
                      >
                        {task.projectName || "-"}
                      </Link>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-600">
                      <User className="w-4 h-4" />
                      <span className="text-xs font-medium">Assigned by:</span>
                      <span className="font-semibold">
                        {task.createdBy?.name || "-"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-600">
                      <Calendar className="w-4 h-4" />
                      <span className="text-xs font-medium">Assigned:</span>
                      <span className="font-semibold">
                        {formatDateTime(task.assignedAt)}
                      </span>
                    </div>
                  </div>

                  <Link
                    to={`/kanban/${task.projectId}`}
                    className="flex items-center justify-center gap-2 w-full px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-900 transition-colors text-sm font-medium"
                  >
                    View in Kanban
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-xl shadow-sm border border-slate-200/50 p-4">
            <p className="text-sm text-slate-600">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, filteredTasks.length)} of{" "}
              {filteredTasks.length} tasks
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              <span className="px-4 py-2 text-sm font-semibold text-slate-700 bg-slate-50 rounded-lg">
                Page {currentPage} of {totalPages}
              </span>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 cursor-pointer"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
