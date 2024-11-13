'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import LiquidityComponent from '../components/LiquidityComponent';
import { useAccount } from 'wagmi';
import Footer from '../components/Footer';

const liquidity = () => {
    const { isConnected } = useAccount();
    return (
        <div className="bg-[#0A0012] relative">
            <Navbar />

            <main className="md:mt-14 mt-10 min-h-[80vh]">
                {isConnected ? (
                    <LiquidityComponent />
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
                )}
            </main>
            <Footer />
        </div>
    );
};

export default liquidity;
