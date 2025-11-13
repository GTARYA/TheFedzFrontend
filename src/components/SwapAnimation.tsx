import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import YouTubePopup from "./YouTubePopup";

const SwapAnimation = () => {
  const words = ["Own", "Swap", "Earn", "Repeat"];
  const [index, setIndex] = useState<number>(0);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const onCloseModal = () => setShowVideoModal(false);

  useEffect(() => {
    let animation: null | number = null;

    const updateIndex = () => {
      const video = videoRef.current;
      if (!video) return;
      const segmentDuration = video.duration / words.length;
      const newIndex = Math.floor(video.currentTime / segmentDuration);

      setIndex((prev) => (newIndex !== prev ? newIndex : prev));
      animation = requestAnimationFrame(updateIndex);
    };

    animation = requestAnimationFrame(updateIndex);

    return () => {
      if (animation !== null) {
        cancelAnimationFrame(animation);
      }
      // Pause and cleanup video on unmount
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      }
    };
  }, []);

  return (
    <>
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
            className="text-[30px] sm:text-[48px] leading-[36px] sm:leading-[58px] font-bold w-full"
          >
            {words[index] ? words[index] : words[0]}
          </motion.div>
          <p className="max-w-[450px] text-xl sm:text-2xl font-normal opacity-85">
            A stability mechanism designed to secure DeFi fractional reserve
            system
          </p>
        </div>

        <video
          onClick={() => setShowVideoModal(true)}
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          className="max-w-[300px] w-full h-auto cursor-pointer"
        >
          <source src="./video/animation.mp4" type="video/mp4" />
        </video>
      </div>
      {showVideoModal && (
        <YouTubePopup onClose={onCloseModal} videoId="-tzv5hdX4Mc" />
      )}
    </>
  );
};

export default SwapAnimation;
