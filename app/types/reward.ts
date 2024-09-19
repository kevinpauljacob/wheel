export interface Reward {
  _id: string;
  address: string;
  type: RewardType;
  name: string;
  image?: string;
  probability: number;
  amount: number;
}

export type RewardType = "CNFT" | "PNFT" | "TOKEN" | "SOL"
