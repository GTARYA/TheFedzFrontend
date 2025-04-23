import { ReactNode } from 'react';

const PointList = ({ children }: { children: ReactNode }) => {
    return <ul className="list-disc list-inside">{children}</ul>;
};

export default PointList;
