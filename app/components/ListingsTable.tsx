import React from "react";

// Define the type for the NFT item
interface NFTItem {
  type: string;
  name: string;
  amount: string;
  probability: string;
}

// Dummy array of NFTs
const nftList: NFTItem[] = [
  { type: "NFT", name: "Degods #123", amount: "01", probability: "30%" },
  { type: "cNFT", name: "Degods #345", amount: "01", probability: "30%" },
  { type: "Token", name: "$SOL", amount: "100", probability: "40%" },
  { type: "NFT", name: "Degods #567", amount: "01", probability: "35%" },
  { type: "cNFT", name: "Degods #789", amount: "01", probability: "25%" },
];

// Hazard Icon SVG as a React component
const HazardIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth="1.5"
    stroke="currentColor"
    className="w-4 h-4 inline ml-1 text-red-500"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  </svg>
);

const NFTTable: React.FC = () => {
  // Calculate the total probability as a number
  const totalProbability = nftList.reduce((sum, nft) => {
    return sum + parseFloat(nft.probability.replace("%", ""));
  }, 0);

  return (
    <>
      <div className="p-4 border border-white/10 rounded-[5px]">
        <table className="min-w-full table-auto border-separate border-spacing-4">
          <thead>
            <tr className="text-left text-white/85 text-xs font-medium">
              <th className="py-2">Type</th>
              <th className="py-2">Name</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Probability</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {nftList.map((item, index) => (
              <tr key={index} className="">
                <td className="px-4 bg-[#202020]/65 text-white/35 font-medium text-xs rounded-[5px]">
                  {item.type}
                </td>
                <td className="px-4 bg-[#202020]/65 text-white/35 font-medium text-xs rounded-[5px]">
                  {item.name}
                </td>
                <td className="px-4 bg-[#202020]/65 text-white/35 font-medium text-xs rounded-[5px]">
                  {item.amount}
                </td>
                <td className="px-4 bg-[#202020]/65 text-white/35 font-medium text-xs rounded-[5px]">
                  <div className="flex justify-between items-center">
                    <span>{item.probability}</span>
                    {/* Display hazard icon if total probability is not 100% */}
                    {totalProbability !== 100 && <HazardIcon />}
                  </div>
                </td>
                <td className="px-4">
                  <button className="text-yellow-500 hover:bg-[#FDC82F] hover:text-black transition-all duration-300 ease-in-out border border-[#FDC82F] text-sm font-semibold bg-black py-2 px-4 rounded-[5px]">
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Show warning if total probability is incorrect */}
        {totalProbability !== 100 && (
          <p className="text-red-500 mt-2 text-sm">
            Warning: Total probability is {totalProbability}% (should be 100%).
          </p>
        )}
      </div>
      <button className="text-sm font-semibold bg-[#00C278] rounded-[5px] px-10 py-2 mt-4">
        Save
      </button>
    </>
  );
};

export default NFTTable;
