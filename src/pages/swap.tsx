'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import SwapComponent from '../components/SwapComponent';
import { useAccount } from 'wagmi';

const Swap = () => {
  const { isConnected } = useAccount();

  return (
    <div className="min-h-screen bg-base-200" style={{
      backgroundImage: "url('/background/background.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <Navbar />
      <main className="container mx-auto px-4 py-8 mt-20">
        {isConnected ? (
          <SwapComponent />
        ) : (
          <div className="text-center p-8 bg-base-100 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
            <p className="text-gray-600">
              Please connect your wallet to access the swap feature.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Swap;
