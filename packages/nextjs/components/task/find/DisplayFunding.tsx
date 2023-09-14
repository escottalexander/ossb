import { formatUnits } from "viem";
import { assets } from "~~/constants";
import { Funding } from "~~/models/Task";

export const DisplayFunding = ({ funding }: { funding: Funding[] }) => {
  const parsed = [];
  for (const f of funding) {
    const asset = assets.find(i => i.address === f.tokenAddress);
    if (asset) {
      const item = (
        <li className="m-1">
          <span className="badge badge-outline badge-lg rounded-md">
            {formatUnits(BigInt(f.amount), asset.decimals)} {asset.name}
          </span>
        </li>
      );
      parsed.push(item);
    }
  }
  return <ul>{parsed.map(p => p)}</ul>;
};
