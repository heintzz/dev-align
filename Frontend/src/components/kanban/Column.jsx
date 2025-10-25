import { useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import { TextInput, Button } from "flowbite-react";
import { IoAddCircleOutline } from "react-icons/io5";
import { GrEdit } from "react-icons/gr";
import TaskCard from "@/components/kanban/TaskCard";

const Column = ({ droppableId, column, updateColumn }) => {
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
    <div className="bg-white rounded-xl border border-indigo-500 shadow-md p-4 w-72 h-fit">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-700">{column.name}</h2>
        <button className="p-2 hover:bg-gray-100 rounded">
          <GrEdit />
        </button>
      </div>

      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className={`min-h-[100px] max-h-[70vh] overflow-y-auto p-2 rounded transition-colors ${
              snapshot.isDraggingOver ? "bg-blue-50" : "bg-white"
            }`}
          >
            {column.tasks.map((task, index) => (
              <Draggable
                key={`${droppableId}-${index}-${task.title}`}
                draggableId={`${droppableId}-${index}-${task.title}`}
                index={index}
              >
                {(provided) => (
                  <div
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef}
                    className="mb-2"
                  >
                    <TaskCard task={task} onDelete={() => deleteTask(index)} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>

      <div className="mt-4 flex gap-2">
        <TextInput
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          placeholder="New task..."
        />
        <Button onClick={addTask} className="flex items-center justify-center">
          <IoAddCircleOutline size={20} />
        </Button>
      </div>
    </div>
  );
};

export default Column;
