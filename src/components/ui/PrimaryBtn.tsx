import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
    children: ReactNode;
    className?: string;
}

const PrimaryBtn = ({ children, className }: Props) => {
    return (
        <button
            className={twMerge(
                'rounded-[56px] bg-lightblue px-6 py-[14px] text-primary leading-[27px] md:text-[18px] text-[16px] font-medium transition-all hover:scale-[102%]',
                className
            )}>
            {children}
        </button>
    );
};

export default PrimaryBtn;
