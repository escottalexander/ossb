import { Dispatch, SetStateAction } from "react";

type FundTaskProps = {
  tokenAddress: string;
  setTokenAddress: Dispatch<SetStateAction<string>>;
  fundAmount: bigint;
  setFundAmount: Dispatch<SetStateAction<bigint>>;
  goBack: () => void;
  createTask: () => void;
  createAndFundTask: () => void;
};

export const FundTask = ({
  tokenAddress,
  setTokenAddress,
  fundAmount,
  setFundAmount,
  goBack,
  createTask,
  createAndFundTask,
}: FundTaskProps) => {
  const assets = [
    {
      name: "ETH",
      address: "0x0000000000000000000000000000000000000000",
    },
    {
      name: "TEST",
      address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
    },
  ];
  return (
    <div className="flex flex-col items-center py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw]">
      <div className="flex flex-col items-center py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw]">
        <div className="form-control w-full max-w-sm">
          <label className="label">
            <span className="label-text">Asset</span>
          </label>
          <select
            value={tokenAddress}
            onChange={e => {
              const val = e.currentTarget.value;
              setTokenAddress(val);
            }}
            placeholder="Percentage of task to pay out to reviewer"
            className="input input-bordered focus:outline-none w-full max-w-sm rounded-md"
          >
            {assets.map(a => (
              <option key={a.address} value={a.address}>
                {a.name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-control w-full max-w-sm">
          <label className="label">
            <span className="label-text">Amount to fund</span>
          </label>
          <input
            type="text"
            value={fundAmount.toString()}
            onChange={e => {
              const val = BigInt(e.currentTarget.value || "0");
              setFundAmount(val);
            }}
            placeholder="Amount to fund task initially"
            className="input input-bordered focus:outline-none w-full max-w-sm rounded-md"
          />
        </div>
      </div>
      <div className="flex flex-row items-center py-10 px-5 sm:px-0 lg:py-auto max-w-[100vw]">
        <button className="btn btn-info btn-full mx-10" onClick={goBack}>
          Back
        </button>
        <button className="btn btn-success btn-full mx-10" onClick={createTask}>
          Create Task Without Funding
        </button>
        <button
          className="btn btn-primary btn-full mx-10"
          disabled={fundAmount.toString() === "0"}
          onClick={createAndFundTask}
        >
          Create Task With Funding
        </button>
      </div>
    </div>
  );
};
