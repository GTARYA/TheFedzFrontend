// pages/_app.tsx
import "../styles/globals.css";
import type { AppProps } from "next/app";

import dynamic from "next/dynamic";
import Head from "next/head";
import { Toaster } from "react-hot-toast";

import Web3provider from "../context/web3Provider";
import { ModeProvider } from "../context/modeProvider";

// Client-only (prevents hydration mismatch from DOM/window usage inside CursorEffect)
const CursorEffect = dynamic(() => import("../libs/cursorEffect"), { ssr: false });

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ModeProvider>
      <Web3provider>
        <CursorEffect />

        <Head>
          <title>The Fedz Project</title>
          <meta
            name="description"
            content="The Fedz - Revolutionary DeFi Platform"
          />

          <link rel="icon" href="/favicon.ico" />
          <link rel="icon" href="/cursor/5.png" sizes="any" />

          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap"
            rel="stylesheet"
          />
        </Head>

        <Component {...pageProps} />

        <Toaster />
      </Web3provider>
    </ModeProvider>
  );
}
