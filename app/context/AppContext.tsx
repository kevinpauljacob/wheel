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
  isModalOpen: boolean;
  yourPrize: boolean;
  recentPrizes: boolean;
  setYourPrize: Dispatch<SetStateAction<boolean>>;
  setRecentPrizes: Dispatch<SetStateAction<boolean>>;
  openModal: () => void;
  closeModal: () => void;
}

export const AppContext = createContext<AppContextType>({
  isModalOpen: false,
  yourPrize: false,
  recentPrizes: false,
  setYourPrize: () => {},
  setRecentPrizes: () => {},
  openModal: () => {},
  closeModal: () => {},
});

interface ContextProviderProps {
  children: ReactNode;
}

export const ContextProvider = ({ children }: ContextProviderProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [yourPrize, setYourPrize] = useState(false);
  const [recentPrizes, setRecentPrizes] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isModalOpen]);

  return (
    <AppContext.Provider
      value={{
        isModalOpen,
        yourPrize,
        recentPrizes,
        setYourPrize,
        setRecentPrizes,
        openModal,
        closeModal,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
