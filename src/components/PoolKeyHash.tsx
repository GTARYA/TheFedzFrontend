import React from 'react';
import Subtitle from './ui/Subtitle';
import PrimaryBtn from './ui/PrimaryBtn';

const PoolKeyHashDisplay = ({ poolKeyHash }: { poolKeyHash: string }) => {
    const handleCopy = () => {
        navigator.clipboard.writeText(poolKeyHash);
    };
    return (
        <div className="relative z-[5] mx-auto md:mx-0 overflow-hidden px-5 sm:px-10 pt-5 md:pt-10 rounded-[32px] flex flex-col justify-between border-[1px] border-white/20 bg-white/5 max-w-[476px] w-full">
            <div>
                <h2 className="text-primary font-extrabold text-[24px] leading-[30px] md:text-[32px] md:leading-[38px] mb-4">
                    Pool Key Hash:
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                    <Subtitle className="!p-4 truncate w-full">
                        {poolKeyHash}
                    </Subtitle>
                    <PrimaryBtn onClick={handleCopy}>Copy</PrimaryBtn>
                </div>
            </div>
            <img src="/money-printer2.png" alt="printer" className="w-full" />

            <img
                src="/clouds-white.png"
                alt="clouds"
                className="absolute w-full bottom-0 left-0"
            />
        </div>
    );
};

export default PoolKeyHashDisplay;
