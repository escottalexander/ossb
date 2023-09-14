import type { GetServerSideProps, NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { DisplayTasks } from "~~/components/task/find/DisplayTasks";
import dbConnect from "~~/lib/dbConnect";
import Task from "~~/models/Task";
import { ITask } from "~~/types/task";

interface Props {
  tasks: ITask[];
}

const FindTaskPage: NextPage<Props> = ({ tasks }) => {
  return (
    <>
      <MetaHeader title="Find Tasks | Task Marketplace" description="Find a task and fulfill to get paid">
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="flex-grow">
        {/* <TaskSearchBar />*/}
        <DisplayTasks tasks={tasks} />
      </div>
    </>
  );
};

export default FindTaskPage;

export const getServerSideProps: GetServerSideProps = async () => {
  try {
    await dbConnect();
    const tasks = await Task.find({});
    return { props: { tasks: JSON.parse(JSON.stringify(tasks)) } };
  } catch (e) {
    console.log(e);
    return { props: { tasks: [] } }; // returns an empty obj if there's an error
  }
};
