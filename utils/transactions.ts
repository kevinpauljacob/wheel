import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  ComputeBudgetProgram,
  VersionedTransaction,
  BlockhashWithExpiryBlockHeight,
  AccountMeta,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import { Metaplex } from "@metaplex-foundation/js";
import { Reward } from "@/app/types/reward";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createTransferInstruction as gumCreateTransferInstruction,
  PROGRAM_ID as BUBBLEGUM_PROGRAM_ID,
} from "@metaplex-foundation/mpl-bubblegum";
import {
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { walletAdapterIdentity } from "@metaplex-foundation/umi-signer-wallet-adapters";
import {
  ConcurrentMerkleTreeAccount,
  SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
  SPL_NOOP_PROGRAM_ID,
} from "@solana/spl-account-compression";
import bs58 from "bs58";

export const connection = new Connection(
  process.env.NEXT_PUBLIC_QNODE_RPC!,
  "confirmed"
);

const devWalletPublicKey = new PublicKey(
  process.env.NEXT_PUBLIC_DEV_PUBLIC_KEY!
);

export const getRandomReward = (rewards: Reward[]): Reward => {
  const randomNumber = Math.random() * 100;
  let cumulativeProbability = 0;
  const candidateRewards: Reward[] = [];

  for (const reward of rewards) {
    cumulativeProbability += reward.probability;
    if (randomNumber <= cumulativeProbability) {
      candidateRewards.push(reward);
      if (randomNumber < cumulativeProbability) break;
    }
  }

  if (candidateRewards.length === 0) {
    throw new Error("No reward selected. Check if probabilities sum to 100.");
  }

  return candidateRewards[Math.floor(Math.random() * candidateRewards.length)];
};

export const listReward = async (
  wallet: WalletContextState,
  address: string,
  type: string,
  name: string,
  image: string,
  amount: number
) => {
  try {
    if (!wallet.publicKey) throw new Error("Wallet not connected");

    const walletId = wallet.publicKey;
    console.log("in listing", type, name, image);
    let transaction, blockhashWithExpiryBlockHeight;
    if (type === "SOL" || type === "TOKEN") {
      const transferInstruction = await createTokenTransferTransaction(
        walletId,
        devWalletPublicKey,
        amount,
        address
      );
      transaction = transferInstruction.transaction;
      blockhashWithExpiryBlockHeight =
        transferInstruction.blockhashWithExpiryBlockHeight;
    } else if (type === "CNFT") {
      const transferInstruction = await createCNFTTransferInstruction(
        address,
        walletId,
        devWalletPublicKey
      );
      transaction = transferInstruction.transaction;
      blockhashWithExpiryBlockHeight =
        transferInstruction.blockhashWithExpiryBlockHeight;
    } else if (type === "PNFT") {
      const transferInstruction = await createPNFTTransferInstruction(
        new PublicKey(address),
        walletId,
        devWalletPublicKey
      );
      transaction = transferInstruction.transaction;
      blockhashWithExpiryBlockHeight =
        transferInstruction.blockhashWithExpiryBlockHeight;
    } else return { success: false, message: "In dev" };
    console.log(transaction);
    const signedTxn = await wallet.signTransaction!(transaction);
    const transactionBase64 = signedTxn
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    const res = await fetch(`/api/rewards/add`, {
      method: "POST",
      body: JSON.stringify({
        wallet: walletId.toBase58(),
        address,
        type,
        name,
        image,
        amount,
        transactionBase64,
        blockhashWithExpiryBlockHeight,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { success, message, reward } = await res.json();

    if (!success) throw new Error(message);

    return { success: true, message };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error?.message ?? "Listing failed" };
  }
};

export const playWheelGame = async (
  wallet: WalletContextState,
  amount: number
) => {
  try {
    if (!wallet.publicKey) throw new Error("Wallet not connected");

    const walletId = wallet.publicKey;

    let { transaction, blockhashWithExpiryBlockHeight } =
      await createTokenTransferTransaction(
        walletId,
        devWalletPublicKey,
        amount,
        "SOL"
      );

    const signedTxn = await wallet.signTransaction!(transaction);
    const transactionBase64 = signedTxn
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    const res = await fetch(`/api/playGame`, {
      method: "POST",
      body: JSON.stringify({
        transactionBase64,
        wallet: walletId.toBase58(),
        amount,
        blockhashWithExpiryBlockHeight,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    const { success, message, reward } = await res.json();

    if (!success) throw new Error(message);

    return { success: true, reward };
  } catch (error: any) {
    console.log(error);
    return { success: false, message: error?.message };
  }
};

export const createTokenTransferTransaction = async (
  fromWallet: PublicKey,
  toWallet: PublicKey,
  amount: number,
  tokenMint: string,
  signer?: Keypair
) => {
  console.log(
    "creating transaction: ",
    fromWallet.toString(),
    toWallet.toString(),
    amount,
    tokenMint,
    signer
  );
  let transaction = new Transaction();

  transaction.feePayer = fromWallet;
  const blockhashWithExpiryBlockHeight = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhashWithExpiryBlockHeight.blockhash;

  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 150_000 })
  );

  if (tokenMint === "SOL") {
    transaction.add(
      SystemProgram.transfer({
        fromPubkey: fromWallet,
        toPubkey: toWallet,
        lamports: Math.floor(amount * Math.pow(10, 9)),
      })
    );
  } else {
    const decimal = 6; // assuming usdc usdt
    const tokenId = new PublicKey(tokenMint);
    let fromAta;
    let toAta;
    if (signer) {
      fromAta = (
        await getOrCreateAssociatedTokenAccount(
          connection,
          signer,
          tokenId,
          fromWallet,
          false,
          "processed",
          { commitment: "confirmed" }
        )
      ).address;
      toAta = (
        await getOrCreateAssociatedTokenAccount(
          connection,
          signer,
          tokenId,
          toWallet,
          false,
          "processed",
          { commitment: "confirmed" }
        )
      ).address;
    } else {
      fromAta = await getAssociatedTokenAddress(tokenId, fromWallet);
      toAta = await getAssociatedTokenAddress(tokenId, toWallet);
    }

    transaction.add(
      createAssociatedTokenAccountIdempotentInstruction(
        fromWallet,
        toAta,
        toWallet,
        tokenId
      ),
      createTransferInstruction(
        fromAta,
        toAta,
        fromWallet,
        Math.floor(amount * Math.pow(10, decimal))
      )
    );
  }

  transaction.instructions.slice(2).forEach((i) => {
    i.keys.forEach((k) => {
      if (k.pubkey.equals(fromWallet)) {
        k.isSigner = true;
        k.isWritable = true;
      }
    });
  });

  return { transaction, blockhashWithExpiryBlockHeight };
};

export const verifyTransaction = (
  transaction: Transaction,
  vTransaction: Transaction
) => {
  const transactionInstructions = JSON.stringify(
    transaction.instructions.filter(
      (i) => !i.programId.equals(ComputeBudgetProgram.programId)
    )
  );

  const vTransactionInstructions = JSON.stringify(
    vTransaction.instructions.filter(
      (i) => !i.programId.equals(ComputeBudgetProgram.programId)
    )
  );

  console.log(transactionInstructions);
  console.log(vTransactionInstructions);

  return transactionInstructions === vTransactionInstructions;
};

export async function retryTxn(
  connection: Connection,
  transaction: Transaction | VersionedTransaction,
  blockhashContext: BlockhashWithExpiryBlockHeight
) {
  const { blockhash, lastValidBlockHeight } = blockhashContext;
  let blockheight = await connection.getBlockHeight();

  let flag = true;

  let finalTxn = "";

  let txn = "";

  let j = 0;

  while (blockheight < lastValidBlockHeight && flag) {
    txn = await connection.sendRawTransaction(transaction.serialize(), {
      skipPreflight: true,
      maxRetries: 0,
    });
    await new Promise((r) => setTimeout(r, 2000));
    console.log("retry count: ", ++j);
    connection
      .confirmTransaction({
        lastValidBlockHeight,
        blockhash,
        signature: txn,
      })
      .then((data) => {
        if ((data.value as any).confirmationStatus) {
          console.log("confirmed txn", data.value, txn);
          finalTxn = txn;
          flag = false;
        }
      })
      .catch((e) => {
        finalTxn = "";
        flag = false;
        console.log(e);
      });

    blockheight = await connection.getBlockHeight();
  }

  if (finalTxn) return finalTxn;
  else throw new Error("Transaction could not be confirmed !");
}

const getAssetData = async (assetId: any) => {
  console.log("in get asset data");
  const assetDataResponse = await (
    await fetch(process.env.NEXT_PUBLIC_RPC!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAsset",
        params: {
          id: assetId,
        },
      }),
    })
  ).json();
  return assetDataResponse.result;
};

const getAssetProof = async (assetId: any) => {
  console.log("in get asset proof");
  const assetProofResponse = await (
    await fetch(process.env.NEXT_PUBLIC_RPC!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: "my-id",
        method: "getAssetProof",
        params: {
          id: assetId,
        },
      }),
    })
  ).json();
  return assetProofResponse.result;
};

