"use client";
import { useState } from "react";
import { Inter } from "next/font/google";
import Navbar from "../components/Navbar";
import Items from "../components/Items";
import ListingsTable from "../components/ListingsTable";
import { useWallet } from "@solana/wallet-adapter-react";
import { ADMIN_WALLETS } from "@/utils/constants";

const inter = Inter({ subsets: ["latin"] });

export default function Admin() {
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState<"items" | "listings">("items");

  if (
    !wallet.connected ||
    !wallet.publicKey ||
    !ADMIN_WALLETS.includes(wallet.publicKey.toString())
  )
    return <h1>Unauthorised</h1>;

  return (
    <div className="bg-black text-white min-h-screen">
      <Navbar />
      <main className={`px-28 py-20 ${inter.className}`}>
        <div className="mb-10">
          <h1 className="text-4xl mb-2">Admin Panel</h1>
          <p className="text-xs text-white/50">
            Choose the most suitable blockchain for your needs. You need to
            connect wallet for creation.
          </p>
        </div>
        <div>
          <div className="flex items-center border-b border-white/20 ">
            <div
              className={`px-10 py-3 border-b-[3px] cursor-pointer ${
                activeTab === "items"
                  ? "border-[#FDC82F]"
                  : "border-transparent"
              }`}
              onClick={() => setActiveTab("items")}
            >
              Items
            </div>
            <div
              className={`px-10 py-3 border-b-[3px] cursor-pointer ${
                activeTab === "listings"
                  ? "border-[#FDC82F]"
                  : "border-transparent"
              }`}
              onClick={() => setActiveTab("listings")}
            >
              Listings
            </div>
          </div>
          <div>
            {activeTab === "items" && (
              <div className="py-14">
                <Items />
              </div>
            )}
            {activeTab === "listings" && (
              <div className="py-14">
                <ListingsTable />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
