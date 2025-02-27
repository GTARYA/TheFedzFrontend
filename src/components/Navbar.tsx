// components/Navbar.js
import Link from 'next/link';
import Container from './Container';
import { useEffect, useState } from 'react';
import ConnectButton from './ConnectButton';
import NetworkSelector from './NetworkSelector/NetworkSelector';
import { useMode } from '../context/modeProvider';
const Navbar = () => {
    const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
    const { isNormalMode, toggleMode } = useMode();

    const handleClick = () => {
        setMenuIsOpen((prev) => !prev);
    };

    useEffect(() => {
        if (menuIsOpen) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = 'auto';

        const resize = window.addEventListener('resize', () => {
            if (!window.matchMedia('(max-width: 1024px)').matches)
                setMenuIsOpen(false);
        });
        return resize;
    }, [menuIsOpen]);

    return (
        <header className="bg-gradient-to-b from-[#000000CF] bg-opacity-80 to-transparent z-[11] sticky top-0  backdrop-blur-md">
            <Container>
                <div className="flex items-center justify-between sm:h-[80px] h-[64px]">
                    <Link href="/">
                        <img
                            src="./logo.png"
                            alt="logo"
                            className="md:max-w-[164px] max-w-[111px]"
                        />
                    </Link>

                    <ul className="items-center gap-6 text-primary hidden lg:flex">
                        <li>
                            <Link
                                href="/"
                                className="text-primary leading-6 text-[16px]">
                                Home
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/swap"
                                className="text-primary leading-6 text-[16px]">
                                Swap
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/liquidity"
                                className="text-primary leading-6 text-[16px]">
                                Earn
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/nft"
                                className="text-primary leading-6 text-[16px]">
                                Owners
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/players"
                                className="text-primary leading-6 text-[16px]">
                                Status
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="https://Blog.TheFedz.org"
                                className="text-primary leading-6 text-[16px]">
                                Blog
                            </Link>
                        </li>
                    </ul>

                    <div className="hidden lg:flex lg:flex-row lg:gap-3 items-center">
                        <NetworkSelector />
                        <ConnectButton />

                        {/* <ConnectButton /> */}

                        <button
                            onClick={toggleMode}
                            className={`relative w-[150px] h-12 flex items-center rounded-full border-2 transition-all ${
                                isNormalMode
                                    ? 'bg-black border-white text-white'
                                    : 'bg-gray-300 border-gray-300 text-black'
                            }`}>
                            <span
                                className={`absolute text-2xl left-0 h-full w-12 transition-transform bg-white border-[1px] border-black rounded-full flex items-center justify-center ${
                                    isNormalMode
                                        ? 'translate-x-[98px]'
                                        : 'translate-x-0'
                                }`}>
                                {isNormalMode ? '🏦' : '🔥'}
                            </span>
                            <span
                                className={`w-full text-sm font-bold ${
                                    isNormalMode
                                        ? 'text-left pl-2'
                                        : 'text-right pr-3'
                                }`}>
                                {isNormalMode ? 'Normie Mode' : 'Degen Mode'}
                            </span>
                        </button>
                    </div>
                    <div className=" lg:hidden">
                        <NetworkSelector />
                    </div>

                    <div
                        onClick={handleClick}
                        className="w-9 h-9 rounded-full bg-lightblue flex justify-center items-center lg:hidden hover:scale-[107%] cursor-pointer transition-all">
                        {menuIsOpen ? (
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M0.909621 0.967551C0.404718 1.49806 0.418154 2.33534 0.93982 2.84938L3.12536 5.00295L6.25073 8.0826L3.18367 11.1858L0.972218 13.4319C0.503347 13.9081 0.501442 14.6719 0.96793 15.1504C1.43743 15.619 2.19842 15.6164 2.66468 15.1446L4.87464 12.9086L7.93003 9.81711L11.0554 12.8968L13.3002 15.1088C13.7915 15.5928 14.5778 15.6008 15.0787 15.1268C15.5655 14.6667 15.5801 13.8967 15.111 13.4185L12.863 11.1268L9.74927 7.9646L12.8746 4.88496L15.1314 2.66124C15.6118 2.18779 15.6196 1.41513 15.1487 0.932154C14.6788 0.456756 13.9123 0.453128 13.438 0.924058L12.4315 1.9233C11.4052 2.94985 10.0058 4.34218 9.30612 5.02655L8.05831 6.26549L4.93294 3.12684L2.7563 0.941009C2.24385 0.426396 1.40707 0.438424 0.909621 0.967551Z"
                                    fill="#0A0012"
                                />
                            </svg>
                        ) : (
                            <svg
                                width="16"
                                height="16"
                                viewBox="0 0 16 16"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                    d="M1.59765 0.071701C0.985783 0.241366 0.428306 0.73 0.142769 1.33401C0.00679851 1.63262 0 1.74799 0 3.64823C0 5.55526 0.00679851 5.66385 0.149567 5.96924C0.353522 6.41716 0.802224 6.87186 1.25093 7.08903L1.63164 7.27905H3.6372H5.64276L6.02348 7.08903C6.47218 6.87186 6.92088 6.41716 7.12483 5.96924C7.2676 5.66385 7.2744 5.55526 7.2744 3.64823C7.2744 1.7412 7.2676 1.63262 7.12483 1.32722C6.92088 0.879304 6.47218 0.424603 6.02348 0.207433L5.64276 0.0174084L3.77317 0.0038352C2.43387 -0.00973797 1.8152 0.010622 1.59765 0.071701Z"
                                    fill="#0A0012"
                                />
                                <path
                                    d="M10.2998 0.071701C9.68793 0.241366 9.13045 0.73 8.84492 1.33401C8.70895 1.63262 8.70215 1.74799 8.70215 3.64823C8.70215 5.55526 8.70895 5.66385 8.85172 5.96924C9.05567 6.41716 9.50437 6.87186 9.95307 7.08903L10.3338 7.27905H12.3393H14.3449L14.7256 7.08903C15.1743 6.87186 15.623 6.41716 15.827 5.96924C15.9698 5.66385 15.9765 5.55526 15.9765 3.64823C15.9765 1.7412 15.9698 1.63262 15.827 1.32722C15.623 0.879304 15.1743 0.424603 14.7256 0.207433L14.3449 0.0174084L12.4753 0.0038352C11.136 -0.00973797 10.5173 0.010622 10.2998 0.071701Z"
                                    fill="#0A0012"
                                />
                                <path
                                    d="M1.59765 8.75871C0.985783 8.92838 0.428306 9.41701 0.142769 10.021C0.00679851 10.3196 0 10.435 0 12.3352C0 14.2423 0.00679851 14.3509 0.149567 14.6563C0.353522 15.1042 0.802224 15.5589 1.25093 15.776L1.63164 15.9661H3.6372H5.64276L6.02348 15.776C6.47218 15.5589 6.92088 15.1042 7.12483 14.6563C7.2676 14.3509 7.2744 14.2423 7.2744 12.3352C7.2744 10.4282 7.2676 10.3196 7.12483 10.0142C6.92088 9.56632 6.47218 9.11162 6.02348 8.89444L5.64276 8.70442L3.77317 8.69085C2.43387 8.67727 1.8152 8.69763 1.59765 8.75871Z"
                                    fill="#0A0012"
                                />
                                <path
                                    d="M11.5579 8.77229C10.1234 9.09126 9.06963 10.15 8.77049 11.5684C8.64812 12.152 8.64812 12.5185 8.77049 13.1021C9.12401 14.7648 10.6469 16 12.3397 16C14.0393 16 15.5554 14.7648 15.9089 13.1021C16.0313 12.5185 16.0313 12.152 15.9089 11.5684C15.4942 9.59347 13.5294 8.33116 11.5579 8.77229ZM13.3459 10.4689C13.747 10.6861 14.0325 10.9779 14.2569 11.4055C14.3861 11.643 14.4133 11.7991 14.4133 12.3352C14.4133 12.9189 14.3929 13.0139 14.2161 13.3397C13.5362 14.5612 11.9522 14.8259 10.8984 13.9029C10.7557 13.7808 10.5517 13.4958 10.4361 13.2718C10.2594 12.9189 10.2322 12.7832 10.2322 12.342C10.2322 11.4733 10.6333 10.8218 11.4083 10.435C11.8026 10.2382 11.8706 10.2246 12.4077 10.245C12.8836 10.2653 13.0468 10.3061 13.3459 10.4689Z"
                                    fill="#0A0012"
                                />
                            </svg>
                        )}
                    </div>
                </div>
            </Container>
            {menuIsOpen && (
                <div className="fixed top-0 h-[100vh] bg-cover bg-[url(/background/mobile-bg.png)] w-full bg-[#0A0012] z-[-1]">
                    <Container>
                        <ul className="flex items-center flex-col text-primary py-16">
                            <li className="py-3 w-full text-center border-b  border-white/10 mt-6">
                                <Link
                                    href="/"
                                    className="text-primary leading-6 md:text-[24px] text-[16px]">
                                    Home
                                </Link>
                            </li>
                            <li className="py-3 w-full text-center border-b  border-white/10">
                                <Link
                                    href="/swap"
                                    className="text-primary leading-6 md:text-[24px] text-[16px]">
                                    Swap
                                </Link>
                            </li>
                            <li className="py-3 w-full text-center border-b  border-white/10">
                                <Link
                                    href="/liquidity"
                                    className="text-primary leading-6 md:text-[24px] text-[16px]">
                                    Liquidity
                                </Link>
                            </li>
                            <li className="py-3 w-full text-center border-b  border-white/10">
                                <Link
                                    href="/nft"
                                    className="text-primary leading-6 md:text-[24px] text-[16px]">
                                    NFTs
                                </Link>
                            </li>
                            <li className="py-3 w-full text-center">
                                <Link
                                    href="/players"
                                    className="text-primary leading-6 md:text-[24px] text-[16px]">
                                    Players
                                </Link>
                            </li>
                        </ul>
                        <div className="mx-auto w-fit flex flex-col justify-center  gap-6">
                            <ConnectButton />
                            <button
                                onClick={toggleMode}
                                className={`relative w-[150px] h-12 flex items-center rounded-full border-2 transition-all ${
                                    isNormalMode
                                        ? 'bg-black border-white text-white'
                                        : 'bg-gray-300 border-gray-300 text-black'
                                }`}>
                                <span
                                    className={`absolute text-2xl left-0 h-full w-12 transition-transform bg-white border-[1px] border-black rounded-full flex items-center justify-center ${
                                        isNormalMode
                                            ? 'translate-x-[98px]'
                                            : 'translate-x-0'
                                    }`}>
                                    {isNormalMode ? '🏦' : '🔥'}
                                </span>
                                <span
                                    className={`w-full text-sm font-bold ${
                                        isNormalMode
                                            ? 'text-left pl-2'
                                            : 'text-right pr-3'
                                    }`}>
                                    {isNormalMode
                                        ? 'Normie Mode'
                                        : 'Degen Mode'}
                                </span>
                            </button>
                        </div>
                    </Container>
                    <div className="block md:hidden">
                        <img
                            className="absolute left-[30px] top-[400px] z-[-1] max-w-[60px]"
                            src="/background/Vector1.png"
                            alt="bg"
                        />
                        <img
                            className="absolute left-[80px] top-[100px] z-[-1] max-w-[15px]"
                            src="/background/Vector2.png"
                            alt="bg"
                        />
                        <img
                            className="absolute right-[30px] top-[100px] z-[-1] max-w-[20px]"
                            src="/background/Vector3.png"
                            alt="bg"
                        />
                        <img
                            className="absolute right-[70px] top-[300px] z-[-1] max-w-[20px]"
                            src="/background/Vector3.png"
                            alt="bg"
                        />
                        <img
                            className="absolute left-[30px] top-[230px] z-[-1] max-w-[20px]"
                            src="/background/Vector4.png"
                            alt="bg"
                        />
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
