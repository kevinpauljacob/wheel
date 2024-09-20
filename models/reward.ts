import mongoose from "mongoose";

const rewardSchema = new mongoose.Schema(
  {
    address: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["CNFT", "PNFT", "TOKEN", "SOL"],
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    probability: {
      type: Number,
      default: 0,
      required: true,
    },
    amount: {
      type: Number,
    },
    disabled: {
      type: Boolean,
      default: false,
      required: true,
    },
    expired: {
      type: Boolean,
      default: false,
      required: true,
    },
    game: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Game",
      sparse: true,
      unique: true,
    },
    txnSignature: {
      type: String,
      required: true,
      unique: true,
    },
    deleteTxnSignature: {
      type: String,
      sparse: true,
      unique: true,
    },
  },
  { timestamps: true }
);
const Reward = mongoose.models.Reward || mongoose.model("Reward", rewardSchema);
export default Reward;
