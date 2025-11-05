import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

export default function EmployeesGrid({
  employees,
  selectedEmployees,
  onToggle,
  getMatchingColor,
  getWorkloadColor,
  getAvailabilityColor,
  scrollable = false,
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 md:grid-cols-2 gap-4",
        scrollable && "max-h-[calc(100vh-24rem)] overflow-y-auto pr-2"
      )}
    >
      {employees.map((employee) => {
        const isSelected = selectedEmployees.includes(employee._id);

        return (
          <div
            key={employee._id}
            onClick={() => onToggle(employee._id)}
            className={cn(
              "cursor-pointer rounded-xl border-2 transition-all p-4 hover:shadow-lg hover:scale-[1.02] duration-200",
              isSelected
                ? "border-blue-500 bg-blue-50 shadow-md"
                : `bg-white ${getMatchingColor(employee.matchingPercentage)}`
            )}
          >
            <div className="flex gap-4">
              {/* Avatar & Checkbox */}
              <div className="relative shrink-0">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggle(employee._id)}
                  className="absolute -top-2 -left-2 z-10"
                />
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                  {employee.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
              </div>

              {/* Employee Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-gray-900 truncate text-base">
                      {employee.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {employee.position?.name}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {employee.matchingPercentage}
                      </span>
                      <span className="text-sm text-gray-500">%</span>
                    </div>
                    {employee.aiRank && (
                      <Badge
                        variant="secondary"
                        className="mt-1 bg-green-100 text-green-700"
                      >
                        #{employee.aiRank}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Skills */}
                {employee.skills?.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                      {employee.skills.map((skill, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {skill.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Workload */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-600 font-medium">Workload</span>
                    <span className="text-gray-900 font-semibold">
                      {employee.currentWorkload}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={cn(
                        "h-2 rounded-full transition-all",
                        getWorkloadColor(employee.currentWorkload)
                      )}
                      style={{ width: `${employee.currentWorkload}%` }}
                    />
                  </div>
                </div>

                {/* Availability */}
                <p
                  className={cn(
                    "text-xs font-semibold flex items-center gap-1",
                    getAvailabilityColor(employee.availability)
                  )}
                >
                  <span className="w-2 h-2 rounded-full bg-current"></span>
                  {employee.availability}
                </p>

                {/* AI Reason */}
                {employee.aiReason && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-500 mb-1 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      AI Insight
                    </p>
                    <p className="text-xs text-gray-700 leading-relaxed line-clamp-2">
                      {employee.aiReason}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
