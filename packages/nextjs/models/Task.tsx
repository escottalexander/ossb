import mongoose from "mongoose";
import { Log, TransactionReceipt } from "viem";

export type Funding = {
  tokenAddress: string;
  amount: string;
};

export interface TaskDocument extends mongoose.Document {
  title: string;
  creator: string;
  description: string;
  location?: { address: string; city: string; state: string; country: string };
  contactInfo?: { method: string; value: string }[];
  tags?: string[];
  funders?: {
    funder: mongoose.Schema.Types.ObjectId;
    funding: Funding[];
  }[];
  funding?: Funding[];
  reviewer: string;
  reviewerPercentage: number;
  approvedWorker: string;
  creationTime: Date;
  approved: boolean;
  canceled: boolean;
  complete: boolean;
  reverted: boolean;
  includedInBlock: string;
  index: string;
}

const taskSchema = new mongoose.Schema<TaskDocument>({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  creator: {
    type: String,
    required: true,
  },
  location: {
    address: {
      type: String,
    },
    city: {
      type: String,
    },
    state: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  contactInfo: [
    {
      method: { type: String },
      value: { type: String },
    },
  ],
  tags: [
    {
      type: String,
    },
  ],
  funders: [
    {
      funder: mongoose.Schema.Types.ObjectId,
      funding: [
        {
          tokenAddress: { type: String, required: true },
          amount: { type: String },
        },
      ],
    },
  ],
  funding: [
    {
      tokenAddress: { type: String, required: true },
      amount: { type: String },
    },
  ],
  reviewer: {
    type: String,
  },
  reviewerPercentage: {
    type: Number,
    min: 0,
    max: 100,
  },
  approvedWorker: {
    type: String,
  },
  creationTime: { type: Date },
  approved: { type: Boolean },
  canceled: { type: Boolean },
  complete: { type: Boolean },
  reverted: { type: Boolean },
  includedInBlock: { type: String },
  index: { type: String },
});

taskSchema.methods.handleReceipt = async function (receipt: TransactionReceipt) {
  if (receipt.status == "success") {
    for (const event of receipt.logs) {
      await this.handleEventLog(event);
    }
  } else {
    this.reverted = true;
  }
};

taskSchema.methods.handleEventLog = async function (log: Log) {
  log.data;
  console.log(log);
};

const Task = mongoose.models.Tasks || mongoose.model("Tasks", taskSchema);

export default Task;
