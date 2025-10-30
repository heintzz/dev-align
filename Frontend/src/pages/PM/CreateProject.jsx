import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateProject() {
  const navigate = useNavigate();

  // Form state
  const [formData, setFormData] = useState({
    projectName: "",
    projectDescription: "",
    startDate: "",
    deadline: "",
  });

  // Skills state
  const [skills, setSkills] = useState([]);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [skillInput, setSkillInput] = useState("");

  // Positions state
  const [positions, setPositions] = useState([]);
  const [teamPositions, setTeamPositions] = useState([]);
  const [positionInput, setPositionInput] = useState("");
  const [quantityInput, setQuantityInput] = useState(1);

  // Recommendations state
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // TODO: Fetch skills from database
  useEffect(() => {
    fetchSkills();
  }, []);

  // TODO: Fetch positions from database
  useEffect(() => {
    fetchPositions();
  }, []);

  // TODO: API - Fetch all skills from database
  const fetchSkills = async () => {
    try {
      // const response = await fetch('/api/skills');
      // const data = await response.json();
      // setSkills(data);

      // TEMPORARY: Mock data
      setSkills([
        { _id: "1", name: "React.js" },
        { _id: "2", name: "Node.js" },
        { _id: "3", name: "Python" },
        { _id: "4", name: "TypeScript" },
        { _id: "5", name: "UI/UX" },
        { _id: "6", name: "MongoDB" },
        { _id: "7", name: "GraphQL" },
        { _id: "8", name: "Jest" },
        { _id: "9", name: "Cypress" },
        { _id: "10", name: "CI/CD" },
      ]);
    } catch (error) {
      console.error("Error fetching skills:", error);
    }
  };

  // TODO: API - Fetch all positions from database
  const fetchPositions = async () => {
    try {
      // const response = await fetch('/api/positions');
      // const data = await response.json();
      // setPositions(data);

      // TEMPORARY: Mock data
      setPositions([
        { _id: "1", name: "Frontend Developer" },
        { _id: "2", name: "Backend Developer" },
        { _id: "3", name: "Fullstack Developer" },
        { _id: "4", name: "UI/UX Designer" },
        { _id: "5", name: "QA Engineer" },
        { _id: "6", name: "DevOps Engineer" },
        { _id: "7", name: "Project Manager" },
      ]);
    } catch (error) {
      console.error("Error fetching positions:", error);
    }
  };

  // TODO: API - Fetch all employees (will be replaced with AI recommendations)
  const fetchAllEmployees = async () => {
    try {
      // const response = await fetch('/api/employees');
      // const data = await response.json();
      // setEmployees(data);

      // TEMPORARY: Mock data - showing all employees
      setEmployees([
        {
          _id: "1",
          name: "Olivia Rhye",
          position: { name: "Senior Frontend Developer" },
          skills: [
            { name: "React.js" },
            { name: "TypeScript" },
            { name: "UI/UX" },
          ],
          currentWorkload: 40,
          availability: "Available",
          matchingPercentage: 85,
        },
        {
          _id: "2",
          name: "Phoenix Baker",
          position: { name: "Backend Developer" },
          skills: [
            { name: "Node.js" },
            { name: "MongoDB" },
            { name: "GraphQL" },
          ],
          currentWorkload: 80,
          availability: "Partially Available",
          matchingPercentage: 100,
        },
        {
          _id: "3",
          name: "Lana Steiner",
          position: { name: "QA Engineer" },
          skills: [{ name: "Cypress" }, { name: "Jest" }, { name: "CI/CD" }],
          currentWorkload: 95,
          availability: "Unavailable",
          matchingPercentage: 80,
        },
      ]);
    } catch (error) {
      console.error("Error fetching employees:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddSkill = () => {
    if (skillInput && !selectedSkills.find((s) => s._id === skillInput)) {
      const skill = skills.find((s) => s._id === skillInput);
      if (skill) {
        setSelectedSkills([...selectedSkills, skill]);
        setSkillInput("");
      }
    }
  };

  const handleRemoveSkill = (skillId) => {
    setSelectedSkills(selectedSkills.filter((s) => s._id !== skillId));
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
    setIsGenerating(true);

    // TODO: API - Call AI recommendation endpoint
    try {
      // const response = await fetch('/api/projects/recommend-team', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     skills: selectedSkills.map(s => s._id),
      //     positions: teamPositions,
      //     projectId: formData.projectId // if editing
      //   })
      // });
      // const data = await response.json();
      // setEmployees(data.recommendations);

      // TEMPORARY: Just fetch all employees
      await fetchAllEmployees();
    } catch (error) {
      console.error("Error generating recommendations:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleToggleEmployee = (employeeId) => {
    if (selectedEmployees.includes(employeeId)) {
      setSelectedEmployees(selectedEmployees.filter((id) => id !== employeeId));
    } else {
      setSelectedEmployees([...selectedEmployees, employeeId]);
    }
  };

  const handleAutoAssignBestTeam = () => {
    // TODO: API - Auto assign best team based on AI
    // For now, select top 2 available employees
    const availableEmployees = employees
      .filter((e) => e.availability === "Available")
      .slice(0, 2)
      .map((e) => e._id);
    setSelectedEmployees(availableEmployees);
  };

  const handleSubmit = async () => {
    // TODO: API - Create project
    try {
      // const response = await fetch('/api/projects', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${localStorage.getItem('token')}`
      //   },
      //   body: JSON.stringify({
      //     name: formData.projectName,
      //     description: formData.projectDescription,
      //     startDate: formData.startDate,
      //     deadline: formData.deadline,
      //     requiredSkills: selectedSkills.map(s => s._id),
      //     teamPositions: teamPositions,
      //     teamMembers: selectedEmployees,
      //   })
      // });
      // const data = await response.json();

      console.log("Project Data to Submit:", {
        name: formData.projectName,
        description: formData.projectDescription,
        startDate: formData.startDate,
        deadline: formData.deadline,
        requiredSkills: selectedSkills.map((s) => s._id),
        teamPositions: teamPositions,
        teamMembers: selectedEmployees,
      });

      alert("Project created successfully! (Mock)");
      // navigate('/dashboard-pm');
    } catch (error) {
      console.error("Error creating project:", error);
      alert("Failed to create project");
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Form */}
          <div className="lg:col-span-1 space-y-6">
            {/* Project Details */}
            <div className="bg-white rounded-lg shadow p-6">
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
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Required Skills & Team Size
              </h3>

              <div className="space-y-4">
                {/* Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Skill
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">e.g. Python, UI/UX Design</option>
                      {skills.map((skill) => (
                        <option key={skill._id} value={skill._id}>
                          {skill.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleAddSkill}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Add Skill
                    </button>
                  </div>
                </div>

                {/* Selected Skills */}
                {selectedSkills.length > 0 && (
                  <div className="space-y-2">
                    {selectedSkills.map((skill) => (
                      <div
                        key={skill._id}
                        className="flex items-center justify-between bg-gray-100 px-3 py-2 rounded-lg"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {skill.name}
                        </span>
                        <button
                          onClick={() => handleRemoveSkill(skill._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Position */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position & Quantity
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={positionInput}
                      onChange={(e) => setPositionInput(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Position</option>
                      {positions.map((position) => (
                        <option key={position._id} value={position._id}>
                          {position.name}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={quantityInput}
                      onChange={(e) =>
                        setQuantityInput(parseInt(e.target.value))
                      }
                      className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={handleAddPosition}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Selected Positions */}
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
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  AI Team Recommendations
                </h3>
                <div className="flex gap-2">
                  <button
                    onClick={handleAutoAssignBestTeam}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2C3F48] text-white rounded-lg hover:bg-[#1F2E35] text-sm font-medium"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                    </svg>
                    Auto-Assign Best Team
                  </button>
                  <button
                    onClick={handleSubmit}
                    className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                  >
                    Create Project
                  </button>
                </div>
              </div>

              {employees.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>
                    Click "Generate Team Recommendations" to see suggestions
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {employees.map((employee) => (
                    <div
                      key={employee._id}
                      className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                        selectedEmployees.includes(employee._id)
                          ? "border-blue-500 bg-blue-50"
                          : getMatchingColor(employee.matchingPercentage)
                      }`}
                      onClick={() => handleToggleEmployee(employee._id)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <input
                            type="checkbox"
                            checked={selectedEmployees.includes(employee._id)}
                            onChange={() => {}}
                            className="absolute top-0 left-0 w-5 h-5"
                          />
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold ml-6">
                            {employee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </div>
                        </div>

                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {employee.name}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {employee.position.name}
                              </p>
                            </div>
                            <span className="text-2xl font-bold text-gray-700">
                              {employee.matchingPercentage}%
                            </span>
                          </div>

                          <div className="mb-2">
                            <p className="text-xs text-gray-600 mb-1">
                              Matching Skills
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {employee.skills.map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded"
                                >
                                  {skill.name}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="mb-2">
                            <div className="flex items-center justify-between text-xs mb-1">
                              <span className="text-gray-600">
                                Current Workload ({employee.currentWorkload}%)
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${getWorkloadColor(
                                  employee.currentWorkload
                                )}`}
                                style={{
                                  width: `${employee.currentWorkload}%`,
                                }}
                              ></div>
                            </div>
                          </div>

                          <p
                            className={`text-xs font-medium ${getAvailabilityColor(
                              employee.availability
                            )}`}
                          >
                            ● {employee.availability}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
