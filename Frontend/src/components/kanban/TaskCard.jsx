import { Card, Button, Badge } from "flowbite-react";
import { MdDeleteForever } from "react-icons/md";

const TaskCard = ({ task, onDelete }) => (
  <Card className="w-full shadow-sm hover:shadow-md transition cursor-grab active:cursor-grabbing">
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-start">
        <p className="font-semibold text-gray-800">{task.title}</p>
        <Button size="xs" color="failure" onClick={onDelete}>
          <MdDeleteForever />
        </Button>
      </div>

      <div className="flex justify-between text-xs text-gray-600">
        {task.deadline && <Badge color="info">{task.deadline}</Badge>}
        {task.status && <p className="italic">{task.status}</p>}
      </div>
    </div>
  </Card>
);

export default TaskCard;
