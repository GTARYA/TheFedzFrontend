import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import YouTubePopup from "./YouTubePopup";

const SwapAnimation = () => {
  const words = ["Own", "Swap", "Earn", "Repeat"];
  const [index, setIndex] = useState<number>(0);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const isVideoLoadedRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  const onCloseModal = () => setShowVideoModal(false);

  // IntersectionObserver to only load video when in viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVideoLoadedRef.current) {
            // Clear any existing timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            // Small delay to prevent multiple loads during navigation
            timeoutRef.current = setTimeout(() => {
              if (entry.isIntersecting && !isVideoLoadedRef.current) {
                isVideoLoadedRef.current = true;
                setShouldLoad(true);
              }
            }, 100);
          }
        });
      },
      {
        rootMargin: "50px",
        threshold: 0.1,
      }
    );

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
      observer.disconnect();
      isVideoLoadedRef.current = false;
    };
  }, []);

  // Video loading and animation frame
  useEffect(() => {
    if (!shouldLoad || !videoRef.current) return;

    const video = videoRef.current;

    // Wait for video metadata to be loaded
    const handleLoadedMetadata = () => {
      if (video && video.duration) {
        const updateIndex = () => {
          if (!videoRef.current) return;
          const video = videoRef.current;
          if (!video.duration) return;

          const segmentDuration = video.duration / words.length;
          const newIndex = Math.floor(video.currentTime / segmentDuration);

          setIndex((prev) => (newIndex !== prev ? newIndex : prev));
          animationRef.current = requestAnimationFrame(updateIndex);
        };

        animationRef.current = requestAnimationFrame(updateIndex);
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);

    // Try to play the video
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Handle autoplay restrictions silently
      });
    }

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      if (video) {
        video.removeEventListener("loadedmetadata", handleLoadedMetadata);
        video.pause();
        video.src = "";
        video.load();
      }
      isVideoLoadedRef.current = false;
    };
  }, [shouldLoad, words.length]);

  return (
    <>
      <div
        ref={containerRef}
        className="w-full mx-auto flex md:flex-row flex-col items-center justify-center md:gap-10 text-white pt-5 sm:pt-10 bg-black"
      >
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

        {shouldLoad ? (
          <video
            onClick={() => setShowVideoModal(true)}
            ref={videoRef}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            className="max-w-[300px] w-full h-auto cursor-pointer"
          >
            <source src="/video/animation.mp4" type="video/mp4" />
          </video>
        ) : (
          <div className="max-w-[300px] w-full h-auto bg-gray-800 rounded animate-pulse flex items-center justify-center aspect-video">
            <span className="text-gray-500">Loading...</span>
          </div>
        )}
      </div>
      {showVideoModal && (
        <YouTubePopup onClose={onCloseModal} videoId="-tzv5hdX4Mc" />
      )}
    </>
  );
};

export default SwapAnimation;
