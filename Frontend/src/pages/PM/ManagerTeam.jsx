import { useEffect, useState } from 'react';

// shadcn/ui components
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';

//icon
import api from '@/api/axios';
import { DropdownMenuLabel } from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';

export default function ManagerTeam() {
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize] = useState(5);
  const [sorting, setSorting] = useState([]);
  const [rowSelection, setRowSelection] = useState({});
  const [employees, setEmployees] = useState([]);

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
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }) => {
        const employeeSkills = row.getValue('skills');
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700"
                >
                  <span>{employeeSkills[0]?.name}</span>
                  {employeeSkills.length > 1 && (
                    <span className="text-xs text-gray-500">+{employeeSkills.length - 1}</span>
                  )}
                  <ChevronDown className="h-4 w-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel className="m-2 text-xs text-gray-500 uppercase">
                  Skills
                </DropdownMenuLabel>
                {employeeSkills.map((skill, index) => (
                  <DropdownMenuItem
                    key={index}
                    className="text-sm text-gray-700 cursor-pointer"
                    onSelect={(e) => e.preventDefault()} // prevent default close if you just want hover
                  >
                    {skill.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        );
      },
    },
  ];

  const getEmployees = async () => {
    const { data } = await api.get('/hr/colleagues');
    setEmployees(data.data.colleagues);
  };

  const table = useReactTable({
    data: employees,
    columns,
    state: { sorting, pagination: { pageIndex, pageSize }, rowSelection },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onPaginationChange: (updater) => {
      const newState = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater;
      setPageIndex(newState.pageIndex);
    },
    pageCount: Math.ceil(employees.length / pageSize),
  });

  useEffect(() => {
    getEmployees();
  }, []);

  return (
    <>
      <div>
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight text-balance">Team</h1>
        <div className="space-y-4 mt-10">
          {/* Table */}
          <div className="flex flex-col justify-between rounded-md border h-[360px]">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((headerGroup) => (
                  <TableRow key={headerGroup.id}>
                    {headerGroup.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder
                          ? null
                          : flexRender(header.column.columnDef.header, header.getContext())}
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
                          {flexRender(cell.column.columnDef.cell, cell.getContext()) ||
                            cell.getValue()}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="h-24 text-center">
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
