import { PublicKey } from "@metaplex-foundation/js";
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";

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
