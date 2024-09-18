import localfont from "next/font/local";
import Image from "next/image";
import Card from "./Card";
import Lion from "/public/assets/bg-lion2.svg";
const titleFont = localfont({ src: "../../fonts/lightmorning.ttf" });

export default function YourPrize({ close }: { close: () => void }) {
  return (
    <div
      className="relative flex justify-center items-center bg-[#450D0D] border-4 border-[#FFE072] rounded-[15px] w-[450px] h-[450px] py-10 px-16"
      style={{ boxShadow: "0px 0px 20px 1px #FFE072" }}
    >
      <div className="z-10 flex flex-col justify-center items-center gap-6 w-full h-full">
        <p className={`${titleFont.className} text-[1.375rem] text-[#FFE9BA]`}>
          Your Prize
        </p>
        <Card />
        <button className="bg-[#E2AD4F] font-bold rounded-[10px] w-full py-[1.375rem]">
          Claim
        </button>
      </div>
      <Image
        src={Lion}
        alt="Lion Background Asset"
        className="absolute bottom-0 md:top-0 left-0"
        width={450}
        height={450}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 22 22"
        strokeWidth="1.5"
        stroke="currentColor"
        className="absolute top-2.5 right-2.5 size-6 text-[#FFE9BA]"
        onClick={close}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6 18 18 6M6 6l12 12"
        />
      </svg>
    </div>
  );
}
