"use client";

import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-phantom";
import { SolflareWalletAdapter } from "@solana/wallet-adapter-solflare";
import {
  StandardWalletAdapter,
} from "@solana/wallet-standard-wallet-adapter-base";
import type { WalletAdapterCompatibleStandardWallet } from "@solana/wallet-adapter-base";
import { getWallets } from "@wallet-standard/app";
import { clusterApiUrl } from "@solana/web3.js";
import { useEffect, useMemo, useState, type ReactNode } from "react";

import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletContextProvider({ children }: { children: ReactNode }) {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const [binanceStandardAdapters, setBinanceStandardAdapters] = useState<
    StandardWalletAdapter[]
  >([]);

  const baseWallets = useMemo(
    () => [new PhantomWalletAdapter(), new SolflareWalletAdapter()],
    [],
  );

  useEffect(() => {
    const walletsApi = getWallets();

    const refreshBinanceAdapters = () => {
      const adapters = walletsApi
        .get()
        .filter((wallet) => /binance/i.test(wallet.name))
        .map(
          (wallet) =>
            new StandardWalletAdapter({
              wallet: wallet as WalletAdapterCompatibleStandardWallet,
            }),
        );
      setBinanceStandardAdapters(adapters);
    };

    refreshBinanceAdapters();
    const offRegister = walletsApi.on("register", refreshBinanceAdapters);
    const offUnregister = walletsApi.on("unregister", refreshBinanceAdapters);
    return () => {
      offRegister();
      offUnregister();
    };
  }, []);

  const wallets = useMemo(
    () => [...baseWallets, ...binanceStandardAdapters],
    [baseWallets, binanceStandardAdapters],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

