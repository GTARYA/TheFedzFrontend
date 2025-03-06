'use client';
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from 'react';

interface ModeContextType {
    isNormalMode: boolean;
    toggleMode: () => void;
}

const ModeContext = createContext<ModeContextType | null>(null);

export const ModeProvider = ({ children }: { children: ReactNode }) => {
    const [isNormalMode, setIsNormalMode] = useState<boolean>(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);

        const storedMode = localStorage.getItem('mode');
        if (storedMode !== null) {
            setIsNormalMode(JSON.parse(storedMode));
        }
    }, []);

    useEffect(() => {
        if (isMounted) {
            localStorage.setItem('mode', JSON.stringify(isNormalMode));
        }
    }, [isNormalMode, isMounted]);

    const toggleMode = () => {
        setIsNormalMode((prev) => !prev);
    };

    return (
        <ModeContext.Provider value={{ isNormalMode, toggleMode }}>
            {children}
        </ModeContext.Provider>
    );
};

export const useMode = () => {
    const context = useContext(ModeContext);
    if (!context) throw new Error('useMode must be used within a ModeProvider');
    return context;
};
