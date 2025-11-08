import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { format } from "date-fns";
import api from "@/api/axios";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { SkillSelector } from "@/components/SkillSelector";

import {
  X,
  Calendar as CalendarIcon,
  ChevronDown,
  Edit,
  Save,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Award,
  UserCircle2,
  Users,
  Loader2,
} from "lucide-react";
import Loading from "@/components/Loading";
import { toast } from "@/lib/toast";

export default function EmployeeDetail() {
  const { id } = useParams();

  const [employeeForm, setEmployeeForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    placeOfBirth: "",
    dateOfBirth: "",
    position: "",
    skills: [],
    managerId: "",
    role: "",
  });

  const [positions, setPositions] = useState([]);
  const [managers, setManagers] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [initialLoading, setInitialLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

  const getEmployee = async () => {
    try {
      const { data } = await api.get(`/hr/employee/${id}`);
      const emp = data.data;
      setEmployeeForm({
        name: emp.name || "",
        email: emp.email || "",
        phoneNumber: emp.phoneNumber || "",
        placeOfBirth: emp.placeOfBirth || "",
        dateOfBirth: emp.dateOfBirth
          ? format(new Date(emp.dateOfBirth), "yyyy-MM-dd")
          : "",
        position: emp.position?._id || "",
        skills: emp.skills || [],
        managerId: emp.managerId || "",
        role: emp.role || "",
      });
      setSkills(emp.skills);
      if (emp.dateOfBirth) setSelectedDate(new Date(emp.dateOfBirth));
    } catch (error) {
      console.error("Error fetching employee:", error);
      toast(error.response?.data?.message || "Error fetching employee", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setInitialLoading(false);
    }
  };

  const getPositions = async () => {
    const { data } = await api.get("/position");
    setPositions(data.data.positions || []);
  };

  const getManagers = async () => {
    const { data } = await api.get("/hr/employees", {
      params: { role: "manager" },
    });
    setManagers(data.data || []);
  };

  useEffect(() => {
    getEmployee();
    getPositions();
    getManagers();
  }, []);

  const handleEditToggle = () => setIsEditing((prev) => !prev);
  const handleCancel = () => {
    setIsEditing(false);
    getEmployee();
  };
  const handleSave = async () => {
    if (employeeForm.role !== "staff") {
      employeeForm.managerId = null;
      employeeForm.position = null;
    }
    setLoadingState(true);
    setLoadingText("Updating employee...");
    try {
      const skillName = skills.map((skill) => skill.name);
      const updatedEmployee = {
        ...employeeForm,
        skills: skillName,
      };
      await api.put(`/hr/employee/${id}`, updatedEmployee);
      toast("Staff updated successfully", {
        type: "success",
        position: "top-center",
        duration: 5000,
      });
      setIsEditing(false);
      await getEmployee();
    } catch (error) {
      console.error("Error updating employee:", error);
      toast(error.response?.data?.message || "Error updating employee", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (field, value) => {
    setEmployeeForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateChange = (date) => {
    setSelectedDate(date);
    setEmployeeForm((prev) => ({
      ...prev,
      dateOfBirth: date ? format(date, "yyyy-MM-dd") : "",
    }));
    setOpenCalendar(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role) => {
    const colors = {
      hr: "bg-red-100 text-red-700 border-red-200",
      manager: "bg-blue-100 text-blue-700 border-blue-200",
      staff: "bg-green-100 text-green-700 border-green-200",
    };
    return (
      colors[role?.toLowerCase()] || "bg-gray-100 text-gray-700 border-gray-200"
    );
  };

  return (
    <div className="min-h-screen lg:p-5">
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <Link
          to="/employees"
          className="group inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors mb-4"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          <span className="group-hover:underline">Back to Employees</span>
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Employee Details
            </h1>
            <p className="text-gray-600 mt-1">
              {isEditing
                ? "Edit employee information"
                : "View employee profile and work details"}
            </p>
          </div>
          {!isEditing && (
            <Button
              onClick={handleEditToggle}
              className="hidden md:flex items-center gap-2 bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              <Edit className="h-4 w-4" />
              Edit Employee
            </Button>
          )}
        </div>
      </div>

      {/* Loading State */}
      {initialLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading employee details...</p>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <Card className="border-gray-200 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-20 relative">
              <div className="absolute -bottom-16 left-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-3xl shadow-xl border-4 border-white">
                  {getInitials(employeeForm.name)}
                </div>
              </div>
            </div>
            <CardContent className="pt-20 pb-6">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                <div className="mb-4 md:mb-0 flex-1">
                  {isEditing ? (
                    <div className="max-w-md">
                      <Label
                        htmlFor="name"
                        className="text-sm text-gray-500 mb-2"
                      >
                        Employee Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="Employee Name"
                        value={employeeForm.name}
                        onChange={handleChange}
                        className="text-2xl font-bold h-auto py-2 border-gray-300"
                        required
                      />
                    </div>
                  ) : (
                    <>
                      <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        {employeeForm.name}
                      </h2>
                      <p className="text-lg text-gray-600 mb-3">
                        {positions.find((p) => p._id === employeeForm.position)
                          ?.name || "No Position"}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <Badge
                          className={cn(
                            "px-3 py-1 border",
                            getRoleColor(employeeForm.role)
                          )}
                        >
                          <Briefcase className="w-3 h-3 mr-1" />
                          {employeeForm.role?.toUpperCase()}
                        </Badge>
                      </div>
                    </>
                  )}
                </div>
                {!isEditing && (
                  <Button
                    onClick={handleEditToggle}
                    className="md:hidden cursor-pointer bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Employee
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Personal Information */}
            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b border-blue-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <UserCircle2 className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">
                      Personal Information
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Contact details and personal data
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                    <Mail className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Email Address
                    </Label>
                    {isEditing ? (
                      <Input
                        name="email"
                        type="email"
                        placeholder="email@domain.com"
                        value={employeeForm.email}
                        onChange={handleChange}
                        className="mt-1"
                        required
                      />
                    ) : (
                      <span className="block text-base font-semibold text-gray-900 break-all">
                        {employeeForm.email || (
                          <span className="text-gray-400 font-normal">
                            Not provided
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                    <Phone className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Phone Number
                    </Label>
                    {isEditing ? (
                      <Input
                        name="phoneNumber"
                        placeholder="08xxxxxxxx"
                        value={employeeForm.phoneNumber}
                        onChange={handleChange}
                        className="mt-1"
                        required
                      />
                    ) : (
                      <span className="block text-base font-semibold text-gray-900">
                        {employeeForm.phoneNumber || (
                          <span className="text-gray-400 font-normal">
                            Not provided
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                    <MapPin className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Place of Birth
                    </Label>
                    {isEditing ? (
                      <Input
                        name="placeOfBirth"
                        placeholder="Bogor"
                        value={employeeForm.placeOfBirth}
                        onChange={handleChange}
                        className="mt-1"
                        required
                      />
                    ) : (
                      <span className="block text-base font-semibold text-gray-900">
                        {employeeForm.placeOfBirth || (
                          <span className="text-gray-400 font-normal">
                            Not provided
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                    <CalendarIcon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Date of Birth
                    </Label>
                    {isEditing ? (
                      <Popover
                        open={openCalendar}
                        onOpenChange={setOpenCalendar}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between mt-1"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <CalendarIcon className="flex-shrink-0 w-4 h-4" />
                              <span className="text-left truncate flex-1 min-w-0">
                                {selectedDate
                                  ? format(selectedDate, "PPP")
                                  : "Select birthdate"}
                              </span>
                              <ChevronDown className="flex-shrink-0 w-4 h-4" />
                            </div>
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
                    ) : (
                      <span className="block text-base font-semibold text-gray-900">
                        {employeeForm.dateOfBirth ? (
                          format(new Date(employeeForm.dateOfBirth), "PPP")
                        ) : (
                          <span className="text-gray-400 font-normal">
                            Not provided
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work Information */}
            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="border-b border-purple-100">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Briefcase className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Work Information</CardTitle>
                    <CardDescription className="text-sm">
                      Role, position, and professional details
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                    <Award className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Position
                    </Label>
                    {isEditing ? (
                      <Select
                        value={employeeForm.position}
                        onValueChange={(value) =>
                          handleSelectChange("position", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select position" />
                        </SelectTrigger>
                        <SelectContent>
                          {positions.map((pos) => (
                            <SelectItem key={pos._id} value={pos._id}>
                              {pos.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <span className="block text-base font-semibold text-gray-900">
                        {positions.find((p) => p._id === employeeForm.position)
                          ?.name || (
                          <span className="text-gray-400 font-normal">
                            No position assigned
                          </span>
                        )}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                    <Briefcase className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                      Role
                    </Label>
                    {isEditing ? (
                      <Select
                        value={employeeForm.role}
                        onValueChange={(value) =>
                          handleSelectChange("role", value)
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      <Badge
                        className={cn(
                          "mt-1 px-3 py-1 text-sm font-semibold border",
                          getRoleColor(employeeForm.role)
                        )}
                      >
                        {employeeForm.role?.toUpperCase()}
                      </Badge>
                    )}
                  </div>
                </div>

                {employeeForm.role !== "manager" && (
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                      <Users className="w-4 h-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
                        Manager
                      </Label>
                      {isEditing ? (
                        <Select
                          value={employeeForm.managerId}
                          onValueChange={(value) =>
                            handleSelectChange("managerId", value)
                          }
                        >
                          <SelectTrigger className="mt-1">
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {managers.map((manager) => (
                              <SelectItem key={manager.id} value={manager.id}>
                                {manager.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="block text-base font-semibold text-gray-900">
                          {managers.find((m) => m.id === employeeForm.managerId)
                            ?.name || (
                            <span className="text-gray-400 font-normal">
                              No manager assigned
                            </span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg mt-0.5">
                    <Award className="w-4 h-4 text-gray-600" />
                  </div>
                  <div className="flex-1">
                    <Label className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                      Skills
                    </Label>
                    {isEditing ? (
                      <SkillSelector
                        selectedSkills={skills}
                        onChange={setSkills}
                        isEditing={isEditing}
                        allowCustomAdd
                      />
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {skills?.length > 0 ? (
                          skills.map((skill, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-1"
                            >
                              {skill.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No skills added
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          {isEditing && (
            <Card className="border-gray-200 shadow-lg">
              <CardContent className="py-6">
                <div className="flex flex-col sm:flex-row justify-end gap-3">
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-red-300 text-red-600 hover:bg-red-50 cursor-pointer"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 cursor-pointer"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
