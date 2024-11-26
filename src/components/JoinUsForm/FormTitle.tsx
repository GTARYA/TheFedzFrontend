import { ReactNode } from 'react';

const FormTitle = ({ children }: { children: ReactNode }) => {
    return (
        <h2 className="mx-auto max-w-xs text-center text-base sm:text-xl font-bold text-black mb-3 sm:mb-5">
            {children}
        </h2>
    );
};

export default FormTitle;
