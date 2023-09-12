import { UseContractReadConfig, erc20ABI, useContractRead } from "wagmi";
import { getTargetNetwork } from "~~/utils/scaffold-eth";

/**
 * @dev wrapper for wagmi's useContractRead hook which loads in an ERC20 contract abi
 * @param config - The config settings, including extra wagmi configuration
 * @param config.address - the contract address
 * @param config.functionName - name of the function to be called
 * @param config.args - args to be passed to the function call
 */
export const useERC20Read = ({ address, functionName, args, ...readConfig }: UseContractReadConfig) => {
  return useContractRead({
    chainId: getTargetNetwork().id,
    functionName,
    address,
    abi: erc20ABI,
    watch: true,
    args,
    enabled: !Array.isArray(args) || !args.some(arg => arg === undefined),
    ...(readConfig as any),
  });
};
