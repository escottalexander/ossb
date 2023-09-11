import { useState } from "react";
import { DefineTask } from "./steps/DefineTask";
import { FundTask } from "./steps/FundTask";
import { Connector, useAccount } from "wagmi";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { notification } from "~~/utils/scaffold-eth";

const zeroAddress = "0x0000000000000000000000000000000000000000";

export const CreateTask = () => {
  const [stepNumber, setStepNumber] = useState(1);
  const [title, setTitle] = useState("");
  const [creator, setCreator] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState([] as string[]);
  const [reviewerPercentage, setReviewerPercentage] = useState(0);
  const [approvedWorker, setApprovedWorker] = useState("");
  const [assignWorker, setAssignWorker] = useState(false);
  const [reviewerTakesCut, setReviewerTakesCut] = useState(false);
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
  const [fundingTokenAddress, setFundingTokenAddress] = useState(zeroAddress);
  const [fundAmount, setFundAmount] = useState(BigInt(0));

  const { writeAsync: writeCreateTask } = useScaffoldContractWrite({
    contractName: "PayoutUponCompletion",
    functionName: "createTask",
    args: [taskId, reviewer, reviewerPercentage],
    onBlockConfirmation: txnReceipt => {
      console.log("📦 Transaction blockHash", txnReceipt.blockHash);
    },
  });

  const { writeAsync: writeCreateAndFundTask } = useScaffoldContractWrite({
    contractName: "PayoutUponCompletion",
    functionName: "createAndFundTask",
    args: [taskId, reviewer, reviewerPercentage, fundAmount, fundingTokenAddress],
    value: (fundingTokenAddress === zeroAddress ? fundAmount.toString() : BigInt(0).toString()) as `${number}`,
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
        setStepNumber(stepNumber + 1);
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

  const goBack = () => {
    setStepNumber(stepNumber - 1);
  };

  const sendCreateTask = async () => {
    await writeCreateTask();
  };

  const sendCreateAndFund = async () => {
    if (fundingTokenAddress === zeroAddress) {
      await writeCreateAndFundTask();
    } else {
      // Approve Token Spend TODO
      // Then Create Task
      await writeCreateAndFundTask();
    }
  };

  const renderStep = (num: number) => {
    switch (num) {
      case 1:
        return (
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
            defineTaskDone={defineTaskDone}
          />
        );
      case 2:
        return (
          <FundTask
            tokenAddress={fundingTokenAddress}
            setTokenAddress={setFundingTokenAddress}
            fundAmount={fundAmount}
            setFundAmount={setFundAmount}
            goBack={goBack}
            createTask={sendCreateTask}
            createAndFundTask={sendCreateAndFund}
          />
        );
    }
  };

  return (
    <div className="bg-[url('/assets/gradient-bg.png')] bg-[length:100%_100%] py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw]">
      {renderStep(stepNumber)}
    </div>
  );
};
