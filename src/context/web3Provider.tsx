"use client";

import { wagmiAdapter, projectId, networks } from "../config";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import {
  mainnet,
  bscTestnet,
  sepolia,
  base,
  bsc,
  arbitrum,
} from "@reown/appkit/networks";
import React, { type ReactNode } from "react";
import { cookieToInitialState, WagmiProvider, type Config } from "wagmi";
import { ToastContainer, toast } from "react-toastify";

const queryClient = new QueryClient();

const metadata = {
  name: "TheFedz",
  description: "TheFedz",
  url: "https://thefedz.org",
  icons: ["https://thefedz.org/logo.png"],
};

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [arbitrum, sepolia],
  defaultNetwork: arbitrum,
  metadata: metadata,

  features: {
    email: false,
    socials: false,
    analytics: false,
  },
});

function ContextProvider({
  children,
}: {
  children: ReactNode
}) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig as Config
  );

  return (
    <WagmiProvider
      config={wagmiAdapter.wagmiConfig as Config}
      initialState={initialState}
    >
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

export default ContextProvider;
