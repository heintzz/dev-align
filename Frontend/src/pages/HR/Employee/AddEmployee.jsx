/* eslint-disable no-unused-vars */
import { useState, useMemo, useEffect } from "react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";

//icon
import {
  X,
  PlusCircle,
  Calendar as CalendarIcon,
  ChevronDown,
  Check,
} from "lucide-react";
import UploadFile from "@/components/UploadFile";
import api from "@/api/axios";

import { format } from "date-fns";
import { email } from "zod";
import axios from "axios";

export default function AddEmployee() {
  const [skills, setSkills] = useState([]);
  const [open, setOpen] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [listSkills, setListSkills] = useState([]);
  const [positions, setPositions] = useState([]);
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

  const extractCV = async () => {
    if (!cvFile) {
      alert("Please upload a CV file first.");
      return;
    }

    // setLoading(true);
    const formData = new FormData();
    formData.append("file", cvFile);

    try {
      const { data } = await axios.post(
        "http://localhost:8000/cv/extract-data", // 🔥 change to your backend URL
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      console.log("✅ CV parsed successfully:", data);
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
      }
      // You can now use response.data.data to fill form fields
    } catch (error) {
      console.error(
        "❌ Extraction failed:",
        error.response?.data || error.message
      );
      alert(error.response?.data?.detail || "Failed to extract CV");
    }
    // finally {
    //   setLoading(false);
    // }
  };

  // --- Generic input handler ---
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmployeeForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // --- Role Select handler ---
  const handleSelectChange = (field, value) => {
    setEmployeeForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // --- Calendar handler ---
  const handleDateChange = (date) => {
    setSelectedDate(date);
    setEmployeeForm((prev) => ({
      ...prev,
      dateOfBirth: date ? format(date, "yyyy-MM-dd") : "",
    }));
    setCalendarOpen(false);
  };

  const getSkills = async () => {
    const { data } = await api.get("/skill");
    console.log(data);
    setListSkills(data.data.skills);
  };

  const getPosition = async () => {
    const { data } = await api.get("/position");
    console.log(data);
    setPositions(data.data.positions || []);
  };

  const getManagers = async () => {
    const { data } = await api.get("/hr/employees", {
      params: {
        role: "manager",
      },
    });
    console.log(data.data);
    setManagers(data.data || []);
  };

  const handleAddSkill = (skill) => {
    console.log(skill);

    const isSelected = skills.some((s) => s.name === skill.name);

    if (!isSelected) {
      setSkills((prev) => [...prev, { name: skill.name }]);
    } else {
      setSkills((prev) => prev.filter((s) => s.name !== skill.name));
    }

    setSearch("");
    setOpen(false);
  };

  const handleRemoveSkill = (skill) => {
    console.log(skill);
    setSkills((prev) => prev.filter((s) => s.name !== skill.name));
  };

  const handleCustomAdd = async () => {
    try {
      console.log("Searching for skill:", search);

      const { data } = await api.post("/skill", { name: search });
      console.log("API response:", data);

      await getSkills();

      setSkills((prevSkills) => {
        const exists = prevSkills.some((s) => s.name === search);
        if (!exists) {
          return [...prevSkills, { name: search }];
        }
        return prevSkills;
      });

      setSearch("");
      setOpen(false);
    } catch (error) {
      console.error("Error adding skill:", error);
    }
  };

  const createEmployee = async (e) => {
    e.preventDefault();

    const formData = {
      ...employeeForm,
      skills: skills.map((s) => s.name),
    };

    console.log("Form Data:", formData);

    try {
      const { data } = await api.post("/hr/employee", formData);
      console.log("Response:", data);
    } catch (error) {
      console.error("Error creating employee:", error);
    }
  };

  useEffect(() => {
    getSkills();
    getPosition();
    getManagers();
  }, []);

  return (
    <>
      <div className=" p-6">
        <h1 className="text-3xl font-extrabold tracking-tight text-balance mb-10">
          Add New Employee
        </h1>
        <div className="grid grid-cols-2 gap-4 items-start">
          <div className="">
            <Card className="w-full mb-5">
              <CardHeader>
                <CardTitle>Upload CV</CardTitle>
                <CardDescription>
                  Extract employee data from CV File
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UploadFile
                  label="Upload document"
                  iconType="file"
                  accept=".pdf,.docx"
                  onFileSelect={(file) => setCvFile(file)} // 👈 capture file here
                />
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button
                  onClick={extractCV}
                  className="bg-primer cursor-pointer"
                >
                  Extract
                </Button>
              </CardFooter>
            </Card>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Skills</CardTitle>
                <CardDescription>
                  Input the employee skills here
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between cursor-pointer"
                    >
                      Add skill
                      <PlusCircle className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>

                  <PopoverContent className="w-80 p-0">
                    <Command>
                      <CommandInput
                        placeholder="Search skill..."
                        value={search}
                        onValueChange={setSearch}
                      />
                      <CommandEmpty>
                        <div className="p-2 text-sm text-muted-foreground">
                          No skill found.
                        </div>
                        {search && (
                          <Button
                            variant="ghost"
                            className="w-full justify-start text-left text-sm"
                            onClick={handleCustomAdd}
                          >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add “{search}”
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
                              className={`
          flex items-center justify-between cursor-pointer transition-colors
          ${isSelected ? "bg-primer/10 text-primer" : "hover:bg-gray-100"}`}
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
                  <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
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
                          className="hover:text-destructive focus:outline-none"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No skills added yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card className="w-full">
              <CardHeader>
                <CardTitle>Employee Details</CardTitle>
                <CardDescription>Input your employee detail</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={createEmployee}>
                  <FieldGroup>
                    <FieldSet>
                      <FieldGroup>
                        <Field>
                          <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                            Employee Name
                          </FieldLabel>
                          <Input
                            id="checkout-7j9-card-name-43j"
                            name="name"
                            placeholder="Meira Nuraeni"
                            value={employeeForm.name}
                            onChange={handleChange}
                            required
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="checkout-7j9-card-email-uw1">
                            Email
                          </FieldLabel>
                          <Input
                            id="checkout-7j9-card-email-uw1"
                            name="email"
                            placeholder="email@domain.com"
                            value={employeeForm.email}
                            onChange={handleChange}
                            required
                          />
                        </Field>
                        <Field>
                          <FieldLabel htmlFor="checkout-7j9-card-phnumber-uw1">
                            Phone Number
                          </FieldLabel>
                          <Input
                            id="checkout-7j9-card-phnumber-uw1"
                            name="phoneNumber"
                            placeholder="08xxxxxxxx"
                            value={employeeForm.phoneNumber}
                            onChange={handleChange}
                            required
                          />
                        </Field>
                        <div className="grid grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel htmlFor="checkout-7j9-card-bplace-uw1">
                              Place of Birth
                            </FieldLabel>
                            <Input
                              id="checkout-7j9-card-bplace-uw1"
                              name="placeOfBirth"
                              placeholder="Bogor"
                              value={employeeForm.placeOfBirth}
                              onChange={handleChange}
                              required
                            />
                          </Field>
                          <Field>
                            <FieldLabel htmlFor="checkout-7j9-bdate-f59">
                              Birth Date
                            </FieldLabel>
                            <Popover
                              open={calendarOpen}
                              onOpenChange={setCalendarOpen}
                            >
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  id="date"
                                  className="w-48 justify-between font-normal cursor-pointer"
                                >
                                  <div className="flex items-center space-x-2">
                                    <CalendarIcon />
                                    <p>
                                      {selectedDate
                                        ? format(selectedDate, "PPP")
                                        : "Select Birthdate"}
                                    </p>
                                  </div>
                                  <ChevronDown />
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent
                                className="w-auto overflow-hidden p-0"
                                align="start"
                              >
                                <Calendar
                                  mode="single"
                                  selected={selectedDate}
                                  captionLayout="dropdown"
                                  onSelect={handleDateChange}
                                />
                              </PopoverContent>
                            </Popover>
                          </Field>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <Field>
                            <FieldLabel htmlFor="checkout-7j9-position-uw1">
                              Position
                            </FieldLabel>
                            <Select
                              value={employeeForm.position}
                              onValueChange={(value) =>
                                handleSelectChange("position", value)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select a position" />
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
                            <FieldLabel htmlFor="checkout-7j9-role-f59">
                              Role
                            </FieldLabel>
                            <Select
                              value={employeeForm.role}
                              onValueChange={(value) =>
                                handleSelectChange("role", value)
                              }
                            >
                              <SelectTrigger
                                id="checkout-7j9-role-f59"
                                className="cursor-pointer"
                              >
                                <SelectValue placeholder="HR / Manager / Staff" />
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
                          <FieldLabel htmlFor="checkout-7j9-manager-43j">
                            Manager
                          </FieldLabel>
                          <Select
                            value={employeeForm.managerId}
                            onValueChange={(value) =>
                              handleSelectChange("managerId", value)
                            }
                          >
                            <SelectTrigger className="cursor-pointer">
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
                        </Field>
                      </FieldGroup>
                    </FieldSet>
                    <FieldSeparator />
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        className="w-1/2 cursor-pointer bg-primer"
                      >
                        Submit
                      </Button>
                    </div>
                  </FieldGroup>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
