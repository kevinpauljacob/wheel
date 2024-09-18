'use client'

import Image from "next/image";
import ConnectWallet from "./components/ConnectWallet";

export default function Home() {
  return (
    <div className="flex flex-1 bg-black/50">
      <main className="flex flex-1 flex-col items-center justify-center">
        <ConnectWallet />
      </main>
    </div>
  );
}
