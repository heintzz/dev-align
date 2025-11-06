import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

export default function EmployeeTable({
  employees,
  positionsList,
  sortOrder,
  setSortOrder,
  positionFilter,
  setPositionFilter,
  projectColor,
  pageIndex,
  setPageIndex,
  total,
  pageSize,
  sortField,
  setSortField,
}) {
  const handleSort = (field) => {
    if (sortField === field) {
      // toggle sort order if same field clicked
      setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      // set new field to sort by
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field)
      return <ArrowUpDown className="h-4 w-4 ml-1 text-gray-400" />;
    return sortOrder === "asc" ? (
      <ArrowUp className="h-4 w-4 ml-1 text-gray-700" />
    ) : (
      <ArrowDown className="h-4 w-4 ml-1 text-gray-700" />
    );
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Employee Status</h3>
        <div className="flex gap-3">
          {/* Sort Select */}
          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-[160px] text-sm">
              <SelectValue placeholder="Sort by Projects" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="desc">Most Projects</SelectItem>
              <SelectItem value="asc">Least Projects</SelectItem>
            </SelectContent>
          </Select>

          {/* Position Filter */}
          <Select value={positionFilter} onValueChange={setPositionFilter}>
            <SelectTrigger className="w-[160px] text-sm">
              <SelectValue placeholder="Filter by Position" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Positions</SelectItem>
              {Array.isArray(positionsList) &&
                positionsList.map((p) => (
                  <SelectItem key={p._id || p.id} value={p._id || p.id}>
                    {p.name}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      {employees.length === 0 ? (
        <p className="text-sm text-gray-500 text-center py-8">
          No employee data available
        </p>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center">
                    Employee Name
                    <SortIcon field="name" />
                  </div>
                </TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Manager</TableHead>
                <TableHead
                  className="cursor-pointer select-none"
                  onClick={() => handleSort("projects")}
                >
                  <div className="flex items-center">
                    Projects
                    <SortIcon field="projects" />
                  </div>
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {employees.map((emp, i) => (
                <TableRow key={i} className="hover:bg-muted/50">
                  <TableCell className="flex items-center gap-3 py-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-sm font-semibold">
                      {emp.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{emp.name}</span>
                  </TableCell>
                  <TableCell className="text-sm">{emp.position}</TableCell>
                  <TableCell className="text-sm">{emp.manager}</TableCell>
                  <TableCell className="text-sm">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${projectColor(
                        emp.projects
                      )}`}
                    >
                      {emp.projects} Projects
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <p className="text-sm text-muted-foreground">
            Page {pageIndex + 1} of {Math.ceil(total / pageSize)}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageIndex((p) => Math.max(p - 1, 0))}
              disabled={pageIndex === 0}
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
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
