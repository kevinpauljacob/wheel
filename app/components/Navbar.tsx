"use client";
import { useState } from "react";
import ConnectWallet from "./ConnectWallet";
import Image from "next/image";
import Link from "next/link";
import Logo from "/public/assets/smithii-logo.svg";

const links = [
  { name: "Smithii Tools", href: "/smithii-tools" },
  { name: "Giveaway", href: "/giveaway" },
];

export default function Navbar() {
  const [mobileNav, setMobileNav] = useState(false);

  const handleMobileNav = () => {
    mobileNav ? setMobileNav(false) : setMobileNav(true);
  };

  return (
    <nav className="flex justify-between items-center p-5 md:px-10 lg:px-14 xl:px-20 md:py-8">
      <div>
        <Image
          src={Logo}
          alt="Smithii Logo"
          width={200}
          height={200}
          className="w-[150px] h-[40px] md:w-[200px] md:h-[50px]"
        />
      </div>
      <div className="hidden lg:flex gap-10">
        {links.map((link, index: number) => (
          <Link key={index} href={link.href} className="font-semibold">
            {link.name}
          </Link>
        ))}
      </div>
      <div className="hidden lg:flex gap-4">
        <button className="font-bold border-[3px] border-accent1 rounded-[10px] px-10 py-2.5">
          Recent Prizes
        </button>
        <button className="bg-secondary text-primary font-bold border-[3px] border-secondary rounded-[10px] px-10 py-2.5">
          <ConnectWallet />
        </button>
      </div>
      <button className="lg:hidden" onClick={handleMobileNav}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth="1.5"
          stroke="currentColor"
          className="size-8"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
          />
        </svg>
      </button>
      {mobileNav && (
        <div className="z-50 fixed top-0 left-0 h-screen w-full flex flex-col justify-between items-start bg-primary p-5 sm:p-10">
          <div className="flex justify-between items-center w-full">
            <Image
              src={Logo}
              alt="Smithii Logo"
              width={200}
              height={200}
              className="w-[150px] h-[40px] md:w-[200px] md:h-[50px]"
            />
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 22 22"
              strokeWidth="1.5"
              stroke="currentColor"
              className="size-6"
              onClick={handleMobileNav}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </div>
          <div className="flex flex-col justify-center items-center gap-4 w-full">
            {links.map((link, index: number) => (
              <Link key={index} href={link.href} className="font-semibold">
                {link.name}
              </Link>
            ))}
          </div>
          <div className="flex flex-col gap-4 w-full">
            <button className="font-bold border-[3px] border-accent1 rounded-[10px] px-10 py-2.5">
              Recent Prizes
            </button>
            <button className="bg-secondary text-primary font-bold border-[3px] border-secondary rounded-[10px] px-10 py-2.5">
              <ConnectWallet />
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