export const createCNFTTransferInstruction = async (
  assetId: any,
  fromWallet: PublicKey,
  toWallet: PublicKey
) => {
  console.log("in create transacinstruction");
  let transaction = new Transaction();

  transaction.feePayer = fromWallet;
  const blockhashWithExpiryBlockHeight = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhashWithExpiryBlockHeight.blockhash;

  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 150_000 })
  );

  const assetData = await getAssetData(assetId);
  console.log(assetData);
  const assetProof = await getAssetProof(assetId);
  console.log(assetProof);
  const treePublicKey = new PublicKey(assetData.compression.tree);

  const treeAccount = await ConcurrentMerkleTreeAccount.fromAccountAddress(
    connection,
    treePublicKey
  );

  const canopyDepth = treeAccount.getCanopyDepth() || 0;
  if (!assetProof.proof || assetProof.proof.length === 0) {
    throw new Error("Proof is empty");
  }
  const proofPath: AccountMeta[] = assetProof.proof
    .map((node: string) => ({
      pubkey: new PublicKey(node),
      isSigner: false,
      isWritable: false,
    }))
    .slice(0, assetProof.proof.length - canopyDepth);

  const treeAuthority = treeAccount.getAuthority();
  const leafOwner = new PublicKey(assetData.ownership.owner);
  const leafDelegate = assetData.ownership.delegate
    ? new PublicKey(assetData.ownership.delegate)
    : leafOwner;

  const transferIx = gumCreateTransferInstruction(
    {
      merkleTree: treePublicKey,
      treeAuthority,
      leafOwner,
      leafDelegate,
      newLeafOwner: toWallet,
      logWrapper: SPL_NOOP_PROGRAM_ID,
      compressionProgram: SPL_ACCOUNT_COMPRESSION_PROGRAM_ID,
      anchorRemainingAccounts: proofPath,
    },
    {
      root: decode(assetProof.root),
      dataHash: decode(assetData.compression.data_hash),
      creatorHash: decode(assetData.compression.creator_hash),
      nonce: assetData.compression.leaf_id,
      index: assetData.compression.leaf_id,
    }
  );

  transaction.add(transferIx);

  transaction.instructions.forEach((i, index1) => {
    i.keys.forEach((k) => {
      console.log(index1, k.pubkey.equals(fromWallet), k.pubkey.toString());
    });
  });

  transaction.instructions.forEach((i) => {
    i.keys.forEach((k) => {
      if (k.pubkey.equals(fromWallet)) {
        k.isSigner = true;
        k.isWritable = true;
      }
    });
  });

  return { transaction, blockhashWithExpiryBlockHeight };
};

