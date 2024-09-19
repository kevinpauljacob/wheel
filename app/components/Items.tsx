import React, { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  Metaplex,
  walletAdapterIdentity,
  OperationOptions,
  FindNftsByOwnerInput,
  PublicKey,
} from "@metaplex-foundation/js";
import {
  Connection,
  clusterApiUrl,
  ParsedAccountData,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { connection, listReward } from "@/utils/transactions";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  DigitalAsset,
  mplTokenMetadata,
} from "@metaplex-foundation/mpl-token-metadata";
import {
  fetchAllDigitalAssetByOwner,
  fetchAllDigitalAssetWithTokenByOwner,
} from "@metaplex-foundation/mpl-token-metadata";
import { publicKey } from "@metaplex-foundation/umi";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import {
  Assets,
  NFT,
  TokenAccount,
  getTokenAccounts,
  obfuscatePubKey,
} from "@/utils/helpers";
import { list } from "postcss";
import Image from "next/image";

const Items: React.FC = () => {
  const wallet = useWallet();
  const [activeTab, setActiveTab] = useState<"NFTs" | "cNFTs" | "Tokens">(
    "NFTs"
  );
  const [activeCollection, setActiveCollection] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [amount, setAmount] = useState<number>(0);
  const [name, setName] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const [assets, setAssets] = useState<Assets>({
    NFTs: {},
    cNFTs: {},
    Tokens: [],
  });

  const handleTabChange = (tab: "NFTs" | "cNFTs" | "Tokens") => {
    setActiveTab(tab);
    if (tab === "Tokens") {
      setActiveCollection(assets.Tokens[0]?.mintAddress);
    } else {
      setActiveCollection(Object.keys(assets[tab])[0]);
    }
    setSearchQuery("");
  };

  const fetchTokens = async () => {
    if (!wallet.publicKey) return;

    let tokens: TokenAccount[] = [];

    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_QNODE_RPC!,
        "confirmed"
      );

      const walletBalance =
        (await connection.getBalance(wallet.publicKey)) / LAMPORTS_PER_SOL;

      const data = await getTokenAccounts(wallet.publicKey!, connection);
      tokens = [
        {
          mintAddress: "SOL",
          name: "SOL",
          balance: walletBalance,
        },
        ...data,
      ];
    } catch (e) {
      console.error(e);
      return [];
    }

    return tokens;
  };

  const getImageFromUri = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const json = await response.json();
      return json.image;
    } catch (error) {
      console.error("Error fetching image from URI:", error);
      return null;
    }
  };

  const getAssets = async () => {
    if (!wallet.publicKey) return;

    const owner = publicKey(wallet.publicKey.toString());

    const umi = createUmi(process.env.NEXT_PUBLIC_RPC!).use(mplTokenMetadata());
    const assets: DigitalAsset[] = await fetchAllDigitalAssetWithTokenByOwner(
      umi,
      owner
    );

    const tokens = await fetchTokens();
    const collections: { [key: string]: any[] } = {};
    const coins: TokenAccount[] = [];

    await Promise.all(
      assets.map(async (asset) => {
        const imageUrl = await getImageFromUri(asset.metadata.uri);

        if (asset.mint.decimals === 0) {
          const collectionName = asset.metadata.name ?? "Others";

          if (!collections[collectionName]) {
            collections[collectionName] = [];
          }

          collections[collectionName].push({
            name: asset.metadata.name ?? asset.publicKey,
            image: imageUrl,
            address: asset.publicKey,
          });

        } else if (
          tokens &&
          tokens.map((token) => token.mintAddress).includes(asset.publicKey)
        ) {
          coins.push({
            mintAddress: asset.publicKey,
            name: asset.metadata.name ?? asset.publicKey,
            balance:
              tokens.find((token) => token.mintAddress === asset.publicKey)
                ?.balance ?? 0,
          });
        }
      })
    );

    console.log("assets", assets);
    console.log("tokens", tokens);
    console.log("collections", collections);
    
    setAssets({
      NFTs: collections,
      cNFTs: {},
      Tokens: coins,
    });

    setActiveCollection(Object.keys(collections)[0] || "Others");
  };

  const list = async (type: string, address: string, nft?: NFT) => {
    setLoading(true);
    console.log(type, address, amount);
    let rewardAmount = amount;
    let rewardImage = "";
    let rewardName = name;
    if (!type || !address) return;
    if (
      (type === "TOKEN" || type === "SOL") &&
      (!rewardAmount || rewardAmount <= 0 || !name || name.length <= 0)
    )
      return;
    if (type === "NFT") {
      if (!nft) return;
      rewardImage = nft.image;
      rewardName = nft.name;
      rewardAmount = 1;
    }
    const response = await listReward(
      wallet,
      address,
      type,
      rewardName,
      rewardImage,
      rewardAmount
    );

    console.log(response);

    setLoading(false);
  };

  useEffect(() => {
    if (wallet.publicKey) {
      getAssets();
    }
  }, [wallet.publicKey]);

  if (
    Object.keys(assets.NFTs).length === 0 &&
    Object.keys(assets.NFTs).length === 0
  )
    return <div></div>;

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
                    className="mb-2 bg-[#141720] rounded-lg text-white h-max"
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
                  )?.mintAddress!
                );
              }}
              className="bg-[#726CFB] w-full py-4 rounded-lg"
            >
              {loading ? "Loading..." : "List"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Items;
