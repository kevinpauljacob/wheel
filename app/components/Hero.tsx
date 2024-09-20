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
  const [spinData, setSpinData] = useState<Reward[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [imageWidth, setImageWidth] = useState(150); // Default image width for large screens
  const [minimumImages, setMinimumImages] = useState(50); // Minimum number of images to display
  // Adjust image width based on screen size
  const rewards = [
    {
      _id: "66ed1cfe31066817e18a6d44",
      address: "5bxqDourczRoV4s7qtNqUFDH8yQNUZxygnBftFRoMmZj",
      type: "CNFT",
      name: "Exodia the Forbidden One",
      image:
        "https://cdna.artstation.com/p/assets/images/images/052/118/830/large/julie-almoneda-03.jpg?1658992401",
      probability: 45,
      disabled: false,
      expired: false,
      amount: 1,
    },
    {
      _id: "66ed3c5c33e335ede6e6eb3b",
      address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
      type: "TOKEN",
      name: "1_2 USDC",
      image:
        "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png",
      probability: 10,
      disabled: false,
      expired: false,
      amount: 1,
    },
    {
      _id: "66ed47b7e8801e1be1d12f98",
      address: "95vxos6ksP1eJeNtSJ1q3wD1u5U132agjx9T5V53hy3S",
      type: "CNFT",
      name: "Bybit X Solana AirDrop",
      image: "https://i.ibb.co/s5HKC5L/image.png",
      probability: 30,
      disabled: false,
      expired: false,
      amount: 1,
    },
    {
      _id: "66ed49d6fb31769457dff55e",
      address: "37pAEuqvurc4k8jHQJ8xui4uMpdrbYqn8C8jjAJN1J2V",
      type: "PNFT",
      name: "Kathakali #20",
      image:
        "https://shdw-drive.genesysgo.net/CJBB5pX7ZBieztPqzZouNnuCndu9GtWDJBrhFo3UuRsg/37pAEuqvurc4k8jHQJ8xui4uMpdrbYqn8C8jjAJN1J2V.png?1",
      probability: 15,
      disabled: false,
      expired: false,
      amount: 1,
    },
  ];

  const handleResize = () => {
    if (window.innerWidth <= 640) {
      setImageWidth(100); // Small screens
      setMinimumImages(75);
    } else {
      setImageWidth(150); // Larger screens
      setMinimumImages(50);
    }
  };

  // Function to fetch and set spin data
  const rewardData = async () => {
    setLoading(true);
    /* const data = await (
      await fetch("/api/rewards/list", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).json(); */

    const duplicatedImages = [];
    const duplicationTimes = Math.ceil(minimumImages / rewards.length);

    for (let i = 0; i < duplicationTimes; i++) {
      duplicatedImages.push(...rewards);
    }

    console.log("🚀 ~ rewardData ~ ̥:", duplicatedImages);
    setSpinData(duplicatedImages);
    setLoading(false);
  };

  useEffect(() => {
    // Set initial image width
    rewardData();

    handleResize();
    // Add event listener to update width on resize
    window.addEventListener("resize", handleResize);
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Function to handle the spin
  const spinWheel = (selectedId: string) => {
    if (!spinData.length) return;
    /*   const selectedIndex = spinData.findIndex(
      (image) => image.id === parseInt(selectedId)
    ); */
    const selectedIndex = parseInt(selectedId);
    if (selectedIndex === -1) {
      alert("Invalid image ID");
      return;
    }

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
      // rewardData();
    }, 5000); // Duration should match the transition time (4s)
  };

  const handleSpin = async () => {
    if (wheelStyle.transform !== `translateX(0px)`) {
      // If the wheel is not at the initial position, reset it
      setWheelStyle({
        transition: "none",
        transform: `translateX(0px)`,
      });

      // Give a slight delay to ensure the reset is visually applied before the spin starts
      await new Promise((resolve) => setTimeout(resolve, 1000)); // 100ms delay
    }
    setIsSpinning(true);
    /*  const response = await playWheelGame(wallet, 0.001);

    if (response.success) {
      const rewardIndex = spinData.findIndex(
        (reward) => reward._id === response.reward._id
      ); */
    const randomIndex = Math.floor(Math.random() * 3) + 1;
    alert(randomIndex);
    spinWheel(`${randomIndex}`);
    const selectedReward = spinData[randomIndex + 1];
    setTimeout(() => {
      setCurrentReward(selectedReward);
    }, 4000);
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
              {loading ? (
                <h1>Loading...</h1>
              ) : (
                spinData.map((reward, index) => (
                  <div
                    key={index}
                    className="flex flex-col justify-between bg-secondary rounded-2xl  lg:w-[177px] lg:h-[203px] flex-shrink-0 p-2.5 lg:p-4 mr-3"
                  >
                    <div className="relative mb-1 lg:mb-2 w-full h-[80%]">
                      <Image
                        src={reward?.image ?? altImage}
                        alt={reward.name}
                        width="200"
                        height="200"
                        className="w-[100px] h-full lg:w-[200px] rounded-lg"
                      />
                      <div className="absolute top-0.5 text-[10px] left-0.5 lg:text-base bg-secondary text-primary border border-[#FFE072] rounded-md lg:rounded-lg px-1 lg:px-2 lg:py-0.5">
                        %{reward.probability}+ {index}
                      </div>
                    </div>
                    <p className="w-[100px] sm:w-[150px] font-bold text-white overflow-hidden whitespace-nowrap text-ellipsis text-xs sm:text-base h-[13%]">
                      {reward?.name}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex flex-col lg:flex-row-reverse items-center gap-3 lg:gap-6 w-full h-1/3 lg:h-max">
            <button className="flex items-center gap-2 bg-accent1 text-secondary font-bold border-[3px] border-secondary rounded-[10px] w-full lg:w-max py-4 px-8">
              <span>0.1</span>
              <span>
                <Image src={Sol} alt="SOL Token" width={30} height={30} />
              </span>
            </button>
            <button
              onClick={() => {
                handleSpin();
              }}
              disabled={isSpinning}
              className="bg-secondary text-primary font-bold uppercase border-[3px] border-primary rounded-[10px] w-full p-4"
            >
              {isSpinning ? (
                <div className="flex items-center justify-center gap-2">
                  <p>Loading</p>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-loader animate-spin"
                  >
                    <path d="M12 2v4" />
                    <path d="m16.2 7.8 2.9-2.9" />
                    <path d="M18 12h4" />
                    <path d="m16.2 16.2 2.9 2.9" />
                    <path d="M12 18v4" />
                    <path d="m4.9 19.1 2.9-2.9" />
                    <path d="M2 12h4" />
                    <path d="m4.9 4.9 2.9 2.9" />
                  </svg>
                </div>
              ) : (
                "spin"
              )}
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
          className="z-0 absolute top-0 left-0 object-cover h-full w-full"
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
