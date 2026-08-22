"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { kit, openWalletModal, getWalletAddress } from "../lib/kit";
import { WalletNetwork } from "@creit.tech/stellar-wallets-kit";
import { NETWORK_PASSPHRASE } from "../lib/constants";

interface WalletContextType {
  address: string | null;
  isConnected: boolean;
  isWrongNetwork: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WalletContext = createContext<WalletContextType>({
  address: null,
  isConnected: false,
  isWrongNetwork: false,
  connect: async () => {},
  disconnect: () => {},
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);

  const checkNetwork = useCallback(async () => {
    try {
      const network = await kit.getNetwork();
      setIsWrongNetwork(network.networkPassphrase !== NETWORK_PASSPHRASE);
    } catch {
      setIsWrongNetwork(false);
    }
  }, []);

  useEffect(() => {
    const restore = async () => {
      const addr = await getWalletAddress();
      if (addr) {
        setAddress(addr);
        await checkNetwork();
      }
    };
    restore();
  }, [checkNetwork]);

  const connect = async () => {
    try {
      await openWalletModal((addr) => {
        setAddress(addr);
      });
      await checkNetwork();
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      throw error;
    }
  };

  const disconnect = () => {
    setAddress(null);
    setIsWrongNetwork(false);
  };

  return (
    <WalletContext.Provider
      value={{
        address,
        isConnected: !!address,
        isWrongNetwork,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}
