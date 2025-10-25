import { Trash2 } from "lucide-react";

// shadcn/ui components
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const TaskCard = ({ task, onDelete }) => {
  return (
    <Card className="w-full shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing">
      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between">
          <p className="font-semibold text-gray-800">{task.title}</p>
          <Button size="sm" variant="destructive" onClick={onDelete}>
            <Trash2 />
          </Button>
        </div>

        <div className="flex items-center justify-between text-xs text-gray-600">
          {task.deadline ? (
            <Badge variant="secondary">{task.deadline}</Badge>
          ) : null}
          {task.status ? (
            <span className="italic text-gray-500">{task.status}</span>
          ) : null}
        </div>
      </div>
    </Card>
  );
};

export default TaskCard;
