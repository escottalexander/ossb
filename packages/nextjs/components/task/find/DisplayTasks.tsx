import { TaskListItem } from "./TaskListItem";
import { ITask } from "~~/types/task";

// import { Connector, useAccount } from "wagmi";
// import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
// import { useERC20Read } from "~~/hooks/scaffold-eth/useERC20Read";
// import { useERC20Write } from "~~/hooks/scaffold-eth/useERC20Write";
// import { notification } from "~~/utils/scaffold-eth";

// const zeroAddress = "0x0000000000000000000000000000000000000000";

interface Props {
  tasks: ITask[];
}

export const DisplayTasks = ({ tasks }: Props) => {
  return (
    <div className="grid">
      <ul>
        {tasks.map(t => (
          <li key={t._id}>
            <TaskListItem task={t} />
          </li>
        ))}
      </ul>
    </div>
  );
};
