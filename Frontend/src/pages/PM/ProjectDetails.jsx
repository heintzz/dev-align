/* eslint-disable no-unused-vars */

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import projectService from "../../services/project.service";

export default function ProjectDetailsDialog({
  projectId,
  isOpen,
  onClose,
  onProjectUpdated,
}) {
  const [project, setProject] = useState(null);
  const [manager, setManager] = useState(null);
  const [staff, setStaff] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    startDate: "",
    deadline: "",
  });

  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);

  //  Fetch project details
  useEffect(() => {
    if (isOpen && projectId) {
      fetchProjectDetails();
    }
  }, [isOpen, projectId]);

  const fetchProjectDetails = async () => {
    setIsLoading(true);
    try {
      const projectData = await projectService.getProjectById(projectId);
      setProject(projectData);
      setFormData({
        name: projectData.name,
        description: projectData.description,
        startDate: projectData.startDate?.split("T")[0] || "",
        deadline: projectData.deadline?.split("T")[0] || "",
      });
    } catch (error) {
      console.error("Error fetching project details:", error);
      alert(error.message || "Failed to fetch project details");
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSkillToggle = (skill) => {
    if (selectedSkills.find((s) => s._id === skill._id)) {
      setSelectedSkills(selectedSkills.filter((s) => s._id !== skill._id));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  //  Save updated project
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updateData = {
        name: formData.name,
        description: formData.description,
        deadline: formData.deadline,
      };
      await projectService.updateProject(projectId, updateData);
      alert("Project updated successfully!");
      setIsEditing(false);
      await fetchProjectDetails();
      if (onProjectUpdated) onProjectUpdated();
    } catch (error) {
      console.error("Error updating project:", error);
      alert(error.message || "Failed to update project");
    } finally {
      setIsSaving(false);
    }
  };

  // Delete project
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await projectService.deleteProject(projectId);
      alert("Project deleted successfully!");
      onClose();
      if (onProjectUpdated) onProjectUpdated();
    } catch (error) {
      console.error("Error deleting project:", error);
      alert(error.message || "Failed to delete project");
    }
  };

  //  Mark as complete
  const handleComplete = async () => {
    if (!confirm("Mark this project as completed?")) return;
    try {
      await projectService.updateProjectStatus(projectId, "completed");
      alert("Project marked as completed!");
      await fetchProjectDetails();
      if (onProjectUpdated) onProjectUpdated();
    } catch (error) {
      console.error("Error completing project:", error);
      alert(error.message || "Failed to complete project");
    }
  };

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

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  //  Keep your original UI
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="py-12 text-center">
            <p className="text-gray-500">Loading project details...</p>
          </div>
        ) : project ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {isEditing ? (
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  project.name
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
                    {project.teamMemberCount || 0}
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
                <h3 className="font-semibold text-gray-900 mb-3">
                  Team Members
                </h3>
                <div className="space-y-1">
                  {staff.map((member) => (
                    <p key={member._id} className="text-sm text-gray-700">
                      {member.name} - {member.position?.name || "N/A"}{" "}
                      {member.isTechLead && (
                        <span className="text-xs text-blue-600">
                          (Tech Lead)
                        </span>
                      )}
                    </p>
                  ))}
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1 px-4 py-2 bg-[#2C3F48] text-white rounded-lg hover:bg-[#1F2E35] font-medium disabled:opacity-50"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleDelete}
                    className="px-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 font-medium"
                  >
                    Delete Project
                  </button>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleComplete}
                    disabled={project.status === "completed"}
                    className="flex-1 px-6 py-2 bg-[#2C3F48] text-white rounded-lg hover:bg-[#1F2E35] font-medium disabled:opacity-50"
                  >
                    {project.status === "completed"
                      ? "Completed"
                      : "Complete the Project"}
                  </button>
                </>
              )}
            </div>
          </>
        ) : (
          <div className="py-12 text-center">
            <p className="text-gray-500">Project not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
