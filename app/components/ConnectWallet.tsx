import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import Image from "next/image";

export default function ConnectWallet() {
  const wallet = useWallet();
  const walletModal = useWalletModal();

  async function logout() {
    console.log("logging out");
    try {
      await wallet.disconnect();
    } catch (e) {}
  }

  return (
    <div className="bg-black border-white/50 border cursor-pointer p-2 rounded">
      {wallet.publicKey && (
        <strong className="text-white flex flex-1">
          {wallet.publicKey.toBase58()}
        </strong>
      )}

      {(!wallet.publicKey || wallet.connecting) && (
        <div
          onClick={() => {
            if (!wallet.connected) {
              walletModal.setVisible(true);
            }
          }}
        >
          <span>CONNECT WALLET</span>
        </div>
      )}
    </div>
  );
}
