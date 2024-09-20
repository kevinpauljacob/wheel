import type { NextApiRequest, NextApiResponse } from "next";
import { PublicKey, Transaction, Connection, Keypair } from "@solana/web3.js";
import Reward from "@/models/reward";
import { ADMIN_WALLETS } from "@/utils/constants";
import connectDatabase from "@/utils/database";
import {
  createCNFTTransferInstruction,
  createPNFTTransferInstruction,
  createTokenTransferTransaction,
  retryTxn,
  verifyTransaction,
} from "@/utils/transactions";
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

  try {
    const {
      wallet,
      address,
      type,
      name,
      image,
      amount,
      transactionBase64,
      blockhashWithExpiryBlockHeight,
    } = req.body;

    if (!wallet || !ADMIN_WALLETS.includes(wallet)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    console.log(
      wallet,
      address,
      type,
      name,
      image,
      amount,
      transactionBase64,
      blockhashWithExpiryBlockHeight
    );

    if (
      !address ||
      !type ||
      !["CNFT", "PNFT", "TOKEN", "SOL"].includes(type) ||
      !name
    )
      return res.status(400).json({
        success: false,
        message: "Missing Parameters",
      });

    if (type !== "SOL") {
      try {
        new PublicKey(address);
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: "Invalid mint address",
        });
      }
    }

    if (
      (type === "SOL" || type === "TOKEN") &&
      (amount === undefined || amount <= 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "Amount required for SOL and TOKEN rewards",
      });
    }

    const walletId = new PublicKey(wallet);

    const transaction: Transaction = Transaction.from(
      Buffer.from(transactionBase64, "base64")
    );

    let verificationTransaction;
    if (type === "SOL" || type === "TOKEN") {
      const transferInstruction = await createTokenTransferTransaction(
        walletId,
        devWallet.publicKey,
        amount,
        address
      );
      verificationTransaction = transferInstruction.transaction;
    } else if (type === "CNFT") {
      const transferInstruction = await createCNFTTransferInstruction(
        address,
        walletId,
        devWallet.publicKey
      );
      verificationTransaction = transferInstruction.transaction;
    }else if (type === "PNFT") {
      const transferInstruction = await createPNFTTransferInstruction(
        new PublicKey(address),
        walletId,
        devWallet.publicKey
      );
      verificationTransaction = transferInstruction.transaction;
    }  else
      return res.status(400).json({
        success: false,
        message: "In dev",
      });

    if (!verifyTransaction(transaction, verificationTransaction))
      return res.status(400).json({
        success: false,
        message: "Listing transaction verification failed",
      });

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
      return res.status(400).json({
        success: false,
        message: "Listing transfer failed",
      });
    }

    await connectDatabase();

    const reward = new Reward({
      address,
      type,
      name,
      image,
      probability: 0,
      amount,
      disabled: true,
      expired: false,
      txnSignature,
    });
    await reward.save();

    return res.status(201).json({
      success: true,
      message: "Reward added successfully",
      reward,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
