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
        <div className="relative">
            <motion.div
                key={index}
                initial={{ opacity: 0, y: 0 }}
                animate={{ opacity: 1, y: 30 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="text-[30px] md:text-[48px] leading-[36px] md:leading-[58px] font-bold w-full text-center top-0">
                {words[index] ? words[index] : words[0]}
            </motion.div>
            <video
                ref={videoRef}
                autoPlay
                loop
                muted
                className="max-w-[400px] w-full">
                <source src="./video/animation.mp4" type="video/mp4" />
            </video>
        </div>
    );
};

export default SwapAnimation;
