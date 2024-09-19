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
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  transfer,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferInstruction,
} from "@solana/spl-token";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Reward } from "@/app/types/reward";

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
    } else return { success: false, message: "In dev" };

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

    const { success, message } = await res.json();

    console.log(message)

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

  return { transaction, blockhashWithExpiryBlockHeight };
};

const sendNFTReward = async (
  reward: Reward,
  userPublicKey: PublicKey,
  devWallet: Keypair
) => {
  if (!reward.address) throw new Error("NFT address not provided");

  //   metaplex.use(
  //     walletAdapterIdentity({
  //       publicKey: devWallet.publicKey,
  //       signTransaction: devWallet.signTransaction,
  //       signAllTransactions: devWallet.signAllTransactions,
  //     })
  //   );

  //   const nft = await metaplex.nfts().findByMint({ mintAddress: reward.address });

  //   await metaplex.nfts().transfer({
  //     nftOrSft: nft,
  //     fromOwner: devWallet.publicKey,
  //     toOwner: userPublicKey,
  //   });
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
