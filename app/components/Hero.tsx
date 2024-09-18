"use client";
import Image from "next/image";
import Lion from "/public/assets/bg-lion.svg";
import Lion3 from "/public/assets/bg-lion3.png";
import Circle from "/public/assets/bg-circle.svg";
import Logo from "/public/assets/roulette-logo.svg";
import { useEffect, useRef, useState } from "react";
import Breakpoint from "/public/assets/breakpoint.svg";
import Sol from "/public/assets/sol.svg";
import DropDown from "/public/assets/dropdown.svg";

import nft from "/public/assets/nft.svg";

export default function Hero() {
  const [spinning, setSpinning] = useState(false);
  const [cardWidth, setCardWidth] = useState(200); // Default value
  const [viewportWidth, setViewportWidth] = useState(600); // Default value
  const cardRef = useRef(null);
  const wheelRef = useRef(null);
  // Array of cards with their images and identifiers
  const cards = [
    { id: "0", imageSrc: nft, alt: "Image 0", name: "SMB #1167" },
    { id: "1", imageSrc: nft, alt: "Image 1", name: "SMB #1168" },
    { id: "2", imageSrc: nft, alt: "Image 2", name: "SMB #1169" },
    { id: "3", imageSrc: nft, alt: "Image 3", name: "SMB #1170" },
    { id: "4", imageSrc: nft, alt: "Image 4", name: "SMB #1171" },
  ];

  useEffect(() => {
    // Update cardWidth based on the actual rendered size
    const updateSizes = () => {
      if (cardRef.current) {
        const cardRect = cardRef.current.getBoundingClientRect();
        setCardWidth(cardRect.width + 20); // Include margin (adjust as needed)
      }
      setViewportWidth(window.innerWidth);
    };

    // Initial size calculation
    updateSizes();

    // Recalculate sizes on window resize
    window.addEventListener("resize", updateSizes);

    return () => {
      window.removeEventListener("resize", updateSizes);
    };
  }, []);
  const initWheel = () => {
    const duplicatedCards = [...cards, ...cards]; // Duplicate the cards
    return duplicatedCards.map((card, index) => (
      <div
        key={index}
        className="bg-secondary rounded-2xl lg:w-[177px] lg:h-[203px] flex-shrink-0 p-2.5 lg:p-4 spin-card mr-4"
        // Attach ref to the first card
        ref={index === 0 ? cardRef : null}
      >
        <div className="relative mb-1 lg:mb-2 w-full">
          <Image
            src={card.imageSrc}
            alt="nft"
            width="200"
            height="200"
            className="w-[100px] h-full lg:w-[180px] "
          />
          <div className="absolute top-0 text-[10px] lg:text-base bg-secondary text-primary border border-[#FFE072] rounded-md lg:rounded-lg px-1 lg:px-2 lg:py-0.5">
            %0.5
          </div>
        </div>
        <p className="text-xs lg:text-base font-bold text-white">{card.name}</p>
      </div>
    ));
  };

  const spinWheel = (desiredCardIndex) => {
    if (spinning) return;
    setSpinning(true);

    const cardWidth = 200; // Width of each card including margin
    const totalCards = cards.length;
    const totalWheelCards = totalCards * 2; // Since we duplicated the cards

    const wheelElement = wheelRef.current;

    // Calculate start position
    const startPosition = parseFloat(
      getComputedStyle(wheelElement).getPropertyValue("--end-position") || "0"
    );

    // Calculate the end position to center the desired card
    const endPosition =
      startPosition -
      (desiredCardIndex + totalCards) * cardWidth + // Move to desired card
      viewportWidth / 2 - // Center the viewport
      cardWidth / 2; // Adjust for card width

    // Update CSS variables
    wheelElement.style.setProperty("--start-position", `${startPosition}px`);
    wheelElement.style.setProperty("--end-position", `${endPosition}px`);
    wheelElement.style.setProperty("--animation-duration", `8s`);

    // Add the animation class to start the spin
    wheelElement.classList.add("spinning");

    // Remove the animation class after the animation ends
    /*     setTimeout(() => {
      wheelElement.classList.remove("spinning");
      setSpinning(false);
    }, 8000); */
  };
  useEffect(() => {
    const wheelElement = wheelRef.current;
    wheelElement.style.setProperty("--start-position", "0px");
    wheelElement.style.setProperty("--end-position", "0px");
  }, []);

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
          className="relative flex flex-col justify-end gap-8 z-10 border-[7px] border-primary rounded-[30px] h-[460px] lg:h-[500px] w-full sm:w-[550px] lg:w-[70%] xl:w-[60%] max-w-[1000px] p-4 md:p-8"
          style={{
            background: "linear-gradient(0deg, #E2AD4F 0%, #921C1D 83%)",
          }}
        >
          <Image
            src={Breakpoint}
            className="z-20 absolute top-3 lg:top-5 left-1/2 transform -translate-x-1/2 w-[220px] md:w-[280px]"
            alt="Breakpoint Logo"
            width={280}
            height={200}
          />
          <div className="flex w-full overflow-hidden">
            <div className="wheel" ref={wheelRef}>
              {initWheel()}
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
              onClick={() => spinWheel(2)}
              disabled={spinning}
              className="bg-secondary text-primary font-bold uppercase border-[3px] border-primary rounded-[10px] w-full p-4"
            >
              Spin
            </button>
          </div>
        </div>
        <Image
          className="absolute top-0 left-0 object-cover h-full w-full"
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
