import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "@/api/axios";

import { DragDropContext } from "@hello-pangea/dnd";
import Column from "@/components/kanban/Column";

// shadcn/ui components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { CirclePlus, CircleCheckBig, MoveLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/useAuthStore";
import ConfirmDialog from "@/components/ConfirmDialog";

import Loading from "@/components/Loading";
import { toast } from "@/lib/toast";

export default function Kanban() {
  const [socket, setSocket] = useState(null);
  const [columns, setColumns] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [listColumns, setListColumns] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [projectInfo, setProjectInfo] = useState("");
  const { projectId } = useParams();

  const [showCompleteProjectDialog, setShowCompleteProjectDialog] =
    useState(false);

  const { role } = useAuthStore();
  const isManager = role === "manager";

  const token = localStorage.getItem("token");

  const getProjectInfo = async () => {
    setLoadingState(true);
    setLoadingText("Getting project info");
    try {
      const { data } = await api.get(`/project/${projectId}/details`);
      console.log(data);
      setProjectInfo(data.data.project);
    } catch (error) {
      console.error(error);
      toast(error.response?.data?.message || "Failed to get project info", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const getColumns = async () => {
    setLoadingState(true);
    setLoadingText("Getting the columns...");
    try {
      const { data } = await api.get(`/task/columns?projectId=${projectId}`);
      console.log(data.data);
      setListColumns(data.data);
    } catch (error) {
      console.error(error);
      toast(error.response?.data?.message || "Failed to get columns", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const getTasks = async () => {
    setLoadingState(true);
    setLoadingText("Getting the tasks...");
    try {
      const { data } = await api.get(`task?projectId=${projectId}`);
      console.log(data.data);
      setColumns(data.data);
    } catch (error) {
      console.error(error);
      toast(error.response?.data?.message || "Failed to get tasks", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const addNewList = async () => {
    setLoadingState(true);
    setLoadingText("Add new list...");
    try {
      const { data } = await api.post("/task/column", {
        projectId: projectId,
        name: newListName,
      });

      if (data.success) {
        getTasks();
      }
    } catch (error) {
      console.error(error);
      toast(error.response?.data?.message || "Failed to add list", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setNewListName("");
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const fromColumnKey = source.droppableId;
    const toColumnKey = destination.droppableId;
    const fromIndex = source.index;
    const toIndex = destination.index;
    console.log({ fromColumnKey, toColumnKey, fromIndex, toIndex });

    if (fromColumnKey === toColumnKey && fromIndex === toIndex) return;

    const task = columns[fromColumnKey].tasks[fromIndex];
    console.log(task);

    try {
      setLoadingState(true);
      setLoadingText("Moving Task...");
      const { data } = await api.patch("/task/move", {
        taskId: task._id,
        fromColumnKey,
        toColumnKey,
        fromIndex,
        toIndex,
      });

      console.log(data);
    } catch (error) {
      console.error(error);
      toast(error.response?.data?.message || "Failed to move task", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const handleComplete = async () => {
    // if (!confirm("Mark this project as completed?")) return;
    setLoadingState(true);
    setLoadingText("Mark project as completed...");
    try {
      const { data } = await api.put(`/project/${projectId}`, {
        status: "completed",
      });

      console.log(data);

      setProjectInfo((prev) => ({ ...prev, status: "completed" }));

      toast("Project completed successfully", {
        icon: <CircleCheckBig className="w-5 h-5 text-white" />,
        type: "success",
        position: "top-center",
        duration: 5000,
      });
    } catch (err) {
      console.error("Error completing project:", err);
      toast(err.response.data.message || "Failed to complete project", {
        type: "error",
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    getProjectInfo();
    getTasks();
    getColumns();
  }, [projectId]);

  useEffect(() => {
    const newSocket = io(
      import.meta.env.VITE_API_URL || "http://localhost:5000",
      {
        auth: { token },
      }
    );

    newSocket.emit("join:project", projectId);

    newSocket.on("column:created", ({ column }) => {
      console.log("New column created:", column);
      setColumns((prev) => ({
        ...prev,
        [column.key]: { ...column, tasks: [] },
      }));
      getColumns();
      toast(`Column ${column.name} has been created`, {
        icon: <CircleCheckBig className="w-5 h-5 text-white" />,
        type: "success",
        position: "bottom-right",
        duration: 5000,
      });
    });

    newSocket.on(
      "column:updated",
      ({ column, columnId, columnKey, updates }) => {
        console.log("Column updated:", {
          column,
          columnId,
          columnKey,
          updates,
        });
        setColumns((prev) => ({
          ...prev,
          [columnKey]: {
            ...prev[columnKey],
            ...updates,
            tasks: prev[columnKey]?.tasks || [],
          },
        }));
        getColumns();
        toast(`Column ${column.name} has renamed to ${updates.name}`, {
          icon: <CircleCheckBig className="w-5 h-5 text-white" />,
          type: "success",
          position: "bottom-right",
          duration: 5000,
        });
      }
    );

    newSocket.on(
      "column:deleted",
      ({ column, columnId, columnKey, movedTo }) => {
        console.log("Column deleted:", {
          column,
          columnId,
          columnKey,
          movedTo,
        });
        setColumns((prev) => {
          const newColumns = { ...prev };

          if (movedTo) {
            const movedTasks = newColumns[columnKey]?.tasks || [];
            newColumns[movedTo] = {
              ...newColumns[movedTo],
              tasks: [
                ...(newColumns[movedTo]?.tasks || []),
                ...movedTasks,
              ].sort((a, b) => a.order - b.order),
            };
          }
          delete newColumns[columnKey];

          return newColumns;
        });
        getColumns();
        toast(`Column ${column.name} has been deleted`, {
          icon: <CircleCheckBig className="w-5 h-5 text-white" />,
          type: "success",
          position: "bottom-right",
          duration: 5000,
        });
      }
    );

    newSocket.on("task:created", ({ task, columnKey }) => {
      console.log(task, columnKey);
      setColumns((prev) => ({
        ...prev,
        [columnKey]: {
          ...prev[columnKey],
          tasks: [
            ...prev[columnKey].tasks,
            {
              ...task,
              deadline: task.deadline ? new Date(task.deadline) : null,
            },
          ],
        },
      }));
      toast(
        `Task ${task.title} has been created on Column ${task.columnId.name}`,
        {
          icon: <CircleCheckBig className="w-5 h-5 text-white" />,
          type: "success",
          position: "bottom-right",
          duration: 5000,
        }
      );
    });

    newSocket.on(
      "task:moved",
      ({ task, taskId, fromColumnKey, toColumnKey, fromIndex, toIndex }) => {
        console.log("Task moved:", {
          task,
          taskId,
          fromColumnKey,
          toColumnKey,
          fromIndex,
          toIndex,
        });

        setColumns((prev) => {
          const newColumns = { ...prev };

          if (fromColumnKey === toColumnKey) {
            const tasks = [...(newColumns[fromColumnKey]?.tasks || [])];
            const [moved] = tasks.splice(fromIndex, 1);
            tasks.splice(toIndex, 0, moved);
            newColumns[fromColumnKey] = {
              ...newColumns[fromColumnKey],
              tasks,
            };
          } else {
            const fromTasks = [...(newColumns[fromColumnKey]?.tasks || [])];
            const toTasks = [...(newColumns[toColumnKey]?.tasks || [])];
            const [moved] = fromTasks.splice(fromIndex, 1);
            toTasks.splice(toIndex, 0, moved);
            newColumns[fromColumnKey] = {
              ...newColumns[fromColumnKey],
              tasks: fromTasks,
            };
            newColumns[toColumnKey] = {
              ...newColumns[toColumnKey],
              tasks: toTasks,
            };
          }
          return newColumns;
        });

        toast(`Task ${task.title} has been moved`, {
          icon: <CircleCheckBig className="w-5 h-5 text-white" />,
          type: "success",
          position: "bottom-right",
          duration: 5000,
        });
      }
    );

    newSocket.on("task:updated", ({ taskId, task, columnKey }) => {
      console.log("Task updated event received:", task);

      setColumns((prev) => {
        const newColumns = { ...prev };

        Object.keys(newColumns).forEach((key) => {
          const taskIndex = newColumns[key].tasks.findIndex(
            (t) => t._id === taskId
          );

          if (taskIndex !== -1) {
            newColumns[key].tasks[taskIndex] = {
              ...newColumns[key].tasks[taskIndex],
              ...task,
              deadline: task.deadline ? new Date(task.deadline) : null,
            };
          }
        });

        return newColumns;
      });

      toast(`Task ${task.title} has been updated`, {
        icon: <CircleCheckBig className="w-5 h-5 text-white" />,
        type: "success",
        position: "bottom-right",
        duration: 5000,
      });
    });

    newSocket.on("task:deleted", ({ task, taskId, columnKey }) => {
      console.log("Task deleted:", { task, taskId, columnKey });
      setColumns((prev) => {
        if (!prev[columnKey]) {
          console.warn(`Column ${columnKey} not found`);
          return prev;
        }

        return {
          ...prev,
          [columnKey]: {
            ...prev[columnKey],
            tasks: prev[columnKey].tasks.filter((task) => task._id !== taskId),
          },
        };
      });

      toast(`Task ${task.title} has been deleted`, {
        icon: <CircleCheckBig className="w-5 h-5 text-white" />,
        type: "success",
        position: "bottom-right",
        duration: 5000,
      });
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit("leave:project", projectId);
      newSocket.close();
    };
  }, []);

  return (
    <div className="p-4">
      <Loading status={loadingState} fullscreen text={loadingText} />
      <div className="flex justify-between items-center flex-wrap gap-3">
        <Link
          to="/projects"
          className={cn(
            "group inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors duration-200 hover:text-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-md px-1"
          )}
        >
          <MoveLeft
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1"
            aria-hidden="true"
          />
          <span className="whitespace-nowrap group-hover:underline">
            Back to Projects
          </span>
        </Link>

        {isManager ? (
          <Button
            onClick={() => setShowCompleteProjectDialog(true)}
            disabled={projectInfo.status === "completed"}
            className="px-6 py-2 bg-primer hover:bg-[#1f2e35] cursor-pointer disabled:opacity-70"
          >
            {projectInfo.status === "completed"
              ? "Completed"
              : "Complete the Project"}
          </Button>
        ) : (
          projectInfo.status === "completed" && (
            <span className="inline-flex items-center px-4 py-2 rounded-lg bg-green-100 text-green-700 text-sm font-medium">
              ✅ Project Completed
            </span>
          )
        )}
      </div>

      <div className="overflow-x-auto">
        <div className="flex gap-6 items-start px-2 py-4 min-w-max">
          <DragDropContext onDragEnd={onDragEnd}>
            {Object.entries(columns).length > 0
              ? Object.entries(columns).map(([key, column]) => (
                  <Column
                    key={key}
                    projectId={projectId}
                    droppableId={key}
                    column={column}
                    listColumns={listColumns}
                    className="shrink-0"
                  />
                ))
              : !isManager && (
                  <div className="flex items-center justify-center w-full h-64 text-gray-500 text-lg">
                    No task yet.
                  </div>
                )}
          </DragDropContext>

          {isManager && (
            <Card className="w-72 shrink-0 p-4">
              <div className="flex flex-col gap-2">
                <Input
                  placeholder="New list name..."
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
                <Button
                  onClick={addNewList}
                  className="w-full flex items-center justify-center gap-2 bg-primer cursor-pointer"
                >
                  <CirclePlus size={18} />
                  Add list
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={showCompleteProjectDialog}
        onOpenChange={setShowCompleteProjectDialog}
        title="Are you sure to complete this project?"
        description="This action can't be undo."
        confirmText="Complete Project"
        cancelText="Cancel"
        onConfirm={handleComplete}
        confirmClassName="bg-primer hover:bg-primerh text-white cursor-pointer"
      />
    </div>
  );
}
