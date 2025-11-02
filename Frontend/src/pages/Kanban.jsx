import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import api from "@/api/axios";

import { DragDropContext } from "@hello-pangea/dnd";
import Column from "@/components/kanban/Column";

// shadcn/ui components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import Loading from "@/components/Loading";

import { toast } from "@/lib/toast";
import { CirclePlus, CircleCheckBig } from "lucide-react";

import { useSkillStore } from "@/store/useSkillStore";
import { useAssigneeStore } from "@/store/useAssigneeStore";
import { set } from "date-fns";

export default function Kanban() {
  const [socket, setSocket] = useState(null);
  const [columns, setColumns] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [listColumns, setListColumns] = useState([]);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const { projectId } = useParams();

  const { listSkills, fetchSkills } = useSkillStore();

  const token = localStorage.getItem("token");

  const getColumns = async () => {
    try {
      const { data } = await api.get(`/task/columns?projectId=${projectId}`);
      console.log(data.data);
      setListColumns(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const getTasks = async () => {
    try {
      const { data } = await api.get(`task?projectId=${projectId}`);
      console.log(data.data);
      setColumns(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addNewList = async () => {
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
    } finally {
      setNewListName("");
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
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  useEffect(() => {
    getTasks();
    fetchSkills();
    getColumns();
  }, [projectId]);

  useEffect(() => {
    const newSocket = io("http://localhost:5000", {
      auth: { token },
    });

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
      {/* <Toaster /> */}
      <Loading status={loadingState} fullscreen text={loadingText} />

      <div className="overflow-x-auto">
        <div className="flex gap-6 items-start px-2 py-4 min-w-max">
          <DragDropContext onDragEnd={onDragEnd}>
            {Object.entries(columns).map(([key, column]) => (
              <>
                <Column
                  key={key}
                  projectId={projectId}
                  droppableId={key}
                  column={column}
                  listColumns={listColumns}
                  listSkills={listSkills}
                  className="shrink-0"
                />
              </>
            ))}
          </DragDropContext>

          <Card className="w-72 shrink-0 p-4">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="New list name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <Button
                onClick={addNewList}
                className="w-full flex items-center justify-center gap-2 bg-primer"
              >
                <CirclePlus size={18} />
                Add list
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
