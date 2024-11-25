import { useRef } from 'react';
import { FaPause } from 'react-icons/fa6';
import { FaPlay } from 'react-icons/fa';
import { HiSpeakerWave } from 'react-icons/hi2';
import { HiSpeakerXMark } from 'react-icons/hi2';
import { useVideo } from '../hooks/useVideo';

const VideoPlayer = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const { isPlaying, isMuted, toggleMute, togglePlay } = useVideo();

    return (
        <div className="rounded-3xl overflow-hidden shrink-0 hidden lg:block relative">
            <img
                src="/Nft lord.png"
                alt="phone"
                className="max-w-[460px] xl:max-w-[540px]"
            />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[32px] overflow-hidden">
                <img
                    src="/forward-phone2.png"
                    alt="phone"
                    className="absolute top-[47%] left-[49%] -translate-x-1/2 -translate-y-1/2 rounded-[10px] w-full h-full z-[-1] p-4"
                />
                <div className="absolute top-[48%] left-[48%]-translate-x-1/2 -translate-y-1/2 rounded-[10px] w-full h-full z-[0] p-5">
                    <div className="w-[82%] h-[91%] rounded-[32px] overflow-hidden absolute top-[49%] left-[49%] -translate-x-1/2 -translate-y-1/2">
                        <div className="relative">
                            {/* Video Player */}
                            <video
                                ref={videoRef}
                                muted={isMuted}
                                autoPlay
                                loop
                                className="w-full h-full object-cover">
                                <source
                                    src="./video/Explainer.mp4"
                                    type="video/mp4"
                                />
                            </video>

                            {/* Control Buttons */}
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-[50px] flex gap-6 z-[10]">
                                {/* Play/Pause Button */}
                                <button
                                    onClick={() => togglePlay(videoRef.current)}
                                    className="w-8 h-8 flex items-center justify-center border-[1] border-gray-300 bg-lightblue text-white rounded-full shadow transition">
                                    {isPlaying ? (
                                        <FaPause />
                                    ) : (
                                        <FaPlay className="translate-x-[1px] scale-95" />
                                    )}
                                </button>

                                {/* Sound On/Off Button */}
                                <button
                                    onClick={() => toggleMute(videoRef.current)}
                                    className="w-8 h-8 flex items-center justify-center border-[1] border-gray-300 bg-lightblue text-white rounded-full shadow transition">
                                    {isMuted ? (
                                        <HiSpeakerXMark />
                                    ) : (
                                        <HiSpeakerWave />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
                <img src="/phone-wrapper.png" alt="phone" />
            </div>
        </div>
    );
};

export default VideoPlayer;
