import type { NextApiRequest, NextApiResponse } from "next";
import Reward from "@/models/reward";
import connectDatabase from "@/utils/database";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res
      .status(405)
      .json({ success: false, message: "Method not allowed" });
  }

  try {
    await connectDatabase();
    const rewards = await Reward.find();
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
