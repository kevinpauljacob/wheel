"use client";
import { useState } from "react";
import nft from "/public/assets/nft.svg";
import Image from "next/image";
import Breakpoint from "/public/assets/breakpoint.svg";

export default function SpinComponent() {
  const images = [
    { id: 0, src: nft, name: "SMB #1167" },
    { id: 1, src: nft, name: "SMB #1168" },
    { id: 2, src: nft, name: "SMB #1169" },
    { id: 3, src: nft, name: "SMB #1170" },
    { id: 4, src: nft, name: "SMB #1171" },
  ];

  const [outcome, setOutcome] = useState("");
  const [isSpinning, setIsSpinning] = useState(false);
  const [wheelStyle, setWheelStyle] = useState({});

  const imageWidth = 177; // Adjust this value based on your image width
  const totalImages = images.length;

  // Duplicating the image array 3 times for smooth spinning
  const extendedImages = [
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
    ...images,
  ];

  // Function to handle the spin
  const spinWheel = (selectedId: any) => {
    if (isSpinning) return;

    const selectedIndex = images.findIndex(
      (image) => image.id === parseInt(selectedId)
    );
    if (selectedIndex === -1) {
      alert("Invalid image ID");
      return;
    }

    setIsSpinning(true);

    const totalSpins = 3; // Number of complete spins (adjust for longer/shorter animation)
    const stopPosition =
      (totalSpins * totalImages + selectedIndex) * imageWidth;

    const randomOffset = Math.floor(Math.random() * 100) - 50; // Add slight randomness

    const finalPosition = stopPosition + randomOffset;

    // Start the spin
    setWheelStyle({
      transition: "transform 4s ease-out",
      transform: `translateX(-${finalPosition}px)`,
    });

    // Reset after spin ends
    setTimeout(() => {
      setIsSpinning(false);
      setWheelStyle({
        transition: "none",
        transform: `translateX(-${selectedIndex * imageWidth}px)`,
      });
    }, 4000); // Duration should match the transition time (4s)
  };

  return (
    <div className="relative flex flex-col items-center space-y-4 top-8">
      {/* Wheel Container */}
      <div className="relative w-[600px] h-68 overflow-hidden border-2 border-gray-300">
        <Image
          src={Breakpoint}
          width={200}
          height={300}
          alt="Breakpoint Logo"
          className="absolute inset-y-0 left-1/2 -top-20 transform -translate-x-1/2 z-30"
        />
        {/* Spinning Images */}
        <div className="flex" style={wheelStyle}>
          {extendedImages.map((image, index) => (
            <div
              key={index}
              className="bg-secondary rounded-2xl  lg:w-[177px] lg:h-[203px] flex-shrink-0 p-2.5 lg:p-4 mr-3"
            >
              <div className="relative mb-1 lg:mb-2 w-full">
                <Image
                  src={image.src}
                  alt={`Image ${image.id}`}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-0 text-[10px] lg:text-base bg-secondary text-primary border border-[#FFE072] rounded-md lg:rounded-lg px-1 lg:px-2 lg:py-0.5">
                  {index - 1}
                </div>
                <h1>{image.name}</h1>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Breakpoint Arrow (Center) */}
      <div className="absolute inset-y-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-red-500" />

      {/* Input for selecting image */}
      <input
        type="number"
        value={outcome}
        onChange={(e) => setOutcome(e.target.value)}
        placeholder="Enter Image ID"
        className="p-2 border border-gray-300 rounded"
      />

      {/* Spin Button */}
      <button
        onClick={() => spinWheel(outcome)}
        disabled={isSpinning}
        className={`px-6 py-2 bg-blue-500 text-white rounded-lg ${
          isSpinning ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isSpinning ? "Spinning..." : "Spin Wheel"}
      </button>
    </div>
  );
}
