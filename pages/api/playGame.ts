import type { NextApiRequest, NextApiResponse } from "next";
import { Connection, PublicKey, Transaction, Keypair } from "@solana/web3.js";
import mongoose from "mongoose";
import Reward from "@/models/reward";
import Game from "@/models/games";
import connectDatabase from "@/utils/database";
import {
  verifyTransaction,
  getRandomReward,
  createTokenTransferTransaction,
  retryTxn,
  createCNFTTransferInstruction,
  createPNFTTransferInstruction,
} from "@/utils/transactions";
import { Reward as RewardType } from "@/app/types/reward";
import bs58 from "bs58";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC!);

const devWallet = Keypair.fromSecretKey(bs58.decode(process.env.DEV_KEYPAIR!));

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
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

    const { transaction: verificationTransaction } =
      await createTokenTransferTransaction(
        walletId,
        devWallet.publicKey,
        amount,
        "SOL"
      );

    if (!verifyTransaction(transaction, verificationTransaction))
      return res.status(400).json({
        success: false,
        message: "Payment transaction verification failed",
      });

    console.log("Transaction verified");

    let paymentTxnSignature;
    try {
      paymentTxnSignature = await retryTxn(
        connection,
        transaction,
        blockhashWithExpiryBlockHeight
      );
    } catch (e) {
      console.log(e);
      return res.status(400).json({
        success: false,
        message: "Payment transaction failed",
      });
    }

    const rewards = await Reward.find({
      expired: false,
      disabled: false,
      deleteTxnSignature: { $exists: false },
    });

    if (!rewards || rewards.length === 0)
      return res.status(400).json({
        success: false,
        message: "No available rewards",
      });

    const reward = getRandomReward(rewards as RewardType[]);

    const game = new Game({
      wallet,
      reward: reward._id,
      paymentTxnSignature,
      status: "PENDING",
    });
    await game.save();

    // remove reward
    const updateReward = await Reward.findOneAndUpdate(
      {
        _id: reward._id,
        expired: false,
        disabled: false,
        game: { $exists: false },
      },
      { expired: true, disabled: true, game: game._id },
      { new: true }
    );

    if (!updateReward) {
      return res.status(400).json({
        success: false,
        message: "Reward Unavailable",
      });
    }

    console.log("generated reward", reward);

    let rewardTransaction, rewardBlockhashWithExpiryBlockHeight;
    if (reward.type === "SOL" || reward.type === "TOKEN") {
      const transferInstruction = await createTokenTransferTransaction(
        devWallet.publicKey,
        walletId,
        reward.amount,
        reward.address,
        devWallet
      );
      rewardTransaction = transferInstruction.transaction;
      rewardBlockhashWithExpiryBlockHeight =
        transferInstruction.blockhashWithExpiryBlockHeight;
    } else if (reward.type === "CNFT") {
      const transferInstruction = await createCNFTTransferInstruction(
        reward.address,
        devWallet.publicKey,
        walletId
      );
      rewardTransaction = transferInstruction.transaction;
      rewardBlockhashWithExpiryBlockHeight =
        transferInstruction.blockhashWithExpiryBlockHeight;
    } else if (reward.type === "PNFT") {
      const transferInstruction = await createPNFTTransferInstruction(
        new PublicKey(reward.address),
        devWallet.publicKey,
        walletId
      );
      rewardTransaction = transferInstruction.transaction;
      rewardBlockhashWithExpiryBlockHeight =
        transferInstruction.blockhashWithExpiryBlockHeight;
    } else throw new Error(`Reward type for ${reward._id} not supported.`);
    const signer = Keypair.fromSecretKey(devWallet.secretKey);
    rewardTransaction.partialSign(signer);

    let rewardTxnSignature;
    try {
      rewardTxnSignature = await retryTxn(
        connection,
        transaction,
        blockhashWithExpiryBlockHeight
      );

      game.status = "COMPLETED";
      game.rewardTxnSignature = rewardTxnSignature;
      await game.save();
    } catch (e) {
      console.log(e);
      game.status = "FAILED";
      await game.save();
      return res.status(400).json({
        success: false,
        message: "Reward transaction failed",
      });
    }

    return res.status(200).json({ success: true, message: "", reward });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
}
