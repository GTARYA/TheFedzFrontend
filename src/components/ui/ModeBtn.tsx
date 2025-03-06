import { useMode } from '../../context/modeProvider';

const ModeBtn = () => {
    const { isNormalMode, toggleMode } = useMode();
    return (
        <button
            onClick={toggleMode}
            className={`relative w-[115px] md:w-[130px] h-9 md:h-10 flex items-center rounded-full border-2 transition-all ${
                isNormalMode
                    ? 'bg-black border-white text-white'
                    : 'bg-gray-300 border-gray-300 text-black'
            }`}>
            <span
                className={`absolute text-xl left-0 h-full w-9 md:w-10 transition-transform bg-white border-[1px] border-black rounded-full flex items-center justify-center ${
                    isNormalMode
                        ? 'translate-x-[76px] md:translate-x-[86px]'
                        : 'translate-x-0'
                }`}>
                {isNormalMode ? '🏦' : '🔥'}
            </span>
            <span
                className={`w-full text-[11px] md:text-xs font-bold ${
                    isNormalMode ? 'text-left pl-2' : 'text-right pr-2 md:pr-3'
                }`}>
                {isNormalMode ? 'Normie Mode' : 'Degen Mode'}
            </span>
        </button>
    );
};

export default ModeBtn;
