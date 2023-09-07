import mongoose from "mongoose";

export interface FunderDocument extends mongoose.Document {
  address: string;
  profile: {
    organization: string;
    organizationUrl: string;
    bio: string;
  };
  location?: { city: string; state: string; country: string };
  tags?: string[];
  fundedTasks?: {
    task: mongoose.Schema.Types.ObjectId;
    funding: {
      tokenAddress: string;
      amount: bigint;
    }[];
  }[];
  funding?: {
    tokenAddress: string;
    amount: bigint;
  }[];
  createdTasks?: [mongoose.Schema.Types.ObjectId];
}

const FunderSchema = new mongoose.Schema<FunderDocument>({
  address: {
    type: String,
    required: true,
  },
  profile: {
    organization: {
      type: String,
    },
    organizationUrl: {
      type: String,
    },
    bio: {
      type: String,
    },
  },
  location: {
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
  fundedTasks: [
    {
      task: mongoose.Schema.Types.ObjectId,
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
  createdTasks: [{ type: mongoose.Schema.Types.ObjectId }],
});

const Funder = mongoose.models.Funders || mongoose.model("Funders", FunderSchema);

export default Funder;
