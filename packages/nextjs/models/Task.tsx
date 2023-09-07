import mongoose from "mongoose";

export interface TaskDocument extends mongoose.Document {
  title: string;
  creator: string;
  description: string;
  location?: { address: string; city: string; state: string; country: string };
  tags?: string[];
  funders?: {
    funder: mongoose.Schema.Types.ObjectId;
    funding: {
      tokenAddress: string;
      amount: bigint;
    }[];
  }[];
  funding?: {
    tokenAddress: string;
    amount: bigint;
  }[];
  reviewer: string;
  reviewerPercentage: number;
  approvedWorker: string;
  creationTime: Date;
  approved: boolean;
  canceled: boolean;
  complete: boolean;
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
          amount: { type: BigInt },
        },
      ],
    },
  ],
  funding: [
    {
      tokenAddress: { type: String, required: true },
      amount: { type: BigInt },
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
});

const Task = mongoose.models.Tasks || mongoose.model("Tasks", taskSchema);

export default Task;
