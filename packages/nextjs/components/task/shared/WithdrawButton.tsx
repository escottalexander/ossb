import { useState } from "react";
import { zeroAddress } from "viem";
import { useAccount } from "wagmi";
import { BanknotesIcon } from "@heroicons/react/24/outline";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

/**
 * Custom Wagmi Connect Button (watch balance + custom design)
 */
export const WithdrawButton = () => {
  const { address } = useAccount();
  const hasClaimableFunds = useState(false);
  address;
  hasClaimableFunds;
  const { data: balance } = useScaffoldContractRead({
    contractName: "PayoutUponCompletion",
    functionName: "getWithdrawableBalance",
    args: [zeroAddress],
  });
  console.log(balance);

  return (
    <>
      <button className="btn btn-secondary btn-sm px-2 rounded-full">
        <BanknotesIcon className="h-4 w-4" />
      </button>
    </>
  );
};
