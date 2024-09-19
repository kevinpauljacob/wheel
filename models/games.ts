import mongoose from "mongoose";

const gameSchema = new mongoose.Schema(
  {
    wallet: {
      type: String,
      required: true,
    },
    reward: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Reward",
      required: true,
      unique: true,
    },
    paymentTxnSignature: {
      type: String,
      required: true,
      unique: true,
    },
    rewardTxnSignature: {
      type: String,
      required: true,
      unique: true,
    },
    status: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Game = mongoose.models.Game || mongoose.model("Game", gameSchema);
export default Game;
