import { useClickOutside } from '@reactuses/core';
import { useRef, useState } from 'react';

const YouTubePopup = ({
    videoId,
    onClose,
}: {
    videoId: string;
    onClose: () => void;
}) => {
    const modalRef = useRef<null | HTMLDivElement>(null);

    useClickOutside(modalRef, onClose);

    return (
        <div className="fixed p-2 inset-0 bg-black bg-opacity-70 flex items-center justify-center z-[900]">
            <div
                ref={modalRef}
                className="overflow-hidden rounded-lg shadow-lg relative w-[80%] max-w-3xl">
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-xl">
                    ✖
                </button>

                <iframe
                    width="100%"
                    height="400"
                    src={`https://www.youtube.com/embed/${videoId}`}
                    title="YouTube Video"
                    allow="autoplay; encrypted-media"
                    allowFullScreen></iframe>
            </div>
        </div>
    );
};

export default YouTubePopup;
