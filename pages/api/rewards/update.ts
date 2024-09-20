import type { NextApiRequest, NextApiResponse } from "next";
import Reward from "@/models/reward";
import { ADMIN_WALLETS } from "@/utils/constants";
import connectDatabase from "@/utils/database";
import mongoose from "mongoose";
import { PublicKey, Connection, Keypair } from "@solana/web3.js";
import bs58 from "bs58";
import {
  createCNFTTransferInstruction,
  createTokenTransferTransaction,
  retryTxn,
} from "@/utils/transactions";

const connection = new Connection(process.env.NEXT_PUBLIC_RPC!);

const devWallet = Keypair.fromSecretKey(bs58.decode(process.env.DEV_KEYPAIR!));

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
    const { wallet, updateRewards, deleteRewards } = req.body;

    if (!ADMIN_WALLETS.includes(wallet)) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    if (!wallet || (!updateRewards && !deleteRewards)) {
      return res
        .status(400)
        .json({ success: false, message: "Missing Parameters" });
    }

    const walletId = new PublicKey(wallet);

    await connectDatabase();

    const session = await mongoose.startSession();
    session.startTransaction();

    console.log("to delete", deleteRewards);

    try {
      const currentRewards = await Reward.find({
        expired: false,
        game: { $exists: false },
        deleteTxnSignature: { $exists: false },
      }).session(session);

      const updatedRewards = currentRewards.map((reward) => {
        const update = updateRewards.find(
          (u: any) => u._id === reward._id.toString()
        );
        console.log(update);
        return {
          ...reward.toObject(),
          probability: update?.probability ?? reward.probability,
          disabled: update?.disabled ?? reward.disabled,
        };
      });

      // Remove deleted rewards
      const finalRewards = updatedRewards.filter(
        (r) => !deleteRewards.includes(r._id.toString())
      );

      console.log("final", finalRewards);

      // Calculate sum of probabilities for active rewards
      const sumProbabilities = finalRewards.reduce(
        (sum, reward) =>
          sum + (!reward.disabled && !reward.expired ? reward.probability : 0),
        0
      );
      console.log(sumProbabilities);
      if (
        finalRewards.filter((reward) => !reward.disabled && !reward.expired).length >
          0 &&
        Math.abs(sumProbabilities - 100) > 0.001
      ) {
        throw new Error("Sum of probabilities for active rewards must be 100");
      }

      // Perform updates
      for (const reward of updateRewards) {
        const { _id: rewardId, probability, disabled, ...rest } = reward;
        const updateFields = { probability, disabled };
        const updatedReward = await Reward.findByIdAndUpdate(
          rewardId,
          { $set: updateFields },
          { session, new: true }
        );

        if (!updatedReward) {
          throw new Error(
            `Reward ${rewardId} not found or marked for deletion.`
          );
        }
      }

      // Perform deletions
      for (const rewardId of deleteRewards) {
        const rewardToDelete = await Reward.findById(rewardId).session(session);
        if (rewardToDelete) {
          console.log(rewardToDelete.type);
          let transaction, blockhashWithExpiryBlockHeight;
          if (
            rewardToDelete.type === "SOL" ||
            rewardToDelete.type === "TOKEN"
          ) {
            const transferInstruction = await createTokenTransferTransaction(
              devWallet.publicKey,
              walletId,
              rewardToDelete.amount,
              rewardToDelete.address,
              devWallet
            );
            transaction = transferInstruction.transaction;
            blockhashWithExpiryBlockHeight =
              transferInstruction.blockhashWithExpiryBlockHeight;
          } else if (rewardToDelete.type === "CNFT") {
            const transferInstruction = await createCNFTTransferInstruction(
              rewardToDelete.address,
              devWallet.publicKey,
              walletId
            );
            transaction = transferInstruction.transaction;
            blockhashWithExpiryBlockHeight =
              transferInstruction.blockhashWithExpiryBlockHeight;
          } else throw new Error(`Reward type for ${rewardId} not supported.`);

          const signer = Keypair.fromSecretKey(devWallet.secretKey);
          transaction.partialSign(signer);

          let txnSignature;
          try {
            txnSignature = await retryTxn(
              connection,
              transaction,
              blockhashWithExpiryBlockHeight
            );
            await Reward.findByIdAndUpdate(
              rewardId,
              {
                $set: {
                  disabled: true,
                  expired: true,
                  deleteTxnSignature: txnSignature,
                },
              },
              { session, new: true }
            );
          } catch (e) {
            console.error(e);
          }
        } else {
          console.log(`Reward with ID ${rewardId} not found for deletion`);
        }
      }

      await session.commitTransaction();
      res.status(200).json({
        success: true,
        message: "Rewards updated and deleted successfully",
      });
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error?.message ?? "Internal server error",
    });
  }
}
