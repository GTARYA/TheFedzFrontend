import type { NextPage } from 'next';
import Navbar from '../components/Navbar';
import Container from '../components/Container';
import PrimaryBtn from '../components/ui/PrimaryBtn';
import Subtitle from '../components/ui/Subtitle';
import Title from '../components/ui/Title';
import Footer from '../components/Footer';
import { useEffect, useState } from 'react';
// import '@fortawesome/fontawesome-free/css/all.css';

// import dynamic from 'next/dynamic'; // For dynamic import of Web3Form
import VideoPlayer from '../components/VideoPlayer';
import VideoPlayerMobile from '../components/VideoPlayerMobile';
import JoinUsForm from '../components/JoinUsForm/JoinUsForm';
import SwapAnimation from '../components/SwapAnimation';

const Home: NextPage = () => {
    const [showForm, setShowForm] = useState(false);
    // const Web3Form = dynamic(() => import('../components/Web3Form.tsx'), {
    //     ssr: false,
    // });

    const onClose = () => {
        setShowForm(false);
    };

    useEffect(() => {
        if (showForm) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'visible';
        }
    }, [showForm]);

    return (
        <>
            {showForm && <JoinUsForm onClose={onClose} isOpen={showForm} />}
            <div className="bg-[#0A0012] relative">
                <Navbar />
                <div className="relative overflow-hidden">
                    <img
                        className="absolute top-0 md:h-full xl:w-full left-1/2 -translate-x-1/2 z-[2] lg:min-w-[1440px] min-w-[1300px]"
                        src="/background/bg.png"
                        alt="bg"
                    />
                    <img
                        className="absolute top-0 md:h-full xl:w-full left-1/2 -translate-x-1/2 z-[3] lg:min-w-[1440px] min-w-[1300px]"
                        src="/background/bg-pool.png"
                        alt="bg"
                    />

                    <Container className="z-[6] relative">
                        <section className="max-w-[1050px] mx-auto md:mt-[10px] mt-[56px]">
                            <h1 className="text-primary md:leading-[72px] md:font-extrabold font-bold md:text-[60px] text-center mb-4 leading-[40px] text-[34px]">
                                FUSD{' '}
                                <span
                                    data-text="Stable"
                                    className="neon-text font-semibold">
                                    Stable
                                </span>{' '}
                                Coin
                            </h1>
                            <p className="text-primary md:leading-[30px] leading-[24px] font-medium md:text-[20px] text-[16px] text-center max-w-[820px] mx-auto">
                                Superior Yield. Robust Stability. Deeper
                                Liquidity
                            </p>
                            <div className="flex items-center gap-4 justify-center py-6">
                                <PrimaryBtn onClick={() => setShowForm(true)}>
                                    Join Us Today!
                                </PrimaryBtn>
                                <a
                                    href="https://the-fedz.gitbook.io/the-fedz"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <PrimaryBtn className="bg-transparent border-[1px] border-primary hover:!bg-transparent">
                                        Learn More
                                    </PrimaryBtn>
                                </a>
                            </div>
                            <div className="flex items-center justify-center gap-10 md:mt-0 mt-[120px]">
                                <img
                                    src="/background/pony-left.png"
                                    alt="pony"
                                    className="hidden md:block"
                                />
                                <img
                                    src="./people.png"
                                    alt="people"
                                    className="md:max-w-[850px] mx-auto max-w-[500px]"
                                />
                                <img
                                    src="/background/pony-right.png"
                                    alt="pony"
                                    className="hidden md:block"
                                />
                            </div>
                        </section>
                    </Container>
                    <img
                        className="absolute md:bottom-[10px] bottom-[30px] translate-y-1/2 w-full left-1/2 -translate-x-1/2 z-[4] max-h-[240px]"
                        src="/background/hero-bottom.png"
                        alt="bg"
                    />
                    <img
                        className="block md:hidden absolute left-[30px] top-[460px] z-[4] max-w-[100px]"
                        src="/background/pony-left.png"
                        alt="bg"
                    />

                    <div className="block md:hidden">
                        <img
                            className="absolute left-[30px] top-[400px] z-[4] max-w-[60px]"
                            src="/background/Vector1.png"
                            alt="bg"
                        />
                        <img
                            className="absolute left-[30px] top-[100px] z-[4] max-w-[15px]"
                            src="/background/Vector2.png"
                            alt="bg"
                        />
                        <img
                            className="absolute right-[30px] top-[100px] z-[4] max-w-[20px]"
                            src="/background/Vector3.png"
                            alt="bg"
                        />
                        <img
                            className="absolute right-[70px] top-[300px] z-[4] max-w-[20px]"
                            src="/background/Vector3.png"
                            alt="bg"
                        />
                        <img
                            className="absolute left-[30px] top-[230px] z-[4] max-w-[20px]"
                            src="/background/Vector4.png"
                            alt="bg"
                        />
                    </div>
                </div>

                <div className="bg-gradient-to-b from-[#140025] to-[#0A0012] h-14"></div>

                <section className="relative">
                    <Container className="!max-w-full !p-0">
                        <div className="bg-gradient-to-b from-[#0A0012] to-[#000000]">
                            <Subtitle className="mx-auto relative z-[10]">
                                FUSD is Issued By
                            </Subtitle>
                            <Title className="text-center pt-1 relative z-[10]">
                                The Fedz
                            </Title>
                        </div>

                        <SwapAnimation />
                        <div className="bg-gradient-to-b from-[#000000] to-[#0A0012] h-[50px] md:h-[100px]"></div>
                    </Container>
                    <img
                        src="/cursor/5.png"
                        alt="eppilse"
                        className="absolute bottom-[92%] md:bottom-[60%] left-0 md:left-[40px] max-w-[50px] md:max-w-[80px]"
                    />
                    <img
                        src="/cursor/7.png"
                        alt="eppilse"
                        className="absolute bottom-[10%] md:bottom-[50%] right-[60px] max-w-[50px] md:max-w-[80px]"
                    />
                    <img
                        src="/cursor/6.png"
                        alt="eppilse"
                        className="absolute hidden lg:block top-0 md:top-10 right-[40px] max-w-[50px] md:max-w-[80px]"
                    />
                </section>
                <main className="relative z-[10]">
                    <section
                        className="relative overflow-hidden md:pb-[75px] pb-[50px]"
                        id="features">
                        <Container>
                            <Subtitle className="mx-auto">
                                Strengths of The Fedz
                            </Subtitle>
                            <Title className="text-center pt-1">
                                Key Features
                            </Title>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10">
                                <div className="bg-white/10 rounded-[24px] p-5 md:p-6 text-primary">
                                    <div className="p-5 w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] flex items-center justify-center bg-[#9370DB1A] rounded-full mb-6">
                                        <svg
                                            width="50"
                                            height="56"
                                            viewBox="0 0 50 56"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M25 0L0 13.3333V18.6667H50V13.3333M36.8421 24V42.6667H44.7368V24M0 56H50V48H0M21.0526 24V42.6667H28.9474V24M5.26316 24V42.6667H13.1579V24H5.26316Z"
                                                fill="#9370DB"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-xl sm:text-2xl">
                                        Preventing Bank Runs
                                    </h3>
                                    <p className="pt-2 text-sm md:text-base md:leading-6">
                                        Implement proven mechanisms to mitigate
                                        the risk of panic withdrawals and ensure
                                        the security of users' assets.
                                    </p>
                                </div>
                                <div className="bg-white/10 rounded-[24px] p-5 md:p-6 text-primary">
                                    <div className="p-5 w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] flex items-center justify-center bg-[#9370DB1A] rounded-full mb-6">
                                        <svg
                                            width="38"
                                            height="49"
                                            viewBox="0 0 38 49"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M19 37.3333C20.2598 37.3333 21.468 36.8417 22.3588 35.9665C23.2496 35.0913 23.75 33.9043 23.75 32.6667C23.75 31.429 23.2496 30.242 22.3588 29.3668C21.468 28.4917 20.2598 28 19 28C17.7402 28 16.532 28.4917 15.6412 29.3668C14.7504 30.242 14.25 31.429 14.25 32.6667C14.25 33.9043 14.7504 35.0913 15.6412 35.9665C16.532 36.8417 17.7402 37.3333 19 37.3333ZM33.25 16.3333C34.5098 16.3333 35.718 16.825 36.6088 17.7002C37.4996 18.5753 38 19.7623 38 21V44.3333C38 45.571 37.4996 46.758 36.6088 47.6332C35.718 48.5083 34.5098 49 33.25 49H4.75C3.49022 49 2.28204 48.5083 1.39124 47.6332C0.500445 46.758 0 45.571 0 44.3333V21C0 19.7623 0.500445 18.5753 1.39124 17.7002C2.28204 16.825 3.49022 16.3333 4.75 16.3333H7.125V11.6667C7.125 8.57247 8.37611 5.60501 10.6031 3.41709C12.8301 1.22916 15.8506 0 19 0C20.5594 0 22.1036 0.301767 23.5444 0.888072C24.9851 1.47438 26.2942 2.33374 27.3969 3.41709C28.4996 4.50044 29.3743 5.78656 29.9711 7.20203C30.5678 8.61749 30.875 10.1346 30.875 11.6667V16.3333H33.25ZM19 4.66667C17.1103 4.66667 15.2981 5.40416 13.9619 6.71692C12.6257 8.02967 11.875 9.81015 11.875 11.6667V16.3333H26.125V11.6667C26.125 9.81015 25.3743 8.02967 24.0381 6.71692C22.7019 5.40416 20.8897 4.66667 19 4.66667Z"
                                                fill="#9370DB"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-xl sm:text-2xl">
                                        Private Liquidity Pools (PLP)
                                    </h3>
                                    <p className="pt-2 text-sm md:text-base md:leading-6">
                                        Modified structures of an AMM designed
                                        to enable issuers to demonstrate their
                                        financial trust, offering enhanced
                                        stability within decentralized markets.
                                    </p>
                                </div>
                                <div className="bg-white/10 rounded-[24px] p-5 md:p-6 text-primary">
                                    <div className="p-5 w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] flex items-center justify-center bg-[#9370DB1A] rounded-full mb-6">
                                        <svg
                                            width="50"
                                            height="50"
                                            viewBox="0 0 50 50"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M0 50V0H5.55556V44.4444H50V50H0ZM8.33333 41.6667V16.6667H19.4444V41.6667H8.33333ZM22.2222 41.6667V2.77778H33.3333V41.6667H22.2222ZM36.1111 41.6667V27.7778H47.2222V41.6667H36.1111Z"
                                                fill="#9370DB"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="font-semibold text-xl sm:text-2xl">
                                        FUSD
                                    </h3>
                                    <p className="pt-2 text-sm md:text-base md:leading-6">
                                        A stablecoin backed by
                                        undercollateralized assets designed to
                                        maintain a stable value while minimizing
                                        capital requirements, and introduced as
                                        our first financial product to
                                        demonstrate stability and mitigate bank
                                        runs within The Fedz ecosystem.
                                    </p>
                                </div>
                            </div>
                        </Container>
                        <img
                            src="./cursor/2.png"
                            alt="money"
                            className="absolute left-[10px] xl:top-[40%] w-[40px] md:w-[80px] top-[30px]"
                        />
                        <img
                            src="./cursor/1.png"
                            alt="money"
                            className="absolute -right-[15px] md:right-[10px] bottom-[40%] md:bottom-0 w-[50px] md:w-[80px]"
                        />
                    </section>

                    <section className="py-[50px] md:py-[75px]">
                        <Container>
                            <div className="overflow-hidden flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-0 justify-between min-h-[435px] px-6 lg:px-[90px] border-[1px] border-white/20 rounded-[32px] bg-[#04152F78] relative">
                                <div
                                    id="about-us"
                                    className="max-w-[410px] self-center relative z-[5] mt-6 md:mt-0">
                                    <Subtitle className="mb-1">
                                        About us
                                    </Subtitle>
                                    <Title>Our Mission</Title>
                                    <p className="pt-4 pb-6 text-sm sm:text-base text-primary/80">
                                        Our mission is to enable the broader
                                        adoption of cryptocurrency by pioneering
                                        a modern fractional reserve financial
                                        mechanism.
                                        <br />
                                        We aim to mitigate bank runs and ensure
                                        the stability of FUSD with minimal
                                        capital requirements, setting a new
                                        standard for financial efficiency and
                                        resilience.
                                    </p>
                                    <PrimaryBtn
                                        onClick={() =>
                                            (window.location.href =
                                                'https://Blog.TheFedz.org')
                                        }>
                                        Read More
                                    </PrimaryBtn>
                                </div>
                                <div className="relative z-[5]">
                                    <img
                                        src="/money-printer.png"
                                        className="max-w-[300px] sm:max-w-[360px] lg:max-w-[420px] self-end"
                                        alt="printer"
                                    />
                                </div>

                                <img
                                    src="/blue-glare1.png"
                                    alt="eppilse"
                                    className="absolute bottom-0 right-0 h-full pointer-events-none"
                                />
                                <img
                                    src="/blue-glare2.png"
                                    alt="eppilse"
                                    className="absolute top-0 left-0 pointer-events-none"
                                />

                                <img
                                    src="/cursor/8.png"
                                    alt="eppilse"
                                    className="absolute top-[40%] md:top-[60px] right-[40px] md:right-[60%] max-w-[53px]"
                                />
                                <img
                                    src="/cursor/8.png"
                                    alt="eppilse"
                                    className="absolute bottom-[100px] md:bottom-[40px] right-[10px] md:right-[50%] max-w-[53px]"
                                />
                            </div>
                        </Container>
                    </section>

                    <section className="py-[50px] md:py-[75px] relative">
                        <Container>
                            <div className="flex items-center gap-14 justify-between text-primary relative z-[5]">
                                <VideoPlayer />
                                <div id="how-it-works">
                                    <Subtitle className="mb-1 mx-auto lg:mx-0">
                                        How It Works
                                    </Subtitle>
                                    <Title className="text-center lg:text-left">
                                        Exclusive Access, Stake Collateral, Earn
                                        Profits
                                    </Title>
                                    <p className="py-4 text-sm sm:text-base lg:max-w-[90%] text-center lg:text-left">
                                        Profit while helping secure long-term
                                        financial stability in The Fedz
                                        ecosystem.
                                    </p>

                                    <VideoPlayerMobile />

                                    <ul className="flex flex-col gap-4 mb-6 order-4">
                                        <li className="flex gap-[14px]">
                                            <div className="w-8 h-8 p-2 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#D4C3F7] shrink-0">
                                                <svg
                                                    width="20"
                                                    height="21"
                                                    viewBox="0 0 20 21"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <g>
                                                        <path
                                                            d="M5.43375 13.5934C5.1562 13.3046 4.67018 13.2687 4.35295 13.5096L4.34462 13.5042L3.6267 14.2221C3.46929 14.379 3.38298 14.5884 3.38298 14.811C3.37351 15.2594 3.76827 15.6533 4.21614 15.6442C4.47687 15.6484 4.70907 15.5181 4.87913 15.3264L5.43375 14.7718C5.54997 14.6556 5.62794 14.5109 5.66031 14.3535C5.71842 14.0813 5.6325 13.7893 5.43375 13.5934Z"
                                                            fill="#6A0DAD"
                                                        />
                                                        <path
                                                            d="M3.43718 11.1528C3.1122 10.8278 2.58416 10.8281 2.25879 11.1528C2.18318 11.2288 1.71692 11.6948 1.63061 11.7815C0.881164 12.5948 1.99472 13.7088 2.80851 12.9599C2.80851 12.9599 3.35372 12.4146 3.43718 12.3312C3.76235 12.0066 3.76235 11.4779 3.43718 11.1528Z"
                                                            fill="#6A0DAD"
                                                        />
                                                        <path
                                                            d="M7.13809 15.4936C6.91546 15.4936 6.70607 15.5804 6.54865 15.7379L5.91999 16.3665C5.91704 16.3695 5.9141 16.3724 5.91116 16.3758C5.59614 16.6871 5.60085 17.2382 5.91999 17.5449C6.24511 17.8695 6.77374 17.8695 7.09837 17.5449L7.72753 16.9157C8.24861 16.396 7.87406 15.4908 7.13809 15.4936Z"
                                                            fill="#6A0DAD"
                                                        />
                                                        <path
                                                            d="M12.7289 6.24558C11.4427 7.05667 9.718 6.90269 8.59846 5.78315L7.14105 4.32623L8.95987 2.5074C7.00634 0.315154 3.57122 0.176082 1.49181 2.26962C-0.598884 4.34609 -0.464863 7.77714 1.72278 9.73126C3.31593 8.84082 5.27505 10.0845 5.14613 11.8987C6.20104 12.0128 7.09412 12.9689 7.14247 14.0241C8.13446 14.0028 9.11983 14.7458 9.36144 15.7257C10.1873 15.5043 11.1129 15.7785 11.6785 16.4328L11.6952 16.4132C12.5151 16.9055 13.3826 15.8943 12.7642 15.1578L12.7657 15.1559C12.7529 15.1436 9.45413 11.8448 9.45413 11.8448C9.71334 11.5856 10.2351 11.0639 10.4942 10.8047L13.768 14.0785C14.5813 14.8278 15.6956 13.7135 14.9459 12.9001L11.6726 9.62632C11.9318 9.3671 12.4535 8.84538 12.7127 8.58622C13.4485 9.32194 15.2335 11.107 15.9865 11.86C16.2965 12.183 16.8548 12.1828 17.1649 11.86C17.4895 11.5349 17.4895 11.0062 17.1649 10.6816L12.7289 6.24558Z"
                                                            fill="#6A0DAD"
                                                        />
                                                        <path
                                                            d="M18.508 2.26957C16.5146 0.27666 13.2712 0.27666 11.2778 2.26957C10.8903 2.65741 9.58775 3.96021 9.22168 4.32623L9.6385 4.74305C10.3633 5.46783 11.5422 5.46783 12.2665 4.74305L12.7868 4.22276C13.0634 4.50242 18.1412 9.57159 18.2839 9.72434C20.4663 7.76949 20.5956 4.34334 18.508 2.26957Z"
                                                            fill="#6A0DAD"
                                                        />
                                                        <path
                                                            d="M10.5369 17.365C10.2118 17.0403 9.68352 17.0399 9.35855 17.365L8.72988 17.9936C8.40637 18.3038 8.40652 18.8619 8.72988 19.172C9.04044 19.4948 9.5979 19.4946 9.90826 19.172L10.5369 18.5434C10.8597 18.2336 10.8597 17.674 10.5369 17.365Z"
                                                            fill="#6A0DAD"
                                                        />
                                                    </g>
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-base sm:text-xl mb-[10px] font-semibold">
                                                    Grant exclusive access to
                                                    the Private Liquidity Pool
                                                </h4>
                                                <p className="text-sm sm:text-base opacity-80">
                                                    Owning a Fedz NFT grants
                                                    exclusive access to the
                                                    Private Liquidity Pool,
                                                    allowing you to engage in
                                                    profitable activities like
                                                    arbitrage and liquidity
                                                    provision within the game.
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex gap-[14px]">
                                            <div className="w-8 h-8 p-2 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#D4C3F7] shrink-0">
                                                <svg
                                                    width="20"
                                                    height="21"
                                                    viewBox="0 0 20 21"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M10.0003 5.19865C10.8057 5.19865 11.4587 4.54573 11.4587 3.74032C11.4587 2.9349 10.8057 2.28198 10.0003 2.28198C9.19491 2.28198 8.54199 2.9349 8.54199 3.74032C8.54199 4.54573 9.19491 5.19865 10.0003 5.19865Z"
                                                        fill="#6A0DAD"
                                                    />
                                                    <path
                                                        d="M17.5003 7.69865C18.3057 7.69865 18.9587 7.04573 18.9587 6.24032C18.9587 5.4349 18.3057 4.78198 17.5003 4.78198C16.6949 4.78198 16.042 5.4349 16.042 6.24032C16.042 7.04573 16.6949 7.69865 17.5003 7.69865Z"
                                                        fill="#6A0DAD"
                                                    />
                                                    <path
                                                        d="M2.50033 7.69865C3.30574 7.69865 3.95866 7.04573 3.95866 6.24032C3.95866 5.4349 3.30574 4.78198 2.50033 4.78198C1.69491 4.78198 1.04199 5.4349 1.04199 6.24032C1.04199 7.04573 1.69491 7.69865 2.50033 7.69865Z"
                                                        fill="#6A0DAD"
                                                    />
                                                    <path
                                                        d="M17.696 7.19615C17.7493 6.93115 17.626 6.66281 17.3918 6.52948C17.1568 6.39698 16.8626 6.42948 16.6626 6.61115C16.6626 6.61115 15.791 7.40365 14.8076 8.29781C14.3476 8.71615 13.7101 8.87865 13.106 8.73281C12.5018 8.58698 12.0093 8.15115 11.791 7.56865L10.5851 4.35448C10.4935 4.11031 10.261 3.94865 10.0001 3.94865C9.7393 3.94865 9.5068 4.11031 9.41514 4.35448L8.2093 7.56865C7.99097 8.15115 7.49847 8.58698 6.8943 8.73281C6.29014 8.87865 5.65264 8.71615 5.19264 8.29781C4.2093 7.40365 3.33764 6.61115 3.33764 6.61115C3.13764 6.42948 2.84347 6.39698 2.60847 6.52948C2.3743 6.66281 2.25097 6.93115 2.3043 7.19615C2.3043 7.19615 3.2318 11.8336 3.70264 14.1895C3.9168 15.2611 4.85764 16.032 5.95014 16.032H14.0501C15.1426 16.032 16.0835 15.2611 16.2976 14.1895C16.7685 11.8336 17.696 7.19615 17.696 7.19615Z"
                                                        fill="#6A0DAD"
                                                    />
                                                    <path
                                                        d="M15 17.282H5C4.655 17.282 4.375 17.562 4.375 17.907C4.375 18.252 4.655 18.532 5 18.532H15C15.345 18.532 15.625 18.252 15.625 17.907C15.625 17.562 15.345 17.282 15 17.282Z"
                                                        fill="#6A0DAD"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-base sm:text-xl mb-[10px] font-semibold">
                                                    Swap to Stabilize and Share
                                                    Access
                                                </h4>
                                                <p className="text-sm sm:text-base opacity-80">
                                                    Take your turn in the
                                                    Private Liquidity Pool and
                                                    perform key actions like
                                                    asset swaps to reinforce the
                                                    system's stability.
                                                    Participation fuels a
                                                    balanced ecosystem while
                                                    unlocking tangible rewards
                                                    and exclusive privileges.
                                                </p>
                                            </div>
                                        </li>
                                        <li className="flex gap-[14px]">
                                            <div className="w-8 h-8 p-2 md:w-10 md:h-10 flex items-center justify-center rounded-full bg-[#D4C3F7] shrink-0">
                                                <svg
                                                    width="18"
                                                    height="19"
                                                    viewBox="0 0 18 19"
                                                    fill="none"
                                                    xmlns="http://www.w3.org/2000/svg">
                                                    <path
                                                        d="M8.298 0.121661C8.75062 -0.0405537 9.24938 -0.0405537 9.702 0.121661L16.702 2.63139C17.0833 2.76804 17.4119 3.01272 17.6438 3.33273C17.8758 3.65273 18.0001 4.0328 18 4.42213V9.54962C18 11.1476 17.5346 12.7141 16.6559 14.0735C15.7772 15.4329 14.52 16.5314 13.025 17.2461L9.671 18.8485C9.46267 18.9481 9.23294 19 9 19C8.76706 19 8.53733 18.9481 8.329 18.8485L4.975 17.2452C3.48004 16.5305 2.22277 15.4319 1.34407 14.0725C0.465371 12.7132 -3.5657e-05 11.1467 3.90162e-07 9.54867V4.42309C-0.00025401 4.03359 0.123906 3.65331 0.355868 3.33312C0.587831 3.01293 0.916534 2.7681 1.298 2.63139L8.298 0.121661ZM10 9.23985C10.3813 9.02937 10.6792 8.7045 10.8477 8.31562C11.0162 7.92673 11.0457 7.49557 10.9318 7.089C10.8178 6.68242 10.5667 6.32315 10.2175 6.0669C9.8682 5.81066 9.44025 5.67176 9 5.67174C8.55975 5.67176 8.1318 5.81066 7.78253 6.0669C7.43326 6.32315 7.18219 6.68242 7.06824 7.089C6.95429 7.49557 6.98384 7.92673 7.15231 8.31562C7.32078 8.7045 7.61874 9.02937 8 9.23985V12.3643C8 12.6179 8.10536 12.8611 8.29289 13.0404C8.48043 13.2197 8.73478 13.3204 9 13.3204C9.26522 13.3204 9.51957 13.2197 9.70711 13.0404C9.89464 12.8611 10 12.6179 10 12.3643V9.23985Z"
                                                        fill="#6A0DAD"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="text-base sm:text-xl mb-[10px] font-semibold">
                                                    Earn Profits While Securing
                                                    Financial Stability
                                                </h4>
                                                <p className="text-sm sm:text-base opacity-80">
                                                    By making strategic choices
                                                    and participating actively,
                                                    you can earn profits while
                                                    helping to secure the
                                                    system's long-term financial
                                                    stability, contributing to a
                                                    balanced and robust game
                                                    economy.
                                                </p>
                                            </div>
                                        </li>
                                    </ul>
                                    <PrimaryBtn
                                        onClick={() =>
                                            (window.location.href =
                                                'https://Blog.TheFedz.org')
                                        }>
                                        Read More
                                    </PrimaryBtn>
                                </div>
                            </div>
                        </Container>

                        <img
                            src="/cursor/5.png"
                            alt="eppilse"
                            className="absolute bottom-[35%] md:bottom-5 left-0 md:left-[40px] max-w-[50px] md:max-w-[80px]"
                        />
                        <img
                            src="/cursor/7.png"
                            alt="eppilse"
                            className="absolute bottom-5 right-[60px] max-w-[50px] md:max-w-[80px]"
                        />
                        <img
                            src="/cursor/6.png"
                            alt="eppilse"
                            className="absolute top-0 md:top-10 right-[40px] max-w-[50px] md:max-w-[80px]"
                        />
                    </section>

                    <section className="relative py-[50px] md:py-[75px] bg-gradient-to-b from-[#0A0012] to-[#0A0012] via-[#04152F78]">
                        <Container className="relative z-[5]">
                            <div className="relative z-[5]">
                                <Subtitle className="mb-1">
                                    Build with Confidence
                                </Subtitle>
                                <Title>FedzHook Repository</Title>
                            </div>
                            <div className="mt-8 md:mt-10 flex flex-col items-center lg:items-stretch lg:flex-row gap-[30px] justify-between relative z-[5]">
                                <div className="relative overflow-hidden rounded-[32px] border-[1px] border-white/20 bg-white/5 w-full pb-[42px] pt-5">
                                    <table className="table w-full text-sm md:text-xl text-primary">
                                        <thead>
                                            <tr>
                                                <th className="text-base md:text-xl px-8 text-primary font-bold border-b border-white/10">
                                                    Item
                                                </th>
                                                <th className="text-base md:text-xl px-8 text-primary font-bold border-b border-white/10">
                                                    Description
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td className="py-4 px-8 border-b border-white/10 w-[130px] md:w-[225px]">
                                                    Repository Name
                                                </td>
                                                <td className="py-4 px-8 border-b border-white/10">
                                                    TheFedzHook
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-4 px-8 border-b border-white/10">
                                                    Owner
                                                </td>
                                                <td className="py-4 px-8 border-b border-white/10">
                                                    Loris-EPFL
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-4 px-8 border-b border-white/10">
                                                    Language
                                                </td>
                                                <td className="py-4 px-8 border-b border-white/10">
                                                    Solidity
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="py-4 px-8 border-b border-white/10">
                                                    Repository Link
                                                </td>
                                                <td className="py-4 px-8 border-b border-white/10">
                                                    TheFedzHook Repository
                                                </td>
                                            </tr>
                                            <tr>
                                                <td className="pt-4 px-8 align-top">
                                                    Description
                                                </td>
                                                <td className="pt-4 px-8">
                                                    A Uniswap v4 Hook that
                                                    implements a gamified
                                                    experienced for Swappers and
                                                    LPs, with NFT-restricted
                                                    access and Turn Based Logic
                                                    for the pool actions.
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>

                                    <img
                                        src="/clouds-gray.png"
                                        alt="clouds"
                                        className="absolute w-full sm:w-2/3 bottom-0 left-0 pointer-events-none"
                                    />
                                </div>
                                <div className="relative z-[5] overflow-hidden rounded-[32px] flex items-end border-[1px] border-white/20 bg-white/5 max-w-[476px]">
                                    <img
                                        src="/money-printer2.png"
                                        alt="printer"
                                        className="w-full"
                                    />
                                    <img
                                        src="/clouds-white.png"
                                        alt="clouds"
                                        className="absolute w-full bottom-0 left-0"
                                    />
                                </div>
                            </div>
                        </Container>
                        <img
                            src="/blue-glare3.png"
                            alt="glare"
                            className="absolute w-full -top-[10%] md:-top-[30%] left-0 max-w-[500px] md:max-w-[700px] pointer-events-none"
                        />
                        <img
                            src="/blue-glare4.png"
                            alt="glare"
                            className="absolute w-full -bottom-[10%] md:-bottom-[30%] right-0 max-w-[500px] md:max-w-[700px] pointer-events-none"
                        />

                        <img
                            src="/cursor/9.png"
                            alt="coin"
                            className="absolute w-full bottom-[95%] md:bottom-0 left-[80%] md:left-[100px] max-w-[60px] md:max-w-[80px] pointer-events-none"
                        />
                        <img
                            src="/cursor/10.png"
                            alt="money"
                            className="absolute w-full bottom-0 right-0 md:right-[100px] max-w-[60px] md:max-w-[80px] pointer-events-none"
                        />
                    </section>
                </main>

                <Footer />
            </div>
        </>
    );
};

export default Home;
