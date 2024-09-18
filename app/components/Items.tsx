import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

// Define types for NFT, cNFT, and Token
interface NFT {
  id: number;
  name: string;
}

interface Collection {
  [collectionName: string]: NFT[];
}

interface Token {
  name: string;
}

interface Collections {
  NFTs: Collection;
  cNFTs: Collection;
  Tokens: Token[];
}

// The collections object with proper typing
const collections: Collections = {
  NFTs: {
    Yoots: [
      { id: 1, name: "Yoot #1" },
      { id: 2, name: "Yoot #2" },
      { id: 3, name: "Yoot #3" },
    ],
    Degods: [
      { id: 4, name: "Degod #1" },
      { id: 5, name: "Degod #2" },
      { id: 6, name: "Degod #3" },
    ],
  },
  cNFTs: {
    "C-Yoots": [
      { id: 7, name: "C-Yoot #1" },
      { id: 8, name: "C-Yoot #2" },
    ],
    "C-Degods": [
      { id: 9, name: "C-Degod #1" },
      { id: 10, name: "C-Degod #2" },
    ],
  },
  Tokens: [{ name: "$SOL" }, { name: "$ETH" }],
};

const Items: React.FC = () => {
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState<"NFTs" | "cNFTs" | "Tokens">(
    "NFTs"
  );
  const [activeCollection, setActiveCollection] = useState<string>(
    Object.keys(collections.NFTs)[0]
  );
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [amount, setAmount] = useState<string>("");

  const handleTabChange = (tab: "NFTs" | "cNFTs" | "Tokens") => {
    setActiveTab(tab);
    if (tab === "Tokens") {
      setActiveCollection(collections.Tokens[0].name); // Set the first token by default
    } else {
      setActiveCollection(Object.keys(collections[tab])[0]);
    }
    setSearchQuery(""); // Clear search when tab changes
  };

  return (
    <div className="flex gap-8">
      <div className="max-w-md p-4 bg-[#161616] min-h-[500px] rounded-xl">
        {/* Tab Header for NFTs, cNFTs, Tokens */}
        <div className="flex border-2 border-white/5 rounded-md p-2 mb-4">
          {["NFTs", "cNFTs", "Tokens"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md text-sm font-medium w-full ${
                activeTab === tab ? "bg-[#202329] text-white" : "text-gray-400"
              }`}
              onClick={() =>
                handleTabChange(tab as "NFTs" | "cNFTs" | "Tokens")
              }
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Collection Tabs for the selected category */}
        <div className="flex flex-col gap-2 mb-4">
          {activeTab !== "Tokens"
            ? Object.keys(collections[activeTab]).map((collectionName) => (
                <button
                  key={collectionName}
                  className={`p-6 rounded-md text-sm font-medium ${
                    activeCollection === collectionName
                      ? "bg-white/10 text-white"
                      : "bg-[#FFFFFF08] text-gray-400"
                  }`}
                  onClick={() => setActiveCollection(collectionName)}
                >
                  {collectionName}
                </button>
              ))
            : collections.Tokens.map((token, index) => (
                <button
                  key={index}
                  className={`p-6 rounded-md text-sm font-medium ${
                    activeCollection === token.name
                      ? "bg-white/10 text-white"
                      : "bg-[#FFFFFF08] text-gray-400"
                  }`}
                  onClick={() => setActiveCollection(token.name)}
                >
                  {token.name}
                </button>
              ))}
        </div>
      </div>

      <div>
        <div className="mb-4">
          <input
            placeholder="Search collections and creators"
            className="rounded-full py-5 px-8 text-xs text-white/30 bg-[#1C181D]/65 min-w-[400px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} // Update search query
          />
        </div>
        {activeTab !== "Tokens" ? (
          <div className="flex flex-wrap gap-2">
            {collections[activeTab][activeCollection].filter((nft: NFT) =>
              nft.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length > 0 ? (
              collections[activeTab][activeCollection]
                .filter((nft: NFT) =>
                  nft.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((nft: NFT) => (
                  <div
                    key={nft.id}
                    className="mb-2 bg-[#141720] rounded-lg text-white h-max"
                  >
                    <div className="w-[120px] h-[120px] bg-[#F0DADA] rounded-[5px]"></div>
                    <div className="flex flex-col gap-2 p-2">
                      <p className="text-xs text-[#94A3B8]">{nft.name}</p>
                      <button className="text-xs bg-[#726CFB] rounded-[5px] py-1">
                        List
                      </button>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-white text-xs">No results found</p>
            )}
          </div>
        ) : (
          <div className="p-6 bg-[#121418] rounded-lg text-white">
            <div className="mb-4">
              <label className="block text-xs font-medium mb-1" htmlFor="coin">
                Coin
              </label>
              <input
                id="coin"
                type="text"
                value={activeCollection}
                className="w-full rounded-md py-3 px-4 bg-[#202329] border-none text-white"
                disabled
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-xs font-medium mb-1"
                htmlFor="wallet"
              >
                Current Wallet
              </label>
              <input
                id="wallet"
                type="text"
                value={wallet.connected ? wallet.publicKey?.toBase58() : ""}
                className="w-full rounded-md py-3 px-4 bg-[#202329] border-none text-white/50"
                disabled
              />
            </div>
            <div className="mb-4">
              <label
                className="block text-xs font-medium mb-1"
                htmlFor="amount"
              >
                Amount
              </label>
              <div className="group flex h-11 w-full cursor-pointer items-center rounded-[8px] bg-[#202329] pl-4 pr-2.5">
                <input
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  type={"number"}
                  lang="en"
                  step={"any"}
                  autoComplete="off"
                  placeholder={"00.00"}
                  className={`flex w-full min-w-0 bg-transparent text-sm text-[#94A3B8] placeholder-[#94A3B8]  placeholder-opacity-40 outline-none`}
                />
                <span
                  className="text-xs font-medium text-white text-opacity-50 bg-[#292C32] hover:bg-[#47484A] focus:bg-[#47484A] transition-all rounded-[5px] py-1.5 px-4"
                  // onClick={() => {
                  //   let bal = 0;
                  //   if (coinData) {
                  //     let token = coinData.find(
                  //       (coin) =>
                  //         coin?.tokenMint &&
                  //         coin?.tokenMint === selectedToken?.tokenMint
                  //     );
                  //     if (token) bal = token?.amount;
                  //   }

                  //   setAmount(bal);
                  // }}
                >
                  Max
                </span>
              </div>
            </div>

            <button className="bg-[#726CFB] w-full py-4 rounded-lg">
              List
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;
