import { PublicKey } from "@metaplex-foundation/js";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

export interface Game {
  wallet: string;
  createdAt: any;
  rewardName: string;
  rewardImage: string;
}

export interface NFT {
  name: string;
  address: string;
  image: string;
  type: "CNFT" | "PNFT";
}

export interface Collection {
  [collectionName: string]: NFT[];
}

export interface TokenAccount {
  mintAddress: string;
  name?: string;
  balance: number;
  image?: string;
}

export interface Assets {
  PNFT: Collection;
  CNFT: Collection;
  Tokens: TokenAccount[];
}

export const obfuscatePubKey = (address: string) => {
  return (
    address?.substring(0, 4) + "..." + address?.substring(address.length - 4)
  );
};

export async function getSolBalance(walletPublicKey: PublicKey) {
  let solBalance = 0;
  try {
    const connection = new Connection(
      process.env.NEXT_PUBLIC_QNODE_RPC!,
      "confirmed"
    );

    solBalance =
      (await connection.getBalance(walletPublicKey)) / LAMPORTS_PER_SOL;
  } catch (e) {
    console.error(e);
  }
  return solBalance;
}

export function timeAgo(timestamp: string): string {
  const givenTime = new Date(timestamp);
  const now = new Date();

  const diffInMs = now.getTime() - givenTime.getTime(); 

  const diffInSeconds = Math.floor(diffInMs / 1000);
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  const diffInMonths = Math.floor(diffInDays / 30); 
  const diffInYears = Math.floor(diffInMonths / 12); 

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes} minutes ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours} hours ago`;
  } else if (diffInDays < 30) {
    return `${diffInDays} days ago`;
  } else if (diffInMonths < 12) {
    return `${diffInMonths} months ago`;
  } else {
    return `${diffInYears} years ago`;
  }
}
