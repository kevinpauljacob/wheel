"use client";
import { useContext } from "react";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Hero from "@/app/components/Hero";
import Prizes from "@/app/components/Prizes";
import RecentPrizes from "@/app/components/RecentPrizes";
import YourPrize from "./components/YourPrize";
import { AppContext } from "@/app/context/AppContext";
import Headroom from "react-headroom";

export default function Home() {
  const { recentPrizes, yourPrize } = useContext(AppContext);
  return (
    <div className="relative">
      <Headroom>
        <Navbar />
      </Headroom>
      <Hero />
      <Prizes />
      <Footer />
      {recentPrizes && <RecentPrizes />}
      {yourPrize && <YourPrize />}
    </div>
  );
}
