import { useState } from 'react';

export const useVideo = () => {
    const [isPlaying, setIsPlaying] = useState(true);
    const [isMuted, setIsMuted] = useState(true);

    const togglePlay = (videoRef: HTMLVideoElement | null) => {
        if (videoRef) {
            if (isPlaying) {
                videoRef.pause();
            } else {
                videoRef.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    // Toggle Sound On/Off
    const toggleMute = (videoRef: HTMLVideoElement | null) => {
        if (videoRef) {
            videoRef.muted = !isMuted;
            setIsMuted(!isMuted);
        }
    };

    return { isPlaying, isMuted, toggleMute, togglePlay };
};

// interface VideoContextType {
//     isPlaying: boolean;
//     isMuted: boolean;
//     togglePlay: (videoRef: HTMLVideoElement | null) => void;
//     toggleMute: (videoRef: HTMLVideoElement | null) => void;
// }

// export const VideoContext = createContext<VideoContextType | null>(null);

// export const VideoProvider = ({ children }: { children: ReactNode }) => {
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [isMuted, setIsMuted] = useState(true);

//     const togglePlay = useCallback(
//         (videoRef: HTMLVideoElement | null) => {
//             if (videoRef) {
//                 if (isPlaying) {
//                     videoRef.pause();
//                 } else {
//                     videoRef.play();
//                 }
//                 setIsPlaying(!isPlaying);
//             }
//         },
//         [isPlaying]
//     );

//     const toggleMute = useCallback(
//         (videoRef: HTMLVideoElement | null) => {
//             if (videoRef) {
//                 videoRef.muted = !isMuted;
//                 setIsMuted(!isMuted);
//             }
//         },
//         [isMuted]
//     );

//     return (
//         <VideoContext.Provider
//             value={{ isPlaying, isMuted, togglePlay, toggleMute }}>
//             {children}
//         </VideoContext.Provider>
//     );
// };

// export const useVideoContext = () => {
//     const context = useContext(VideoContext);
//     if (!context) {
//         throw new Error('useVideoContext must be used within a VideoProvider');
//     }
//     return context;
// };
