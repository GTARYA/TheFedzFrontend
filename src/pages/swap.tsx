'use client';
import React from 'react';
import dynamic from 'next/dynamic';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const V4SwapComponent = dynamic(
  () => import('../components/V4SwapComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-20">
        <p className="text-primary text-lg animate-pulse">
          Loading swap component...
        </p>
      </div>
    ),
  }
);

const Swap = () => {
    return (
        <div className="bg-[#0A0012]">
            <Navbar />
            <main className="md:mt-14 mt-10 min-h-[80vh] relative z-1">
                <V4SwapComponent />
            </main>
            <Footer />
        </div>
    );
};

export default Swap;
