import Image from "next/image";
import localfont from "next/font/local";
import Card from "./Card";
import Background from "/public/assets/bg-sol.svg";
import { useEffect, useState } from "react";
import { Reward } from "../types/reward";

const titleFont = localfont({ src: "../fonts/lightmorning.ttf" });

export default function Prizes() {
  const [loading, setLoading] = useState<boolean>(false);
  const [rewards, setRewards] = useState<Reward[]>([]);

  const getRewards = async () => {
    setLoading(true);
    const response = await (
      await fetch("/api/rewards/list", {
        method: "POST",
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

  useEffect(() => {
    getRewards();
  }, []);

  return (
    <section className="relative flex flex-col items-center min-h-screen px-5 sm:px-14 md:px-20 pt-4 pb-16">
      <div className="my-12 w-full">
        <h2
          className={`${titleFont.className} text-center text-3xl sm:text-5xl xl:text-6xl`}
        >
          Prizes Available
        </h2>
      </div>
      <div
        className="z-0 grid grid-cols-3 md:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2 md:gap-4 border-[7px] border-secondary rounded-[15px] p-3 sm:p-5 "
        style={{
          background: "linear-gradient(10deg, #921C1DBF 0%, #E2AD4FCC 83%)",
        }}
      >
        {rewards?.map((reward, index: number) => (
          <Card key={index} reward={reward} />
        ))}
      </div>
      <Image
        className="-z-10 absolute top-0 left-0 object-cover lg:object-fill h-full w-full"
        src={Background}
        alt="Background asset"
        sizes="100vw"
      />
    </section>
  );
}
