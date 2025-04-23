import { ReactNode } from 'react';
import TermsSection from './SectionTerms';
import PointList from './PointList';
import { Point } from './Point';

const TermsTitle = ({ children }: { children: ReactNode }) => {
    return <h2 className="text-xl font-semibold">{children}</h2>;
};

export default TermsTitle;

const test = (
    <TermsSection>
        <TermsTitle>fdsfdsfs</TermsTitle>
        <PointList>
            <Point>fdsfdsfds</Point>
            <Point>ffdsfdsf</Point>
            <Point>ffdsfdsf</Point>
            <Point>ffdsfdsf</Point>
            <Point>ffdsfdsf</Point>
            <Point>ffdsfdsf</Point>
            <Point>ffdsfdsf</Point>
        </PointList>
    </TermsSection>
);
