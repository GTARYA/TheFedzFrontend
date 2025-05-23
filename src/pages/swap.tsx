'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import SwapComponent from '../components/SwapComponent';
import { useAccount, useChainId } from 'wagmi';
import Footer from '../components/Footer';
import {
    arbitrum,
    sepolia,
  } from "@reown/appkit/networks";
import V4SwapComponent from '../components/V4SwapComponent';
const Swap = () => {
    const { isConnected } = useAccount();
    const activeChainId = useChainId();
    return (
        <div className="bg-[#0A0012]">
            <Navbar />
            <main className="md:mt-14 mt-10 min-h-[80vh] relative z-1">

            <V4SwapComponent />


                {/* {isConnected ? (
                    sepolia.id === activeChainId ? (
                        <SwapComponent />
                    ) : (<V4SwapComponent />)
                ) : (
                    <div className="text-center text-primary">
                        <h2 className="text-4xl font-bold mb-4">
                            Wallet Not Connected
                        </h2>
                        <p className="text-gray-600 text-xl">
                            Please connect your wallet to access the swap
                            feature.
                        </p>
                    </div>
                )} */}
            </main>
            <Footer />
        </div>
    );
};

export default Swap;
