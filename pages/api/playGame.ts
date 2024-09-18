import type { NextApiRequest, NextApiResponse } from "next";
import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  sendAndConfirmRawTransaction,
} from "@solana/web3.js";
import mongoose from "mongoose";
import Reward from "@/models/reward";
import Game from "@/models/games";
import connectDatabase from "@/utils/database";
import {
  verifyTransaction,
  getRandomReward,
  createPaymentTransaction,
  retryTxn,
} from "@/utils/transactions";
import { Reward as RewardType } from "@/app/types/reward";
import bs58 from "bs58";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC!);

const devWallet = Keypair.fromSecretKey(
  bs58.decode(process.env.NEXT_PUBLIC_DEV_KEYPAIR!)
);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  await connectDatabase();

  try {
    const {
      transactionBase64,
      wallet,
      amount,
      blockhashWithExpiryBlockHeight,
    } = req.body;

    const walletId = new PublicKey(wallet);

    const transaction: Transaction = Transaction.from(
      Buffer.from(transactionBase64, "base64")
    );

    let { transaction: verificationTransaction } =
      await createPaymentTransaction(walletId, devWallet.publicKey, amount);

    if (!verifyTransaction(transaction, verificationTransaction))
      throw new Error("Transaction verification failed");

    console.log("Transaction verified");

    let txnSignature;
    try {
      txnSignature = await retryTxn(
        connection,
        transaction,
        blockhashWithExpiryBlockHeight
      );
    } catch (e) {
      console.log(e);
      throw new Error("Transaction failed");
    }

    const rewards = await Reward.find();
    const reward = getRandomReward(rewards as RewardType[]);

    const game = new Game({
      wallet,
      reward: reward,
      txnSignature,
    });
    await game.save();

    // await sendRewardToUser(reward, new PublicKey(wallet), devWallet);

    res.status(200).json({ success: true, message: "", reward });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
