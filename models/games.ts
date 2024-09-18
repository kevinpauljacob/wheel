import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true,
    },
    reward: {
      type: String,
      ref: "Reward",
      required: true,
    },
    txnSignature: {
      type: String,
      required: true,
      unique: true,
    }
  },
  { timestamps: true }
);

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);
export default Game;
