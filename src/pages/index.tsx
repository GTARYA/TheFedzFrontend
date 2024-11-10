import type { NextPage } from 'next';
import Head from 'next/head';
import Navbar from '../components/Navbar';
import Link from 'next/link';
import Container from '../components/Container';
import PrimaryBtn from '../components/ui/PrimaryBtn';
import Subtitle from '../components/ui/Subtitle';
import Title from '../components/ui/Title';

const Home: NextPage = () => {
    return (
        <div className="bg-[#0A0012]">
            <Head>
                <title>The Fedz Project</title>
                <meta
                    content="The Fedz - Revolutionary DeFi Platform"
                    name="description"
                />
                <link href="/favicon.ico" rel="icon" />
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Inter+Tight:ital,wght@0,100..900;1,100..900&display=swap"
                    rel="stylesheet"
                />
            </Head>

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

                <Navbar />
                <Container className="z-[5] relative">
                    <section className="max-w-[1050px] mx-auto md:mt-[10px] mt-[56px]">
                        <h1 className="text-primary md:leading-[72px] md:font-extrabold font-bold md:text-[60px] text-center mb-4 leading-[40px] text-[34px]">
                            Bank Run Mitigation{' '}
                            <span
                                data-text="Stable"
                                className="neon-text font-normal">
                                Stable
                            </span>{' '}
                            Coin
                        </h1>
                        <p className="text-primary md:leading-[30px] leading-[24px] font-medium md:text-[20px] text-[16px] text-center max-w-[820px] mx-auto">
                            FUSD is an under-collateralized stablecoin issued by
                            The Fedz - A DeFi stability mechanism designed to
                            ensure the financial stability of
                            under-collateralized assets.
                        </p>
                        <div className="flex items-center gap-4 justify-center py-6">
                            <PrimaryBtn>Join Us Today!</PrimaryBtn>
                            <PrimaryBtn className="bg-transparent border-[1px] border-primary">
                                Learn More
                            </PrimaryBtn>
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
                    className="block md:hidden absolute left-[30px] top-[460px] z-20 max-w-[100px]"
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

            <main>
                <section className="relative overflow-hidden">
                    <Container>
                        <Subtitle className="mx-auto">
                            Strengths of The Fedz
                        </Subtitle>
                        <Title className="text-center pt-1">Key Features</Title>
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
                                    Implement proven mechanisms to mitigate the
                                    risk of panic withdrawals and ensure the
                                    security of users' assets.
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
                                    Modified structures of an AMM designed to
                                    enable issuers to demonstrate their
                                    financial trust, offering enhanced stability
                                    within decentralized markets.
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
                                    A stablecoin backed by undercollateralized
                                    assets, designed to maintain a stable value
                                    while minimizing capital requirements, and
                                    introduced as our first financial product to
                                    demonstrate stability and mitigate bank runs
                                    within The Fedz ecosystem.
                                </p>
                            </div>
                        </div>
                    </Container>
                    <img
                        src="./cursor/2.png"
                        alt="money"
                        className="absolute left-[10px] xl:top-[50%] w-[40px] md:w-[80px] top-[30px]"
                    />
                    <img
                        src="./cursor/1.png"
                        alt="money"
                        className="absolute -right-[15px] md:right-[10px] bottom-[40%] md:-bottom-[50px] w-[50px] md:w-[80px]"
                    />
                </section>

                <Container>
                    <section className="bg-base-100 rounded-lg shadow-md p-8">
                        <h2 className="text-3xl font-bold mb-6 text-center text-blue-600">
                            FedzHook Repository
                        </h2>
                        <div className="overflow-x-auto">
                            <table className="table w-full">
                                <thead>
                                    <tr className="bg-base-100">
                                        <th className="text-left py-2 px-4 text-blue-500">
                                            Item
                                        </th>
                                        <th className="text-left py-2 px-4 text-blue-500">
                                            Description
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td className="py-2 px-4 border-b">
                                            Repository Name
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            TheFedzHook
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4 border-b">
                                            Owner
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            Loris-EPFL
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4 border-b">
                                            Language
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            Solidity
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4 border-b">
                                            Repository Link
                                        </td>
                                        <td className="py-2 px-4 border-b">
                                            <Link
                                                href="https://github.com/FedzHookDev/TheFedzHook"
                                                className="text-blue-500 hover:text-blue-700 font-bold underline"
                                                passHref>
                                                TheFedzHook Repository
                                            </Link>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td className="py-2 px-4">
                                            Description
                                        </td>
                                        <td className="py-2 px-4">
                                            A Uniswap v4 Hook that implements a
                                            gamifiex experienced for Swappers
                                            and LPs, with NFT restricted access
                                            and Turn Based Logic for the pool
                                            actions.
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </Container>
            </main>

            <footer className="footer footer-center p-10 bg-base-100 text-gray-700 rounded-t-lg mt-8">
                <div>
                    <p>Made with ❤️ by Loris from The Fedz Team</p>
                </div>
            </footer>
        </div>
    );
};

export default Home;
