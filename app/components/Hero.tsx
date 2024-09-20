"use client";
import Image from "next/image";
import Lion from "/public/assets/bg-lion.svg";
import Lion3 from "/public/assets/bg-lion3.png";
import Circle from "/public/assets/bg-circle.svg";
import Logo from "/public/assets/roulette-logo.svg";
import { useState, useEffect, useContext } from "react";
import Breakpoint from "/public/assets/breakpoint.svg";
import Sol from "/public/assets/sol.svg";
import DropDown from "/public/assets/dropdown.svg";

import altImage from "/public/assets/storeMyster.png";
import { Reward } from "../types/reward";
import { playWheelGame } from "@/utils/transactions";
import { useWallet } from "@solana/wallet-adapter-react";
import { AppContext } from "../context/AppContext";

export default function Hero() {
  const wallet = useWallet();
  const { setCurrentReward, setYourPrize } = useContext(AppContext);
  const [outcome, setOutcome] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelStyle, setWheelStyle] = useState({});
  const [loading, setLoading] = useState<boolean>(false);

  const [rewardSet, setRewardSet] = useState<Reward[]>([]);

  const [imageWidth, setImageWidth] = useState(150);
  const minimumImages = 200;
  const handleResize = () => {
    if (window.innerWidth <= 640) {
      setImageWidth(150);
    } else {
      setImageWidth(200);
    }
  };

  const rewardData = async () => {
    setLoading(true);
    const data = await (
      await fetch("/api/rewards/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json();

    if (data?.rewards && data?.rewards?.length > 0) {
      const duplicatedImages: Reward[] = [];
      const duplicationTimes = Math.ceil(
        minimumImages / data?.rewards?.length ?? 1
      );

      for (let i = 0; i < duplicationTimes; i++) {
        duplicatedImages.push(...(data?.rewards as Reward[]));
      }

      setRewardSet(duplicatedImages);
    }
    setLoading(false);
  };

  useEffect(() => {
    rewardData();
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [position, setPosition] = useState(0);
  const speed = 50;
  // const boxSize = 50;
  // const screenWidth = window.innerWidth;

  useEffect(() => {
    if (!isSpinning) return;
    const intervalId = setInterval(() => {
      setPosition((prevPosition) => {
        if (!isSpinning) {
          clearInterval(intervalId);
          setPosition(0);
          return 0;
        }
        return prevPosition - speed;
      });
    }, 10);

    return () => clearInterval(intervalId);
  }, [isSpinning]);

  const handleSpin = async () => {
    setIsSpinning(true);
    const response = await playWheelGame(wallet, 0.001);

    if (response.success) {
      setTimeout(() => {
        setCurrentReward(response.reward);
        setYourPrize(true)
        rewardData();
        setIsSpinning(false);
      }, 2000);
    } else setIsSpinning(false);
  };

  return (
    <main className="flex bg-secondary text-primary lg:min-h-screen overflow-hidden">
      <div className="relative flex flex-col items-center justify-start lg:justify-center lg:gap-16 w-full lg:w-3/4 py-10 sm:py-16 lg:py-20 px-5">
        <div className="flex">
          <Image
            src={Logo}
            alt="Breakpoint Roulette Logo"
            className="w-[220px] md:w-[300px] lg:w-[540px]"
            width={540}
            height={540}
          />
          <Image
            src={Lion3}
            className="lg:hidden"
            alt="lion background asset"
            width={130}
            height={130}
          />
        </div>
        <div
          className="relative flex flex-col justify-end gap-8 z-0 border-[7px] border-primary rounded-[30px] h-[460px] lg:h-[500px] w-full sm:w-[80%] p-4 md:p-8"
          style={{
            background: "linear-gradient(0deg, #E2AD4F 0%, #921C1D 83%)",
          }}
        >
          <div className="flex justify-between gap-4 overflow-x-auto no-scrollbar h-max">
            <Image
              src={Breakpoint}
              className="z-10 absolute top-3 lg:top-5 left-1/2 transform -translate-x-1/2 w-[220px] md:w-[280px]"
              alt="Breakpoint Logo"
              width={280}
              height={200}
            />
            <div className="flex relative h-[200px] w-full">
              <div className="flex items-end sm:items-center absolute h-[200px] w-fit">
                {loading ? (
                  <h1>Loading...</h1>
                ) : (
                  <div
                    className="flex absolute"
                    style={{
                      left: `${isSpinning ? position : 0}px`,
                    }}
                  >
                    {rewardSet.map((reward, index) => (
                      <div
                        key={index}
                        // style={{
                        //   left: `${
                        //     imageWidth * index + (isSpinning ? position : 0)
                        //   }px`,
                        // }}
                        className="flex flex-col justify-between bg-secondary rounded-2xl  lg:w-[177px] lg:h-[203px] flex-shrink-0 p-2.5 lg:p-4 mr-3"
                      >
                        <div className="relative flex justify-center mb-1 lg:mb-2 w-full h-[80%]">
                          <Image
                            src={reward?.image ?? altImage}
                            alt={reward.name}
                            width="200"
                            height="200"
                            className="w-[100px] h-full lg:w-[200px] rounded-lg"
                          />
                          <div className="absolute top-0.5 text-[10px] left-0.5 lg:text-base bg-secondary text-primary border border-[#FFE072] rounded-md lg:rounded-lg px-1 lg:px-2 lg:py-0.5">
                            %{reward.probability}
                          </div>
                        </div>
                        <p className="w-[100px] sm:w-[150px] font-bold text-white overflow-hidden whitespace-nowrap text-ellipsis text-xs sm:text-base h-[13%]">
                          {reward?.name}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse items-center gap-3 lg:gap-6 w-full h-1/3 lg:h-max">
            <button className="flex items-center gap-2 bg-accent1 text-secondary font-bold border-[3px] border-secondary rounded-[10px] w-full lg:w-max h-16  px-8">
              <span>0.001</span>
              <span>
                <Image src={Sol} alt="SOL Token" width={40} height={40} />
              </span>
              {/* <span>
                <Image
                  src={DropDown}
                  alt="Dropdown Arrow"
                  width={20}
                  height={20}
                />
              </span> */}
            </button>
            <button
              onClick={() => {
                handleSpin();
              }}
              disabled={isSpinning}
              className="bg-secondary text-primary font-bold uppercase border-[3px] border-primary rounded-[10px] w-full h-16 p-4"
            >
              {isSpinning ? "Loading" : "spin"}
            </button>
          </div>
        </div>
        <Image
          className="-z-10 absolute top-0 left-0 object-cover h-full w-full"
          src={Circle}
          alt="Circles background asset"
          sizes="100vw"
        />
      </div>
      <div className="relative lg:w-1/4">
        <Image
          className="absolute -bottom-20 right-0 h-full"
          src={Lion}
          alt="lion background asset"
          sizes="100vw"
        />
      </div>
    </main>
  );
}
