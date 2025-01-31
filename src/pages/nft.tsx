'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import NftComponent from '../components/NftComponent';
import { useAccount } from 'wagmi';
import Footer from '../components/Footer';
//a
const nft = () => {
    const { isConnected } = useAccount();
    return (
        <div className="bg-[#0A0012]">
            <Navbar />

            <main className="md:mt-14 mt-10 min-h-[80vh] relative z-1">
                {isConnected ? (
                    <NftComponent />
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

export default nft;
