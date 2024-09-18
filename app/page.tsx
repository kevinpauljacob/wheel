"use client";
import { useContext } from "react";
import { Roboto_Serif } from "next/font/google";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import Hero from "@/app/components/Hero";
import Prizes from "@/app/components/Prizes";
import Modal from "@/app/components/Modal";
import { AppContext } from "@/app/context/AppContext";

const roboto = Roboto_Serif({ subsets: ["latin"], weight: ["400", "700"] });

export default function Home() {
  const { isModalOpen } = useContext(AppContext);
  return (
    <div className={`${roboto.className} relative`}>
      <Navbar />
      <Hero />
      <Prizes />
      <Footer />
      {isModalOpen && <Modal />}
    </div>
  );
}