function decode(stuff: string) {
  return bufferToArray(bs58.decode(stuff));
}
function bufferToArray(buffer: Uint8Array): number[] {
  const nums: number[] = [];
  for (let i = 0; i < buffer.length; i++) {
    nums.push(buffer[i]);
  }
  return nums;
}

export const createPNFTTransferInstruction = async (
  address: PublicKey,
  fromWallet: PublicKey,
  toWallet: PublicKey
) => {
  console.log("in create transacinstruction");
  let transaction = new Transaction();

  transaction.feePayer = fromWallet;
  const blockhashWithExpiryBlockHeight = await connection.getLatestBlockhash();
  transaction.recentBlockhash = blockhashWithExpiryBlockHeight.blockhash;

  transaction.add(
    ComputeBudgetProgram.setComputeUnitLimit({ units: 100_000 }),
    ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 150_000 })
  );

  const metaplex = Metaplex.make(connection);

  const pNFT = await metaplex.nfts().findByMint({ mintAddress: address });
  const transferIx = metaplex.nfts().builders().transfer({
    nftOrSft: pNFT,
    toOwner: toWallet,
  });

  transaction.add(...transferIx.getInstructions());

  transaction.instructions.forEach((i, index1) => {
    i.keys.forEach((k) => {
      console.log(index1, k.pubkey.equals(fromWallet), k.pubkey.toString());
    });
  });

  transaction.instructions.forEach((i) => {
    i.keys.forEach((k) => {
      if (k.pubkey.equals(fromWallet)) {
        k.isSigner = true;
        k.isWritable = true;
      }
    });
  });

  return { transaction, blockhashWithExpiryBlockHeight };
};
