import { TaskDocument } from "~~/models/Task";

export type ITask = TaskDocument;

export type GenericEvent = { eventName: string; args: any };

export type TaskCreatedEvent = {
  eventName: "TaskCreated";
  args: { index: bigint; taskLocation: string; reviewer: `0x${string}` };
};

export type TaskFundedEvent = {
  eventName: "TaskFunded";
  args: {
    index: bigint;
    amount: bigint;
    token: `0x${string}`;
  };
};

export type TaskCanceledEvent = {
  eventName: "TaskCanceled";
  args: { index: bigint };
};

export type TaskApprovedEvent = {
  eventName: "TaskApproved";
  args: { index: bigint; worker: `0x${string}` };
};

export type TaskFinalizedEvent = {
  eventName: "TaskFinalized";
  args: { index: bigint };
};

export type WithdrawEvent = {
  eventName: "Withdraw";
  args: { receiver: `0x${string}`; amount: bigint; token: `0x${string}` };
};

export type WorkSubmittedEvent = {
  eventName: "WorkSubmitted";
  args: {
    index: bigint;
    worker: `0x${string}`;
    workLocation: string;
  };
};

export type ApprovedWorkerSetEvent = {
  eventName: "ApprovedWorkerSet";
  args: {
    index: bigint;
    worker: `0x${string}`;
  };
};
