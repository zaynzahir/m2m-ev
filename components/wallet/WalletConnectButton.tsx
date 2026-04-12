"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";

type WalletConnectButtonProps = {
  variant?: "nav" | "primary";
};

export function WalletConnectButton({ variant = "nav" }: WalletConnectButtonProps) {
  const { connected, disconnect, connecting } = useWallet();
  const { setVisible } = useWalletModal();
  const className = variant === "nav" ? "wallet-m2m-nav" : "wallet-m2m-primary";

  if (connected) {
    return (
      <button
        type="button"
        className={className}
        onClick={() => void disconnect()}
        disabled={connecting}
      >
        <span className="sm:hidden">Disconnect</span>
        <span className="hidden sm:inline">Disconnect Wallet</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={() => setVisible(true)}
      disabled={connecting}
    >
      {connecting ? (
        "Connecting…"
      ) : (
        <>
          <span className="sm:hidden">Connect</span>
          <span className="hidden sm:inline">Connect Wallet</span>
        </>
      )}
    </button>
  );
}
