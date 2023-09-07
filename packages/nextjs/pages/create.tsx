import { useRouter } from "next/router";
import type { NextPage } from "next";
import { MetaHeader } from "~~/components/MetaHeader";
import { ContractData } from "~~/components/example-ui/ContractData";
import { ContractInteraction } from "~~/components/example-ui/ContractInteraction";

// import dbConnect from "~~/lib/dbConnect";
// import Task from "~~/models/Task";
// import { ITask } from "~~/types/task";

const CreateTask: NextPage = () => {
  const { query, pathname } = useRouter();
  console.log(query, pathname);
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

export default CreateTask;
