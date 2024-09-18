import type { NextApiRequest, NextApiResponse } from "next";
import Reward from "@/models/reward";
import { ADMIN_WALLETS } from "@/utils/constants";
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
    const { wallet, rewardId, probability, disabled } = req.body;

    if (!ADMIN_WALLETS.includes(wallet)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!wallet || !rewardId || (!probability && !disabled))
      return res
        .status(400)
        .json({ success: false, message: "Missing Parameters" });

    if (probability < 0 || probability > 100) {
      return res.status(400).json({
        success: false,
        message: "Probability must be between 0 and 100",
      });
    }

    await connectDatabase();

    const updateFields: Partial<{ probability: number; disabled: boolean }> =
      {};
    if (probability) updateFields.probability = probability;
    if (disabled) updateFields.disabled = disabled;

    const updatedReward = await Reward.findByIdAndUpdate(
      rewardId,
      { $set: updateFields },
      { new: true }
    );

    if (!updatedReward) {
      return res
        .status(404)
        .json({ success: false, message: "Reward not found" });
    }

    res.status(200).json({
      success: true,
      message: "Reward updated successfully",
      reward: updatedReward,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
