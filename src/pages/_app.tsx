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
                    <Component {...pageProps} />
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
}

export default MyApp;
