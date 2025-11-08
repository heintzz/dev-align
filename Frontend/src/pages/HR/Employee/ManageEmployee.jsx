/* eslint-disable no-unused-vars */
import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// shadcn/ui components
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

//icon
import {
  Users,
  UserPlus,
  UserMinus,
  MoreVertical,
  Plus,
  FilePenLine,
  Sheet,
  Download,
  CircleCheckBig,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  Eye,
  UserCheck,
  UserX,
  TrendingUp,
  ArrowUpDown,
} from "lucide-react";
import api from "@/api/axios";
import UploadFile from "@/components/UploadFile";
import { cn } from "@/lib/utils";

import { toast } from "@/lib/toast";
import Loading from "@/components/Loading";

export default function ManageEmployee() {
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [positionFilter, setPositionFilter] = useState("all");

  const [employees, setEmployees] = useState([]);
  const [openAddExcel, setOpenAddExcel] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [leavingCount, setLeavingCount] = useState(0);
  const [positionsList, setPositionsList] = useState([]);

  const [openConfirmation, setOpenConfirmation] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState();

  const navigate = useNavigate();

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          className="flex items-center gap-2 font-semibold hover:text-blue-600 transition-colors"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          {column.getIsSorted() === "asc" ? (
            <ChevronUp className="w-4 h-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      ),
      cell: ({ row }) => (
        <div className="font-medium text-gray-900">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <div className="text-gray-600">{row.getValue("email")}</div>
      ),
    },
    {
      accessorKey: "position.name",
      header: "Position",
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-blue-100 text-blue-700">
          {row.original.position?.name || "-"}
        </Badge>
      ),
    },
    {
      accessorKey: "role",
      header: "Role",
      cell: ({ row }) => {
        const role = row.getValue("role");
        const getRoleColor = (role) => {
          const colors = {
            hr: "bg-red-100 text-red-700",
            manager: "bg-purple-100 text-purple-700",
            staff: "bg-green-100 text-green-700",
          };
          return colors[role?.toLowerCase()] || "bg-gray-100 text-gray-700";
        };
        return (
          <Badge className={cn("capitalize", getRoleColor(role))}>{role}</Badge>
        );
      },
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("active");
        return (
          <Badge
            className={cn(
              "flex items-center gap-1 w-fit",
              isActive
                ? "bg-green-100 text-green-700"
                : "bg-red-100 text-red-700"
            )}
          >
            {isActive ? (
              <>
                <UserCheck className="w-3 h-3" />
                Active
              </>
            ) : (
              <>
                <UserX className="w-3 h-3" />
                Resigned
              </>
            )}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-center">Actions</div>,
      cell: ({ row }) => {
        const isActive = row.original.active;
        return (
          <div className="flex justify-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => navigate(`detail/${row.original.id}`)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setOpenConfirmation(true);
                    setUserToUpdate({
                      active: isActive,
                      id: row.original.id,
                      name: row.original.name,
                    });
                  }}
                  className={cn(
                    "cursor-pointer flex items-center gap-2",
                    isActive ? "text-red-600" : "text-green-600"
                  )}
                >
                  {isActive ? (
                    <>
                      <UserX className="w-4 h-4" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      Activate
                    </>
                  )}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        );
      },
    },
  ];

  const getEmployeeStats = async () => {
    setLoadingState(true);
    setLoadingText("Loading employee statistics...");
    try {
      const { data } = await api.get("/hr/employees", {
        params: { limit: 1000 },
      });

      const currentDate = new Date();
      const firstDayOfMonth = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1
      );

      const newEmployees = data.data.filter((emp) => {
        if (!emp.createdAt) return false;
        const joinDate = new Date(emp.createdAt);
        return joinDate >= firstDayOfMonth;
      });

      const leavingEmployees = data.data.filter((emp) => {
        if (emp.active) return false;
        if (!emp.updatedAt) return false;
        const leaveDate = new Date(emp.updatedAt);
        return leaveDate >= firstDayOfMonth;
      });

      setTotalCount(data.meta.total);
      setNewCount(newEmployees.length);
      setLeavingCount(leavingEmployees.length);
    } catch (error) {
      console.warn("Error calculating employee stats:", error);
      toast(
        error.response?.data?.message || "Failed to get employee statistics",
        {
          type: "error",
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const getEmployees = async () => {
    setLoadingState(true);
    setLoadingText("Loading employees...");
    try {
      const params = {
        page: pageIndex + 1,
        limit: pageSize,
        search: globalFilter || undefined,
        active: statusFilter === "all" ? undefined : statusFilter,
        position:
          positionFilter && positionFilter !== "all"
            ? positionFilter
            : undefined,
      };

      const { data } = await api.get("/hr/employees", { params });
      setEmployees(data.data);
      setTotal(data.meta.total);
    } catch (error) {
      console.error(error);
      toast(error.response?.data?.message || "Failed to load employees", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const loadPositions = async () => {
    setLoadingState(true);
    setLoadingText("Loading positions...");
    try {
      const projectService = await import("../../../services/project.service");
      const res = await projectService.default.getAllPositions();
      let list = [];
      if (Array.isArray(res)) list = res;
      else if (res && res.positions) list = res.positions;
      else if (res && res.data && res.data.positions) list = res.data.positions;
      setPositionsList(list || []);
    } catch (error) {
      console.warn("Failed to load positions", error);
      setPositionsList([]);
      toast(error.response?.data?.message || "Failed to load positions", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const getExcelTemplate = async () => {
    const response = await api.get("/hr/employees/template", {
      responseType: "blob",
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "employee-import-template.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const AddEmployeeByExcel = async () => {
    setLoadingState(true);
    setLoadingText("Importing employees...");

    if (!excelFile) {
      toast("Please select a file first!", {
        type: "warning",
        position: "top-center",
      });
      setLoadingState(false);
      setLoadingText("");
      return;
    }

    const formData = new FormData();
    formData.append("file", excelFile);

    try {
      const response = await api.post(
        "/hr/employees/import?dryRun=false&sendEmails=false",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      toast(
        `Import completed! Created: ${response.data.created}, Failed: ${response.data.failed}`,
        {
          icon: <CircleCheckBig className="w-5 h-5 text-white" />,
          type: "success",
          position: "top-center",
          duration: 5000,
        }
      );
      setOpenAddExcel(false);
      setExcelFile(null);
    } catch (error) {
      console.error("Failed to import employees:", error);
      toast(error.response?.data?.message || "Failed to import employees", {
        type: "error",
        position: "top-center",
        duration: 4000,
      });
    } finally {
      getEmployees();
      getEmployeeStats();
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const changeEmployeeStatus = async (id, isActive) => {
    setLoadingState(true);
    setLoadingText("Updating employee status...");
    try {
      const { data } = await api.delete(`hr/employee/${id}?active=${isActive}`);
      toast(
        `Employee ${isActive ? "activated" : "deactivated"} successfully!`,
        {
          type: "success",
          position: "top-center",
          duration: 3000,
        }
      );
      console.log(data);
      getEmployees();
      getEmployeeStats();
      setOpenConfirmation(false);
    } catch (error) {
      toast(
        error.response?.data?.message || "Failed to update employee status",
        {
          type: "error",
          position: "top-center",
          duration: 4000,
        }
      );
    } finally {
      setLoadingState(false);
      setLoadingText("");
    }
  };

  const table = useReactTable({
    data: employees,
    columns,
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(total / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    getEmployees();
  }, [pageIndex, pageSize, globalFilter, statusFilter, positionFilter]);

  useEffect(() => {
    loadPositions();
    getEmployeeStats();
  }, []);

  return (
    <>
      <Loading status={loadingState} fullscreen text={loadingText} />

      {/* Confirmation Dialog */}
      {openConfirmation && userToUpdate && (
        <AlertDialog open={openConfirmation} onOpenChange={setOpenConfirmation}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                {userToUpdate.active ? (
                  <>
                    <UserX className="w-5 h-5 text-red-600" />
                    Deactivate Employee
                  </>
                ) : (
                  <>
                    <UserCheck className="w-5 h-5 text-green-600" />
                    Activate Employee
                  </>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {userToUpdate.active
                  ? `Are you sure you want to deactivate ${userToUpdate.name}? They will no longer have access to the system.`
                  : `Are you sure you want to activate ${userToUpdate.name}? They will regain access to the system.`}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() =>
                  changeEmployeeStatus(userToUpdate.id, !userToUpdate.active)
                }
                className={cn(
                  "cursor-pointer",
                  userToUpdate.active
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-green-600 hover:bg-green-700"
                )}
              >
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Employee Management
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your team members and their information
            </p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg cursor-pointer">
                <Plus className="h-4 w-4 mr-2" />
                Add Employee
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                onClick={() => navigate(`/addEmployee`)}
                className="cursor-pointer flex items-center gap-2"
              >
                <FilePenLine className="w-4 h-4" />
                Individual
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => setOpenAddExcel(true)}
                className="cursor-pointer flex items-center gap-2"
              >
                <Sheet className="w-4 h-4" />
                Multiple (Excel)
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Employees */}
          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-2 bg-gradient-to-r from-blue-500 to-cyan-500" />
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Total Employees
                  </p>
                  <p className="text-4xl font-bold text-gray-900">
                    {totalCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">Active workforce</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg">
                  <Users className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* New Employees */}
          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-2 bg-gradient-to-r from-green-500 to-emerald-500" />
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    New Employees
                  </p>
                  <p className="text-4xl font-bold text-green-600">
                    {newCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">This month</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg">
                  <UserPlus className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaving Employees */}
          <Card className="border-gray-200 shadow-lg hover:shadow-xl transition-shadow">
            <div className="h-2 bg-gradient-to-r from-red-500 to-pink-500" />
            <CardContent>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Resigned
                  </p>
                  <p className="text-4xl font-bold text-red-600">
                    {leavingCount}
                  </p>
                  <p className="text-xs text-gray-500 mt-2">This month</p>
                </div>
                <div className="p-3 bg-gradient-to-br from-red-500 to-pink-500 rounded-xl shadow-lg">
                  <UserMinus className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Table Card */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <CardTitle className="text-lg">Employee Directory</CardTitle>
                <CardDescription className="text-sm">
                  View and manage all employees
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search by name..."
                  value={globalFilter}
                  onChange={(e) => {
                    setGlobalFilter(e.target.value);
                    setPageIndex(0);
                  }}
                  className="pl-10 border-gray-300 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Select
                value={statusFilter}
                onValueChange={(val) => {
                  setStatusFilter(val);
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-[180px] cursor-pointer border-gray-300">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="Status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">
                    All Status
                  </SelectItem>
                  <SelectItem value="true" className="cursor-pointer">
                    Active
                  </SelectItem>
                  <SelectItem value="false" className="cursor-pointer">
                    Resigned
                  </SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={positionFilter}
                onValueChange={(val) => {
                  setPositionFilter(val);
                  setPageIndex(0);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px] cursor-pointer border-gray-300">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-gray-500" />
                    <SelectValue placeholder="Position" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" className="cursor-pointer">
                    All Positions
                  </SelectItem>
                  {positionsList.map((p) => (
                    <SelectItem
                      key={p._id || p.id || p.name}
                      value={String(p._id || p.id || p.name)}
                      className="cursor-pointer"
                    >
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Table */}
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id}>
                        {headerGroup.headers.map((header) => (
                          <TableHead key={header.id} className="font-semibold">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                          </TableHead>
                        ))}
                      </TableRow>
                    ))}
                  </TableHeader>

                  <TableBody>
                    {employees.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={columns.length}
                          className="text-center py-12"
                        >
                          <div className="flex flex-col items-center gap-2 text-gray-500">
                            <Users className="w-12 h-12 text-gray-400" />
                            <p className="font-medium">No employees found</p>
                            <p className="text-sm">
                              Try adjusting your filters
                            </p>
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      table.getRowModel().rows.map((row) => (
                        <TableRow
                          key={row.id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <TableCell key={cell.id}>
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext()
                              )}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="text-sm text-gray-600">
                  Showing{" "}
                  <span className="font-medium">
                    {pageIndex * pageSize + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min((pageIndex + 1) * pageSize, total)}
                  </span>{" "}
                  of <span className="font-medium">{total}</span> employees
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
                    disabled={pageIndex === 0}
                    className="cursor-pointer"
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setPageIndex((p) =>
                        p + 1 < Math.ceil(total / pageSize) ? p + 1 : p
                      )
                    }
                    disabled={pageIndex + 1 >= Math.ceil(total / pageSize)}
                    className="cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Excel Import Dialog */}
      <Dialog
        open={openAddExcel}
        onOpenChange={(isOpen) => {
          setOpenAddExcel(isOpen);
          if (!isOpen) {
            setExcelFile(null);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Sheet className="w-5 h-5 text-blue-600" />
              Import Multiple Employees
            </DialogTitle>
            <DialogDescription className="pt-2">
              Upload an Excel file to add multiple employees at once. Please
              ensure all employees in the file have the same role.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button
              onClick={getExcelTemplate}
              variant="outline"
              className="w-full border-blue-300 text-blue-700 hover:bg-blue-50 cursor-pointer"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Excel Template
            </Button>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
              <UploadFile
                label="Upload Excel File"
                iconType="file"
                accept=".xlsx"
                onFileSelect={(file) => setExcelFile(file)}
              />
              {excelFile && (
                <p className="text-sm text-green-600 mt-2 flex items-center gap-1">
                  <CircleCheckBig className="w-4 h-4" />
                  File selected: {excelFile.name}
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </DialogClose>
            <Button
              onClick={AddEmployeeByExcel}
              disabled={!excelFile}
              className="bg-blue-600 hover:bg-blue-700 cursor-pointer"
            >
              Import Employees
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
