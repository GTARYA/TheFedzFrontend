'use client';
import React from 'react';
import Navbar from '../components/Navbar';
import NftComponent from '../components/NftComponent';
import { useAccount } from 'wagmi';

const nft = () => {
  const { isConnected } = useAccount();
  return (
    <div className="min-h-screen bg-base-200"  style={{
      backgroundImage: "url('/background/background.jpg')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      <Navbar />

      <main className="container mx-auto px-4 py-8 mt-16">
        {isConnected ? (<NftComponent />) 
        : (<div className="text-center p-8 bg-base-100 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">Wallet Not Connected</h2>
          <p className="text-gray-600">
            Please connect your wallet to view and manage your liquidity.
          </p>
        </div>)
        
      }
          
      </main>
    </div>
  );
};

export default nft;