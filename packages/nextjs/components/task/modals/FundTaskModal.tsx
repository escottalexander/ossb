import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import BaseModal from "./BaseModal";
import { parseUnits } from "viem";
import { assets } from "~~/constants";

// Define an interface for the props that LoadingModal component receives
interface IFundTaskModal {
  tokenAddress: string;
  setTokenAddress: Dispatch<SetStateAction<string>>;
  fundAmount: bigint;
  setFundAmount: Dispatch<SetStateAction<bigint>>;
  onClose: () => void;
  skipBtn: () => void;
  skipWording: string;
  nextBtn: () => void;
  nextWording: string;
}

// Define the LoadingModal component as a functional component that receives props of type ILoadingModal
const FundTaskModal: React.FC<IFundTaskModal> = ({
  tokenAddress,
  setTokenAddress,
  fundAmount,
  setFundAmount,
  onClose,
  skipBtn,
  skipWording,
  nextBtn,
  nextWording,
}) => {
  const [amountInputString, setAmountInputString] = useState("0");

  useEffect(() => {
    const selectedAsset = assets.find(i => i.address === tokenAddress);
    if (!amountInputString || amountInputString.match(/^\d{1,}(\.\d{0,18})?$/)) {
      //const val = BigInt(parseEther(e.currentTarget.value));
      setFundAmount(parseUnits(amountInputString, selectedAsset ? selectedAsset.decimals : 18));
    }
  }, [amountInputString, fundAmount, setFundAmount, tokenAddress]);
  return (
    <BaseModal onClose={onClose}>
      <div className="w-fit md:w-[400px] flex flex-col gap-5 items-center justify-center bg-white rounded-xl p-6">
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
              value={amountInputString}
              onChange={e => {
                const amount = e.currentTarget.value;
                setAmountInputString(amount);
              }}
              placeholder="Amount to fund task initially"
              className="input input-bordered focus:outline-none w-full max-w-sm rounded-md"
            />
          </div>
        </div>
        <div className="flex flex-col items-center pb-10 px-5 sm:px-0 lg:py-auto">
          <button className="btn btn-primary btn-full m-4" disabled={fundAmount.toString() === "0"} onClick={nextBtn}>
            {nextWording}
          </button>
          <button className="btn btn-default btn-full mx-4" onClick={skipBtn}>
            {skipWording}
          </button>
        </div>
      </div>
    </BaseModal>
  );
};

// Export the FundTaskModal component to be used in other parts of the application
export default FundTaskModal;
