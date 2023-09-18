import { useState } from "react";
import { useRouter } from "next/router";
import FundTaskModal from "../modals/FundTaskModal";
import { DefineTask } from "./steps/DefineTask";
// import { FundTask } from "./steps/FundTask";
import { TransactionReceipt, zeroAddress } from "viem";
import { Connector, useAccount } from "wagmi";
import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useERC20Write } from "~~/hooks/scaffold-eth/useERC20Write";
import { notification } from "~~/utils/scaffold-eth";

export const CreateTask = () => {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([] as string[]);
  const [reviewerPercentage, setReviewerPercentage] = useState(0);
  const [approvedWorker, setApprovedWorker] = useState("");
  const [assignWorker, setAssignWorker] = useState(false);
  const [reviewerTakesCut, setReviewerTakesCut] = useState(false);
  const [contactInfo, setContactInfo] = useState<{ method: string; value: string }[]>();
  const onConnect = (u: {
    address?: string | undefined;
    connector?: Connector<any, any> | undefined;
    isReconnected: boolean;
  }) => {
    setCreator(u.address || "");
    if (!reviewer) {
      setReviewer(u.address || "");
    }
  };
  const { address } = useAccount({ onConnect });
  const [reviewer, setReviewer] = useState(address || ""); // Default to creator
  const [taskId, setTaskId] = useState("");
  const { data: payoutUponCompletionContract } = useDeployedContractInfo("PayoutUponCompletion");
  // Funding Modal State
  const [showFundingModal, setShowFundingModal] = useState(false);
  const [fundingTokenAddress, setFundingTokenAddress] = useState(zeroAddress as string);
  const [fundAmount, setFundAmount] = useState(BigInt(0));

  const handleReceipt = async (receipt: TransactionReceipt) => {
    const response = await fetch("/api/task/receipt", {
      method: "PUT",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ taskId, receipt }),
    });
    response;
  };

  const { writeAsync: writeCreateTask } = useScaffoldContractWrite({
    contractName: "PayoutUponCompletion",
    functionName: "createTask",
    args: [taskId, reviewer, reviewerPercentage],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      handleReceipt(txnReceipt);
      setTimeout(function () {
        setShowFundingModal(false);
        router.push(`/task/${taskId}`);
      }, 3000);
    },
  });

  const { writeAsync: writeCreateAndFundTask } = useScaffoldContractWrite({
    contractName: "PayoutUponCompletion",
    functionName: "createAndFundTask",
    args: [taskId, reviewer, reviewerPercentage, fundAmount, fundingTokenAddress],
    value: fundingTokenAddress === zeroAddress ? fundAmount : BigInt(0),
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
      handleReceipt(txnReceipt);
      setTimeout(function () {
        setShowFundingModal(false);
        router.push(`/task/${taskId}`);
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

  const defineTaskDone = async () => {
    console.log(title, creator, description, tags, reviewer, reviewerPercentage, approvedWorker);
    // Validation
    // push data to server to get id
    const taskReq = {
      taskId,
      title,
      creator,
      description,
      tags,
      reviewer,
      reviewerPercentage,
      contactInfo,
      approvedWorker,
    };
    try {
      const response = await fetch("/api/task", {
        method: taskId ? "PUT" : "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(taskReq),
      });
      if (response.ok) {
        // Post onchain
        const respBody = await response.json();
        console.log(respBody);
        setTaskId(respBody._id);
        // setStepNumber(stepNumber + 1);
        setShowFundingModal(true);
        // setIsLoading(false);
      } else {
        // Handle any errors
        // setIsLoading(false);
        notification.error("There was an error with our server. Please try again later.");
      }
    } catch (e) {
      console.log("ERR_SAVING_TASK::", e);
      // setIsLoading(false);
    }
  };

  const sendCreateTask = async () => {
    await writeCreateTask();
  };

  const sendCreateAndFund = async () => {
    if (fundingTokenAddress === zeroAddress) {
      await writeCreateAndFundTask();
    } else {
      // Approve Token Spend
      await writeERC20Approve();
      // Then Create Task
      await writeCreateAndFundTask();
    }
  };

  return (
    <div className="bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw]">
      <DefineTask
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        tags={tags}
        setTags={setTags}
        reviewerPercentage={reviewerPercentage}
        setReviewerPercentage={setReviewerPercentage}
        approvedWorker={approvedWorker}
        setApprovedWorker={setApprovedWorker}
        assignWorker={assignWorker}
        setAssignWorker={setAssignWorker}
        reviewer={reviewer || ""}
        setReviewer={setReviewer}
        reviewerTakesCut={reviewerTakesCut}
        setReviewerTakesCut={setReviewerTakesCut}
        contactInfo={contactInfo}
        setContactInfo={setContactInfo}
        defineTaskDone={defineTaskDone}
      />
      {showFundingModal && (
        <FundTaskModal
          tokenAddress={fundingTokenAddress}
          setTokenAddress={setFundingTokenAddress}
          fundAmount={fundAmount}
          setFundAmount={setFundAmount}
          onClose={() => setShowFundingModal(false)}
          skipBtn={sendCreateTask}
          skipWording="Create task without funding"
          nextBtn={sendCreateAndFund}
          nextWording="Create and Fund Task"
        />
      )}
    </div>
  );
};
