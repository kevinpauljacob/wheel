"use client";
import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  Dispatch,
  SetStateAction,
} from "react";

interface AppContextType {
  yourPrize: boolean;
  recentPrizes: boolean;
  setYourPrize: Dispatch<SetStateAction<boolean>>;
  setRecentPrizes: Dispatch<SetStateAction<boolean>>;
}

export const AppContext = createContext<AppContextType>({
  yourPrize: false,
  recentPrizes: false,
  setYourPrize: () => {},
  setRecentPrizes: () => {},
});

interface ContextProviderProps {
  children: ReactNode;
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
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
        yourPrize,
        recentPrizes,
        setYourPrize,
        setRecentPrizes,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
