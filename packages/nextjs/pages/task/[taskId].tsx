import { useRouter } from "next/router";
import type { GetServerSideProps, NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { ContractData } from "~~/components/example-ui/ContractData";
import { ContractInteraction } from "~~/components/example-ui/ContractInteraction";
import dbConnect from "~~/lib/dbConnect";
import Task from "~~/models/Task";
import { ITask } from "~~/types/task";

interface Props {
  task: ITask;
}

const TaskDetail: NextPage<Props> = ({ task }) => {
  const { query, pathname } = useRouter();
  console.log(query, pathname);
  task;
  return (
    <>
      <MetaHeader
        title="Example UI | Scaffold-ETH 2"
        description="Example UI created with 🏗 Scaffold-ETH 2, showcasing some of its features."
      >
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="grid lg:grid-cols-2 flex-grow" data-theme="TaskPage">
        <ContractInteraction />
        <ContractData />
      </div>
    </>
  );
};

export default TaskDetail;

export const getServerSideProps: GetServerSideProps = async context => {
  try {
    await dbConnect();
    const taskId = context.query.taskId;
    const task = await Task.findById(taskId);
    return { props: { task: JSON.parse(JSON.stringify(task)) } };
  } catch (e) {
    console.log(e);
    return { props: { task: {} } }; // returns an empty obj if there's an error
  }
};
