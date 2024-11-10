import { ReactNode } from 'react';
import { twMerge } from 'tailwind-merge';

interface Props {
    children: ReactNode;
    className?: string;
}

const Container = ({ children, className }: Props) => {
    return (
        <div
            className={twMerge(
                'mx-auto max-w-[1340px] xl:px-[100px] lg:px-[70px] md:px-[50px] px-[20px]',
                className
            )}>
            {children}
        </div>
    );
};

export default Container;
