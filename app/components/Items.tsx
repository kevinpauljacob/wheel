import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { listReward } from "@/utils/transactions";
import {
  Assets,
  Collection,
  NFT,
  TokenAccount,
  getSolBalance,
  obfuscatePubKey,
} from "@/utils/helpers";
import Image from "next/image";

const Items: React.FC = () => {
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState<"PNFT" | "CNFT" | "Tokens">(
    "PNFT"
  );
  const [activeCollection, setActiveCollection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [adding, setAdding] = useState<boolean>(false);

  const [assets, setAssets] = useState<Assets>({
    PNFT: {},
    CNFT: {},
    Tokens: [],
  });

  const handleTabChange = (tab: "PNFT" | "CNFT" | "Tokens") => {
    setActiveTab(tab);
    if (tab === "Tokens") {
      setActiveCollection(assets.Tokens[0]?.mintAddress);
    } else {
      setActiveCollection(Object.keys(assets[tab])[0] || "Others");
    }
    setSearchQuery("");
  };

  const getAssets = async () => {
    try {
      if (!wallet.publicKey) return;

      const response = await fetch(
        "https://mainnet.helius-rpc.com/?api-key=70d82569-44dd-44e4-9135-2c234ac26ff9",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jsonrpc: "2.0",
            id: "text",
            method: "getAssetsByOwner",
            params: {
              ownerAddress: wallet.publicKey.toString(),
              page: 1,
              limit: 100,
              sortBy: {
                sortBy: "created",
                sortDirection: "asc",
              },
              options: {
                showUnverifiedCollections: false,
                showCollectionMetadata: true,
                showGrandTotal: false,
                showFungible: true,
                showNativeBalance: false,
                showInscription: true,
                showZeroBalance: false,
              },
            },
          }),
        }
      );
      const data = await response.json();

      setLoading(false);

      console.log("helius", data);

      const assetsData: any[] = data?.result?.items ?? [];
      const tokens: TokenAccount[] = [];
      const PNFTS: Collection = { Others: [] };
      const CNFTS: Collection = { Others: [] };

      assetsData.forEach((asset) => {
        if (
          asset?.interface === "FungibleToken" &&
          asset?.id &&
          asset?.token_info?.symbol &&
          asset?.token_info?.price_info?.total_price
        ) {
          tokens.push({
            mintAddress: asset.id,
            name: asset.token_info.symbol,
            balance: asset.token_info.price_info.total_price,
            image: asset?.content?.links?.image ?? "",
          });
        } else if (
          (asset?.interface === "ProgrammableNFT" ||
            asset?.compression?.compressed) &&
          asset?.id &&
          asset?.content?.metadata?.name
        ) {
          let collection = "Others";
          if (
            asset?.grouping?.length > 0 &&
            asset?.grouping[0]?.collection_metadata?.name
          ) {
            collection = asset?.grouping[0]?.collection_metadata?.name;
            asset?.compression?.compressed
              ? (CNFTS[collection] = [])
              : (PNFTS[collection] = []);
          }
          const nft = {
            name: asset.content.metadata.name,
            address: asset.id,
            image: asset?.content?.links?.image ?? "",
            type: (asset?.compression?.compressed ? "CNFT" : "PNFT") as
              | "PNFT"
              | "CNFT",
          };
          asset?.compression?.compressed
            ? CNFTS[collection].push(nft)
            : PNFTS[collection].push(nft);
        }
      });

      const solBalance = await getSolBalance(wallet.publicKey);

      tokens.push({
        mintAddress: "SOL",
        name: "SOL",
        balance: solBalance,
        image:
          "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/8ezDtNNhX91t1NbSLe8xV2PcCEfoQjEm2qDVGjt3rjhg/SOL.svg",
      });

      console.log("nfts", PNFTS);
      console.log("cnfts", CNFTS);
      console.log("tokens", tokens);

      setAssets({
        PNFT: PNFTS,
        CNFT: CNFTS,
        Tokens: tokens,
      });

      setActiveCollection(Object.keys(PNFTS)[0] || "Others");
    } catch (e) {
      console.error("Failed to fetch assets", e);
    }
  };

  const list = async (
    type: string,
    address: string,
    reward: TokenAccount | NFT
  ) => {
    setAdding(true);
    console.log(type, address, amount, reward.name);
    let rewardAmount = amount;
    let rewardName = name;
    if (!type || !address || !reward) {
      setLoading(false);
      return;
    }
    if (
      (type === "TOKEN" || type === "SOL") &&
      (!rewardAmount || rewardAmount <= 0 || !name || name.length <= 0)
    ) {
      setLoading(false);
      return;
    }
    if (type === "CNFT" || type === "PNFT") {
      if (!reward?.name) return;
      rewardName = reward.name;
      rewardAmount = 1;
    }
    const response = await listReward(
      wallet,
      address,
      type,
      rewardName,
      reward?.image ?? "",
      rewardAmount
    );

    console.log(response);
    getAssets();
    setAdding(false);
  };

  useEffect(() => {
    if (wallet.publicKey) {
      setLoading(true);
      getAssets();
    }
  }, [wallet.publicKey]);

  if (
    loading ||
    (Object.keys(assets.PNFT).length === 0 &&
      Object.keys(assets.CNFT).length === 0 &&
      assets.Tokens.length === 0)
  )
    return <div>Loading...</div>;

  return (
    <div className="flex gap-8">
      <div className="max-w-md p-4 bg-[#161616] min-h-[500px] rounded-xl">
        {/* Tab Header for NFTs, cNFTs, Tokens */}
        <div className="flex border-2 border-white/5 rounded-md p-2 mb-4">
          {["PNFT", "CNFT", "Tokens"].map((tab) => (
            <button
              key={tab}
              className={`px-4 py-2 rounded-md text-sm font-medium w-full ${
                activeTab === tab ? "bg-[#202329] text-white" : "text-gray-400"
              }`}
              onClick={() => handleTabChange(tab as "PNFT" | "CNFT" | "Tokens")}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Collection Tabs for the selected category */}
        <div className="flex flex-col gap-2 mb-4 max-h-[40vh] overflow-y-auto">
          {activeTab !== "Tokens"
            ? Object.keys(assets[activeTab]).map((collectionName) => (
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
            : assets.Tokens.map((token, index) => (
                <button
                  key={index}
                  className={`p-6 rounded-md text-sm font-medium ${
                    activeCollection === token.mintAddress
                      ? "bg-white/10 text-white"
                      : "bg-[#FFFFFF08] text-gray-400"
                  }`}
                  onClick={() => setActiveCollection(token.mintAddress)}
                >
                  {token?.name ?? obfuscatePubKey(token.mintAddress)}
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
            {assets[activeTab][activeCollection]?.filter((nft: NFT) =>
              nft.name.toLowerCase().includes(searchQuery.toLowerCase())
            ).length > 0 ? (
              assets[activeTab][activeCollection]
                .filter((nft: NFT) =>
                  nft.name.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((nft: NFT) => (
                  <div
                    key={nft.address}
                    className="mb-2 max-w-[120px] bg-[#141720] rounded-lg text-white h-max"
                  >
                    <Image
                      className="w-[120px] h-[120px] bg-[#F0DADA] rounded-[5px]"
                      src={nft.image}
                      alt={nft.name}
                      width={120}
                      height={120}
                      objectFit="cover"
                    />
                    <div className="flex flex-col gap-2 p-2">
                      <p className="text-xs text-[#94A3B8]">{nft.name}</p>
                      <button
                        onClick={() => {
                          list(nft.type, nft.address, nft);
                        }}
                        className="text-xs bg-[#726CFB] rounded-[5px] py-1"
                      >
                        {adding ? "Adding" : "List"}
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
                className="flex items-center justify-between text-xs font-medium mb-1 "
                htmlFor="name"
              >
                Reward Name
              </label>
              <div className="group flex h-11 w-full cursor-pointer items-center rounded-[8px] bg-[#202329] pl-4 pr-2.5">
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  type={"text"}
                  lang="en"
                  autoComplete="off"
                  placeholder={"Reward"}
                  className={`flex w-full min-w-0 bg-transparent text-sm text-[#94A3B8] placeholder-[#94A3B8]  placeholder-opacity-40 outline-none`}
                />
                {/* <span
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
                </span> */}
              </div>
            </div>
            <div className="mb-4">
              <label
                className="flex items-center justify-between text-xs font-medium mb-1 "
                htmlFor="amount"
              >
                <div>Amount</div>
                <div>
                  Available:{" "}
                  {assets.Tokens.find(
                    (token) => token.mintAddress === activeCollection
                  )?.balance ?? 0}
                </div>
              </label>
              <div className="group flex h-11 w-full cursor-pointer items-center rounded-[8px] bg-[#202329] pl-4 pr-2.5">
                <input
                  id="amount"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e?.target?.value ?? 0))}
                  type={"number"}
                  lang="en"
                  step={"any"}
                  autoComplete="off"
                  placeholder={"00.00"}
                  className={`flex w-full min-w-0 bg-transparent text-sm text-[#94A3B8] placeholder-[#94A3B8]  placeholder-opacity-40 outline-none`}
                />
                {/* <span
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
                </span> */}
              </div>
            </div>

            <button
              disabled={loading}
              onClick={() => {
                list(
                  assets.Tokens.find(
                    (token) => token.mintAddress === activeCollection
                  )?.mintAddress === "SOL"
                    ? "SOL"
                    : "TOKEN",
                  assets.Tokens.find(
                    (token) => token.mintAddress === activeCollection
                  )?.mintAddress!,
                  assets.Tokens.find(
                    (token) => token.mintAddress === activeCollection
                  )!
                );
              }}
              className="bg-[#726CFB] w-full py-4 rounded-lg"
            >
              {adding ? "Adding" : "List"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;
