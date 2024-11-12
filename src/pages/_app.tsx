import '../styles/globals.css';
import '@rainbow-me/rainbowkit/styles.css';
import type { AppProps } from 'next/app';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import {
    RainbowKitProvider,
    darkTheme,
    lightTheme,
} from '@rainbow-me/rainbowkit';
import { config } from '../wagmi';
import CursorEffect from '../libs/cursorEffect';
import Head from 'next/head';

const client = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={client}>
                <RainbowKitProvider
                    theme={{
                        lightMode: lightTheme({
                            accentColor: '#f3f4f6',
                            accentColorForeground: 'black',
                        }),
                        darkMode: darkTheme({
                            accentColor: '#171717',
                            accentColorForeground: '#f5f5f5',
                        }),
                    }}>
                    {/* <CursorEffect /> */}
                    <Head>
                        <title>The Fedz Project</title>
                        <meta
                            content="The Fedz - Revolutionary DeFi Platform"
                            name="description"
                        />
                        <link href="/favicon.ico" rel="icon" />
                        <link
                            rel="preconnect"
                            href="https://fonts.googleapis.com"
                        />
                        <link
                            rel="preconnect"
                            href="https://fonts.gstatic.com"
                        />
                        <link
                            href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap"
                            rel="stylesheet"
                        />
                    </Head>
                    <Component {...pageProps} />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default MyApp;
