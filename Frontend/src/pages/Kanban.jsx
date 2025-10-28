import { useState } from "react";
import { DragDropContext } from "@hello-pangea/dnd";
import { CirclePlus } from "lucide-react";

import Column from "@/components/kanban/Column";

// shadcn/ui components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function Kanban() {
  const [columns, setColumns] = useState({
    backlog: {
      name: "Backlog",
      tasks: [
        { title: "Buy groceries", status: "todo", deadline: "20-07-2025" },
        { title: "Finish report", status: "todo", deadline: "20-07-2025" },
      ],
    },
    staging: {
      name: "Staging",
      tasks: [
        {
          title: "Build Kanban app",
          status: "in-progress",
          deadline: "20-07-2025",
        },
      ],
    },
    onTesting: {
      name: "On Testing",
      tasks: [{ title: "Learn React", status: "done", deadline: "20-07-2025" }],
    },
    deployed: {
      name: "Deployed",
      tasks: [{ title: "Learn React", status: "done", deadline: "20-07-2025" }],
    },
  });

  const [newListName, setNewListName] = useState("");

  const addNewList = () => {
    const key = newListName.trim().toLowerCase().replace(/\s+/g, "-");
    if (!key || columns[key]) return;

    setColumns((prev) => ({
      ...prev,
      [key]: { name: newListName, tasks: [] },
    }));
    setNewListName("");
  };

  const updateColumn = (colKey, tasks) => {
    setColumns((prev) => ({
      ...prev,
      [colKey]: { ...prev[colKey], tasks },
    }));
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    // same column reorder
    if (source.droppableId === destination.droppableId) {
      const column = columns[source.droppableId];
      const copied = [...column.tasks];
      const [moved] = copied.splice(source.index, 1);
      copied.splice(destination.index, 0, moved);
      updateColumn(source.droppableId, copied);
      return;
    }

    // move between columns
    const fromCol = columns[source.droppableId];
    const toCol = columns[destination.droppableId];
    const fromTasks = [...fromCol.tasks];
    const toTasks = [...toCol.tasks];
    const [moved] = fromTasks.splice(source.index, 1);
    toTasks.splice(destination.index, 0, moved);
    updateColumn(source.droppableId, fromTasks);
    updateColumn(destination.droppableId, toTasks);
  };

  return (
    <div className="min-h-screen p-4 bg-[url('/assets/images/kanbanBG.jpg')] bg-cover bg-fixed">
      {/* Responsive wrapper:
          - horizontal scroll on small screens (mobile)
          - spacing and wrapping behavior on larger screens */}
      <div className="overflow-x-auto">
        <div className="flex gap-6 items-start px-2 py-4 min-w-max">
          <DragDropContext onDragEnd={onDragEnd}>
            {Object.entries(columns).map(([key, column]) => (
              <Column
                key={key}
                droppableId={key}
                column={column}
                updateColumn={updateColumn}
                className="shrink-0"
              />
            ))}
          </DragDropContext>

          {/* Add new list card */}
          <Card className="w-72 shrink-0 p-4">
            <div className="flex flex-col gap-2">
              <Input
                placeholder="New list name..."
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
              />
              <Button
                onClick={addNewList}
                className="w-full flex items-center justify-center gap-2"
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
