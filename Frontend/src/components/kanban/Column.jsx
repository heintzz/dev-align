import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { CirclePlus, Pencil } from "lucide-react";
import TaskCard from "@/components/kanban/TaskCard";

// shadcn/ui components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

const Column = ({ droppableId, column, updateColumn, className = "" }) => {
  const [newTask, setNewTask] = useState("");

  const addTask = () => {
    if (!newTask.trim()) return;
    const newTaskObj = {
      title: newTask,
      status: "todo",
      deadline: new Date().toLocaleDateString("en-GB"),
    };
    updateColumn(droppableId, [...column.tasks, newTaskObj]);
    setNewTask("");
  };

  const deleteTask = (index) => {
    updateColumn(
      droppableId,
      column.tasks.filter((_, i) => i !== index)
    );
  };

  return (
    <div className={`w-72 ${className}`}>
      <Card className="bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-800">{column.name}</h3>
          <button className="p-1 rounded hover:bg-gray-100">
            <Pencil />
          </button>
        </div>

        {/* Droppable + Scrollable area */}
        <Droppable droppableId={droppableId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`rounded-md p-2 transition-colors ${
                snapshot.isDraggingOver ? "bg-blue-50" : "bg-white"
              }`}
              style={{ maxHeight: "60vh", overflow: "hidden" }}
            >
              <ScrollArea className="h-[45vh]">
                <div className="space-y-2">
                  {column.tasks.map((task, index) => (
                    <Draggable
                      key={`${droppableId}-${index}-${task.title}`}
                      draggableId={`${droppableId}-${index}-${task.title}`}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="mb-2"
                        >
                          <TaskCard
                            task={task}
                            onDelete={() => deleteTask(index)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              </ScrollArea>
            </div>
          )}
        </Droppable>

        {/* Add task input */}
        <div className="mt-3 flex gap-2">
          <Input
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="New task..."
          />
          <Button onClick={addTask} variant="ghost" className="p-2">
            <CirclePlus size={18} />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Column;
