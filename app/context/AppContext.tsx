"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";
import { Reward } from "../types/reward";
interface AppContextType {
  currentReward: Reward | null;
  yourPrize: boolean;
  recentPrizes: boolean;
  setCurrentReward: Dispatch<SetStateAction<Reward | null>>;
  setYourPrize: Dispatch<SetStateAction<boolean>>;
  setRecentPrizes: Dispatch<SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType>({
  currentReward: null,
  yourPrize: false,
  recentPrizes: false,
  setCurrentReward: () => {},
  setYourPrize: () => {},
  setRecentPrizes: () => {},
});

interface ContextProviderProps {
  children: ReactNode;
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [currentReward, setCurrentReward] = useState<Reward | null>(null);
  const [yourPrize, setYourPrize] = useState(false);
  const [recentPrizes, setRecentPrizes] = useState(false);

  useEffect(() => {
    if (yourPrize || recentPrizes) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [yourPrize, recentPrizes]);

  return (
    <AppContext.Provider
      value={{
        currentReward,
        yourPrize,
        recentPrizes,
        setCurrentReward,
        setYourPrize,
        setRecentPrizes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
