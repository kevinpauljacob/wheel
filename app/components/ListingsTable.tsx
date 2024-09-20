import React, { useEffect, useState } from "react";
import { Reward } from "../types/reward";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";

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
  const wallet = useWallet();
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [deleteRewards, setDeleteRewards] = useState<Reward[]>([]);
  const [changes, setChanges] = useState<Reward[]>([]);
  const [isValid, setIsValid] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [updateLoading, setUpdateLoading] = useState<boolean>(false);

  const totalProbability = rewards.reduce((sum: number, nft: Reward) => {
    return !nft.disabled ? sum + nft.probability : sum;
  }, 0);

  const getRewards = async () => {
    setLoading(true);
    const response = await (
      await fetch("/api/rewards/list", {
        method: "POST",
        body: JSON.stringify({
          wallet: wallet.publicKey?.toString(),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();
    console.log(response);
    if (response?.success) setRewards(response?.rewards ?? []);
    else console.error("Failed to fetch rewards");
    setLoading(false);
  };

  const handleProbabilityChange = (id: string, value: string) => {
    const newRewards = rewards.map((reward) =>
      reward._id === id
        ? { ...reward, probability: parseFloat(value) || 0 }
        : reward
    );
    setRewards(newRewards);
    validateChanges(newRewards);
  };

  const handleToggleEnable = (id: string) => {
    const newRewards = rewards.map((reward) =>
      reward._id === id ? { ...reward, disabled: !reward.disabled } : reward
    );
    setRewards(newRewards);
    validateChanges(newRewards);
  };

  const handleRemove = (id: string) => {
    const newRewards = rewards.filter((reward) => reward._id !== id);
    const deletedReward = rewards.find((reward) => reward._id === id);
    if (deletedReward) {
      setDeleteRewards((prev) => [...prev, deletedReward]);
    }
    setRewards(newRewards);
    validateChanges(newRewards);
  };

  const validateChanges = (rewards: Reward[]) => {
    const valid =
      rewards.reduce((sum, nft) => {
        return !nft.disabled ? sum + nft.probability : sum;
      }, 0) === 100;
    setIsValid(valid);
  };

  const handleSave = async () => {
    setUpdateLoading(true);

    if (!isValid) {
      alert("Total probability of enabled items must be 100%");
      return;
    }

    console.log(rewards);
    console.log(deleteRewards);

    const response = await (
      await fetch("/api/rewards/update", {
        method: "POST",
        body: JSON.stringify({
          wallet: wallet.publicKey?.toString(),
          updateRewards: rewards,
          deleteRewards: deleteRewards.map((reward) => reward._id),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (response?.success) {
      setChanges(rewards);
      alert("Changes saved successfully");
    } else {
      console.error("Failed to save changes");
    }
    setUpdateLoading(false);
  };

  useEffect(() => {
    if (wallet.publicKey) getRewards();
  }, [wallet.publicKey]);

  return (
    <>
      <div className="p-4 border border-white/10 rounded-[5px]">
        <table className="min-w-full table-auto border-separate border-spacing-4">
          <thead>
            <tr className="text-left text-white/85 text-xs font-medium">
              <th className="py-2">Image</th>
              <th className="py-2">Type</th>
              <th className="py-2">Name</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Probability</th>
              <th className="py-2">Enable</th>
              <th className="py-2"></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? "Loading..."
              : rewards
                  .filter((reward) => !reward.expired)
                  .map((item: Reward, index: number) => (
                    <tr key={index} className="">
                      <td>
                        <Image
                          className="w-[40px] h-[40px] rounded-[5px]"
                          src={item?.image ?? ""}
                          alt={item?.name ?? ""}
                          width={40}
                          height={40}
                          objectFit="cover"
                        />
                      </td>

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
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={item.probability}
                          onChange={(e) =>
                            handleProbabilityChange(item._id, e.target.value)
                          }
                          className="w-full bg-[#1C181D] text-white/90 border border-gray-500 rounded-md px-2 py-1 text-xs"
                        />
                      </td>
                      <td className="flex justify-center px-4 py-3.5 bg-[#202020]/65 text-white/35 font-medium text-xs rounded-[5px]">
                        <input
                          type="checkbox"
                          checked={!item.disabled}
                          onChange={() => handleToggleEnable(item._id)}
                          className="text-yellow-500"
                        />
                      </td>
                      <td className="px-4">
                        <button
                          onClick={() => handleRemove(item._id)}
                          className="text-yellow-500 hover:bg-[#FDC82F] hover:text-black transition-all duration-300 ease-in-out border border-[#FDC82F] text-sm font-semibold bg-black py-2 px-4 rounded-[5px]"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
        {/* Show warning if total probability is incorrect */}
        {!isValid && (
          <p className="text-red-500 mt-2 text-sm">
            Warning: Total probability of enabled items is {totalProbability}%
            (should be 100%).
          </p>
        )}
      </div>
      <button
        onClick={handleSave}
        className="text-sm font-semibold bg-[#00C278] rounded-[5px] px-10 py-2 mt-4"
        disabled={!isValid}
      >
        {updateLoading ? "Loading" : "Save"}
      </button>
      <div className="p-4 mt-5 border border-white/10 rounded-[5px]">
        <span> Previous rewards</span>
        <table className="min-w-full table-auto border-separate border-spacing-4">
          <thead>
            <tr className="text-left text-white/85 text-xs font-medium">
              <th className="py-2">Image</th>
              <th className="py-2">Type</th>
              <th className="py-2">Name</th>
              <th className="py-2">Amount</th>
              <th className="py-2">Probability</th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? "Loading..."
              : rewards
                  .filter((reward) => reward.expired)
                  .map((item: Reward, index: number) => (
                    <tr key={index} className="">
                      <td>
                        <Image
                          className="w-[40px] h-[40px] rounded-[5px]"
                          src={item?.image ?? ""}
                          alt={item?.name ?? ""}
                          width={40}
                          height={40}
                          objectFit="cover"
                        />
                      </td>

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
                        {item.probability}
                      </td>
                    </tr>
                  ))}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default NFTTable;
