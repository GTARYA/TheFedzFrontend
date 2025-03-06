import { ReactNode, useEffect, useState } from 'react';
import { twMerge } from 'tailwind-merge';
import JoinUsForm from '../JoinUsForm/JoinUsForm';
import { createPortal } from 'react-dom';

interface Props {
    children: ReactNode;
    className?: string;
}

const JoinUsBtn = ({ children, className }: Props) => {
    const [showForm, setShowForm] = useState(false);

    const onClose = () => {
        setShowForm(false);
    };

    useEffect(() => {
        const header = document.getElementsByTagName('main')[0];
        if (showForm) {
            document.body.style.overflow = 'hidden';
            console.log(header);
        } else {
            document.body.style.overflow = 'visible';
        }
    }, [showForm]);

    return (
        <>
            {showForm &&
                createPortal(
                    <JoinUsForm onClose={onClose} isOpen={showForm} />,
                    document.body
                )}
            <button
                className="text-lightblue"
                onClick={() => setShowForm(true)}>
                {children}
            </button>
        </>
    );
};

export default JoinUsBtn;
