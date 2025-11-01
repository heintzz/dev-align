import { useState } from "react";
import { format, differenceInDays } from "date-fns";

import { SkillSelector } from "@/components/SkillSelector";

// shadcn/ui components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

import {
  ClockPlus,
  ClockFading,
  ClockAlert,
  Pencil,
  Trash2,
  Save,
  X,
  User,
  ClipboardList,
  Layers3,
  CalendarDays,
  Calendar as CalendarIcon,
  ChevronDown,
} from "lucide-react";
import { useAssigneeStore } from "@/store/useAssigneeStore";
import api from "@/api/axios";

const TaskCard = ({ task, projectId }) => {
  const [openCalendar, setOpenCalendar] = useState(false);
  const [open, setOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    editedTask.deadline ? new Date(editedTask.deadline) : null
  );
  const [skills, setSkills] = useState(editedTask.requiredSkills || []);

  const { listAssigneeProject, fetchAssigneeProject } = useAssigneeStore();

  // console.log("task in TaskCard:", editedTask);
  // Handle field changes
  const handleChange = (field, value) => {
    setEditedTask((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setEditedTask((prev) => ({
      ...prev,
      deadline: date ? format(date, "yyyy-MM-dd") : "",
    }));
    setOpenCalendar(false);
  };

  // Handle save
  const handleSave = async () => {
    console.log("Saving task:", editedTask);

    const updatedTask = {
      ...editedTask,
      assignedTo: editedTask?.assignedUsers[0]?._id || [],
      taskId: editedTask._id,
      projectId,
      skills,
    };

    console.log("Updated task to be saved:", updatedTask);
    try {
      const { data } = await api.patch("/task", updatedTask);
      console.log("Task updated successfully:", data);
    } catch (error) {
      console.error("Error saving task:", error);
    } finally {
      setIsEditing(false);
      setOpen(false);
    }
  };

  // Handle delete
  const handleDelete = () => {
    onDelete?.(task.id);
    setConfirmDelete(false);
    setOpen(false);
  };

  return (
    <>
      <Card
        onClick={() => setOpen(true)}
        className="w-full shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing p-5"
      >
        <div className="flex flex-col gap-2 space-y-2">
          <div className="flex items-start justify-between">
            <p className="font-semibold text-gray-800 line-clamp-2">
              {task.title}
            </p>
          </div>

          <div
            className={`w-3/5 text-xs rounded border-2 p-1 ${(() => {
              if (!task.deadline) return "hidden";
              const diff = differenceInDays(task.deadline, new Date());
              if (diff > 3) return "border-green-400 text-green-600";
              if (diff >= 1 && diff <= 3)
                return "border-yellow-400 text-yellow-600";
              if (diff <= 0) return "border-red-400 text-red-600";
            })()}`}
          >
            {task.deadline ? (
              <div className="flex items-center gap-2">
                {(() => {
                  const diff = differenceInDays(task.deadline, new Date());
                  if (diff > 3) return <ClockPlus className="w-4 h-4" />;
                  if (diff >= 1 && diff <= 3)
                    return <ClockFading className="w-4 h-4" />;
                  if (diff <= 0) return <ClockAlert className="w-4 h-4" />;
                })()}
                {format(task.deadline, "PP")}
              </div>
            ) : null}
          </div>

          <div className="grid grid-cols-3  items-center">
            {(task.assignedUsers && task.assignedUsers.length > 0 && (
              <div className="col-span-2 flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                  {task.assignedUsers[0]?.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <p className="text-sm font-medium text-gray-700 truncate max-w-[80px]">
                  {task.assignedUsers[0]?.name}
                </p>
              </div>
            )) || (
              <div className="col-span-2 text-sm text-gray-500 italic">
                Unassigned
              </div>
            )}
            <div className="flex justify-end">
              {task.status ? (
                <Badge
                  className={`italic ${
                    task.status == "done"
                      ? "bg-green-300"
                      : task.status == "todo"
                      ? "bg-slate-300"
                      : "bg-blue-300"
                  }`}
                >
                  {task.status}
                </Badge>
              ) : null}
            </div>
          </div>
        </div>
      </Card>

      {/* --- Task Detail Dialog --- */}
      <Dialog
        open={open}
        onOpenChange={(isOpen) => {
          setOpen(isOpen);

          if (!isOpen) {
            setEditedTask(task);
            setSkills(task.requiredSkills || []);
            setIsEditing(false);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              {isEditing ? "Edit Task" : task.title}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? "Update the task details below."
                : "Detailed information about this task."}
            </DialogDescription>
          </DialogHeader>

          {/* --- VIEW MODE --- */}
          {!isEditing ? (
            <>
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-gray-400" />
                    {task.assignedUsers && task.assignedUsers.length > 0 ? (
                      <span>{task.assignedUsers[0].name}</span>
                    ) : (
                      <span className="italic text-gray-400">Unassigned</span>
                    )}
                  </div>
                  <Separator orientation="vertical" className="h-4" />
                  <div className="flex items-center gap-1">
                    <ClipboardList className="w-4 h-4 text-gray-400" />
                    <Badge
                      className={`capitalize ${
                        task.status === "done"
                          ? "bg-green-200 text-green-700"
                          : task.status === "todo"
                          ? "bg-slate-200 text-slate-700"
                          : "bg-blue-200 text-blue-700"
                      }`}
                    >
                      {task.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* --- Description --- */}
              {task.description && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">
                    Description
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-line">
                    {task.description}
                  </p>
                </div>
              )}

              {/* --- Required Skills --- */}
              {task.requiredSkills && task.requiredSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <Layers3 className="w-4 h-4 text-gray-500" />
                    Required Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {task.requiredSkills.map((skill) => (
                      <Badge
                        key={skill._id}
                        className="bg-primer/10 text-primer border border-primer/20 font-medium"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {/* --- Dates --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-semibold text-gray-700">
                      Created:
                    </span>{" "}
                    {task.createdAt
                      ? format(new Date(task.createdAt), "PPP")
                      : "Unknown"}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-gray-500" />
                  <div>
                    <span className="font-semibold text-gray-700">
                      Deadline:
                    </span>{" "}
                    {task.deadline ? (
                      format(new Date(task.deadline), "PPP")
                    ) : (
                      <span className="italic text-gray-400">No deadline</span>
                    )}
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* --- EDIT MODE --- */
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Title
                  </label>
                  <Input
                    placeholder="Enter task title"
                    value={editedTask.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    className="focus-visible:ring-primer"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Status
                  </label>
                  <Select
                    value={editedTask.status}
                    onValueChange={(v) => handleChange("status", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* === Description === */}
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Description
                </label>
                <Textarea
                  placeholder="Describe the task..."
                  value={editedTask.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  className="min-h-[100px] resize-y focus-visible:ring-primer"
                />
              </div>

              <Separator />

              {/* === Skills & Assigned To === */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Required Skills
                  </label>
                  <SkillSelector
                    selectedSkills={skills}
                    onChange={setSkills}
                    isEditing={isEditing}
                    className="max-h-12"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-1 block">
                    Assigned To
                  </label>
                  <Select
                    value={
                      editedTask.assignedUsers &&
                      editedTask.assignedUsers.length > 0
                        ? editedTask.assignedUsers[0]._id
                        : ""
                    }
                    onValueChange={(v) =>
                      handleChange("assignedUsers", [{ _id: v }])
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select assignee" />
                    </SelectTrigger>
                    <SelectContent>
                      {listAssigneeProject.map((assignee) => (
                        <SelectItem key={assignee._id} value={assignee._id}>
                          {assignee.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              {/* === Deadline === */}
              <div className="w-full md:w-1/2">
                <label className="text-sm font-semibold text-gray-700 mb-1 block">
                  Deadline
                </label>
                {/* <Input
                  type="date"
                  value={
                    editedTask.deadline
                      ? format(new Date(editedTask.deadline), "yyyy-MM-dd")
                      : ""
                  }
                  onChange={(e) =>
                    handleChange("deadline", new Date(e.target.value))
                  }
                  className="focus-visible:ring-primer"
                /> */}
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
                            : "Select deadline"}
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
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </>
          )}

          <DialogFooter>
            {isEditing ? (
              <div className="flex justify-end gap-2 w-full">
                <Button
                  variant="outline"
                  className="cursor-pointer"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedTask(task);
                    setSkills(task.requiredSkills || []);
                  }}
                >
                  <X className="w-4 h-4 mr-1" /> Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-primer cursor-pointer"
                >
                  <Save className="w-4 h-4 mr-1 " /> Save
                </Button>
              </div>
            ) : confirmDelete ? (
              <div className="text-center space-y-3">
                <p className="text-sm text-red-600">
                  Are you sure you want to delete this task?
                </p>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setConfirmDelete(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDelete}
                    className="cursor-pointer"
                  >
                    Yes, Delete
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex gap-2">
                {!isEditing && (
                  <>
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                      className="cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => setConfirmDelete(true)}
                      className="cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </>
                )}
              </div>
            )}
          </DialogFooter>

          {/* --- Delete Confirmation --- */}
          {/* {confirmDelete && (
            <div className="border-t pt-4 mt-4 text-center space-y-3">
              <p className="text-sm text-red-600">
                Are you sure you want to delete this task?
              </p>
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setConfirmDelete(false)}
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Yes, Delete
                </Button>
              </div>
            </div>
          )} */}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default TaskCard;
