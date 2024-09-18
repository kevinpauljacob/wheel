import { WalletContextState } from "@solana/wallet-adapter-react";
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  sendAndConfirmRawTransaction,
  ComputeBudgetProgram,
  VersionedTransaction,
  BlockhashWithExpiryBlockHeight,
} from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  getOrCreateAssociatedTokenAccount,
  transfer,
} from "@solana/spl-token";
import { Metaplex, walletAdapterIdentity } from "@metaplex-foundation/js";
import { Reward } from "@/app/types/reward";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC!);
const metaplex = new Metaplex(connection);

const devWalletPublicKey = new PublicKey(process.env.NEXT_PUBLIC_DEV_PUBKEY!);

export const getRandomReward = (rewards: Reward[]): Reward => {
  let randomNumber = Math.random() * 100;
  let currentProbability = 0;

  for (const option of rewards) {
    currentProbability += option.probability;
    if (randomNumber < currentProbability) {
      return option;
    }
  }

  // fallback
  return rewards[rewards.length - 1];
};

export const playWheelGame = async (
  wallet: WalletContextState,
  amount: number
) => {
  try {
    if (!wallet.publicKey) throw new Error("Wallet not connected");

    const walletId = wallet.publicKey;

    let { transaction, blockhashWithExpiryBlockHeight } =
      await createPaymentTransaction(walletId, devWalletPublicKey, amount);

    const signedTxn = await wallet.signTransaction!(transaction);
    const transactionBase64 = signedTxn
      .serialize({ requireAllSignatures: false })
      .toString("base64");

    // Send transaction to backend for processing
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
    return { success: false, error: error.message };
  }
};

export const createPaymentTransaction = async (
  fromPubkey: PublicKey,
  toPubkey: PublicKey,
  amount: number
) => {
  let transaction = new Transaction();
  const blockhashWithExpiryBlockHeight = await connection.getLatestBlockhash();
  transaction.feePayer = fromPubkey;
  transaction.recentBlockhash = blockhashWithExpiryBlockHeight.blockhash;

  transaction.add(
    SystemProgram.transfer({
      lamports: Math.floor(amount * 1e9),
      fromPubkey,
      toPubkey,
    })
  );

  return { transaction, blockhashWithExpiryBlockHeight };
};

export const sendRewardToUser = async (
  reward: Reward,
  userPublicKey: PublicKey,
  devWallet: Keypair
) => {
  switch (reward.type) {
    case "SOL":
      return sendSolReward(reward, userPublicKey, devWallet);
    case "TOKEN":
      return sendTokenReward(reward, userPublicKey, devWallet);
    case "CNFT":
    case "PNFT":
      return sendNFTReward(reward, userPublicKey, devWallet);
    default:
      throw new Error("Unknown reward type");
  }
};

const sendSolReward = async (
  reward: Reward,
  userPublicKey: PublicKey,
  devWallet: Keypair
) => {
  const rewardTxn = new Transaction();
  rewardTxn.feePayer = devWallet.publicKey;
  rewardTxn.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;

  rewardTxn.add(
    SystemProgram.transfer({
      lamports: Math.floor(reward.amount * 1e9),
      fromPubkey: devWallet.publicKey,
      toPubkey: userPublicKey,
    })
  );

  rewardTxn.sign(devWallet);
  await sendAndConfirmRawTransaction(connection, rewardTxn.serialize(), {
    commitment: "confirmed",
  });
};

const sendTokenReward = async (
  reward: Reward,
  userPublicKey: PublicKey,
  devWallet: Keypair
) => {
  if (!reward.address) throw new Error("Token address not provided");

  const rewardPublicKey = new PublicKey(reward.address);

  const sourceAcc = (
    await getOrCreateAssociatedTokenAccount(
      connection,
      devWallet,
      rewardPublicKey,
      devWallet.publicKey,
      false,
      "processed",
      { commitment: "confirmed" }
    )
  ).address;

  const destAcc = (
    await getOrCreateAssociatedTokenAccount(
      connection,
      devWallet,
      rewardPublicKey,
      userPublicKey,
      false,
      "processed",
      { commitment: "confirmed" }
    )
  ).address;

  await transfer(
    connection,
    devWallet,
    sourceAcc,
    destAcc,
    devWallet.publicKey,
    reward.amount * 1e9 // Assuming 9 decimals, adjust if different
  );
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

  return transactionInstructions !== vTransactionInstructions;
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
