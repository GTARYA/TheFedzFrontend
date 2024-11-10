import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
    children: ReactNode;
    className?: string;
}

const Title = ({ children, className }: Props) => {
    return (
        <h1
            className={twMerge(
                'text-[30px] md:text-[48px] leading-[36px] md:leading-[58px] text-primary font-bold',
                className
            )}>
            {children}
        </h1>
    );
};

export default Title;
