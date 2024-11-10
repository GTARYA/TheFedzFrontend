import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
    children: ReactNode;
    className?: string;
}

const Subtitle = ({ children, className }: Props) => {
    return (
        <div
            className={twMerge(
                'py-0.5 md:py-1 bg-white/10 px-3 md:px-4 border-[1px] border-white/10 text-primary w-fit rounded-[46px] text-[14px] md:text-[16px] leading-5 md:leading-6',
                className
            )}>
            {children}
        </div>
    );
};

export default Subtitle;
