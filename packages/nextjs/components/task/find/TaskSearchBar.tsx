import { Dispatch, SetStateAction } from "react";

// import { Connector, useAccount } from "wagmi";
// import { useDeployedContractInfo, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
// import { useERC20Read } from "~~/hooks/scaffold-eth/useERC20Read";
// import { useERC20Write } from "~~/hooks/scaffold-eth/useERC20Write";
// import { notification } from "~~/utils/scaffold-eth";

// const zeroAddress = "0x0000000000000000000000000000000000000000";

interface Props {
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

export const TaskSearchBar = ({ searchTerm, setSearchTerm }: Props) => {
  return (
    <div>
      <input value={searchTerm} onChange={e => setSearchTerm(e.currentTarget.value)} />
    </div>
  );
};
