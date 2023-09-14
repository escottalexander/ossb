import Link from "next/link";
import { DisplayFunding } from "./DisplayFunding";
import { ITask } from "~~/types/task";

interface Props {
  task: ITask;
}

export const TaskListItem = ({ task }: Props) => {
  const truncateText = (text: string, maxLength: number) => {
    if (text.length > maxLength) {
      return text.slice(0, maxLength) + "...";
    } else {
      return text;
    }
  };

  return (
    <Link href={`/task/${task._id}`}>
      <div className="flex flex-col border rounded-[1.5rem] border-gray-300 p-4 m-2 bg-white hover:bg-secondary">
        <div className="flex flex-row">
          <div className="flex flex-col w-2/3">
            <h1 className="text-lg">{task.title}</h1>
            <span className="text-sm">{truncateText(task.description, 500)}</span>
          </div>
          <div className="flex flex-col w-1/3 items-end justify-start">
            {task.funding && task.funding.length ? (
              <DisplayFunding funding={task.funding} />
            ) : (
              <span className="badge badge-outline badge-lg rounded-md">Not funded</span>
            )}
          </div>
        </div>
        <div className="mt-2 ml-[-4px]">
          {task.tags && task.tags.length
            ? task.tags.map((tag, i) => (
                <span key={i} className="badge badge-primary mx-1">
                  {tag}
                </span>
              ))
            : ""}
        </div>
      </div>
    </Link>
  );
};
