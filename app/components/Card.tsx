import Image from "next/image";
import nft from "/public/assets/nft.svg";

export default function Card() {
  return (
    <div className="bg-secondary rounded-2xl  lg:w-[177px] lg:h-[203px] flex-shrink-0 p-2.5 lg:p-4">
      <div className="relative mb-1 lg:mb-2 w-full">
        <Image
          src={nft}
          alt="nft"
          width="200"
          height="200"
          className="w-[100px] h-full lg:w-[200px] "
        />
        <div className="absolute top-0 text-[10px] lg:text-base bg-secondary text-primary border border-[#FFE072] rounded-md lg:rounded-lg px-1 lg:px-2 lg:py-0.5">
          %0.5
        </div>
      </div>
      <p className="text-xs lg:text-base font-bold text-white">SMB #1167</p>
    </div>
  );
}
