import type { NextApiRequest, NextApiResponse } from "next";
import Game from "@/models/games";
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

    const games = await Game.find().sort({ createdAt: -1 }).limit(10).populate({
      path: "reward",
      select: "name image",
    });

    const formattedGames = games.map((game) => ({
      wallet: game.wallet,
      createdAt: game.createdAt,
      rewardName: game.reward?.name || "No reward",
      rewardImage: game.reward?.image || "No image",
    }));

    res.status(200).json({
      success: true,
      message: "Games fetched successfully",
      games: formattedGames,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}
