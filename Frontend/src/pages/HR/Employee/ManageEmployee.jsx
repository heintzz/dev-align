/* eslint-disable no-unused-vars */
import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// shadcn/ui components
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';

//icon
import {
  Users,
  UserPlus,
  UserMinus,
  Ellipsis,
  Plus,
  FilePenLine,
  Sheet,
  Download,
  CircleCheckBig,
} from 'lucide-react';
import api from '@/api/axios';
import UploadFile from '@/components/UploadFile';
import AddEmployee from './AddEmployee';
import { toast } from '@/lib/toast';

export default function ManageEmployee() {
  const [total, setTotal] = useState(0);
  const [pageIndex, setPageIndex] = useState(0); // 0-based
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [employees, setEmployees] = useState([]);
  const [openAddExcel, setOpenAddExcel] = useState(false);
  const [excelFile, setExcelFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [loadingState, setLoadingState] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  const navigate = useNavigate();

  console.log(employees);

  const columns = [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <button
          className="flex items-center font-semibold"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Name
          <span className="ml-1 text-xs">
            {column.getIsSorted() === 'asc' ? '▲' : column.getIsSorted() === 'desc' ? '▼' : ''}
          </span>
        </button>
      ),
    },
    {
      accessorKey: 'email',
      header: 'Email',
    },
    {
      accessorKey: 'position.name',
      header: 'Position',
    },
    {
      accessorKey: 'role',
      header: 'Role',
    },
    {
      accessorKey: 'active',
      header: 'Status',
      cell: ({ row }) => {
        const isActive = row.getValue('active');
        return (
          <span className={isActive ? 'text-green-600 font-medium' : 'text-red-500 font-medium'}>
            {isActive ? 'Active' : 'Resigned'}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const isActive = row.original.active;
        console.log('Aktif ga: ' + isActive);
        return (
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
                Details
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => changeEmployeeStatus(row.original.id, !isActive)}
                className="cursor-pointer"
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const getEmployees = async () => {
    try {
      setLoading(true);
      const params = {
        page: pageIndex + 1, // backend is 1-based
        limit: pageSize,
        search: globalFilter || undefined,
        active: statusFilter === 'all' ? undefined : statusFilter,
      };

      const { data } = await api.get('/hr/employees', { params });
      setEmployees(data.data);
      setTotal(data.meta.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      console.log('finish');
    }
  };

  const getExcelTemplate = async () => {
    const response = await api.get('/hr/employees/template', {
      responseType: 'blob',
    });

    console.log(response);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;

    // Set the file name dynamically
    const fileName = 'employee-import-template.xlsx';

    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();

    // Clean up
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const AddEmployeeByExcel = async () => {
    if (!excelFile) {
      alert('Please select a file first!');
      return;
    }

    const formData = new FormData();
    formData.append('file', excelFile);

    try {
      setLoadingState(true);
      setLoadingState('Adding Employee...');
      const response = await api.post(
        '/hr/employees/import?dryRun=false&sendEmails=false',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      console.log('Import result:', response);
      toast(
        `Import completed! Created: ${response.data.created}, Failed: ${response.data.failed}`,
        {
          icon: <CircleCheckBig className="w-5 h-5 text-white" />,
          type: 'success',
          position: 'top-center',
          duration: 5000,
        }
      );
      setOpenAddExcel(false);
    } catch (error) {
      console.error('Failed to import employees:', error);
      alert('Failed to import employees.');
    } finally {
      getEmployees();
      setLoadingState(true);
      setLoadingText('');
    }
  };

  const changeEmployeeStatus = async (id, isActive) => {
    console.log(id);
    const { data } = await api.delete(`hr/employee/${id}?active=${isActive}`);
    console.log(data);
    getEmployees();
  };

  const table = useReactTable({
    data: employees,
    columns,
    manualPagination: true, // ✅ important
    manualSorting: true, // optional if backend handles sorting
    manualFiltering: true,
    pageCount: Math.ceil(total / pageSize),
    state: {
      pagination: { pageIndex, pageSize },
      sorting,
    },
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(newState.pageIndex);
      setPageSize(newState.pageSize);
    },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  useEffect(() => {
    getEmployees();
  }, [pageIndex, pageSize, globalFilter, statusFilter]);

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
                    onClick={() => setOpenAddExcel(true)}
                    className="cursor-pointer"
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
              // className="cursor-pointer"
            >
              <SelectTrigger className="w-[150px] cursor-pointer">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="cursor-pointer">
                  All
                </SelectItem>
                <SelectItem value="true" className="cursor-pointer">
                  Active
                </SelectItem>
                <SelectItem value="false" className="cursor-pointer">
                  Resigned
                </SelectItem>
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
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>

              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : employees.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center">
                      No data
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getVisibleCells().map((cell) => (
                        <TableCell key={cell.id}>
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between p-5">
              <div className="text-sm text-muted-foreground">
                Page {pageIndex + 1} of {Math.ceil(total / pageSize)}
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
                    setPageIndex((p) => (p + 1 < Math.ceil(total / pageSize) ? p + 1 : p))
                  }
                  disabled={pageIndex + 1 >= Math.ceil(total / pageSize)}
                  className="cursor-pointer"
                >
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

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
            <DialogTitle className="flex justify-between items-center">
              Add Multiple Employee
            </DialogTitle>
            <DialogDescription>Add multiple employee by uploading excell</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <Button
              onClick={getExcelTemplate}
              className="w-full sm:w-auto bg-primer cursor-pointer text-white font-semibold px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-70"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Template
            </Button>

            <UploadFile
              label="Upload document"
              iconType="file"
              accept=".xlsx"
              onFileSelect={(file) => setExcelFile(file)}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" className="cursor-pointer">
                Cancel
              </Button>
            </DialogClose>
            <Button onClick={AddEmployeeByExcel} className="bg-primer cursor-pointer">
              Add Employee
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
