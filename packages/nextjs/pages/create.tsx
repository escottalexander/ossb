import { useRouter } from "next/router";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { CreateTask } from "~~/components/task/CreateTask";

// import { ContractData } from "~~/components/example-ui/ContractData";
// import { ContractInteraction } from "~~/components/example-ui/ContractInteraction";

// import dbConnect from "~~/lib/dbConnect";
// import Task from "~~/models/Task";
// import { ITask } from "~~/types/task";

const CreateTaskPage: NextPage = () => {
  const { query, pathname } = useRouter();
  console.log(query, pathname);
  return (
    <>
      <MetaHeader title="Create Task | Task Marketplace" description="Create a task for someone to fulfill">
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className=" flex-grow" data-theme="TaskPage">
        <CreateTask />
      </div>
    </>
  );
};

export default CreateTaskPage;
