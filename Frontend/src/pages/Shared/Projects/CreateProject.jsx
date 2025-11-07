import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { SkillSelector } from "@/components/SkillSelector";
import projectService from "../../../services/project.service";
import { cn } from "@/lib/utils";

import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import Loading from "@/components/Loading";
import {
  Bot,
  CircleCheckBig,
  X,
  ArrowLeft,
  ArrowRight,
  Briefcase,
  FileText,
  Calendar as CalendarIcon,
  Target,
  Users,
  Plus,
  Sparkles,
  Loader2,
  Save,
  Medal,
  Clock,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";
import { toast } from "@/lib/toast";
import apiAI from "@/api/ai";
import api from "@/api/axios";

export default function CreateProject() {
  const navigate = useNavigate();

  // Step Management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

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
  const [manualEmployees, setManualEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("ai"); // 'ai' or 'manual'

  const [manualMeta, setManualMeta] = useState({
    page: 1,
    total: 1,
    limit: 10,
  });

  const fetchPositions = async () => {
    try {
      const response = await projectService.getAllPositions();
      setPositions(response.positions || []);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  useEffect(() => {
    fetchPositions();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddPosition = () => {
    if (positionInput && quantityInput > 0) {
      const position = positions.find((p) => p._id === positionInput);
      if (quantityInput > position.userCount) {
        toast("Quantity can't exceed the available position", {
          type: "warning",
          position: "top-center",
        });
        return;
      }

      const alreadyExists = teamPositions.some((p) => p._id === position._id);
      if (alreadyExists) {
        toast("Position already added!", {
          type: "warning",
          position: "top-center",
        });
        return;
      }

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
    setLoadingText("AI is analyzing the best team match...");
    setIsGenerating(true);
    try {
      if (skills.length < 1) {
        throw new Error("At least one skill must be specified");
      }
      if (!formData.projectDescription.trim()) {
        throw new Error(
          "Project description is required for AI recommendations"
        );
      }

      if (teamPositions.length === 0) {
        throw new Error("At least one position must be specified");
      }

      setEmployees([]);

      const requestData = {
        description: formData.projectDescription,
        positions: teamPositions.map((p) => ({
          name: p.name,
          numOfRequest: p.quantity,
        })),
        skills: skills.map((s) => s.name),
      };

      const { data } = await apiAI.post("/roster-recommendations", requestData);

      if (!data?.data) {
        throw new Error("Invalid response from AI service");
      }

      const transformedEmployees = Object.entries(data.data).flatMap(
        ([positionName, candidates]) =>
          candidates.map((candidate, index) => ({
            _id: candidate._id,
            name: candidate.name,
            position: { name: positionName },
            skills: (candidate.skills || []).map((s) => ({ name: s })),
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
            aiRank: candidate.rank ?? index + 1,
            aiReason: candidate.reason,
            isResolved: true,
          }))
      );

      setEmployees(transformedEmployees);
      setActiveTab("ai");
      toast("AI recommendations generated successfully!", {
        type: "success",
        position: "top-center",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);

      const message =
        error.response?.data?.message ||
        error.message ||
        "Failed to generate recommendations";

      toast(message, {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setIsGenerating(false);
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const getManualTeams = async (page = 1) => {
    setLoadingState(true);
    setLoadingText("Loading staff members...");

    try {
      const params = {
        page,
        limit: manualMeta.limit,
        active: "true",
        role: "staff",
      };

      const { data } = await api.get("/hr/employees", { params });

      const transformed = data.data.map((emp) => {
        let workload;
        if (emp.projectCount === 0) workload = 1.0;
        else if (emp.projectCount >= 5) workload = 0.0;
        else workload = 1.0 - emp.projectCount * 0.2;

        return {
          _id: emp.id || emp._id,
          name: emp.name,
          position: { name: emp.position?.name || "Unknown" },
          skills: (emp.skills || []).map((s) => ({ name: s.name })),
          currentWorkload: Math.round((1 - workload) * 100),
          availability:
            workload > 0.7
              ? "Unavailable"
              : workload > 0.3
              ? "Partially Available"
              : "Available",
          matchingPercentage: 0,
          aiRank: null,
          aiReason: null,
          email: emp.email,
          phoneNumber: emp.phoneNumber,
        };
      });

      setManualEmployees(transformed);
      setManualMeta(data.meta);
      setActiveTab("manual");
    } catch (error) {
      console.error("Error fetching staff:", error);
      toast(error.response?.data?.message || "Failed to get staff", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const handleToggleEmployee = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];

    // Validation
    if (!formData.projectName.trim()) {
      toast("Project name is required", {
        type: "warning",
        position: "top-center",
      });
      return;
    }

    if (!formData.projectDescription.trim()) {
      toast("Project description is required", {
        type: "warning",
        position: "top-center",
      });
      return;
    }

    if (!formData.startDate) {
      toast("Start date is required", {
        type: "warning",
        position: "top-center",
      });
      return;
    }
    if (formData.startDate < today) {
      toast("Start date cannot be before today", {
        type: "warning",
        position: "top-center",
      });
      return;
    }

    if (!formData.deadline) {
      toast("Project deadline is required", {
        type: "warning",
        position: "top-center",
      });
      return;
    }
    if (formData.deadline < formData.startDate) {
      toast("Deadline cannot be before start date", {
        type: "warning",
        position: "top-center",
      });
      return;
    }

    if (selectedEmployees.length === 0) {
      toast("At least one staff member must be assigned to the project", {
        type: "warning",
        position: "top-center",
      });
      return;
    }

    setIsSubmitting(true);
    setLoadingState(true);
    setLoadingText("Creating your project...");

    try {
      const projectData = {
        name: formData.projectName,
        description: formData.projectDescription,
        staffIds: selectedEmployees,
      };

      if (formData.startDate) {
        projectData.startDate = formData.startDate;
      }

      if (formData.deadline) {
        projectData.deadline = formData.deadline;
      }

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
        navigate("/projects");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      toast(error.message || "Failed to create project. Please try again.", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setIsSubmitting(false);
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const getAvailabilityBgColor = (availability) => {
    const colors = {
      Available: "bg-green-100 text-green-700",
      "Partially Available": "bg-yellow-100 text-yellow-700",
      Unavailable: "bg-red-100 text-red-700",
    };
    return colors[availability] || "bg-gray-100 text-gray-700";
  };

  const getWorkloadColor = (workload) => {
    if (workload <= 40) return "bg-green-500";
    if (workload <= 80) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getMatchingColor = (percentage) => {
    if (percentage >= 90) return "border-yellow-400 bg-yellow-50/50";
    if (percentage >= 80) return "border-green-400 bg-green-50/50";
    return "border-gray-200";
  };

  // Step validation
  const canProceedToStep2 = () => {
    return (
      formData.projectName.trim() &&
      formData.projectDescription.trim() &&
      formData.startDate &&
      formData.deadline &&
      skills.length > 0 &&
      teamPositions.length > 0
    );
  };

  const canProceedToStep3 = () => {
    return selectedEmployees.length > 0;
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!canProceedToStep2()) {
        toast("Please complete all required fields in Step 1", {
          type: "warning",
          position: "top-center",
        });
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!canProceedToStep3()) {
        toast("Please select at least one team member", {
          type: "warning",
          position: "top-center",
        });
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get selected employee details for review
  const getSelectedEmployeeDetails = () => {
    const allEmployees = [...employees, ...manualEmployees];
    return selectedEmployees.map((id) =>
      allEmployees.find((emp) => emp._id === id)
    ).filter(Boolean);
  };

  // Step indicator component
  const StepIndicator = () => {
    const steps = [
      { number: 1, title: "Project Details", icon: FileText },
      { number: 2, title: "Select Team", icon: Users },
      { number: 3, title: "Review & Create", icon: CheckCircle2 },
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-3xl mx-auto">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center transition-all",
                      isActive
                        ? "bg-blue-600 text-white ring-4 ring-blue-100"
                        : isCompleted
                        ? "bg-green-600 text-white"
                        : "bg-gray-200 text-gray-400"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-6 h-6" />
                    ) : (
                      <StepIcon className="w-6 h-6" />
                    )}
                  </div>
                  <span
                    className={cn(
                      "text-xs font-medium mt-2 text-center",
                      isActive
                        ? "text-blue-600"
                        : isCompleted
                        ? "text-green-600"
                        : "text-gray-400"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 h-1 mx-2 -mt-6">
                    <div
                      className={cn(
                        "h-full rounded transition-all",
                        isCompleted ? "bg-green-600" : "bg-gray-200"
                      )}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen lg:p-5">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link
          to="/projects"
          className="group inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="group-hover:underline">Back to Projects</span>
        </Link>

        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Create New Project
            </h1>
            <p className="text-gray-600 mt-1">
              Follow the steps to create and assemble your project team
            </p>
          </div>
        </div>

        {/* Step Indicator */}
        <StepIndicator />
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        {/* Step 1: Project Details */}
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Project Information Card */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Project Details</CardTitle>
                    <CardDescription className="text-sm">
                      Basic information about the project
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-gray-400" />
                    Project Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="projectName"
                    name="projectName"
                    value={formData.projectName}
                    onChange={handleInputChange}
                    placeholder="e.g. Phoenix Project"
                    className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="projectDescription" className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-gray-400" />
                    Project Description <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="projectDescription"
                    name="projectDescription"
                    value={formData.projectDescription}
                    onChange={handleInputChange}
                    placeholder="Describe the project goals, scope, and deliverables..."
                    rows={4}
                    className="border-gray-300 focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400" />
                      Start Date <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline" className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-gray-400" />
                      Deadline <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="deadline"
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      min={
                        formData.startDate
                          ? formData.startDate
                          : new Date().toISOString().split("T")[0]
                      }
                      className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Requirements Card */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Team Requirements</CardTitle>
                    <CardDescription className="text-sm">
                      Define skills and positions needed
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Medal className="w-4 h-4 text-gray-400" />
                    Required Skills <span className="text-red-500">*</span>
                  </Label>
                  <SkillSelector
                    selectedSkills={skills}
                    onChange={setSkills}
                    isEditing={true}
                    allowCustomAdd
                  />
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    Position & Quantity <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex gap-2">
                    <Select value={positionInput} onValueChange={setPositionInput}>
                      <SelectTrigger className="flex-1 border-gray-300">
                        <SelectValue placeholder="Select Position" />
                      </SelectTrigger>
                      <SelectContent>
                        {positions.map((position) => (
                          <SelectItem key={position._id} value={position._id}>
                            {position.name} - available {position.userCount}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Input
                      type="number"
                      min="1"
                      value={quantityInput}
                      onChange={(e) =>
                        setQuantityInput(parseInt(e.target.value) || 1)
                      }
                      className="w-20 border-gray-300"
                    />

                    <Button
                      onClick={handleAddPosition}
                      className="bg-purple-600 hover:bg-purple-700 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Selected Positions */}
                {teamPositions.length > 0 && (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {teamPositions.map((position, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center bg-purple-50 px-3 py-2 rounded-lg border border-purple-200"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {position.name} × {position.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemovePosition(index)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 cursor-pointer h-6 w-6 p-0"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-end">
              <Button
                onClick={handleNextStep}
                disabled={!canProceedToStep2()}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Next: Select Team
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Team Selection */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Action Buttons - Only show if no data loaded yet or for refresh */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleGenerateRecommendations}
                disabled={isGenerating}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-12"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5 mr-2" />
                    {employees.length > 0 ? "Regenerate AI Recommendations" : "AI Team Recommendations"}
                  </>
                )}
              </Button>

              <Button
                onClick={() => getManualTeams()}
                className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-12"
              >
                <Users className="w-5 h-5 mr-2" />
                {manualEmployees.length > 0 ? "Refresh Staff List" : "Browse All Staff"}
              </Button>
            </div>
            {/* Tab Switcher - Only show if at least one has data */}
            {(employees.length > 0 || manualEmployees.length > 0) && (
              <div className="flex gap-2 border-b border-gray-200">
                {employees.length > 0 && (
                  <button
                    onClick={() => setActiveTab("ai")}
                    className={cn(
                      "px-4 py-2 font-medium text-sm transition-colors relative",
                      activeTab === "ai"
                        ? "text-purple-600 border-b-2 border-purple-600"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Bot className="w-4 h-4" />
                      AI Recommendations
                      <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                        {employees.length}
                      </Badge>
                    </div>
                  </button>
                )}
                {manualEmployees.length > 0 && (
                  <button
                    onClick={() => setActiveTab("manual")}
                    className={cn(
                      "px-4 py-2 font-medium text-sm transition-colors relative",
                      activeTab === "manual"
                        ? "text-gray-600 border-b-2 border-gray-600"
                        : "text-gray-500 hover:text-gray-700"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      All Staff
                      <Badge variant="secondary" className="bg-gray-100 text-gray-700">
                        {manualEmployees.length}
                      </Badge>
                    </div>
                  </button>
                )}
              </div>
            )}

            {/* Selected Staff Summary */}
            {selectedEmployees.length > 0 && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        {selectedEmployees.length} Team Member{selectedEmployees.length !== 1 ? 's' : ''} Selected
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedEmployees([])}
                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 cursor-pointer"
                    >
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Team Members Display */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="border-b bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {activeTab === "ai" ? "AI Recommendations" : "All Staff Members"}
                      </CardTitle>
                      <CardDescription>
                        {activeTab === "ai"
                          ? "Best matches based on your requirements"
                          : "Browse and select team members manually"}
                      </CardDescription>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6">
                {activeTab === "ai" && employees.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500">
                    <Bot className="w-16 h-16 mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">No AI Recommendations Yet</p>
                    <p className="text-sm">
                      Click "AI Team Recommendations" to get personalized suggestions
                    </p>
                  </div>
                )}

                {activeTab === "manual" && manualEmployees.length === 0 && (
                  <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500">
                    <Users className="w-16 h-16 mb-4 text-gray-400" />
                    <p className="text-lg font-medium mb-2">No Staff Loaded</p>
                    <p className="text-sm">
                      Click "Browse All Staff" to see available team members
                    </p>
                  </div>
                )}

                {/* Employee Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {(activeTab === "ai" ? employees : manualEmployees).map((employee) => {
                    const isSelected = selectedEmployees.includes(employee._id);

                    return (
                      <div
                        key={employee._id}
                        onClick={() => handleToggleEmployee(employee._id)}
                        className={cn(
                          "cursor-pointer rounded-xl border-2 transition-all p-4 bg-white shadow-sm hover:shadow-md",
                          isSelected
                            ? "border-blue-500 bg-blue-50 scale-[1.02]"
                            : activeTab === "ai"
                            ? getMatchingColor(employee.matchingPercentage)
                            : "border-gray-200"
                        )}
                      >
                        <div className="flex items-start gap-3">
                          {/* Avatar & Checkbox */}
                          <div className="relative">
                            <div className="absolute -top-2 -left-2 z-10">
                              <Checkbox
                                checked={isSelected}
                                onCheckedChange={() => handleToggleEmployee(employee._id)}
                                onClick={(e) => e.stopPropagation()}
                                className="border-2"
                              />
                            </div>
                            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                              {employee.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </div>
                          </div>

                          {/* Employee Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate">
                                  {employee.name}
                                </h4>
                                <p className="text-sm text-gray-600 truncate">
                                  {employee.position?.name}
                                </p>
                              </div>
                              {activeTab === "ai" && employee.matchingPercentage > 0 && (
                                <div className="text-right ml-2">
                                  <div className="text-2xl font-bold text-purple-600">
                                    {employee.matchingPercentage}%
                                  </div>
                                  {employee.aiRank && (
                                    <Badge variant="secondary" className="text-xs mt-1">
                                      Rank #{employee.aiRank}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>

                            {/* Skills */}
                            {employee.skills?.length > 0 && (
                              <div className="mb-3">
                                <div className="flex flex-wrap gap-1">
                                  {employee.skills.slice(0, 3).map((skill, idx) => (
                                    <Badge
                                      key={idx}
                                      variant="secondary"
                                      className="text-xs bg-gray-100"
                                    >
                                      {skill.name}
                                    </Badge>
                                  ))}
                                  {employee.skills.length > 3 && (
                                    <Badge variant="secondary" className="text-xs">
                                      +{employee.skills.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Workload Bar */}
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="text-gray-600">Workload</span>
                                <span className="font-medium">{employee.currentWorkload}%</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div
                                  className={cn(
                                    "h-2 rounded-full transition-all",
                                    getWorkloadColor(employee.currentWorkload)
                                  )}
                                  style={{ width: `${employee.currentWorkload}%` }}
                                />
                              </div>
                            </div>

                            {/* Availability Badge */}
                            <div className="mt-2">
                              <Badge
                                className={cn(
                                  "text-xs font-medium",
                                  getAvailabilityBgColor(employee.availability)
                                )}
                              >
                                {employee.availability}
                              </Badge>
                            </div>

                            {/* AI Reason */}
                            {employee.aiReason && (
                              <div className="mt-3 pt-3 border-t border-gray-200">
                                <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                  <Sparkles className="w-3 h-3" />
                                  AI Insight
                                </p>
                                <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
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
              </CardContent>

              {/* Pagination for Manual Browse */}
              {activeTab === "manual" && manualEmployees.length > 0 && (
                <CardFooter className="flex justify-between items-center border-t bg-gray-50">
                  <Button
                    disabled={manualMeta.page === 1}
                    onClick={() => getManualTeams(manualMeta.page - 1)}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Previous
                  </Button>

                  <span className="text-sm text-gray-600">
                    Page {manualMeta.page} of{" "}
                    {Math.ceil(manualMeta.total / manualMeta.limit)}
                  </span>

                  <Button
                    disabled={
                      manualMeta.page >=
                      Math.ceil(manualMeta.total / manualMeta.limit)
                    }
                    onClick={() => getManualTeams(manualMeta.page + 1)}
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Next
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={handlePrevStep}
                variant="outline"
                className="cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleNextStep}
                disabled={!canProceedToStep3()}
                className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
              >
                Next: Review & Create
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Create */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Project Summary */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Project Summary</CardTitle>
                    <CardDescription className="text-sm">
                      Review your project details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500 text-sm">Project Name</Label>
                    <p className="font-semibold text-gray-900">{formData.projectName}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500 text-sm">Timeline</Label>
                    <p className="font-semibold text-gray-900">
                      {formData.startDate} to {formData.deadline}
                    </p>
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Description</Label>
                  <p className="text-gray-900">{formData.projectDescription}</p>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Required Skills</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-blue-100 text-blue-700">
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">Required Positions</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teamPositions.map((position, idx) => (
                      <Badge key={idx} variant="secondary" className="bg-purple-100 text-purple-700">
                        {position.name} × {position.quantity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Summary */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Selected Team Members</CardTitle>
                    <CardDescription className="text-sm">
                      {selectedEmployees.length} member{selectedEmployees.length !== 1 ? 's' : ''} will be assigned to this project
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  {getSelectedEmployeeDetails().map((employee) => (
                    <div
                      key={employee._id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{employee.name}</p>
                        <p className="text-sm text-gray-600">{employee.position?.name}</p>
                      </div>
                      <Badge className={cn("text-xs", getAvailabilityBgColor(employee.availability))}>
                        {employee.availability}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex justify-between">
              <Button
                onClick={handlePrevStep}
                variant="outline"
                className="cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Project...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5 mr-2" />
                    Create Project
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
