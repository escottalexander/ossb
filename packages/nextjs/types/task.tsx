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
