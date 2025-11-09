import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { format } from "date-fns";
import axios from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import api from "@/api/axios";
import UploadFile from "@/components/UploadFile";
import { SkillSelector } from "@/components/SkillSelector";
import { PositionSelector } from "@/components/PositionSelector";
import {
  ArrowLeft,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar as CalendarIconLucide,
  Briefcase,
  Shield,
  Users,
  Sparkles,
  ChevronDown,
  Save,
  Loader2,
  Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import apiAI from "@/api/ai";

import { toast } from "@/lib/toast";
import Loading from "@/components/Loading";

export default function AddEmployee() {
  const [skills, setSkills] = useState([]);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [managers, setManagers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [cvFile, setCvFile] = useState(null);
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

  const navigate = useNavigate();
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [extracting, setExtracting] = useState(false);

  const extractCV = async () => {
    if (!cvFile) {
      toast("Please upload a CV file first.", {
        type: "warning",
      });
      return;
    }

    setLoadingState(true);
    setLoadingText("Extracting CV...");

    const formData = new FormData();
    formData.append("file", cvFile);

    try {
      setExtracting(true);
      const { data } = await apiAI.post("/cv/extract-data", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (data?.data) {
        const extracted = data.data;
        setEmployeeForm((prev) => ({
          ...prev,
          name: extracted?.name ?? prev.name,
          email: extracted?.email ?? prev.email,
          phoneNumber: extracted?.phoneNumber ?? prev.phoneNumber,
        }));

        if (Array.isArray(extracted?.skills)) {
          setSkills(extracted.skills.map((skill) => ({ name: skill })));
        }
        toast("CV extracted successfully!", {
          type: "success",
          position: "top-center",
          duration: 5000,
        });
      }
    } catch (error) {
      console.error(
        "Extraction failed:",
        error.response?.data || error.message
      );
      toast(error.response?.data?.detail || "Failed to extract CV", {
        type: "error",
      });
    } finally {
      setExtracting(false);
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
    setCalendarOpen(false);
  };

  const getManagers = async () => {
    try {
      const { data } = await api.get("/hr/employees", {
        params: { role: "manager" },
      });
      setManagers(data.data || []);
    } catch (error) {
      console.error("Error fetching managers:", error);
      toast(error.response?.data?.message || "Error fetching managers", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    }
  };

  const createEmployee = async (e) => {
    e.preventDefault();

    if (employeeForm.role === "manager") {
      employeeForm.managerId = null;
    }

    const formData = {
      ...employeeForm,
      skills: skills.map((s) => s.name),
    };

    setLoadingState(true);
    setLoadingText("Adding Employee...");

    try {
      await api.post("/hr/employee", formData);
      toast("Employee added successfully!", {
        type: "success",
      });
      navigate("/employees");
    } catch (error) {
      console.error("Error creating employee:", error);
      toast(error.response?.data?.message || "Failed to add employee", {
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
    getManagers();
  }, []);

  return (
    <div className="min-h-screen pb-24 pt-5 lg:px-5 lg:py-10">
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

        <div className="flex items-center gap-3">
          <div className="p-3 bg-linear-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Add New Employee
            </h1>
            <p className="text-gray-600 mt-1">
              Fill in the details to add a new team member
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - CV Upload & Skills */}
          <div className="space-y-6 ">
            {/* CV Upload Card */}
            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow bg-linear-to-r from-purple-50 to-pink-50 border-b border-purple-100">
              <CardHeader className="">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Upload CV</CardTitle>
                    <CardDescription className="text-sm">
                      Extract data automatically
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <UploadFile
                  label="Upload document"
                  iconType="file"
                  accept=".pdf,.docx"
                  onFileSelect={(file) => setCvFile(file)}
                />
                {cvFile && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-green-700">
                      <FileText className="w-4 h-4" />
                      <span className="font-medium truncate">
                        {cvFile.name}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
              <CardFooter className="border-t">
                <Button
                  onClick={extractCV}
                  disabled={!cvFile || extracting}
                  className="w-full bg-linear-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-md hover:shadow-lg transition-all cursor-pointer"
                >
                  {extracting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Extracting...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Extract Data
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>

          {/* Right Column - Employee Details */}
          <div className="lg:col-span-2">
            <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-linear-to-r from-gray-50 to-white border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">Employee Details</CardTitle>
                    <CardDescription>
                      Enter the employee information
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label
                          htmlFor="name"
                          className="flex items-center gap-2"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          name="name"
                          placeholder="John Doe"
                          value={employeeForm.name}
                          onChange={handleChange}
                          required
                          className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="email"
                          className="flex items-center gap-2"
                        >
                          <Mail className="w-4 h-4 text-gray-400" />
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          placeholder="john.doe@company.com"
                          value={employeeForm.email}
                          onChange={handleChange}
                          required
                          className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="phoneNumber"
                          className="flex items-center gap-2"
                        >
                          <Phone className="w-4 h-4 text-gray-400" />
                          Phone Number
                        </Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          placeholder="08123456789"
                          value={employeeForm.phoneNumber}
                          onChange={handleChange}
                          required
                          className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="placeOfBirth"
                          className="flex items-center gap-2"
                        >
                          <MapPin className="w-4 h-4 text-gray-400" />
                          Place of Birth
                        </Label>
                        <Input
                          id="placeOfBirth"
                          name="placeOfBirth"
                          placeholder="Jakarta"
                          value={employeeForm.placeOfBirth}
                          onChange={handleChange}
                          required
                          className="border-gray-300 focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      <div className="space-y-2 md:col-span-2">
                        <Label
                          htmlFor="dateOfBirth"
                          className="flex items-center gap-2"
                        >
                          <CalendarIconLucide className="w-4 h-4 text-gray-400" />
                          Date of Birth
                        </Label>
                        <Popover
                          open={calendarOpen}
                          onOpenChange={setCalendarOpen}
                        >
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-between font-normal border-gray-300 hover:bg-gray-50 cursor-pointer",
                                !selectedDate && "text-gray-500"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <CalendarIconLucide className="w-4 h-4" />
                                {selectedDate
                                  ? format(selectedDate, "PPP")
                                  : "Select date of birth"}
                              </div>
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={selectedDate}
                              captionLayout="dropdown"
                              onSelect={handleDateChange}
                              fromYear={1950}
                              toYear={2010}
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                  </div>

                  {/* Work Information Section */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <h3 className="font-semibold text-gray-700">
                        Work Information
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      <div className="space-y-2">
                        <Label
                          htmlFor="role"
                          className="flex items-center gap-2"
                        >
                          <Shield className="w-4 h-4 text-gray-400" />
                          Role
                        </Label>
                        <Select
                          value={employeeForm.role}
                          onValueChange={(value) =>
                            handleSelectChange("role", value)
                          }
                        >
                          <SelectTrigger className="border-gray-300 w-full cursor-pointer">
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="hr" className="cursor-pointer">
                              HR
                            </SelectItem>
                            <SelectItem
                              value="manager"
                              className="cursor-pointer"
                            >
                              Manager
                            </SelectItem>
                            <SelectItem
                              value="staff"
                              className="cursor-pointer"
                            >
                              Staff
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {employeeForm.role === "staff" && (
                        <>
                          <div className="space-y-2">
                            <Label
                              htmlFor="position"
                              className="flex items-center gap-2"
                            >
                              <Briefcase className="w-4 h-4 text-gray-400" />
                              Position
                            </Label>
                            <PositionSelector
                              selectedPosition={employeeForm.position}
                              onChange={(pos) =>
                                setEmployeeForm((prev) => ({
                                  ...prev,
                                  position: pos,
                                }))
                              }
                              isEditing={true}
                              allowCustomAdd
                            />
                          </div>

                          <div className="space-y-2 md:col-span-2">
                            <Label
                              htmlFor="manager"
                              className="flex items-center gap-2"
                            >
                              <Users className="w-4 h-4 text-gray-400" />
                              Manager
                            </Label>
                            <Select
                              value={employeeForm.managerId}
                              onValueChange={(value) =>
                                handleSelectChange("managerId", value)
                              }
                            >
                              <SelectTrigger className="border-gray-300 w-full cursor-pointer">
                                <SelectValue placeholder="Select a manager" />
                              </SelectTrigger>
                              <SelectContent>
                                {managers.map((manager) => (
                                  <SelectItem
                                    key={manager.id}
                                    value={manager.id}
                                    className="cursor-pointer"
                                  >
                                    {manager.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b">
                      <Medal className="w-4 h-4 text-gray-500" />
                      <h3 className="font-semibold text-gray-700">Skills</h3>
                    </div>
                    <div className="space-y-2">
                      <SkillSelector
                        selectedSkills={skills}
                        onChange={setSkills}
                        isEditing={true}
                        allowCustomAdd
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t">
                    <Button
                      onClick={createEmployee}
                      disabled={loadingState}
                      className="w-full md:min-w-[200px] bg-linear-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-lg hover:shadow-xl transition-all cursor-pointer"
                    >
                      {loadingState ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding Employee...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Add Employee
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
