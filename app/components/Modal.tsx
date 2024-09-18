"use client";
import { useContext } from "react";
import { AppContext } from "@/app/context/AppContext";
import YourPrize from "./YourPrize";
import RecentPrize from "./RecentPrizes";

export default function PrizeModal() {
  const { yourPrize, recentPrizes, closeModal } = useContext(AppContext);
  return (
    <div
      className={`z-50 top-0 left-0 fixed flex ${
        yourPrize
          ? "justify-center items-center"
          : recentPrizes
          ? "justify-end items-center md:items-start"
          : ""
      } bg-[#450D0D]/80 h-screen w-full p-5 md:p-14`}
    >
      {yourPrize && <YourPrize close={closeModal} />}
      {recentPrizes && <RecentPrize close={closeModal} />}
    </div>
  );
}
