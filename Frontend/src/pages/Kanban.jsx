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
import { CirclePlus } from "lucide-react";

import { useSkillStore } from "@/store/useSkillStore";
import { useAssigneeStore } from "@/store/useAssigneeStore";

export default function Kanban() {
  const [socket, setSocket] = useState(null);
  const [columns, setColumns] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const { projectId } = useParams();

  const { listSkills, fetchSkills } = useSkillStore();

  const token = localStorage.getItem("token");

  const getTasks = async () => {
    try {
      const { data } = await api.get(`task?projectId=${projectId}`);
      // console.log(data);
      setColumns(data.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addNewList = async () => {
    const key = newListName.trim().toLowerCase().replace(/\s+/g, "-");
    // console.log(key);
    if (!key || columns[key]) return;

    try {
      const { data } = await api.post("/task/column", {
        projectId: projectId,
        key,
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

  const updateColumn = (colKey, tasks) => {
    setColumns((prev) => ({
      ...prev,
      [colKey]: { ...prev[colKey], tasks },
    }));
  };

  const onDragEnd = async (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const fromColumnKey = source.droppableId;
    const toColumnKey = destination.droppableId;
    const fromIndex = source.index;
    const toIndex = destination.index;
    console.log({ fromColumnKey, toColumnKey, fromIndex, toIndex });
    // Don't do anything if dropped in same position
    if (fromColumnKey === toColumnKey && fromIndex === toIndex) return;

    // Get the task being moved
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
  }, [projectId]);

  useEffect(() => {
    // Setup Socket.IO
    const newSocket = io("http://localhost:5000", {
      auth: { token },
    });

    newSocket.emit("join:project", projectId);

    // Listen for real-time updates
    newSocket.on("task:created", ({ task, columnKey }) => {
      console.log(task);
      // console.log(columnKey);
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
    });

    newSocket.on(
      "task:moved",
      ({ taskId, fromColumnKey, toColumnKey, fromIndex, toIndex }) => {
        console.log("Task moved:", {
          taskId,
          fromColumnKey,
          toColumnKey,
          fromIndex,
          toIndex,
        });

        setColumns((prev) => {
          const newColumns = { ...prev };

          if (fromColumnKey === toColumnKey) {
            // Same column reorder
            const tasks = [...(newColumns[fromColumnKey]?.tasks || [])];
            const [moved] = tasks.splice(fromIndex, 1);
            tasks.splice(toIndex, 0, moved);
            newColumns[fromColumnKey] = {
              ...newColumns[fromColumnKey],
              tasks,
            };
          } else {
            // Different columns
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
      }
    );

    newSocket.on("task:updated", ({ taskId, task, columnKey }) => {
      console.log("Task updated event received:", task);

      setColumns((prev) => {
        const newColumns = { ...prev };

        // Find and update the task in all columns
        Object.keys(newColumns).forEach((key) => {
          const taskIndex = newColumns[key].tasks.findIndex(
            (t) => t._id === taskId
          );

          if (taskIndex !== -1) {
            // Update the task
            newColumns[key].tasks[taskIndex] = {
              ...newColumns[key].tasks[taskIndex],
              ...task,
              deadline: task.deadline ? new Date(task.deadline) : null,
            };
          }
        });

        return newColumns;
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
                  listSkills={listSkills}
                  className="shrink-0"
                />
                <p>{key}</p>
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
