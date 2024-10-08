"use client";
import { useState, useEffect, useContext } from "react";
import ConnectWallet from "./ConnectWallet";
import Image from "next/image";
import Link from "next/link";
import { AppContext } from "../context/AppContext";
import SmithiiLogo from "/public/assets/smithii-logo.svg";
import Logo from "/public/assets/logo.svg";
import { socials } from "./Footer";

const links = [
  { name: "Smithii Tools", href: "/smithii-tools" },
  { name: "Giveaway", href: "/giveaway" },
];

export default function Navbar() {
  const { recentPrizes, setRecentPrizes } = useContext(AppContext);
  const [mobileNav, setMobileNav] = useState(false);

  const handleMobileNav = () => {
    mobileNav ? setMobileNav(false) : setMobileNav(true);
  };

  const handleRecentPrizes = () => {
    if (recentPrizes) {
      setRecentPrizes(false);
    } else {
      setRecentPrizes(true);
      setMobileNav(false);
    }
  };

  useEffect(() => {
    if (mobileNav) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileNav]);

  return (
    <nav className="z-[100] flex justify-between bg-primary border-b border-secondary items-center p-5 md:px-10 lg:px-14 xl:px-20 md:py-8 w-full">
      <div className="flex lg:hidden gap-4">
        <button className="" onClick={handleMobileNav}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="size-10"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <Image
          src={Logo}
          alt="Smithii Logo"
          width={40}
          height={40}
          className=""
        />
      </div>
      <div className="hidden lg:block">
        <Image
          src={SmithiiLogo}
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
      <div className="flex gap-4">
        <button
          className="hidden lg:block font-bold border-[3px] border-accent1 hover:bg-[#e2ad4f4d] transition-all duration-300 ease-in-out rounded-[10px] px-10 py-2.5"
          onClick={handleRecentPrizes}
        >
          Recent Prizes
        </button>
        <ConnectWallet />
      </div>
      <div
        className={`${
          mobileNav ? "top-[91px]" : "fadeOutDown top-[100dvh]"
        } z-50 fixed  transition-all duration-500 ease-in-out left-0  h-[calc(100dvh-70px)] w-full flex flex-col justify-between items-start bg-primary`}
      >
        <div className="w-full">
          <div className="flex flex-col justify-start items-start gap-4 w-full p-5 sm:p-10">
            <button
              className="font-bold border-[3px] border-accent1 rounded-[10px] px-10 py-4 w-full"
              onClick={handleRecentPrizes}
            >
              Recent Prizes
            </button>
            {links.map((link, index: number) => (
              <Link
                key={index}
                href={link.href}
                className="font-semibold w-full"
              >
                <button className="font-bold border-[3px] border-accent1 hover:bg-[#e2ad4f4d] transition-all duration-300 ease-in-out rounded-[10px] px-10 py-4 w-full">
                  {link.name}
                </button>
              </Link>
            ))}
          </div>
        </div>
        <footer className="flex flex-col justify-between items-center p-5 md:px-10 w-full">
          <div className="flex items-center gap-14 mb-10">
            {socials.map((social, index: number) => (
              <Link key={index} href={social.href}>
                <Image
                  src={social.icon}
                  alt={social.name}
                  width={40}
                  height={40}
                />
              </Link>
            ))}
          </div>

          <Image
            src={SmithiiLogo}
            alt="Smithii Logo"
            width={80}
            height={80}
            className="mb-2.5"
          />

          <p>© 2024 Smithii LTD | All rights reserved</p>
        </footer>
      </div>
    </nav>
  );
}
