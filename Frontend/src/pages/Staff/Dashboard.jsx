import { useState, useEffect } from "react";
import projectService from "../../services/project.service";

export default function StaffDashboard() {
  const [activeFilter, setActiveFilter] = useState("All");
  const [sortBy, setSortBy] = useState("Deadline");

  // Projects loaded for the staff user
  // Tasks for the staff user (global)
  const [allTasks, setAllTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [filterProject, setFilterProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showDebug, setShowDebug] = useState(false);
  const [selectedProjectDetail, setSelectedProjectDetail] = useState(null);
  // Tasks grouped for board view
  const [tasks, setTasks] = useState({ toDo: [], inProgress: [], done: [] });

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

  // Load all tasks for staff user
  useEffect(() => {
    const load = async () => {
      try {
        setLoadingTasks(true);
        const res = await projectService.getStaffTasks();
        // res expected: array of tasks with projectName and status
        setAllTasks(res || []);
      } catch (err) {
        console.error('Failed to load staff tasks', err);
      } finally {
        setLoadingTasks(false);
      }
    };
    load();
  }, []);

  // Recompute grouped tasks whenever allTasks or filters change
  useEffect(() => {
    const toDo = [];
    const inProgress = [];
    const done = [];

    const filtered = (allTasks || []).filter(t => {
      if (filterProject !== 'all' && String(t.projectId) !== String(filterProject)) return false;
      if (filterStatus !== 'all' && t.status !== filterStatus) return false;
      return true;
    });

    filtered.forEach(t => {
      const item = {
        id: t.taskId || t.taskId,
        title: t.title,
        description: t.description,
        color: t.status === 'done' ? 'border-l-4 border-green-500' : t.status === 'in_progress' ? 'border-l-4 border-yellow-500' : 'border-l-4 border-blue-500',
        strikethrough: t.status === 'done',
        projectName: t.projectName,
      };
      if (t.status === 'done') done.push(item);
      else if (t.status === 'in_progress') inProgress.push(item);
      else toDo.push(item);
    });

    setTasks({ toDo, inProgress, done });
  }, [allTasks, filterProject, filterStatus]);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
  <h1 className="text-3xl font-bold text-gray-900 mb-6">My Tasks ({(allTasks || []).length})</h1>

        {/* Filter Tabs & Sort */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Project:</label>
              <select value={filterProject} onChange={(e) => setFilterProject(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="all">All Projects</option>
                {(Array.from(new Map(allTasks.map(t => [String(t.projectId), t.projectName]))).map(([id, name]) => ({ id, name }))).map(p => (
                  <option key={p.id} value={p.id}>{p.name || 'Unnamed'}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Status:</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="px-3 py-2 border rounded-lg text-sm bg-white">
                <option value="all">All</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          
          {/* <button
            className="ml-4 px-3 py-2 border rounded text-sm bg-gray-100"
            onClick={() => setShowDebug((s) => !s)}
          >
            {showDebug ? 'Hide debug' : 'Show debug'}
          </button> */}
          </div>
        </div>

      {showDebug && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h4 className="font-semibold mb-2">Debug — raw responses</h4>
          <div className="text-xs text-gray-600 mb-2">All Tasks (raw):</div>
          <pre className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(allTasks, null, 2)}</pre>
          <div className="text-xs text-gray-600 mt-2 mb-2">Selected Project Detail (raw):</div>
          <pre className="text-xs bg-gray-100 p-2 rounded max-h-40 overflow-auto">{JSON.stringify(selectedProjectDetail, null, 2)}</pre>
        </div>
      )}
      </div>
      

      {/* Task List (table-style) */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          
        </div>

        {loadingTasks ? (
          <div className="p-6 bg-white rounded shadow text-center">Loading tasks...</div>
        ) : (() => {
          // Filtering logic
          const filteredTasks = (allTasks || []).filter(t => {
            if (filterProject !== 'all' && String(t.projectId) !== String(filterProject)) return false;
            if (filterStatus !== 'all') {
              const s2 = String(t.status).toLowerCase();
              if (filterStatus === 'todo' && !s2.includes('todo')) return false;
              if (filterStatus === 'in_progress' && !(s2.includes('in_progress') || s2.includes('in progress') || s2.includes('inprogress'))) return false;
              if (filterStatus === 'done' && !(s2.includes('done') || s2.includes('completed'))) return false;
            }
            return true;
          });
          if (filteredTasks.length === 0) {
            return (
              <div className="p-6 bg-white rounded shadow text-center">
                <p className="text-gray-700 mb-2">No tasks match the selected filter.</p>
              </div>
            );
          }
          return (
            <div className="bg-white rounded shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned By</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned At</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {filteredTasks.map((t, i) => {
                    const normalizeStatus = (s) => {
                      if (!s) return 'Unknown';
                      const s2 = String(s).toLowerCase();
                      if (s2.includes('todo')) return 'To Do';
                      if (s2.includes('in_progress') || s2.includes('in progress') || s2.includes('inprogress')) return 'In Progress';
                      if (s2.includes('done') || s2.includes('completed')) return 'Done';
                      return t.status || 'Unknown';
                    };
                    const statusLabel = normalizeStatus(t.status);
                    // Solid color badges
                    const badgeClass = statusLabel === 'Done'
                      ? 'bg-green-500 text-white'
                      : statusLabel === 'In Progress'
                        ? 'bg-blue-500 text-white'
                        : statusLabel === 'To Do'
                          ? 'bg-gray-500 text-white'
                          : 'bg-gray-300 text-gray-800';
                    return (
                      <tr key={t.assignmentId || t.taskId || i}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{i + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{t.title || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{t.projectName || '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badgeClass}`}>
                            {statusLabel}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{t.createdBy && t.createdBy.name ? t.createdBy.name : '-'}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{t.assignedAt ? new Date(t.assignedAt).toLocaleString() : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
