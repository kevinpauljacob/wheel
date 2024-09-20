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
  // const [outcome, setOutcome] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelStyle, setWheelStyle] = useState({});
  const [spinData, setSpinData] = useState<Reward[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const imageWidth = 150; // Adjust this value based on your image width

  // Function to fetch and set spin data
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
    const duplicatedImages = [];
    const minImagesNeeded = 50;
    const duplicationTimes = Math.ceil(minImagesNeeded / data.rewards.length);

    for (let i = 0; i < duplicationTimes; i++) {
      duplicatedImages.push(...data.rewards);
    }
    setSpinData(duplicatedImages);
    setLoading(false);
  };

  useEffect(() => {
    rewardData();
  }, []);

  // Function to handle the spin
  const spinWheel = (selectedId: string) => {
    if (isSpinning || !spinData.length) return;
    /*   const selectedIndex = spinData.findIndex(
      (image) => image.id === parseInt(selectedId)
    ); */
    const selectedIndex = parseInt(selectedId);
    if (selectedIndex === -1) {
      alert("Invalid image ID");
      return;
    }

    setIsSpinning(true);
    const totalSpins = 1; // Number of complete spins
    const stopPosition =
      (totalSpins * spinData.length + selectedIndex) * imageWidth;
    const randomOffset = Math.floor(Math.random() * 100) - 50; // Add slight randomness
    const finalPosition = stopPosition + randomOffset;

    // Start the spin
    setWheelStyle({
      transition: "transform 4s ease-out",
      transform: `translateX(-${finalPosition - 20}px)`,
    });

    // Reset after spin ends
    setTimeout(() => {
      setIsSpinning(false);
      setYourPrize(true);
      // Ensures the wheel stops on the exact image without the offset
      setWheelStyle({
        transition: "none",
        transform: `translateX(-${selectedIndex * imageWidth}px)`,
      });
    }, 4000); // Duration should match the transition time (4s)
    rewardData();
  };

  const handleSpin = async () => {
    const response = await playWheelGame(wallet, 0.001);

    if (response.success) {
      const rewardIndex = spinData.findIndex(
        (reward) => reward._id === response.reward._id
      );
      spinWheel(`${rewardIndex}`);
      setCurrentReward(response.reward);
    }
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
          className="relative flex flex-col justify-end gap-8 z-0 border-[7px] border-primary rounded-[30px] h-[460px] lg:h-[500px] w-full sm:w-[550px] lg:w-[70%] xl:w-[60%] max-w-[1000px] p-4 md:p-8"
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
            <div className="flex" style={wheelStyle}>
              {spinData.map((reward, index) => (
                <div
                  key={index}
                  className="bg-secondary rounded-2xl  lg:w-[177px] lg:h-[203px] flex-shrink-0 p-2.5 lg:p-4 mr-3"
                >
                  <div className="relative mb-1 lg:mb-2 w-full">
                    <Image
                      src={reward?.image ?? altImage}
                      alt={reward.name}
                      width="200"
                      height="200"
                      className="w-[100px] h-full lg:w-[200px] "
                    />
                    <div className="absolute top-0 text-[10px] lg:text-base bg-secondary text-primary border border-[#FFE072] rounded-md lg:rounded-lg px-1 lg:px-2 lg:py-0.5">
                      %{reward.probability} {index - 1}
                    </div>
                    <h1 className="w-[150px] overflow-hidden whitespace-nowrap text-ellipsis">
                      {reward?.name}
                    </h1>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse items-center gap-3 lg:gap-6 w-full h-1/3 lg:h-max">
            <button className="flex items-center gap-2 bg-accent1 text-secondary font-bold border-[3px] border-secondary rounded-[10px] w-full lg:w-max py-4 px-8">
              <span>0.1</span>
              <span>
                <Image src={Sol} alt="SOL Token" width={30} height={30} />
              </span>
              <span>
                <Image
                  src={DropDown}
                  alt="Dropdown Arrow"
                  width={20}
                  height={20}
                />
              </span>
            </button>
            <button
              onClick={() => {
                handleSpin();
              }}
              disabled={isSpinning}
              className="bg-secondary text-primary font-bold uppercase border-[3px] border-primary rounded-[10px] w-full p-4"
            >
              spin
            </button>
            {/*     <input
              type="number"
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              placeholder="Enter Image ID"
              className="p-2 border border-gray-300 rounded"
            /> */}
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
