const contracts = {
  31337: [
    {
      chainId: "31337",
      name: "localhost",
      contracts: {
        PayoutUponCompletion: {
          address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
          abi: [
            {
              inputs: [
                {
                  internalType: "uint8",
                  name: "_protocolTakeRate",
                  type: "uint8",
                },
                {
                  internalType: "address",
                  name: "_protocolAddress",
                  type: "address",
                },
              ],
              stateMutability: "nonpayable",
              type: "constructor",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "index",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "address",
                  name: "worker",
                  type: "address",
                },
              ],
              name: "ApprovedWorkerSet",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: false,
                  internalType: "uint8",
                  name: "maxTakeRate",
                  type: "uint8",
                },
              ],
              name: "MaxTakeRateLowered",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "previousOwner",
                  type: "address",
                },
                {
                  indexed: true,
                  internalType: "address",
                  name: "newOwner",
                  type: "address",
                },
              ],
              name: "OwnershipTransferred",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: false,
                  internalType: "uint8",
                  name: "takeRate",
                  type: "uint8",
                },
              ],
              name: "TakeRateAdjusted",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "index",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "address",
                  name: "worker",
                  type: "address",
                },
              ],
              name: "TaskApproved",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "index",
                  type: "uint256",
                },
              ],
              name: "TaskCanceled",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "index",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "taskLocation",
                  type: "string",
                },
                {
                  indexed: false,
                  internalType: "address",
                  name: "reviewer",
                  type: "address",
                },
              ],
              name: "TaskCreated",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "index",
                  type: "uint256",
                },
              ],
              name: "TaskFinalized",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "index",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
              ],
              name: "TaskFunded",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: false,
                  internalType: "uint32",
                  name: "unlockPeriod",
                  type: "uint32",
                },
              ],
              name: "UnlockPeriodAdjusted",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "address",
                  name: "receiver",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
              ],
              name: "Withdraw",
              type: "event",
            },
            {
              anonymous: false,
              inputs: [
                {
                  indexed: true,
                  internalType: "uint256",
                  name: "index",
                  type: "uint256",
                },
                {
                  indexed: false,
                  internalType: "address",
                  name: "worker",
                  type: "address",
                },
                {
                  indexed: false,
                  internalType: "string",
                  name: "workUrl",
                  type: "string",
                },
              ],
              name: "WorkSubmitted",
              type: "event",
            },
            {
              stateMutability: "payable",
              type: "fallback",
            },
            {
              inputs: [
                {
                  internalType: "uint8",
                  name: "takeRate",
                  type: "uint8",
                },
              ],
              name: "adjustTakeRate",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint32",
                  name: "_unlockPeriod",
                  type: "uint32",
                },
              ],
              name: "adjustUnlockPeriod",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "taskIndex",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "approvedWorker",
                  type: "address",
                },
              ],
              name: "approveTask",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "taskIndex",
                  type: "uint256",
                },
              ],
              name: "cancelTask",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "string",
                  name: "taskLocation",
                  type: "string",
                },
                {
                  internalType: "address",
                  name: "reviewer",
                  type: "address",
                },
                {
                  internalType: "uint8",
                  name: "reviewerPercentage",
                  type: "uint8",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
              ],
              name: "createAndFundTask",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "string",
                  name: "taskLocation",
                  type: "string",
                },
                {
                  internalType: "address",
                  name: "reviewer",
                  type: "address",
                },
                {
                  internalType: "uint8",
                  name: "reviewerPercentage",
                  type: "uint8",
                },
              ],
              name: "createTask",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "currentTaskIndex",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "taskIndex",
                  type: "uint256",
                },
              ],
              name: "finalizeTask",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "taskIndex",
                  type: "uint256",
                },
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
              ],
              name: "fundTask",
              outputs: [],
              stateMutability: "payable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "taskIndex",
                  type: "uint256",
                },
              ],
              name: "getTask",
              outputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "uint8",
                  name: "",
                  type: "uint8",
                },
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
                {
                  internalType: "address[]",
                  name: "",
                  type: "address[]",
                },
                {
                  internalType: "address[]",
                  name: "",
                  type: "address[]",
                },
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
                {
                  internalType: "bool",
                  name: "",
                  type: "bool",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "taskIndex",
                  type: "uint256",
                },
              ],
              name: "getTaskFunding",
              outputs: [
                {
                  internalType: "address[]",
                  name: "",
                  type: "address[]",
                },
                {
                  internalType: "uint256[]",
                  name: "",
                  type: "uint256[]",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "token",
                  type: "address",
                },
              ],
              name: "getWithdrawableBalance",
              outputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "maxProtocolTakeRate",
              outputs: [
                {
                  internalType: "uint8",
                  name: "",
                  type: "uint8",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "owner",
              outputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint8",
                  name: "takeRate",
                  type: "uint8",
                },
              ],
              name: "permanentlyLowerMaxTakeRate",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "protocolAddress",
              outputs: [
                {
                  internalType: "address",
                  name: "",
                  type: "address",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "protocolTakeRate",
              outputs: [
                {
                  internalType: "uint8",
                  name: "",
                  type: "uint8",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [],
              name: "renounceOwnership",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "taskIndex",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "approvedWorker",
                  type: "address",
                },
              ],
              name: "setApprovedWorker",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "taskIndex",
                  type: "uint256",
                },
                {
                  internalType: "string",
                  name: "workUrl",
                  type: "string",
                },
              ],
              name: "submitWork",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "",
                  type: "uint256",
                },
              ],
              name: "tasks",
              outputs: [
                {
                  internalType: "address",
                  name: "reviewer",
                  type: "address",
                },
                {
                  internalType: "uint8",
                  name: "reviewerPercentage",
                  type: "uint8",
                },
                {
                  internalType: "address",
                  name: "approvedWorker",
                  type: "address",
                },
                {
                  internalType: "uint256",
                  name: "creationTime",
                  type: "uint256",
                },
                {
                  internalType: "bool",
                  name: "approved",
                  type: "bool",
                },
                {
                  internalType: "bool",
                  name: "canceled",
                  type: "bool",
                },
                {
                  internalType: "bool",
                  name: "complete",
                  type: "bool",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "newOwner",
                  type: "address",
                },
              ],
              name: "transferOwnership",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [],
              name: "unlockPeriod",
              outputs: [
                {
                  internalType: "uint32",
                  name: "",
                  type: "uint32",
                },
              ],
              stateMutability: "view",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "uint256",
                  name: "amount",
                  type: "uint256",
                },
                {
                  internalType: "address",
                  name: "tokenAddress",
                  type: "address",
                },
              ],
              name: "withdraw",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              inputs: [
                {
                  internalType: "address",
                  name: "tokenAddress",
                  type: "address",
                },
              ],
              name: "withdrawStuckTokens",
              outputs: [],
              stateMutability: "nonpayable",
              type: "function",
            },
            {
              stateMutability: "payable",
              type: "receive",
            },
          ],
        },
      },
    },
  ],
} as const;

export default contracts;
