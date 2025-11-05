import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SkillSelector } from "@/components/SkillSelector";
import projectService from "../../services/project.service";
import { cn } from "@/lib/utils";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Loading from "@/components/Loading";
import { Checkbox } from "@/components/ui/checkbox";
import { CircleCheckBig } from "lucide-react";

export default function CreateProject() {
  const navigate = useNavigate();

  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    startDate: "",
    deadline: "",
  });

  // Skills state
  const [skills, setSkills] = useState([]);

  // Positions state
  const [positions, setPositions] = useState([]);
  const [teamPositions, setTeamPositions] = useState([]);
  const [positionInput, setPositionInput] = useState("");
  const [quantityInput, setQuantityInput] = useState(1);

  // Recommendations state
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch positions from database
  useEffect(() => {
    fetchPositions();
  }, []);

  // API - Fetch all positions from database
  const fetchPositions = async () => {
    try {
      const response = await projectService.getAllPositions();
      // Sesuaikan dengan struktur response dari controller: response.positions
      setPositions(response.positions || []);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPosition = () => {
    if (positionInput && quantityInput > 0) {
      const position = positions.find((p) => p._id === positionInput);
      if (position) {
        setTeamPositions([
          ...teamPositions,
          { ...position, quantity: quantityInput },
        ]);
        setPositionInput("");
        setQuantityInput(1);
      }
    }
  };

  const handleRemovePosition = (index) => {
    setTeamPositions(teamPositions.filter((_, i) => i !== index));
  };

  const handleGenerateRecommendations = async () => {
    setLoadingState(true);
    setLoadingText("Getting The Best Staff...");
    setIsGenerating(true);
    setEmployees([]); // Clear previous results

    try {
      // Validate required fields
      if (!formData.projectDescription.trim()) {
        throw new Error(
          "Project description is required for AI recommendations"
        );
      }

      if (teamPositions.length === 0) {
        throw new Error("At least one position must be specified");
      }

      console.log("Starting team recommendation generation...");

      // Format request data for AI endpoint
      const requestData = {
        description: formData.projectDescription,
        positions: teamPositions.map((p) => ({
          name: p.name,
          numOfRequest: p.quantity,
        })),
        skills: skills.map((s) => s.name),
      };

      console.log("Request data:", requestData);

      console.log("Calling AI recommendation endpoint...");
      const response = await projectService.getTeamRecommendations(requestData);

      console.log("AI Response:", response);

      if (!response || !response.data) {
        throw new Error("Invalid response from AI service");
      }

      // Transform AI recommendations (grouped by position) into flat array
      // and try to resolve each candidate to a real user ID from backend employees
      console.log("Fetching employee list for matching...");
      let backendEmployees = [];
      try {
        backendEmployees = await projectService.getAllEmployees();
        console.log("Backend employees:", backendEmployees);
      } catch (err) {
        console.warn("Could not fetch full employee list:", err);
      }

      const backendMap = new Map();
      backendEmployees.forEach((emp) => {
        const key = `${(emp.name || "").toLowerCase()}|${(
          (emp.position && emp.position.name) ||
          ""
        ).toLowerCase()}`;
        backendMap.set(key, emp._id || emp.id || emp.id);
      });

      const transformedEmployees = [];
      Object.entries(response.data).forEach(([positionName, candidates]) => {
        candidates.forEach((candidate) => {
          const normalizedKey = `${(candidate.name || "").toLowerCase()}|${(
            positionName || ""
          ).toLowerCase()}`;

          const resolvedId = backendMap.get(normalizedKey) || null;

          transformedEmployees.push({
            _id: resolvedId || candidate._id || `temp_${Math.random()}`, // prefer real ID
            name: candidate.name,
            position: { name: positionName },
            skills: (candidate.skills || []).map((skill) => ({ name: skill })),
            currentWorkload: Math.round(
              (1 - (candidate.currentWorkload || 0)) * 100
            ),
            availability:
              (candidate.currentWorkload || 0) > 0.7
                ? "Available"
                : (candidate.currentWorkload || 0) > 0.3
                ? "Partially Available"
                : "Unavailable",
            matchingPercentage: Math.round(
              (candidate.matchingPercentage || 0) * 100
            ),
            aiRank: candidate.rank,
            aiReason: candidate.reason,
            isResolved: !!resolvedId,
          });
        });
      });

      setEmployees(transformedEmployees);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      if (error.response) {
        console.error("Error response:", error.response);
        console.error("Error data:", error.response.data);
        alert(
          `Error: ${
            error.response.data?.message ||
            error.message ||
            "Failed to generate recommendations"
          }`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        toast("The best fit employee has been retrieved", {
          icon: <CircleCheckBig className="w-5 h-5 text-white" />,
          type: "success",
          position: "top-center",
          duration: 5000,
        });
      } else {
        console.error("Error:", error.message);
        alert(error.message || "Failed to generate recommendations");
      }
    } finally {
      setIsGenerating(false);
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const handleCheckboxClick = (e, employeeId) => {
    // e.stopPropagation() mencegah event click naik ke <div> parent
    e.stopPropagation();
    // Panggil fungsi toggle yang sudah ada
    handleToggleEmployee(employeeId);
  };

  const handleToggleEmployee = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  const handleAutoAssignBestTeam = () => {
    // Group employees by position
    const employeesByPosition = employees.reduce((acc, emp) => {
      const pos = emp.position.name;
      if (!acc[pos]) acc[pos] = [];
      acc[pos].push(emp);
      return acc;
    }, {});

    // For each position, select the top N employees based on rank
    const newSelectedEmployees = teamPositions.flatMap((pos) => {
      const positionEmployees = employeesByPosition[pos.name] || [];
      // Sort by AI rank (lower is better) and take required quantity
      return positionEmployees
        .sort((a, b) => (a.aiRank || Infinity) - (b.aiRank || Infinity))
        .slice(0, pos.quantity)
        .map((e) => e._id);
    });

    setSelectedEmployees(newSelectedEmployees);
  };

  const handleSubmit = async () => {
    // Validation
    if (!formData.projectName.trim()) {
      alert("Project name is required");
      return;
    }

    if (!formData.projectDescription.trim()) {
      alert("Project description is required");
      return;
    }

    if (selectedEmployees.length === 0) {
      alert("At least one staff member must be assigned to the project");
      return;
    }

    setIsSubmitting(true);
    setLoadingState(true);
    setLoadingText("Creating Project...");

    try {
      // Ensure all selected employees are resolved to real user IDs
      const unresolved = selectedEmployees.filter((id) => {
        const emp = employees.find((e) => e._id === id);
        return !emp || emp.isResolved === false;
      });

      if (unresolved.length > 0) {
        alert(
          "Some selected employees are not matched to real users. Please select resolved users or Auto-Assign the team."
        );
        setIsSubmitting(false);
        return;
      }
      // Prepare project data according to backend API
      const projectData = {
        name: formData.projectName,
        description: formData.projectDescription,
        staffIds: selectedEmployees, // Array of employee IDs
      };

      // Add optional fields only if they have values
      if (formData.startDate) {
        projectData.startDate = formData.startDate;
      }

      if (formData.deadline) {
        projectData.deadline = formData.deadline;
      }

      console.log("Submitting project data:", projectData);

      // Call API to create project with assignments
      const response = await projectService.createProjectWithAssignments(
        projectData
      );

      if (response.success) {
        toast(
          `Project "${response.data.project.name}" created successfully with ${selectedEmployees.length} staff members assigned!`,
          {
            icon: <CircleCheckBig className="w-5 h-5 text-white" />,
            type: "success",
            position: "top-center",
            duration: 5000,
          }
        );
        navigate("/projects"); // Navigate to projects list
      }
    } catch (error) {
      console.error("Error creating project:", error);
      alert(error.message || "Failed to create project. Please try again.");
    } finally {
      setIsSubmitting(false);
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const getAvailabilityColor = (availability) => {
    const colors = {
      Available: "text-green-600",
      "Partially Available": "text-yellow-600",
      Unavailable: "text-red-600",
    };
    return colors[availability] || "text-gray-600";
  };

  const getWorkloadColor = (workload) => {
    if (workload <= 40) return "bg-green-500";
    if (workload <= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getMatchingColor = (percentage) => {
    if (percentage >= 90) return "border-yellow-400 bg-yellow-50";
    if (percentage >= 80) return "border-green-400 bg-green-50";
    return "border-gray-300 bg-white";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Loading status={loadingState} fullscreen text={loadingText} />

      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-800">
            Create New Project
          </h1>
          <button
            onClick={() => navigate("/dashboard-pm")}
            className="px-4 py-2 text-gray-600 hover:text-gray-900"
          >
            Cancel
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start lg:h-full">
          {/* Left Form */}
          <div className="lg:col-span-1 space-y-6 flex flex-col h-full">
            {/* Project Details */}
            <div className="bg-white rounded-lg shadow p-6 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Project Details
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Name
                  </label>
                  <input
                    type="text"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    placeholder="e.g. Phoenix Project"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Project Description
                  </label>
                  <textarea
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    placeholder="Describe the project goals, scope, and deliverables."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date
                    </label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Project Deadline
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Required Skills & Team Size */}
            <div className="bg-white rounded-lg shadow p-6 flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Required Skills & Team Size
              </h3>

              <div className="space-y-4">
                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill
                  </label>
                  <SkillSelector
                    selectedSkills={skills}
                    onChange={setSkills}
                    isEditing={true}
                    className="max-h-12"
                    allowCustomAdd
                  />
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Position & Quantity
                  </label>

                  {/* Scrollable container */}
                  <div className="max-h-56 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                    <div className="grid grid-cols-1 sm:grid-cols-7 gap-3 items-center">
                      {/* Position Select */}
                      <Select
                        value={positionInput}
                        onValueChange={setPositionInput}
                      >
                        <SelectTrigger className="w-full sm:col-span-3">
                          <SelectValue placeholder="Select Position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((position) => (
                            <SelectItem key={position._id} value={position._id}>
                              {position.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      {/* Quantity Input */}
                      <Input
                        type="number"
                        min="1"
                        value={quantityInput}
                        onChange={(e) =>
                          setQuantityInput(parseInt(e.target.value) || 1)
                        }
                        className="w-full sm:col-span-2"
                      />

                      {/* Add Button */}
                      <Button
                        onClick={handleAddPosition}
                        className="w-full sm:col-span-2 bg-[#2C3F48] hover:bg-[#1F2E35]"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Selected Positions */}
                <div className=" max-h-16 overflow-auto">
                  {teamPositions.length > 0 && (
                    <div className="space-y-2">
                      {teamPositions.map((position, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg"
                        >
                          <span className="text-sm font-medium text-gray-900">
                            {position.name} × {position.quantity}
                          </span>
                          <button
                            onClick={() => handleRemovePosition(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleGenerateRecommendations}
                disabled={isGenerating}
                className="w-full mt-6 py-3 bg-[#2C3F48] text-white rounded-lg hover:bg-[#1F2E35] font-medium disabled:opacity-50"
              >
                {isGenerating
                  ? "Generating..."
                  : "Generate Team Recommendations"}
              </button>
            </div>
          </div>

          {/* Right - AI Recommendations */}
          <div className="lg:col-span-2 flex flex-col max-h-full">
            <Card className="bg-white shadow-sm border rounded-xl flex flex-col flex-grow h-full">
              <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Team Recommendations
                </h3>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-medium"
                  >
                    {isSubmitting ? "Creating Project..." : "Create Project"}
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 flex-1 overflow-y-auto">
                {employees.length === 0 ? (
                  <div className="flex flex-col items-center justify-center text-center py-12 text-gray-500">
                    <p>
                      Click “Generate Team Recommendations” to see suggestions
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {employees.map((employee) => {
                      const isSelected = selectedEmployees.includes(
                        employee._id
                      );

                      return (
                        <div
                          key={employee._id}
                          onClick={() => handleToggleEmployee(employee._id)}
                          className={cn(
                            "cursor-pointer rounded-xl border transition-all p-4 bg-white shadow-sm hover:shadow-md hover:scale-[1.01] duration-200",
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : getMatchingColor(employee.matchingPercentage)
                          )}
                        >
                          {/* Top Section */}
                          <div className="flex items-start gap-3">
                            {/* Avatar + Checkbox */}
                            <div className="relative shrink-0">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={(checked) =>
                                  handleCheckboxClick(
                                    { target: { checked } },
                                    employee._id
                                  )
                                }
                                className="absolute -top-1 -left-1"
                              />
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold text-sm">
                                {employee.name
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </div>
                            </div>

                            {/* Employee Info */}
                            <div className="flex-1">
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900 leading-tight text-base">
                                    {employee.name}
                                  </h4>
                                  <p className="text-xs sm:text-sm text-gray-600">
                                    {employee.position?.name}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <span className="text-lg sm:text-2xl font-bold text-gray-700 leading-none">
                                    {employee.matchingPercentage}%
                                  </span>
                                  {employee.aiRank && (
                                    <div className="text-xs text-green-600 font-medium mt-0.5">
                                      Rank #{employee.aiRank}
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Matching Skills */}
                              {employee.skills?.length > 0 && (
                                <div className="mb-3">
                                  <p className="text-xs text-gray-600 mb-1">
                                    Skills
                                  </p>
                                  <div className="flex flex-wrap gap-1">
                                    {employee.skills.map((skill, idx) => (
                                      <span
                                        key={idx}
                                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                      >
                                        {skill.name}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Workload Bar */}
                              <div className="mb-2">
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-gray-600">
                                    Current Workload ({employee.currentWorkload}
                                    %)
                                  </span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className={cn(
                                      "h-2 rounded-full transition-all",
                                      getWorkloadColor(employee.currentWorkload)
                                    )}
                                    style={{
                                      width: `${employee.currentWorkload}%`,
                                    }}
                                  />
                                </div>
                              </div>

                              {/* Availability */}
                              <p
                                className={cn(
                                  "text-xs font-medium mt-1",
                                  getAvailabilityColor(employee.availability)
                                )}
                              >
                                ● {employee.availability}
                              </p>

                              {/* AI Reason */}
                              {employee.aiReason && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-xs font-medium text-gray-500 mb-1">
                                    AI Reasoning
                                  </p>
                                  <p className="text-sm text-gray-700 leading-snug max-h-24 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent pr-1">
                                    {employee.aiReason}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
