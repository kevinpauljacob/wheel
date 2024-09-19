import { PublicKey } from "@metaplex-foundation/js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, ParsedAccountData } from "@solana/web3.js";

export interface NFT {
  name: string;
  address: string;
  image: string;
}

export interface Collection {
  [collectionName: string]: NFT[];
}

export interface TokenAccount {
  mintAddress: string;
  name?: string;
  balance: number;
}

export interface Assets {
  NFTs: Collection;
  cNFTs: Collection;
  Tokens: TokenAccount[];
}

export const obfuscatePubKey = (address: string) => {
  return (
    address?.substring(0, 4) + "..." + address?.substring(address.length - 4)
  );
};


export async function getTokenAccounts(
  walletPublicKey: PublicKey,
  connection: Connection
) {
  const filters = [
    {
      dataSize: 165,
    },
    {
      memcmp: {
        offset: 32,
        bytes: walletPublicKey.toBase58(),
      },
    },
  ];

  const accounts = await connection.getParsedProgramAccounts(
    TOKEN_PROGRAM_ID,
    { filters: filters }
  );

  const results: TokenAccount[] = accounts.map((account) => {
    const info = account.account.data as ParsedAccountData;
    const mintAddress = info.parsed.info.mint;
    // console.log(info.parsed);
    const balance = info.parsed.info.tokenAmount.uiAmount || 0;

    // console.log(`Token Mint: ${mintAddress}, Balance: ${balance}`);
    return { mintAddress, balance };
  });

  return results;
}

