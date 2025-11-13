import '../styles/globals.css';
import type { AppProps } from 'next/app';

import CursorEffect from '../libs/cursorEffect';
import Head from 'next/head';
import Web3provider from '../context/web3Provider';
import { ModeProvider } from '../context/modeProvider';

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <div>
            <ModeProvider>
                <Web3provider>
                    <CursorEffect />
                    <Head>
                        <title>The Fedz Project</title>
                        <link rel="icon" href="/cursor/5.png" sizes="any" />
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
                    <Component {...pageProps} suppressHydrationWarning />
                </Web3provider>
            </ModeProvider>
        </div>
    );
}

export default MyApp;