// components/CursorTrailWithImages.js
import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';

const CursorEffect = () => {
    const particlesInit = useCallback(async (engine) => {
        await loadFull(engine);
    }, []);

    return (
        <Particles
            className="z-[6] pointer-events-none fixed"
            id="tsparticles"
            init={particlesInit}
            options={{
                fullScreen: { enable: true },
                particles: {
                    number: {
                        value: 0,
                    },

                    move: {
                        enable: true,
                        speed: 1,
                        decay: 0.1,
                        direction: 'none',
                        random: false,
                        straight: false,
                        outModes: 'none',
                        trail: {
                            enable: true,
                            length: 15,
                            fillColor: 'transparent',
                        },
                    },
                    life: {
                        duration: {
                            sync: true,
                            value: 1,
                        },
                        count: 1,
                    },
                    shape: {
                        type: 'image',
                        image: [
                            {
                                src: '/cursor/1.png',
                                width: 32,
                                height: 32,
                            },
                            {
                                src: '/cursor/2.png',
                                width: 32,
                                height: 32,
                            },
                            {
                                src: '/cursor/3.png',
                                width: 32,
                                height: 32,
                            },
                            {
                                src: '/cursor/5.png',
                                width: 32,
                                height: 32,
                            },
                            {
                                src: '/cursor/6.png',
                                width: 32,
                                height: 32,
                            },
                        ],
                    },

                    opacity: {
                        value: 1,
                    },
                    size: {
                        value: {
                            min: 5,
                            max: 25,
                        },
                        animation: {
                            enable: true,
                            speed: 20,
                            sync: true,
                            startValue: 'max',
                            destroy: 'min',
                        },
                    },
                },
                interactivity: {
                    events: {
                        onHover: {
                            enable: true,
                            mode: 'trail',
                        },
                    },
                    modes: {
                        trail: {
                            pauseOnStop: true,
                            delay: 0.05,
                            quantity: 1,
                        },
                    },
                },
            }}
        />
    );
};

export default CursorEffect;
