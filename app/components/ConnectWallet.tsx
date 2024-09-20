import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { obfuscatePubKey } from "@/utils/helpers";

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
    <div className="bg-secondary text-primary cursor-pointer font-bold border-[3px] border-secondary rounded-[10px] px-10 py-2.5">
      {wallet.publicKey && (
        <strong onClick={logout} className="">
          {obfuscatePubKey(wallet.publicKey.toBase58())}
        </strong>
      )}

      {(!wallet.publicKey || wallet.connecting) && (
        <div
          onClick={() => {
            console.log('clicked')
            if (!wallet.connected) {
              console.log('connected')
              walletModal.setVisible(true);
            }
          }}
        >
          <span>Connect Wallet</span>
        </div>
      )}
    </div>
  );
}
