import type { NextApiRequest, NextApiResponse } from "next";
import Reward from "@/models/reward";
import connectDatabase from "@/utils/database";

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
    const ADMIN_WALLETS =
      process.env.NEXT_PUBLIC_ADMIN_WALLETS?.split(",") || [];
    const { wallet } = req.body;
    let filter = {};
    if (!wallet || !ADMIN_WALLETS.includes(wallet))
      filter = { expired: false, disabled: false, game: { $exists: false } };
    await connectDatabase();
    const rewards = await Reward.find(filter);
    res.status(200).json({
      success: true,
      message: "Rewards fetched successfully",
      rewards,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
