import { ReactNode } from 'react';

const TermsSection = ({ children }: { children: ReactNode }) => {
    return <section className="space-y-4 mt-8">{children}</section>;
};

export default TermsSection;
