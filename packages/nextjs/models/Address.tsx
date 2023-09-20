import mongoose from "mongoose";

export interface AddressDocument extends mongoose.Document {
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
  completedTasks?: [mongoose.Schema.Types.ObjectId];
}

const AddressSchema = new mongoose.Schema<AddressDocument>({
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
  completedTasks: [{ type: mongoose.Schema.Types.ObjectId }],
});

const Address = mongoose.models.Addresses || mongoose.model("Addresses", AddressSchema);

export default Address;
