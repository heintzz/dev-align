import { useEffect, useState } from "react";
import { Droppable, Draggable } from "@hello-pangea/dnd";
import {
  CirclePlus,
  Pencil,
  PlusCircle,
  Check,
  X,
  Calendar as CalendarIcon,
  ChevronDown,
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

const Column = ({
  projectId,
  droppableId,
  column,
  listSkills,
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

  const { listAssigneeProject, fetchAssigneeProject } = useAssigneeStore();

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

  const handleAddSkill = (skill) => {
    const isSelected = skills.some((s) => s._id === skill._id);
    const updatedSkills = isSelected
      ? skills.filter((s) => s._id !== skill._id)
      : [...skills, { _id: skill._id, name: skill.name }];
    setSkills(updatedSkills);
  };

  const handleRemoveSkill = (skill) => {
    setSkills((prev) => prev.filter((s) => s.name !== skill.name));
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
    const formData = {
      ...newTask,
      columnKey: column.name.trim().toLowerCase().replace(/\s+/g, "-"),
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
    }
  };

  useEffect(() => {
    fetchAssigneeProject(projectId);
  }, []);

  return (
    <div className={`w-72 ${className}`}>
      <Card className="bg-white p-5">
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
                        value={newTask.skills}
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between cursor-pointer"
                      >
                        Add skill
                        <PlusCircle className="ml-2 h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      className="w-[90vw] max-w-sm max-h-[50vh] overflow-y-auto"
                      align="start"
                    >
                      <DropdownMenuLabel>Available Skills</DropdownMenuLabel>
                      <DropdownMenuSeparator />

                      {listSkills.map((skill) => {
                        const isSelected = skills.some(
                          (s) => s.name === skill.name
                        );
                        return (
                          <DropdownMenuItem
                            key={skill.name}
                            onClick={() => handleAddSkill(skill)}
                            className={`flex justify-between items-center ${
                              isSelected ? "bg-primary/10 text-primary" : ""
                            }`}
                          >
                            <span>{skill.name}</span>
                            {isSelected && (
                              <Check className="h-4 w-4 text-primary" />
                            )}
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 max-h-14 overflow-y-auto">
                      {skills.map((skill) => (
                        <Badge
                          key={skill.name}
                          variant="secondary"
                          className="flex items-center gap-1"
                        >
                          {skill.name}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-destructive focus:outline-none cursor-pointer"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No skills added yet.
                    </p>
                  )}
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
    </div>
  );
};

export default Column;
