import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import api from "@/api/axios";

// 🧱 shadcn/ui components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import {
  Field,
  FieldLabel,
  FieldGroup,
  FieldSet,
  FieldSeparator,
} from "@/components/ui/field";

import { SkillSelector } from "@/components/SkillSelector";

// 🧭 icons
import {
  X,
  PlusCircle,
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
  User,
  Edit,
  Save,
} from "lucide-react";

export default function EmployeeDetail() {
  const { id } = useParams();

  // 🌿 States
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

  // UI Controls
  const [isEditing, setIsEditing] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);

  // 🧭 Fetch employee detail
  const getEmployee = async () => {
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
      position: emp.position?._id || "", // ✅ Extract _id from nested position object
      skills: emp.skills || [],
      managerId: emp.managerId || "",
      role: emp.role || "",
    });
    console.log(emp.skills);
    setSkills(emp.skills);
    if (emp.dateOfBirth) setSelectedDate(new Date(emp.dateOfBirth));
  };

  // 🧭 Fetch dropdown data
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

  // 🚀 On mount
  useEffect(() => {
    getEmployee();
    getPositions();
    getManagers();
  }, []);

  // 🧠 Handlers
  const handleEditToggle = () => setIsEditing((prev) => !prev);
  const handleCancel = () => {
    setIsEditing(false);
    getEmployee(); // reset form to original data
  };
  const handleSave = async () => {
    try {
      console.log(employeeForm);
      const skillName = skills.map((skill) => skill.name);
      console.log(skillName);
      const updatedEmployee = {
        ...employeeForm,
        skills: skillName,
      };
      await api.put(`/hr/employee/${id}`, updatedEmployee);
      setIsEditing(false);
      await getEmployee();
    } catch (error) {
      console.error("Error updating employee:", error);
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

  // 🖼 UI
  return (
    <div className="p-6">
      <Card className="w-full">
        <CardContent>
          <FieldGroup>
            <FieldSet>
              {/* Header Section */}
              <div className="flex items-center space-x-3 mb-6">
                <div className="h-32 w-32 flex items-center justify-center rounded-full bg-teal-100">
                  <User className="h-8 w-8 text-teal-600" />
                </div>
                <Field className="w-96">
                  <FieldLabel>Employee Name</FieldLabel>
                  <Input
                    name="name"
                    placeholder="Meira Nuraeni"
                    value={employeeForm.name}
                    onChange={handleChange}
                    required
                    disabled={!isEditing}
                  />
                </Field>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <Field>
                    <FieldLabel>Email</FieldLabel>
                    <Input
                      name="email"
                      placeholder="email@domain.com"
                      value={employeeForm.email}
                      onChange={handleChange}
                      required
                      disabled={!isEditing}
                    />
                  </Field>

                  <Field>
                    <FieldLabel>Phone Number</FieldLabel>
                    <Input
                      name="phoneNumber"
                      placeholder="08xxxxxxxx"
                      value={employeeForm.phoneNumber}
                      onChange={handleChange}
                      required
                      disabled={!isEditing}
                    />
                  </Field>

                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Place of Birth</FieldLabel>
                      <Input
                        name="placeOfBirth"
                        placeholder="Bogor"
                        value={employeeForm.placeOfBirth}
                        onChange={handleChange}
                        required
                        disabled={!isEditing}
                      />
                    </Field>

                    <Field>
                      <FieldLabel>Birth Date</FieldLabel>
                      <Popover
                        open={openCalendar}
                        onOpenChange={setOpenCalendar}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-between"
                            disabled={!isEditing}
                          >
                            <div className="flex items-center space-x-2">
                              <CalendarIcon />
                              <span>
                                {selectedDate
                                  ? format(selectedDate, "PPP")
                                  : "Select Birthdate"}
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
                    </Field>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Field>
                      <FieldLabel>Position</FieldLabel>
                      <Select
                        value={employeeForm.position}
                        onValueChange={(value) =>
                          handleSelectChange("position", value)
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
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
                    </Field>
                    <Field>
                      <FieldLabel>Role</FieldLabel>
                      <Select
                        value={employeeForm.role}
                        onValueChange={(value) =>
                          handleSelectChange("role", value)
                        }
                        disabled={!isEditing}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hr">HR</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="staff">Staff</SelectItem>
                        </SelectContent>
                      </Select>
                    </Field>
                  </div>

                  <Field>
                    <FieldLabel>Manager</FieldLabel>
                    <Select
                      value={employeeForm.managerId}
                      onValueChange={(value) =>
                        handleSelectChange("managerId", value)
                      }
                      disabled={!isEditing}
                    >
                      <SelectTrigger>
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
                  </Field>

                  {/* Skills Section */}
                  <Field>
                    <FieldLabel>Skills</FieldLabel>
                    <SkillSelector
                      selectedSkills={skills}
                      onChange={setSkills}
                      isEditing={isEditing}
                      className="max-h-12"
                    />
                    {/* <Popover
                      open={openSkillPopover}
                      onOpenChange={setOpenSkillPopover}
                    >
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between"
                          disabled={!isEditing}
                        >
                          Add skill
                          <PlusCircle className="ml-2 h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0">
                        <Command>
                          <CommandInput
                            placeholder="Search skill..."
                            value={searchSkill}
                            onValueChange={setSearchSkill}
                          />
                          <CommandEmpty>
                            <div className="p-2 text-sm text-muted-foreground">
                              No skill found.
                            </div>
                            {searchSkill && (
                              <Button
                                variant="ghost"
                                className="w-full justify-start text-left text-sm"
                                onClick={handleCustomAddSkill}
                              >
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Add “{searchSkill}”
                              </Button>
                            )}
                          </CommandEmpty>
                          <CommandGroup>
                            {listSkills.map((skill) => {
                              const isSelected = skills.some(
                                (s) => s.name === skill.name
                              );
                              return (
                                <CommandItem
                                  key={skill.name}
                                  onSelect={() => handleAddSkill(skill)}
                                  className={`flex justify-between ${
                                    isSelected ? "bg-primer/10 text-primer" : ""
                                  }`}
                                >
                                  <span>{skill.name}</span>
                                  {isSelected && (
                                    <Check className="h-4 w-4 text-primer" />
                                  )}
                                </CommandItem>
                              );
                            })}
                          </CommandGroup>
                        </Command>
                      </PopoverContent>
                    </Popover>

                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2 mt-2 max-h-20 overflow-y-auto">
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
                              className="enabled:hover:text-destructive focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={!isEditing}
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground mt-2">
                        No skills added yet.
                      </p>
                    )} */}
                  </Field>
                </div>
              </div>
            </FieldSet>

            <FieldSeparator />
            <div className="flex justify-end">
              {!isEditing ? (
                <Button
                  onClick={handleEditToggle}
                  className="bg-primer flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" /> Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={handleSave}
                    className="bg-primer flex items-center gap-2 mr-3"
                  >
                    <Save className="h-4 w-4" /> Save
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    className="border-destructive text-destructive flex items-center gap-2"
                  >
                    <X className="h-4 w-4" /> Cancel
                  </Button>
                </>
              )}
            </div>
          </FieldGroup>
        </CardContent>
      </Card>
    </div>
  );
}
