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
    },
  },
  { timestamps: true }
);
const Reward = mongoose.models.Reward || mongoose.model("Reward", rewardSchema);
export default Reward;
