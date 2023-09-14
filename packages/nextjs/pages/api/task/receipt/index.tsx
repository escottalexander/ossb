import { NextApiRequest, NextApiResponse } from "next";
import { Abi, TransactionReceipt, decodeEventLog } from "viem";
import { PayoutUponCompletionAbi } from "~~/constants";
import dbConnect from "~~/lib/dbConnect";
import Task, { Funding } from "~~/models/Task";
import { GenericEvent, TaskCreatedEvent, TaskFundedEvent } from "~~/types/task";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Connect to the database
  await dbConnect();
  if (req.method === "PUT") {
    return await update(req, res);
  } else {
    return res.status(405).json({ message: "Method not allowed." });
  }

  async function update(req: NextApiRequest, res: NextApiResponse) {
    try {
      // get data from request
      const { taskId, receipt }: { taskId: string; receipt: TransactionReceipt } = req.body;

      // Get existing task
      const task = await Task.findById(taskId);

      // Check if tx reverted
      task.reverted = receipt.status === "reverted" ? true : false;
      task.includedInBlock = receipt.blockNumber;
      // Check logs
      for (const event of receipt.logs) {
        try {
          const decodedEvent = decodeEventLog({
            abi: PayoutUponCompletionAbi as Abi,
            data: event.data,
            topics: event.topics,
          });
          await handleEvent(decodedEvent, receipt, taskId);
        } catch (e) {
          // Ignore unknown events
        }
      }

      // Save the Task to the database
      await task.save();

      // Respond with the updated Task
      res.status(201).json(task);
    } catch (error: any) {
      console.error("Error updating the Task:", error);
      res.status(500).json({ message: "An unexpected error occurred while creating the Task." });
    }
    return res;
  }

  async function handleEvent(event: GenericEvent, receipt: TransactionReceipt, taskId: string) {
    // Record Funding, Index
    console.log(event);
    switch (event.eventName) {
      case "TaskCreated":
        taskCreatedHandler(event as TaskCreatedEvent, receipt);
        break;
      case "TaskFunded":
        taskFundedHandler(event as TaskFundedEvent, receipt, taskId);
        break;
    }
  }

  async function taskCreatedHandler(event: TaskCreatedEvent, receipt: TransactionReceipt) {
    receipt; // Will need this later to verify we haven't processed this event before
    const { index, taskLocation, reviewer } = event.args;
    const task = await Task.findById(taskLocation);
    if (task) {
      task.index = index;
      task.reviewer = reviewer;
      task.save();
    }
  }

  async function taskFundedHandler(event: TaskFundedEvent, receipt: TransactionReceipt, taskId: string) {
    receipt; // Will need this later to verify we haven't processed this event before
    const { index, amount, token } = event.args;
    const task = await Task.findById(taskId);
    if (task) {
      task.index = index;
      const hasExisting = (task.funding as Funding[]).findIndex(i => i.tokenAddress === token);
      if (hasExisting > -1) {
        let newTotal = BigInt(task.funding[hasExisting].amount);
        newTotal += BigInt(amount);
        task.funding[hasExisting].amount = newTotal;
      } else {
        task.funding.push({ tokenAddress: token, amount });
      }
      task.save();
    }
  }
}
