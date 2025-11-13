import { useRef, useEffect, useState } from "react";
import { FaPause } from "react-icons/fa6";
import { FaPlay } from "react-icons/fa";
import { HiSpeakerWave } from "react-icons/hi2";
import { HiSpeakerXMark } from "react-icons/hi2";
import { useVideo } from "../hooks/useVideo";

const VideoPlayerMobile = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { isPlaying, isMuted, toggleMute, togglePlay } = useVideo();
  const [isInView, setIsInView] = useState(false);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            // Clear any existing timeout
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
            }
            // Delay loading slightly to improve initial page load
            timeoutRef.current = setTimeout(() => setShouldLoad(true), 100);
          } else {
            // Clear timeout if leaving view
            if (timeoutRef.current) {
              clearTimeout(timeoutRef.current);
              timeoutRef.current = null;
            }
            // Pause video when out of view to save resources
            if (videoRef.current && !videoRef.current.paused) {
              videoRef.current.pause();
            }
          }
        });
      },
      {
        rootMargin: "50px", // Start loading 50px before entering viewport
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
      // Pause and cleanup video on unmount
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.src = "";
        videoRef.current.load();
      }
    };
  }, []);

  useEffect(() => {
    if (shouldLoad && videoRef.current && isInView) {
      // Only autoplay when in view
      const playPromise = videoRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Handle autoplay restrictions
        });
      }
    }
    return () => {
      // Cleanup video on unmount
      if (videoRef.current) {
        videoRef.current.pause();
      }
    };
  }, [shouldLoad, isInView]);

  return (
    <div
      ref={containerRef}
      className="rounded-3xl overflow-hidden shrink-0 block lg:hidden relative w-fit mx-auto my-6"
    >
      <img
        src="/Nft lord.png"
        alt="phone"
        className="max-w-[460px] xl:max-w-[540px] w-full"
        loading="lazy"
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[32px] overflow-hidden">
        <img
          src="/forward-phone2.png"
          alt="phone"
          className="absolute top-[47%] left-[49%] -translate-x-1/2 -translate-y-1/2 sm:rounded-[10px] w-full h-full z-[-1] p-[6%]"
          loading="lazy"
        />
        <div className="absolute top-[48%] left-[48%]-translate-x-1/2 -translate-y-1/2 rounded-[10px] w-full h-full z-[0] p-5">
          <div className="w-[82%] h-[91%] sm:rounded-[32px] rounded-[20px] overflow-hidden absolute top-[49%] left-[49%] -translate-x-1/2 -translate-y-1/2">
            <div className="relative">
              {/* Video Player */}
              {shouldLoad ? (
                <video
                  ref={videoRef}
                  muted={isMuted}
                  autoPlay={isInView}
                  loop
                  playsInline
                  preload="metadata"
                  className="w-full h-full object-cover"
                >
                  <source src="/video/Explainer.mp4" type="video/mp4" />
                </video>
              ) : (
                <div className="w-full h-full bg-gray-200 animate-pulse" />
              )}

              {/* Control Buttons */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[40px] sm:translate-y-[50px] flex gap-6 z-[10]">
                {/* Play/Pause Button */}
                <button
                  onClick={() => togglePlay(videoRef.current)}
                  className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border-[1] border-gray-300 bg-lightblue text-white rounded-full shadow transition"
                >
                  {isPlaying ? (
                    <FaPause />
                  ) : (
                    <FaPlay className="translate-x-[1px] scale-[85%]" />
                  )}
                </button>

                {/* Sound On/Off Button */}
                <button
                  onClick={() => toggleMute(videoRef.current)}
                  className="w-6 h-6 sm:w-8 sm:h-8 flex items-center justify-center border-[1] border-gray-300 bg-lightblue text-white rounded-full shadow transition"
                >
                  {isMuted ? <HiSpeakerXMark /> : <HiSpeakerWave />}
                </button>
              </div>
            </div>
          </div>
        </div>
        <img src="/phone-wrapper.png" alt="phone" loading="lazy" />
      </div>
    </div>
  );
};

export default VideoPlayerMobile;
