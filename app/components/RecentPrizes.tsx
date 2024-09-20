import { useContext } from "react";
import { AppContext } from "../context/AppContext";
import localfont from "next/font/local";
import Image from "next/image";
import User from "/public/assets/user.svg";
const titleFont = localfont({ src: "../fonts/lightmorning.ttf" });

export default function RecentPrize() {
  const { setRecentPrizes } = useContext(AppContext);
  const handleClose = () => {
    setRecentPrizes(false);
  };

  return (
    <div
      className={`z-[100] top-0 left-0 fixed flex justify-end items-center md:items-start bg-[#450D0D]/80 h-screen w-full p-5 md:p-14`}
    >
      <div
        className="relative flex justify-center items-center border-[7px] border-[#FFE072] rounded-[15px] p-5 md:pt-8 md:pb-4 md:px-10"
        style={{
          background: "linear-gradient(0deg, #E2AD4F -75.32%, #921C1D 83.98%)",
        }}
      >
        <div className="z-10 flex flex-col justify-center items-center gap-6 w-full h-full">
          <p
            className={`${titleFont.className} text-xl sm:text-3xl md:text-[2.5rem] text-[#FFE9BA]`}
          >
            Recent Prizes
          </p>
          <div>
            {[...Array(5)].map((_, index) => (
              <Prize key={index} />
            ))}
          </div>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 22 22"
          strokeWidth="1.5"
          stroke="currentColor"
          className="absolute top-2.5 right-2.5 size-6 text-[#FFE9BA]"
          onClick={handleClose}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18 18 6M6 6l12 12"
          />
        </svg>
      </div>
    </div>
  );
}

const Prize = () => {
  return (
    <div className="flex items-center gap-5 p-2.5 mb-4">
      <div>
        <p className="text-primary font-medium">
          9WzhLi...HY6 spinned 3 minutes ago and got
        </p>
      </div>
      <div className="flex items-center gap-2.5">
        <p className="text-sm font-bold text-white">SMB #1167</p>
        <Image src={User} alt="User" width={50} height={50} />
      </div>
    </div>
  );
};
