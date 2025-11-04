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
import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';

//icon
import api from '@/api/axios';
import { DropdownMenuLabel } from '@radix-ui/react-dropdown-menu';
import { ChevronDown } from 'lucide-react';

export default function StaffTeam() {
  const [team, setTeam] = useState([]);
  const [manager, setManager] = useState([]);

  const managerColumns = [
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
      cell: ({ row }) => {
        const positionName = row.original.position?.name || '-';
        return <span>{positionName}</span>;
      },
    },
  ];

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
      cell: ({ row }) => {
        const positionName = row.original.position?.name || '-';
        return <span>{positionName}</span>;
      },
    },
    {
      accessorKey: 'skills',
      header: 'Skills',
      cell: ({ row }) => {
        const employeeSkills = row.getValue('skills');
        if (employeeSkills.length == 0) return <span>-</span>;
        return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700"
                >
                  <span>{employeeSkills[0]?.name || 'No skill'}</span>
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

  const getTeam = async () => {
    const { data } = await api.get('/hr/colleagues');
    setManager([data.data.directManager]);
    setTeam(data.data.colleagues);
  };

  useEffect(() => {
    getTeam();
  }, []);

  const managerTable = useReactTable({
    data: manager,
    columns: managerColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const teamTable = useReactTable({
    data: team,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <>
      <div>
        <h1 className="scroll-m-20 text-3xl font-extrabold tracking-tight text-balance">My Team</h1>
        <div className="space-y-4 mt-10">
          <h2 className="text-2xl font-semibold">Manager</h2>
          <div className="flex flex-col justify-between rounded-md border">
            <Table className="border rounded-md">
              <TableHeader>
                {managerTable.getHeaderGroups().map((headerGroup) => (
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
                {managerTable.getRowModel().rows.length ? (
                  managerTable.getRowModel().rows.map((row) => (
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
                      No manager found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <h2 className="text-2xl font-semibold mt-8">Team Members</h2>
          <div className="px-2 flex flex-col justify-between rounded-md border">
            <Table>
              <TableHeader>
                {teamTable.getHeaderGroups().map((headerGroup) => (
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
                {teamTable.getRowModel().rows.length ? (
                  teamTable.getRowModel().rows.map((row) => (
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
                      No team members found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}
