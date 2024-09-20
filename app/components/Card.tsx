import Image from "next/image";
import { Reward } from "../types/reward";
import altImage from "/public/assets/storeMyster.png";

export default function Card({ reward }: { reward: Reward | null }) {
  return (
    <div className="flex flex-col justify-between bg-secondary rounded-2xl  lg:w-[177px] lg:h-[203px] flex-shrink-0 p-2.5 lg:p-4">
      <div className="relative mb-1 lg:mb-2 w-full h-[80%]">
        <Image
          src={reward?.image ?? altImage}
          alt="nft"
          width="200"
          height="200"
          className="w-[100px] h-full lg:w-[200px] rounded-lg"
        />
        <div className="absolute top-0.5 left-0.5 text-[10px] lg:text-base bg-secondary text-primary border border-[#FFE072] rounded-md lg:rounded-lg px-1 lg:px-2 lg:py-0.5">
          %{reward?.probability}
        </div>
      </div>
      <p className="text-xs lg:text-base font-bold text-white overflow-hidden whitespace-nowrap text-ellipsis h-[13%]">
        {reward?.name}
      </p>
    </div>
  );
}
