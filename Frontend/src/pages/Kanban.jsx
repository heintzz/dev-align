// Kanban.jsx rewritten using Flowbite React components
import { useState } from "react";
import { IoAddCircleOutline } from "react-icons/io5";
import { DragDropContext } from "@hello-pangea/dnd";
import { Card, Button, TextInput } from "flowbite-react";
import Column from "@/components/kanban/Column";

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
      [key]: {
        name: newListName,
        tasks: [],
      },
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

    if (source.droppableId === destination.droppableId) {
      const column = columns[source.droppableId];
      const copiedTasks = [...column.tasks];
      const [moved] = copiedTasks.splice(source.index, 1);
      copiedTasks.splice(destination.index, 0, moved);
      updateColumn(source.droppableId, copiedTasks);
    } else {
      const fromColumn = columns[source.droppableId];
      const toColumn = columns[destination.droppableId];
      const fromTasks = [...fromColumn.tasks];
      const toTasks = [...toColumn.tasks];
      const [moved] = fromTasks.splice(source.index, 1);
      toTasks.splice(destination.index, 0, moved);
      updateColumn(source.droppableId, fromTasks);
      updateColumn(destination.droppableId, toTasks);
    }
  };

  return (
    <div className="h-screen overflow-x-auto overflow-y-hidden scroll-smooth bg-[url('@/assets/images/kanbanBG.jpg')] bg-cover bg-fixed p-6">
      <div className="flex space-x-6 p-6 min-w-max">
        <DragDropContext onDragEnd={onDragEnd}>
          {Object.entries(columns).map(([key, column]) => (
            <Column
              key={key}
              droppableId={key}
              column={column}
              updateColumn={updateColumn}
            />
          ))}
        </DragDropContext>

        <Card className="w-80 max-h-28 border border-indigo-500 bg-white p-4">
          <div className="flex flex-col gap-2">
            <TextInput
              placeholder="New list name..."
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
            />
            <Button
              onClick={addNewList}
              className="w-full flex items-center justify-center gap-2"
            >
              <IoAddCircleOutline size={20} /> Add list
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
