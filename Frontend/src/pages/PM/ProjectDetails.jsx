/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/store/useAuthStore";
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
import projectService from "../../services/project.service";
import { Button } from "@/components/ui/button";
import { CircleCheckBig, Trash } from "lucide-react";
import { toast } from "@/lib/toast";

// ─── Utility Helpers ──────────────────────────────────────────────
const getStatusColor = (status) => {
  switch (status) {
    case "completed":
      return "bg-green-100 text-green-700";
    case "active":
      return "bg-blue-100 text-blue-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

const getStatusText = (status) =>
  status === "completed" ? "Completed" : "In Progress";

const formatDate = (dateString) =>
  dateString
    ? new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not set";

export default function ProjectDetailsDialog({
  projectId,
  isOpen,
  onClose,
  onProjectUpdated,
}) {
  const { role } = useAuthStore();
  const isHR = role === "hr";
  const [project, setProject] = useState(null);
  const [manager, setManager] = useState(null);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    deadline: "",
  });

  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [allEmployees, setAllEmployees] = useState([]);
  const [addEmployeeId, setAddEmployeeId] = useState("");

  // ─── Initial Load Effect ──────────────────────────────────────────────
  useEffect(() => {
    if (!isOpen || !projectId) {
      if (!isOpen) {
        setProject(null);
        setIsLoading(true);
      }
      return;
    }

    const loadData = async () => {
      setIsLoading(true);

      try {
        const [projectRes, tasksRes, skillsRes, employeesRes] =
          await Promise.allSettled([
            projectService.getProjectById(projectId),
            projectService.getProjectTasks(projectId),
            projectService.getAllSkills(),
            projectService.getAllEmployees(),
          ]);

        // 1. Project info
        if (projectRes.status === "fulfilled") {
          const data = projectRes.value.data;
          if (!data?.project) throw new Error("Invalid project data");

          const p = data.project;
          setProject(p);
          setFormData({
            name: p.name || "",
            description: p.description || "",
            startDate: p.startDate?.split("T")[0] || "",
            deadline: p.deadline?.split("T")[0] || "",
          });
          setManager(data.managerDetails || null);
          setStaff(data.staffDetails || []);
        }

        // 2. Extract used skills from project tasks
        if (tasksRes.status === "fulfilled") {
          const tasks = tasksRes.value || [];
          const skillMap = new Map();
          tasks.forEach((t) =>
            (t.requiredSkills || []).forEach((s) => {
              const id = s._id || s.id || s._id?.toString();
              if (!skillMap.has(id))
                skillMap.set(id, { _id: id, name: s.name });
            })
          );
          setSelectedSkills([...skillMap.values()]);
        } else {
          setSelectedSkills([]);
        }

        // 3. All skills
        if (skillsRes.status === "fulfilled") {
          const skills = skillsRes.value.skills || skillsRes.value || [];
          setAllSkills(skills);
        }

        // 4. All employees
        if (employeesRes.status === "fulfilled") {
          setAllEmployees(employeesRes.value || []);
        }
      } catch (err) {
        console.error("Error fetching project details:", err);
        toast(err.response.data.message || "Failed to fetch project details", {
          type: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [isOpen, projectId]);

  // ─── Handlers ──────────────────────────────────────────────
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await projectService.updateProject(projectId, {
        name: formData.name,
        description: formData.description,
        deadline: formData.deadline,
        skills: selectedSkills.map((s) => s._id),
      });

      // Fetch fresh project data
      const response = await projectService.getProjectById(projectId);
      const data = response.data;

      if (data?.project) {
        const p = data.project;
        setProject(p);
        setFormData({
          name: p.name || "",
          description: p.description || "",
          startDate: p.startDate?.split("T")[0] || "",
          deadline: p.deadline?.split("T")[0] || "",
        });
        setManager(data.managerDetails || null);
        setStaff(data.staffDetails || []);
      }

      onProjectUpdated?.();

      toast(`Project successfully updated`, {
        icon: <CircleCheckBig className="w-5 h-5 text-white" />,
        type: "success",
        position: "top-center",
        duration: 5000,
      });
    } catch (err) {
      console.error("Error updating project:", err);
      toast(err.response.data.message || "Failed to update project", {
        type: "error",
      });
    } finally {
      setIsSaving(false);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await projectService.deleteProject(projectId);
      toast("Project deleted successfully", {
        icon: <CircleCheckBig className="w-5 h-5 text-white" />,
        type: "success",
        position: "top-center",
        duration: 5000,
      });
      onProjectUpdated?.();
      onClose();
    } catch (err) {
      console.error("Error deleting project:", err);
      toast(err.response.data.message || "Failed to delete project", {
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!confirm("Mark this project as completed?")) return;
    setIsLoading(true);
    try {
      const res = await projectService.updateProjectStatus(
        projectId,
        "completed"
      );

      // Update local state directly
      setProject((prev) => ({ ...prev, status: "completed" }));

      onProjectUpdated?.(res?.data);
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
      setIsLoading(false);
    }
  };

  // ─── Render ──────────────────────────────────────────────
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {isLoading || isSaving ? (
            <div className="py-12 text-center">
              <p className="text-gray-500">Loading project details...</p>
            </div>
          ) : project ? (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold mr-10">
                  {isEditing ? (
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <>
                      {project.name}
                      {!isHR && (
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setShowDeleteDialog(true)}
                          disabled={project.status === "completed"}
                          className="ml-2 p-1 text-red-500 hover:text-red-700 cursor-pointer"
                        >
                          <Trash />
                        </Button>
                      )}
                    </>
                  )}
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 py-4">
                {/* Description */}
                <div>
                  {isEditing ? (
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-600">{project.description}</p>
                  )}
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <span className="font-medium">Start Date</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {formatDate(project.startDate)}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <span className="font-medium">Project Deadline</span>
                    </div>
                    {isEditing ? (
                      <input
                        type="date"
                        name="deadline"
                        value={formData.deadline}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <p className="text-gray-900">
                        {formatDate(project.deadline)}
                      </p>
                    )}
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <span className="font-medium">Number of Members</span>
                    </div>
                    <p className="text-gray-900">
                      {project?.teamMemberCount || 0}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 text-gray-600 mb-2">
                      <span className="font-medium">Project Status</span>
                    </div>
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(
                        project.status
                      )}`}
                    >
                      {getStatusText(project.status)}
                    </span>
                  </div>
                </div>

                {/* Skills Used */}
                <div>
                  {!isHR && (
                    <>
                      <h3 className="font-semibold text-gray-900 mb-3">
                        Skills Used
                      </h3>
                      <div className="flex flex-wrap gap-2 mb-4 max-h-24 overflow-auto">
                        {selectedSkills && selectedSkills.length > 0 ? (
                          selectedSkills.map((skill) => (
                            <span
                              key={skill._id}
                              className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-800"
                            >
                              {skill.name}
                            </span>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500">
                            No skills recorded
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  <h3 className="font-semibold text-gray-900 mb-3">
                    Team Members
                  </h3>
                  <div className="space-y-1">
                    {staff && staff.length > 0 ? (
                      staff.map((member) => (
                        <p key={member._id} className="text-sm text-gray-700">
                          {member.name} - {member.position?.name || "N/A"}{" "}
                          {member.isTechLead && (
                            <span className="text-xs text-blue-600">
                              (Tech Lead)
                            </span>
                          )}
                        </p>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500">
                        No team members assigned
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4 border-t">
                {!isHR &&
                  (isEditing ? (
                    <>
                      <button
                        onClick={() => setIsEditing(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex-1 px-4 py-2 bg-[#2C3F48] text-white rounded-lg hover:bg-[#1F2E35] font-medium disabled:opacity-50 cursor-pointer"
                      >
                        {isSaving ? "Saving..." : "Save Changes"}
                      </button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => setIsEditing(true)}
                        disabled={project.status === "completed"}
                        className="cursor-pointer"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={handleComplete}
                        disabled={project.status === "completed"}
                        className="flex-1 px-6 py-2 bg-primer cursor-pointer"
                      >
                        {project.status === "completed"
                          ? "Completed"
                          : "Complete the Project"}
                      </Button>
                    </>
                  ))}
              </div>
            </>
          ) : (
            <div className="py-12 text-center">
              <p className="text-gray-500">Project not found</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure to delete this project?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This project will be permanently deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 cursor-pointer"
            >
              Delete Project
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
