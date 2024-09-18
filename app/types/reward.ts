export interface Reward {
  address: string;
  type: RewardType;
  name: string;
  image?: string;
  probability: number;
  amount: number;
}

export type RewardType = "CNFT" | "PNFT" | "TOKEN" | "SOL"
