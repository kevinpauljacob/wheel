import type { NextApiRequest, NextApiResponse } from "next";
import mongoose from "mongoose";
import { PublicKey } from "@solana/web3.js";
import Reward from "@/models/reward";
import { ADMIN_WALLETS } from "@/utils/constants";
import connectDatabase from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  try {
    const { wallet, address, type, name, image, probability, amount } =
      req.body;

    if (!wallet || !ADMIN_WALLETS.includes(wallet)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (
      !address ||
      !type ||
      !["CNFT", "PNFT", "TOKEN", "SOL"].includes(type) ||
      !probability ||
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

    if (probability < 0 || probability > 100) {
      return res.status(400).json({
        success: false,
        message: "Probability must be between 0 and 100",
      });
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

    await connectDatabase();

    const reward = new Reward({
      address,
      type,
      name,
      image,
      probability,
      amount,
    });
    await reward.save();

    return res.status(201).json({
      success: true,
      message: "Reward added successfully",
      reward,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
