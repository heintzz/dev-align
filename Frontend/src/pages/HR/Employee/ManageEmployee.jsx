import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// shadcn/ui components
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
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
import { Checkbox } from "@/components/ui/checkbox";

//icon
import {
  Users,
  UserPlus,
  UserMinus,
  Ellipsis,
  Plus,
  FilePenLine,
  Sheet,
} from "lucide-react";
import api from "@/api/axios";

export default function ManageEmployee() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(5);
  const [globalFilter, setGlobalFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [employees, setEmployees] = useState([]);

  const navigate = useNavigate();

  const columns = [
    {
      accessorKey: "id",
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          className="cursor-pointer"
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          className="cursor-pointer"
          aria-label="Select row"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => (
        <button
          className="flex items-center font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <span className="ml-1 text-xs">
            {column.getIsSorted() === "asc"
              ? "▲"
              : column.getIsSorted() === "desc"
              ? "▼"
              : ""}
          </span>
        </button>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "position.name",
      header: "Position",
    },
    {
      accessorKey: "role",
      header: "Role",
    },
    {
      accessorKey: "active",
      header: "Status",
      cell: ({ row }) => {
        const isActive = row.getValue("active");
        return (
          <span
            className={
              isActive
                ? "text-green-600 font-medium"
                : "text-red-500 font-medium"
            }
          >
            {isActive ? "Active" : "Resigned"}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="h-8 w-8 p-0 cursor-pointer">
              <Ellipsis className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="center">
            <DropdownMenuItem
              onClick={() => navigate(`detail/${row.original.id}`)}
              className="cursor-pointer"
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => deativate(row.original.id)}
              className="cursor-pointer"
            >
              Deactivate
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  const getEmployees = async () => {
    const { data } = await api.get("/hr/employees");
    console.log(data);
    setEmployees(data.data);
  };

  const deativate = async (id) => {
    console.log(id);
    const { data } = await api.delete(`hr/employee/${id}`);
    console.log(data);
    getEmployees();
  };

  // getEmployees();

  const filteredData = useMemo(() => {
    let filtered = employees;

    if (globalFilter) {
      filtered = filtered.filter((row) =>
        row.name.toLowerCase().includes(globalFilter.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((row) => row.status === statusFilter);
    }

    return filtered;
  }, [employees, globalFilter, statusFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize }, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => {
      const newState =
        typeof updater === "function"
          ? updater({ pageIndex, pageSize })
          : updater;
      setPageIndex(newState.pageIndex);
    },
    pageCount: Math.ceil(filteredData.length / pageSize),
  });

  useEffect(() => {
    getEmployees();
  }, []);

  return (
    <>
      <div>
        <div>
          <div className="flex justify-between">
            <h1 className="scroll-m-20  text-3xl font-extrabold tracking-tight text-balance">
              Employee
            </h1>
            <div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="cursor-pointer">
                    <Plus className="h-4 w-4" />
                    Add Employee
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center">
                  <DropdownMenuItem
                    onClick={() => navigate(`/addEmployee`)}
                    className="cursor-pointer"
                  >
                    <FilePenLine /> Individual
                  </DropdownMenuItem>
                  <DropdownMenuItem
                  // onClick={() => alert(`Deleting ${row.original.name}`)}
                  // className="cursor-pointer"
                  >
                    <Sheet />
                    Multiple
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-10">
            <div className="space-y-2 text-center">
              <div className="flex justify-center space-x-2">
                <Users />
                <h3>Total Employees</h3>
              </div>
              <p className="text-4xl font-extrabold">300</p>
              <p className="text-slate-800">
                <span className=" text-green-500">+2</span> this month
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="flex justify-center space-x-2">
                <UserPlus />
                <h3>New Employee</h3>
              </div>
              <p className="text-4xl font-extrabold">2</p>
              <p className="text-slate-800">
                <span className=" text-green-500">+2</span> this month
              </p>
            </div>
            <div className="space-y-2 text-center">
              <div className="flex justify-center space-x-2">
                <UserMinus />
                <h3>Leaving</h3>
              </div>
              <p className="text-4xl font-extrabold">0</p>
              <p className="text-slate-800">
                <span className=" text-red-500">0</span> this month
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 mt-10">
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center justify-between">
            <Input
              placeholder="Search by name..."
              value={globalFilter}
              onChange={(e) => {
                setGlobalFilter(e.target.value);
                setPageIndex(0); // reset to first page
              }}
              className="w-full sm:w-1/3"
            />

            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val);
                setPageIndex(0);
              }}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          <div className="flex flex-col justify-between rounded-md border h-[350px]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {table.getRowModel().rows.length ? (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          ) || cell.getValue()}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-end space-x-2 py-2 mr-5">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <span className="text-sm">
                Page {pageIndex + 1} of {table.getPageCount() || 1}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
