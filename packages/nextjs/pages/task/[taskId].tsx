import { useState } from "react";
import { useRouter } from "next/router";
import type { GetServerSideProps, NextPage } from "next";
import { TransactionReceipt, zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { MetaHeader } from "~~/components/MetaHeader";
import { Address } from "~~/components/scaffold-eth";
import { DisplayFunding } from "~~/components/task/find/DisplayFunding";
import ApproveWorkModal from "~~/components/task/modals/ApproveWorkModal";
import AssignTaskModal from "~~/components/task/modals/AssignTaskModal";
import CancelTaskModal from "~~/components/task/modals/CancelTaskModal";
import FinalizeTaskModal from "~~/components/task/modals/FinalizeTaskModal";
import FundTaskModal from "~~/components/task/modals/FundTaskModal";
import SuccessModal from "~~/components/task/modals/SuccessModal";
import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useERC20Write } from "~~/hooks/scaffold-eth/useERC20Write";
import dbConnect from "~~/lib/dbConnect";
import Task from "~~/models/Task";
import { ITask } from "~~/types/task";

interface Props {
  task: ITask;
}

const TaskDetail: NextPage<Props> = ({ task }) => {
  const router = useRouter();
  const { address } = useAccount();
  const { query, pathname } = useRouter();
  console.log(query, pathname);
  const { data: payoutUponCompletionContract } = useDeployedContractInfo("PayoutUponCompletion");

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Funding Modal State
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [fundingTokenAddress, setFundingTokenAddress] = useState(zeroAddress as string);
  const [fundAmount, setFundAmount] = useState(BigInt(0));

  const { writeAsync: writeFundTask } = useScaffoldContractWrite({
    contractName: "PayoutUponCompletion",
    functionName: "fundTask",
    args: [BigInt(task.index), fundAmount, fundingTokenAddress],
    value: fundingTokenAddress === zeroAddress ? fundAmount : BigInt(0),
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      handleReceipt(txnReceipt);
      setShowSuccessModal(true);
      setTimeout(function () {
        setShowFundingModal(false);
        setShowSuccessModal(false);
        router.push(`/task/${task._id}`);
      }, 3000);
    },
  });

  const { writeAsync: writeERC20Approve } = useERC20Write({
    address: fundingTokenAddress,
    functionName: "approve",
    args: [payoutUponCompletionContract?.address, fundAmount],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const fundTask = async () => {
    if (fundingTokenAddress === zeroAddress) {
      await writeFundTask();
    } else {
      // Approve Token Spend
      await writeERC20Approve();
      // Then Create Task
      await writeFundTask();
    }
  };

  // Approve Work Modal State
  const [showApproveWorkModal, setShowApproveWorkModal] = useState(false);
  const [approvedWorkerAddress, setApprovedWorkerAddress] = useState("");

  const { writeAsync: writeApproveWork } = useScaffoldContractWrite({
    contractName: "PayoutUponCompletion",
    functionName: "approveTask",
    args: [BigInt(task.index), approvedWorkerAddress],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      handleReceipt(txnReceipt);
      setShowSuccessModal(true);
      setTimeout(function () {
        setShowApproveWorkModal(false);
        setShowSuccessModal(false);
        router.push(`/task/${task._id}`);
      }, 3000);
    },
  });

  // Assign Task Modal State
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [assignedWorkerAddress, setAssignedWorkerAddress] = useState("");

  const { writeAsync: writeAssignTask } = useScaffoldContractWrite({
    contractName: "PayoutUponCompletion",
    functionName: "approveTask",
    args: [BigInt(task.index), assignedWorkerAddress],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      handleReceipt(txnReceipt);
      setShowSuccessModal(true);
      setTimeout(function () {
        setShowAssignTaskModal(false);
        setShowSuccessModal(false);
        router.push(`/task/${task._id}`);
      }, 3000);
    },
  });

  // Cancel Task Modal State
  const [showCancelTaskModal, setShowCancelTaskModal] = useState(false);

  const { writeAsync: writeCancelTask } = useScaffoldContractWrite({
    contractName: "PayoutUponCompletion",
    functionName: "cancelTask",
    args: [BigInt(task.index)],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      handleReceipt(txnReceipt);
      setShowSuccessModal(true);
      setTimeout(function () {
        setShowCancelTaskModal(false);
        setShowSuccessModal(false);
        router.push(`/task/${task._id}`);
      }, 3000);
    },
  });

  // Cancel Task Modal State
  const [showFinalizeTaskModal, setShowFinalizeTaskModal] = useState(false);

  const { writeAsync: writeFinalizeTask } = useScaffoldContractWrite({
    contractName: "PayoutUponCompletion",
    functionName: "finalizeTask",
    args: [BigInt(task.index)],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      handleReceipt(txnReceipt);
      setShowSuccessModal(true);
      setTimeout(function () {
        setShowFinalizeTaskModal(false);
        setShowSuccessModal(false);
        router.push(`/task/${task._id}`);
      }, 3000);
    },
  });
  const handleReceipt = async (receipt: TransactionReceipt) => {
    const response = await fetch("/api/task/receipt", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ taskId: task._id, receipt }),
    });
    response;
  };

  return (
    <>
      <MetaHeader title={`${task.title} | Task Marketplace`} description={`${task.description}`}>
        {/* We are importing the font this way to lighten the size of SE2. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link href="https://fonts.googleapis.com/css2?family=Bai+Jamjuree&display=swap" rel="stylesheet" />
      </MetaHeader>
      <div className="flex flex-row w-full">
        <div className="flex flex-row m-4 p-6 justify-between border rounded-lg bg-white w-2/3">
          <div className="flex flex-col items-start w-2/3">
            <h1 className="text-xl">{task.title}</h1>
            <p>{task.description}</p>
            <p>Send follow up questions to: taskcreator@gmail.com</p>
          </div>
          <div className="flex flex-col items-end w-1/3">
            <span className="text-md">
              Creator: <Address address={task.creator} />
            </span>
            <span className="text-md">
              Reviewer: <Address address={task.reviewer} />
            </span>
          </div>
        </div>
        <div className="flex flex-row w-1/3 m-4 ml-0 p-6 justify-between border rounded-lg bg-white">
          <div className="mr-10">
            {task.funding && task.funding.length ? (
              <DisplayFunding funding={task.funding} />
            ) : (
              <span className="badge badge-outline badge-lg rounded-md">Not funded</span>
            )}
          </div>
          <div className="flex flex-col">
            <button className="btn btn-primary btn-lg mb-1" onClick={() => setShowFundingModal(true)}>
              Fund Task
            </button>
            {(address == task.creator || address == task.reviewer) && (
              <button className="btn btn-warning btn-lg my-1">Edit Task</button>
            )}
            {address == task.reviewer && (
              <button className="btn btn-success btn-lg my-1" onClick={() => setShowAssignTaskModal(true)}>
                Assign Task
              </button>
            )}
            {address == task.reviewer && !task.approved && (
              <button className="btn btn-default btn-lg mt-1" onClick={() => setShowApproveWorkModal(true)}>
                Approve Work
              </button>
            )}
            {address == task.reviewer && task.approved && (
              <button className="btn btn-default btn-lg mt-1" onClick={() => setShowFinalizeTaskModal(true)}>
                Mark as Complete
              </button>
            )}
            {address == task.reviewer && (
              <button className="btn btn-error btn-lg mt-1" onClick={() => setShowCancelTaskModal(true)}>
                Cancel Task
              </button>
            )}
            {address != task.reviewer && <button className="btn btn-warning btn-lg my-1">Submit Work</button>}
            {address != task.reviewer && <button className="btn btn-success btn-lg mt-1">Contact</button>}
          </div>
        </div>
        {showFundingModal && (
          <FundTaskModal
            tokenAddress={fundingTokenAddress}
            setTokenAddress={setFundingTokenAddress}
            fundAmount={fundAmount}
            setFundAmount={setFundAmount}
            onClose={() => setShowFundingModal(false)}
            skipBtn={() => setShowFundingModal(false)}
            skipWording="Cancel"
            nextBtn={fundTask}
            nextWording="Fund Task"
          />
        )}
        {showApproveWorkModal && (
          <ApproveWorkModal
            approvedWorkerAddress={approvedWorkerAddress}
            setApprovedWorkerAddress={setApprovedWorkerAddress}
            onClose={() => setShowApproveWorkModal(false)}
            cancelBtn={() => setShowApproveWorkModal(false)}
            cancelWording="Cancel"
            approveBtn={writeApproveWork}
            approveWording="Approve Work"
          />
        )}
        {showAssignTaskModal && (
          <AssignTaskModal
            assignedWorkerAddress={assignedWorkerAddress}
            setAssignedWorkerAddress={setAssignedWorkerAddress}
            onClose={() => setShowAssignTaskModal(false)}
            cancelBtn={() => setShowAssignTaskModal(false)}
            cancelWording="Cancel"
            assignBtn={writeAssignTask}
            assignWording="Assign Task"
          />
        )}
        {showCancelTaskModal && (
          <CancelTaskModal
            onClose={() => setShowCancelTaskModal(false)}
            cancelBtn={() => setShowCancelTaskModal(false)}
            cancelWording="Cancel"
            confirmBtn={writeCancelTask}
            confirmWording="Cancel Task"
          />
        )}
        {showFinalizeTaskModal && (
          <FinalizeTaskModal
            onClose={() => setShowFinalizeTaskModal(false)}
            cancelBtn={() => setShowFinalizeTaskModal(false)}
            cancelWording="Cancel"
            confirmBtn={writeFinalizeTask}
            confirmWording="Complete Task"
          />
        )}
        {showSuccessModal && (
          <SuccessModal onClose={() => setShowSuccessModal(false)} message="You funded this task! Way to go!" />
        )}
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
