import type { NextApiRequest, NextApiResponse } from "next";
import Reward from "@/models/reward";
import { ADMIN_WALLETS } from "@/utils/constants";
import connectDatabase from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "DELETE") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { wallet, rewardId } = req.body;

    if (!ADMIN_WALLETS.includes(wallet)) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    if (!wallet || !rewardId)
      return res.status(400).json({ error: "Missing Parameters" });

    await connectDatabase();

    const deletedReward = await Reward.findByIdAndDelete(rewardId);

    if (!deletedReward) {
      return res.status(404).json({ error: "Reward not found" });
    }

    res
      .status(200)
      .json({ success: true, message: "Reward deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
}
