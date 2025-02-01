import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

const SwapAnimation = () => {
    const words = ['Own', 'Swap', 'Earn', 'Repeat'];
    const [index, setIndex] = useState<number>(0);
    const videoRef = useRef<HTMLVideoElement | null>(null);

    useEffect(() => {
        const updateIndex = () => {
            const video = videoRef.current;
            if (!video) return;

            const segmentDuration = video.duration / words.length;
            const newIndex = Math.floor(video.currentTime / segmentDuration);

            if (newIndex !== index) {
                setIndex(newIndex);
            }

            requestAnimationFrame(updateIndex);
        };

        requestAnimationFrame(updateIndex);
    }, []);

    return (
        <div className="w-full mx-auto flex md:flex-row flex-col items-center justify-center md:gap-10 text-white pt-5 sm:pt-10 bg-black">
            <div className="relative z-[10] text-center md:text-left">
                <h3 className="font-semibold text-2xl sm:text-4xl mb-2 sm:mb-4">
                    Private Liquidity Pool
                </h3>
                <motion.div
                    key={index}
                    initial={{ opacity: 0, y: -40 }}
                    animate={{ opacity: 1, y: -10 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.5 }}
                    className="text-[30px] sm:text-[48px] leading-[36px] sm:leading-[58px] font-bold w-full">
                    {words[index] ? words[index] : words[0]}
                </motion.div>
                <p className="max-w-[450px] text-xl sm:text-2xl font-normal opacity-85">
                    A stability mechanism designed to secure DeFi fractional
                    reserve system
                </p>
            </div>
            <div className="relative">
                <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    className="max-w-[300px] w-full">
                    <source src="./video/animation.mp4" type="video/mp4" />
                </video>
            </div>
        </div>
    );
};

export default SwapAnimation;
