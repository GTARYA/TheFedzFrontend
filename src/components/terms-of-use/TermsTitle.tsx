import { ReactNode } from 'react';

const TermsTitle = ({ children }: { children: ReactNode }) => {
    return <h2 className="text-xl font-semibold">{children}</h2>;
};

export default TermsTitle;
