import { useEffect, useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  CirclePlus,
  Pencil,
  PlusCircle,
  Check,
  X,
  Save,
  Calendar as CalendarIcon,
  ChevronDown,
  Trash,
} from "lucide-react";
import { format, set } from "date-fns";

import TaskCard from "@/components/kanban/TaskCard";

// shadcn/ui components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import api from "@/api/axios";
import { useAssigneeStore } from "@/store/useAssigneeStore";
import { SkillSelector } from "../SkillSelector";
import Loading from "@/components/Loading";
import { toast } from "@/lib/toast";

const Column = ({
  projectId,
  droppableId,
  column,
  listColumns,
  className = "",
}) => {
  const defaultTask = {
    projectId: "",
    columnKey: "",
    title: "",
    description: "",
    skills: [],
    status: "todo",
    deadline: "",
    assignedTo: "",
  };

  const [skills, setSkills] = useState([]);
  const [openAddTask, setOpenAddTask] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [newTask, setNewTask] = useState(defaultTask);
  const [isEdited, setIsEdited] = useState(false);
  const [columnName, setColumnName] = useState(column.name);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [moveToColumn, setMoveToColumn] = useState("");

  const { listAssigneeProject, fetchAssigneeProject } = useAssigneeStore();

  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const handleSelectChange = (field, value) => {
    setNewTask((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setNewTask((prev) => ({
      ...prev,
      deadline: date ? format(date, "yyyy-MM-dd") : "",
    }));
    setOpenCalendar(false);
  };

  const addTask = async () => {
    // if (!newTask.trim()) return;
    setLoadingState(true);
    setLoadingText("Creating new task...");
    const columnDetail = listColumns.filter((col) => col._id === column._id);
    console.log(columnDetail[0].key);
    const formData = {
      ...newTask,
      columnKey: columnDetail[0].key,
      skills: skills.map((s) => s._id),
      projectId: projectId,
    };

    console.log(formData);
    try {
      const { data } = await api.post("/task", formData);
      console.log(data);
      setOpenAddTask(false);
    } catch (error) {
      console.error(error);
      toast(error.response?.data?.message || "Failed to add task", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const editColumn = async () => {
    console.log("edit column", columnName);
    setLoadingState(true);
    setLoadingText("Editing the column...");
    try {
      const { data } = await api.patch("/task/column", {
        columnId: column._id,
        name: columnName,
      });
      if (data.success) {
        setIsEdited(false);
      }
    } catch (error) {
      console.error(error);
      toast(error.response?.data?.message || "Failed to edit columns", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const deleteColumn = async () => {
    setLoadingState(true);
    setLoadingText("Deleting the column...");
    try {
      const url = moveToColumn
        ? `/task/column/${column._id}?moveTasksTo=${moveToColumn}`
        : `/task/column/${column._id}`;

      console.log("delete column", url);

      await api.delete(url);
      setShowDeleteDialog(false);
      // UI updates via socket
    } catch (error) {
      console.error("Failed to delete column:", error);
      toast(error.response?.data?.message || "Failed to delete column", {
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
    fetchAssigneeProject(projectId);
  }, [projectId]);

  return (
    <div className={`w-72 ${className}`}>
      <Loading status={loadingState} fullscreen text={loadingText} />

      <Card className="bg-white p-5">
        <div className="flex items-center justify-between mb-3">
          {isEdited ? (
            <div className="flex items-center w-full space-x-2">
              <Input
                value={columnName}
                onChange={(e) => setColumnName(e.target.value)}
                className="flex-1"
                autoFocus
              />
              <Button
                onClick={editColumn}
                className="bg-primer flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save size={16} />
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEdited(false);
                }}
                className="cursor-pointer"
              >
                <X size={16} />
              </Button>
            </div>
          ) : (
            <>
              <h3 className="text-lg font-semibold text-gray-800">
                {column.name}
              </h3>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setIsEdited(!isEdited)}
                  className="p-1 rounded hover:bg-gray-100 cursor-pointer"
                >
                  <Pencil />
                </Button>
                <Button
                  variant="outline"
                  size="icon-sm"
                  onClick={() => setShowDeleteDialog(true)}
                  className="p-1 rounded text-red-500 hover:text-red-700  cursor-pointer"
                >
                  <Trash />
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Droppable + Scrollable area */}
        <Droppable droppableId={droppableId}>
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`rounded-md transition-colors ${
                snapshot.isDraggingOver ? "bg-blue-50" : "bg-white"
              }`}
              style={{ overflow: "hidden" }}
            >
              <ScrollArea className="h-[60vh]">
                <div className="space-y-2 w-61">
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
                          <TaskCard task={task} projectId={projectId} />
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
        <div className="mt-3">
          <Dialog
            open={openAddTask}
            onOpenChange={(isOpen) => {
              setOpenAddTask(isOpen);

              if (!isOpen) {
                setNewTask(defaultTask);
                setSkills([]);
                setSelectedDate(null);
              }
            }}
          >
            <DialogTrigger asChild>
              <Button className="w-full flex items-center justify-center gap-2 bg-primer cursor-pointer">
                <CirclePlus size={18} />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              {/* <form onSubmit={addTask}> */}
              <DialogHeader>
                <DialogTitle>Add New Task</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4">
                <div className="grid gap-3">
                  <Label htmlFor="title-1">Task Name</Label>
                  <Input
                    id="title-1"
                    name="title"
                    placeholder="Add JWT Authorization"
                    value={newTask.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="description-1">Description</Label>
                  <Textarea
                    id="description-1"
                    name="description"
                    placeholder="Type the description of the task."
                    value={newTask.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="deadline-1">Deadline</Label>
                  <Popover open={openCalendar} onOpenChange={setOpenCalendar}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <CalendarIcon />
                          <span>
                            {selectedDate
                              ? format(selectedDate, "PPP")
                              : "Select Deadline"}
                          </span>
                        </div>
                        <ChevronDown />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={handleDateChange}
                        id="deadline-1"
                        value={newTask.deadline}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="assignee-1">Assignee</Label>
                  <Select
                    value={newTask.position}
                    onValueChange={(value) =>
                      handleSelectChange("assignedTo", value)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue
                        placeholder="Select Employee"
                        value={newTask.assignedTo}
                        required
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {listAssigneeProject.map((employee) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-3">
                  <Label htmlFor="name-1">Skills</Label>
                  <SkillSelector
                    selectedSkills={skills}
                    onChange={setSkills}
                    isEditing={true}
                    className="max-h-12"
                    allowCustomAdd
                  />
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="cursor-pointer">
                    Cancel
                  </Button>
                </DialogClose>
                <Button onClick={addTask} className="bg-primer cursor-pointer">
                  Add Task
                </Button>
              </DialogFooter>
              {/* </form> */}
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Column "{column.name}"?</AlertDialogTitle>

            {/* ✅ Only plain text inside AlertDialogDescription */}
            <AlertDialogDescription>
              {column.tasks?.length > 0
                ? "This column has tasks. Please choose where to move them."
                : "This column is empty and will be permanently deleted."}
            </AlertDialogDescription>

            {/* ✅ Put complex layout OUTSIDE */}
            {column.tasks?.length > 0 && (
              <div className="space-y-4 mt-3">
                <p className="text-sm text-gray-600">
                  This column has {column.tasks.length} task(s). Where should
                  they be moved?
                </p>
                <select
                  className="w-full p-2 border rounded"
                  value={moveToColumn}
                  onChange={(e) => setMoveToColumn(e.target.value)}
                >
                  <option value="">Select a column...</option>
                  {listColumns
                    .filter((col) => col._id !== column._id)
                    .map((col) => (
                      <option key={col.key} value={col.key}>
                        {col.key} - {col.name}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteColumn}
              disabled={column.tasks?.length > 0 && !moveToColumn}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Column
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Column;
