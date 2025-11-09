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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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
  Info,
  Search,
  BadgeCheckIcon,
  BadgeInfo,
  UserCheck,
} from "lucide-react";
import apiAI from "@/api/ai";
import api from "@/api/axios";

import { toast } from "@/lib/toast";
import Loading from "@/components/Loading";
import { useAuthStore } from "@/store/useAuthStore";

export default function CreateProject() {
  const { userId } = useAuthStore();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);

  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");

  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    startDate: "",
    deadline: "",
  });

  const [skills, setSkills] = useState([]);

  const [positions, setPositions] = useState([]);
  const [teamPositions, setTeamPositions] = useState([]);
  const [positionInput, setPositionInput] = useState("");
  const [quantityInput, setQuantityInput] = useState(1);

  const [employees, setEmployees] = useState([]);
  const [manualEmployees, setManualEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("ai");
  const [searchQuery, setSearchQuery] = useState("");

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

  useEffect(() => {
    if (activeTab === "manual" && manualEmployees.length > 0) {
      const timeoutId = setTimeout(() => {
        getManualTeams(1, searchQuery);
      }, 500);

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, activeTab]);

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
            managerId: candidate.manager._id,
            managerName: candidate.manager.name,
            position: { name: positionName },
            skills: (candidate.skills || []).map((s) => ({ name: s })),
            skillMatch: candidate.skillMatch * 100,
            originalCurrentWorkload: Math.round(
              (candidate.currentWorkload || 0) * 100
            ),
            currentWorkload: Math.round(
              (1 - candidate.currentWorkload || 0) * 100
            ),
            projectSimilarity: candidate.projectSimilarity * 100,
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

  const getManualTeams = async (page = 1, search = "") => {
    setLoadingState(true);
    setLoadingText("Loading staff members...");

    try {
      const params = {
        page,
        limit: manualMeta.limit,
        active: "true",
        role: "staff",
      };

      if (search.trim()) {
        params.search = search.trim();
      }

      const { data } = await api.get("/hr/employees", { params });

      const transformed = data.data.map((emp) => {
        let workload;
        if (emp.activeProjectCount === 0) workload = 1.0;
        else if (emp.activeProjectCount >= 5) workload = 0.0;
        else workload = 1.0 - emp.activeProjectCount * 0.2;

        return {
          _id: emp.id || emp._id,
          name: emp.name,
          managerId: emp.manager.id,
          managerName: emp.manager.name,
          position: { name: emp.position?.name || "Unknown" },
          skills: (emp.skills || []).map((s) => ({ name: s.name })),
          currentWorkload: Math.round((1 - workload) * 100),
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

  const handleToggleEmployee = (
    employeeId,
    employeeName,
    employeePosition,
    employeeManagerId,
    employeeManagerName
  ) => {
    console.log(
      employeeId,
      employeeName,
      employeePosition,
      employeeManagerId,
      employeeManagerName
    );
    if (selectedEmployees.some((e) => e.id === employeeId)) {
      setSelectedEmployees(
        selectedEmployees.filter((e) => e.id !== employeeId)
      );
    } else {
      setSelectedEmployees([
        ...selectedEmployees,
        {
          id: employeeId,
          name: employeeName,
          position: employeePosition,
          managerId: employeeManagerId,
          manager: employeeManagerName,
        },
      ]);
    }
  };

  const handleSubmit = async () => {
    const today = new Date().toISOString().split("T")[0];

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
        staffIds: selectedEmployees.map((emp) => emp.id),
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

  const filterEmployees = (employeeList) => {
    if (!searchQuery.trim()) return employeeList;

    const query = searchQuery.toLowerCase();
    return employeeList.filter((employee) => {
      const nameMatch = employee.name.toLowerCase().includes(query);
      const positionMatch = employee.position?.name
        ?.toLowerCase()
        .includes(query);
      const skillMatch = employee.skills?.some((skill) =>
        skill.name.toLowerCase().includes(query)
      );
      return nameMatch || positionMatch || skillMatch;
    });
  };

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

  const StepIndicator = () => {
    const steps = [
      { number: 1, title: "Project Details", icon: FileText },
      { number: 2, title: "Select Team", icon: Users },
      { number: 3, title: "Review & Create", icon: CheckCircle2 },
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-center gap-8">
          {steps.map((step, index) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.number;
            const isCompleted = currentStep > step.number;

            return (
              <div key={step.number} className="flex items-center">
                <div className="flex flex-col items-center">
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
                  <div
                    className={cn(
                      "h-1 w-12 mx-4 mt-[-24px] rounded",
                      isCompleted ? "bg-green-600" : "bg-gray-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-24 pt-5 lg:px-5 lg:py-10">
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
          <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
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
        <StepIndicator />
      </div>

      <div className="max-w-7xl mx-auto">
        {/* Step 1: Project Details */}
        {currentStep === 1 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Project Information Card */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="border-b border-blue-100">
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
              <CardContent className="space-y-8">
                <div className="space-y-2">
                  <Label
                    htmlFor="projectName"
                    className="flex items-center gap-2"
                  >
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
                  <Label
                    htmlFor="projectDescription"
                    className="flex items-center gap-2"
                  >
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
                    <Label
                      htmlFor="startDate"
                      className="flex items-center gap-2"
                    >
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
                    <Label
                      htmlFor="deadline"
                      className="flex items-center gap-2"
                    >
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
              <CardHeader className="border-b border-purple-100">
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
              <CardContent className="space-y-8">
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
                    <Select
                      value={positionInput}
                      onValueChange={setPositionInput}
                    >
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
                  {/* Selected Positions */}
                  {teamPositions.length > 0 && (
                    <div className="space-y-2 max-h-32 overflow-y-auto">
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
                </div>
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
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleGenerateRecommendations}
                disabled={isGenerating}
                className="flex-1 bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-12"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Bot className="w-5 h-5 mr-2" />
                    {employees.length > 0
                      ? "Regenerate AI Recommendations"
                      : "AI Team Recommendations"}
                  </>
                )}
              </Button>

              <Button
                onClick={() => {
                  setSearchQuery("");
                  getManualTeams(1, "");
                }}
                className="flex-1 bg-linear-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white shadow-md hover:shadow-lg transition-all cursor-pointer h-12"
              >
                <Users className="w-5 h-5 mr-2" />
                {manualEmployees.length > 0
                  ? "Refresh Staff List"
                  : "Browse All Staff"}
              </Button>
            </div>
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => {
                  setActiveTab("ai");
                  setSearchQuery("");
                }}
                className={cn(
                  "px-4 py-2 font-medium text-sm transition-colors relative cursor-pointer",
                  activeTab === "ai"
                    ? "text-purple-600 border-b-2 border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4" />
                  AI Recommendations
                  <Badge
                    variant="secondary"
                    className="bg-purple-100 text-purple-700"
                  >
                    {employees.length}
                  </Badge>
                </div>
              </button>
              <button
                onClick={() => {
                  setActiveTab("manual");
                  setSearchQuery("");
                }}
                className={cn(
                  "px-4 py-2 font-medium text-sm transition-colors relative cursor-pointer",
                  activeTab === "manual"
                    ? "text-gray-600 border-b-2 border-gray-600"
                    : "text-gray-500 hover:text-gray-700"
                )}
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  All Staff
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-700"
                  ></Badge>
                </div>
              </button>
            </div>

            {/* Search Input */}
            {((activeTab === "ai" && employees.length > 0) ||
              (activeTab === "manual" && manualEmployees.length > 0)) && (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search by name, position, or skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="text-sm text-gray-600">
                    {activeTab === "ai" ? (
                      <>
                        Showing {filterEmployees(employees).length} of{" "}
                        {employees.length} employees
                      </>
                    ) : (
                      <>
                        Found {manualMeta.total} employee
                        {manualMeta.total !== 1 ? "s" : ""}
                      </>
                    )}
                  </p>
                )}
              </div>
            )}

            {/* Team Members Display */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="border-b bg-linear-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Users className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">
                        {activeTab === "ai"
                          ? "AI Recommendations"
                          : "All Staff Members"}
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
                    <p className="text-lg font-medium mb-2">
                      No AI Recommendations Yet
                    </p>
                    <p className="text-sm">
                      Click "AI Team Recommendations" to get personalized
                      suggestions
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

                {/* No search results message */}
                {searchQuery &&
                  ((activeTab === "ai" &&
                    filterEmployees(employees).length === 0) ||
                    (activeTab === "manual" &&
                      manualEmployees.length === 0)) && (
                    <div className="flex flex-col items-center justify-center text-center py-16 text-gray-500">
                      <Search className="w-16 h-16 mb-4 text-gray-400" />
                      <p className="text-lg font-medium mb-2">
                        No employees found
                      </p>
                      <p className="text-sm">
                        Try adjusting your search query or clear the search
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setSearchQuery("")}
                        className="mt-4 cursor-pointer"
                      >
                        Clear Search
                      </Button>
                    </div>
                  )}

                {/* Employee Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[600px] overflow-y-auto p-4">
                  {(activeTab === "ai"
                    ? filterEmployees(employees)
                    : manualEmployees
                  ).map((employee) => {
                    const isSelected = selectedEmployees.some(
                      (e) => e.id === employee._id
                    );

                    return (
                      <div
                        key={employee._id}
                        onClick={() =>
                          handleToggleEmployee(
                            employee._id,
                            employee.name,
                            employee.position.name,
                            employee.managerId,
                            employee.managerName
                          )
                        }
                        className={cn(
                          "cursor-pointer rounded-xl border-2 transition-all p-4 bg-white shadow-sm hover:shadow-md flex flex-col",
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
                                onCheckedChange={() =>
                                  handleToggleEmployee(
                                    employee._id,
                                    employee.name,
                                    employee.position.name,
                                    employee.managerId,
                                    employee.managerName
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                className="border-2"
                              />
                            </div>
                            <div className="w-14 h-14 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
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
                                <p className="text-sm text-gray-600 truncate mb-1">
                                  {employee.position?.name}
                                </p>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge
                                      variant={
                                        userId === employee.managerId
                                          ? "default"
                                          : "secondary"
                                      }
                                      className={`gap-1.5 px-3 font-medium transition-colors ${
                                        userId === employee.managerId
                                          ? "bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600"
                                          : "bg-slate-500 hover:bg-slate-600 text-white dark:bg-slate-600"
                                      }`}
                                    >
                                      {userId === employee.managerId ? (
                                        <UserCheck className="h-4 w-4" />
                                      ) : (
                                        <Users className="h-4 w-4" />
                                      )}
                                      {employee.managerName}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="top">
                                    <p className="text-sm">
                                      {userId === employee.managerId
                                        ? "Direct subordinate - You manage this employee"
                                        : "Indirect subordinate - Managed by another manager"}
                                    </p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              {activeTab === "ai" &&
                                employee.matchingPercentage > 0 && (
                                  <div className="text-right ml-2">
                                    <div className="text-2xl font-bold space-x-2 text-purple-600">
                                      <span>
                                        {employee.matchingPercentage}%
                                      </span>
                                      <Tooltip>
                                        <TooltipTrigger>
                                          <Info className="w-4 h-4" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          <p>
                                            Skill Match : {employee.skillMatch}{" "}
                                            ({employee.skillMatch * 0.4}%)
                                          </p>
                                          <p>
                                            Current Workload :{" "}
                                            {employee.originalCurrentWorkload} (
                                            {employee.originalCurrentWorkload *
                                              0.2}
                                            %)
                                          </p>
                                          <p>
                                            Project Similarity :{" "}
                                            {employee.projectSimilarity} (
                                            {employee.projectSimilarity * 0.4}
                                            %)
                                          </p>
                                        </TooltipContent>
                                      </Tooltip>
                                    </div>
                                    {employee.aiRank && (
                                      <Badge
                                        variant="secondary"
                                        className="text-xs mt-1"
                                      >
                                        Rank #{employee.aiRank}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                            </div>

                            {/* Skills */}
                            {employee.skills?.length > 0 && (
                              <div className="flex flex-wrap gap-1 max-h-24 overflow-auto my-3">
                                {employee.skills.map((skill, idx) => (
                                  <Badge
                                    key={idx}
                                    variant="secondary"
                                    className="text-xs bg-gray-100"
                                  >
                                    {skill.name}
                                  </Badge>
                                ))}
                              </div>
                            )}

                            {/* Workload Bar */}
                            {employee.currentWorkload && (
                              <>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span className="text-gray-600">
                                      Workload
                                    </span>
                                    <span className="font-medium">
                                      {employee.currentWorkload}%
                                    </span>
                                  </div>
                                  <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div
                                      className={cn(
                                        "h-2 rounded-full transition-all",
                                        getWorkloadColor(
                                          employee.currentWorkload
                                        )
                                      )}
                                      style={{
                                        width: `${employee.currentWorkload}%`,
                                      }}
                                    />
                                  </div>
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* AI Reason - Now at the bottom with flex-grow spacer */}
                        {employee.aiReason && (
                          <>
                            <div className="flex-grow" />
                            <div className="pt-3 border-t border-gray-200 mt-3">
                              <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                                <Sparkles className="w-3 h-3" />
                                AI Insight
                              </p>
                              <p className="text-xs text-gray-700 leading-relaxed max-h-24 overflow-auto">
                                {employee.aiReason}
                              </p>
                            </div>
                          </>
                        )}
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
                    onClick={() =>
                      getManualTeams(manualMeta.page - 1, searchQuery)
                    }
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
                    onClick={() =>
                      getManualTeams(manualMeta.page + 1, searchQuery)
                    }
                    variant="outline"
                    className="cursor-pointer"
                  >
                    Next
                  </Button>
                </CardFooter>
              )}
            </Card>

            {/* Selected Staff Summary */}
            {selectedEmployees.length > 0 && (
              <Card className="border-blue-200 bg-blue-50/50">
                <CardContent className="py-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-900">
                        {selectedEmployees.length} Team Member
                        {selectedEmployees.length !== 1 ? "s" : ""} Selected
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
              <CardHeader className="border-b border-blue-100">
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
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-500 text-sm">
                      Project Name
                    </Label>
                    <p className="font-semibold text-gray-900">
                      {formData.projectName}
                    </p>
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
                  <Label className="text-gray-500 text-sm">
                    Required Skills
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {skills.map((skill, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-blue-100 text-blue-700"
                      >
                        {skill.name}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label className="text-gray-500 text-sm">
                    Required Positions
                  </Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {teamPositions.map((position, idx) => (
                      <Badge
                        key={idx}
                        variant="secondary"
                        className="bg-purple-100 text-purple-700"
                      >
                        {position.name} × {position.quantity}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Summary */}
            <Card className="border-gray-200 shadow-lg">
              <CardHeader className="border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Selected Team Members
                    </CardTitle>
                    <CardDescription className="text-sm">
                      {selectedEmployees.length} member
                      {selectedEmployees.length !== 1 ? "s" : ""} will be
                      assigned to this project{" "}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-auto">
                  {selectedEmployees.map((employee) => (
                    <div
                      key={employee.id}
                      className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <div className="w-10 h-10 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
                        {employee.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {employee.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          {employee.position}
                        </p>
                      </div>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Badge
                            variant={
                              userId === employee.managerId
                                ? "default"
                                : "secondary"
                            }
                            className={`gap-1.5 px-3 font-medium transition-colors ${
                              userId === employee.managerId
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white dark:bg-emerald-600"
                                : "bg-slate-500 hover:bg-slate-600 text-white dark:bg-slate-600"
                            }`}
                          >
                            {userId === employee.managerId ? (
                              <UserCheck className="h-4 w-4" />
                            ) : (
                              <Users className="h-4 w-4" />
                            )}
                            {employee.manager}
                          </Badge>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="text-sm">
                            {userId === employee.managerId
                              ? "Direct report - You manage this employee"
                              : "Indirect report - Managed by another manager"}
                          </p>
                        </TooltipContent>
                      </Tooltip>
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
                className="bg-linear-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
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
