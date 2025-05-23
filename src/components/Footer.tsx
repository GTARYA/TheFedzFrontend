import Link from 'next/link';
import Container from './Container';

const Footer = () => {
    return (
        <footer className="pt-[50px] md:pt-[75px] text-primary text-sm md:text-base relative z-[10]">
            <Container>
                <div className="flex flex-col md:flex-row justify-between gap-[52px]">
                    <div className="max-w-full md:max-w-[300px] lg:max-w-[375px] w-full">
                        <Link href="/">
                            <img
                                src="./logo.png"
                                alt="logo"
                                className="max-w-[164px] md:mx-0 mx-auto"
                            />
                        </Link>
                        <p className="mt-4 text-center md:text-left">
                            Join our community and stay updated on the latest
                            developments in financial stability, blockchain
                            technology, and the future of decentralized finance.
                        </p>
                        <div className="mt-10 flex flex-col gap-3 items-center md:items-start">
                            <h3 className="font-semibold">Follow Us</h3>
                            <ul className="flex items-center gap-4">
                                <a
                                    href="https://www.linkedin.com/company/the-fedz/"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <li className="cursor-pointer hover:opacity-85 p-1 w-9 h-9 bg-transparent border-[1px] border-[#4A88ED] rounded-full flex items-center justify-center">
                                        <svg
                                            width="21"
                                            height="21"
                                            viewBox="0 0 21 21"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <path
                                                d="M6.50975 4.29392C6.50953 4.73811 6.33287 5.16401 6.01863 5.47794C5.70438 5.79187 5.2783 5.96811 4.83412 5.96788C4.38993 5.96766 3.96403 5.791 3.6501 5.47675C3.33617 5.16251 3.15993 4.73643 3.16016 4.29225C3.16038 3.84806 3.33704 3.42216 3.65129 3.10823C3.96553 2.7943 4.39161 2.61806 4.83579 2.61829C5.27998 2.61851 5.70588 2.79517 6.01981 3.10942C6.33374 3.42366 6.50998 3.84974 6.50975 4.29392ZM6.56 7.20807H3.2104V17.6923H6.56V7.20807ZM11.8524 7.20807H8.51951V17.6923H11.8189V12.1906C11.8189 9.12572 15.8133 8.841 15.8133 12.1906V17.6923H19.121V11.0517C19.121 5.88498 13.209 6.07758 11.8189 8.6149L11.8524 7.20807Z"
                                                fill="#4A88ED"
                                            />
                                        </svg>
                                    </li>
                                </a>
                                {/* <a href="https://x.com/TheFedzNFT" target="_blank" rel="noopener noreferrer">
                                <li className="cursor-pointer hover:opacity-85 p-1 w-9 h-9 bg-transparent border-[1px] border-[#4A88ED] rounded-full flex items-center justify-center">
                                    <svg
                                        width="21"
                                        height="21"
                                        viewBox="0 0 21 21"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M11.498 1.78216C12.1091 1.77981 12.7202 1.78595 13.3311 1.80058L13.4935 1.80644C13.6811 1.81314 13.8662 1.82152 14.0898 1.83156C14.9808 1.87343 15.5887 2.01412 16.1221 2.22096C16.6748 2.43366 17.1404 2.72172 17.606 3.18731C18.0317 3.60568 18.3612 4.11176 18.5715 4.67035C18.7784 5.20377 18.9191 5.81256 18.9609 6.70355C18.971 6.9263 18.9793 7.11221 18.986 7.29978L18.9911 7.46224C19.006 8.07286 19.0124 8.68367 19.0103 9.29447L19.0112 9.91917V11.0162C19.0132 11.6272 19.0068 12.2383 18.9919 12.8492L18.9869 13.0117C18.9802 13.1993 18.9718 13.3843 18.9618 13.6079C18.9199 14.4989 18.7775 15.1069 18.5715 15.6403C18.3619 16.1995 18.0323 16.706 17.606 17.1242C17.1873 17.5498 16.6809 17.8793 16.1221 18.0897C15.5887 18.2965 14.9808 18.4372 14.0898 18.4791C13.8662 18.4891 13.6811 18.4975 13.4935 18.5042L13.3311 18.5092C12.7202 18.5241 12.1091 18.5305 11.498 18.5285L10.8733 18.5293H9.77716C9.16608 18.5314 8.555 18.525 7.9441 18.51L7.78164 18.505C7.58285 18.4978 7.3841 18.4894 7.18541 18.4799C6.29442 18.438 5.68647 18.2957 5.15221 18.0897C4.5934 17.8798 4.08723 17.5502 3.66917 17.1242C3.24297 16.7057 2.91319 16.1993 2.70281 15.6403C2.49598 15.1069 2.35529 14.4989 2.31342 13.6079C2.3041 13.4092 2.29572 13.2105 2.2883 13.0117L2.28411 12.8492C2.26867 12.2383 2.2617 11.6273 2.26318 11.0162V9.29447C2.26084 8.68367 2.26698 8.07287 2.2816 7.46224L2.28746 7.29978C2.29416 7.11221 2.30254 6.9263 2.31259 6.70355C2.35446 5.81172 2.49514 5.20461 2.70198 4.67035C2.91248 4.11149 3.24291 3.60555 3.67001 3.18815C4.08778 2.76171 4.59363 2.43162 5.15221 2.22096C5.68647 2.01412 6.29358 1.87343 7.18541 1.83156L7.78164 1.80644L7.9441 1.80226C8.55471 1.78683 9.16552 1.77985 9.77633 1.78132L11.498 1.78216ZM10.6372 5.96916C10.0824 5.96131 9.5316 6.0638 9.01679 6.27068C8.50197 6.47755 8.0334 6.78468 7.63832 7.17422C7.24323 7.56376 6.9295 8.02793 6.71537 8.53977C6.50124 9.05161 6.39096 9.60091 6.39096 10.1557C6.39096 10.7106 6.50124 11.2599 6.71537 11.7717C6.9295 12.2835 7.24323 12.7477 7.63832 13.1372C8.0334 13.5268 8.50197 13.8339 9.01679 14.0408C9.5316 14.2477 10.0824 14.3502 10.6372 14.3423C11.7476 14.3423 12.8126 13.9012 13.5978 13.116C14.383 12.3308 14.8242 11.2658 14.8242 10.1553C14.8242 9.04486 14.383 7.97988 13.5978 7.19466C12.8126 6.40945 11.7476 5.96916 10.6372 5.96916ZM10.6372 7.64395C10.9709 7.63781 11.3025 7.69822 11.6126 7.82166C11.9227 7.9451 12.2051 8.1291 12.4433 8.3629C12.6815 8.5967 12.8707 8.87563 12.9998 9.18338C13.129 9.49113 13.1956 9.82154 13.1957 10.1553C13.1957 10.4891 13.1293 10.8195 13.0002 11.1273C12.8711 11.4351 12.682 11.7141 12.4439 11.948C12.2057 12.1819 11.9234 12.3659 11.6134 12.4895C11.3033 12.613 10.9717 12.6736 10.638 12.6675C9.97174 12.6675 9.33275 12.4028 8.86162 11.9317C8.39049 11.4606 8.12581 10.8216 8.12581 10.1553C8.12581 9.48904 8.39049 8.85005 8.86162 8.37892C9.33275 7.90779 9.97174 7.64312 10.638 7.64312L10.6372 7.64395ZM15.0335 4.71306C14.7634 4.72387 14.5079 4.83879 14.3206 5.03376C14.1332 5.22872 14.0286 5.4886 14.0286 5.75897C14.0286 6.02934 14.1332 6.28922 14.3206 6.48418C14.5079 6.67914 14.7634 6.79407 15.0335 6.80488C15.3111 6.80488 15.5774 6.6946 15.7737 6.49829C15.97 6.30199 16.0803 6.03575 16.0803 5.75813C16.0803 5.48052 15.97 5.21427 15.7737 5.01797C15.5774 4.82166 15.3111 4.71138 15.0335 4.71138V4.71306Z"
                                            fill="#4A88ED"
                                        />
                                    </svg>
                                </li>
                    </a> */}
                                {/* <a href="https://x.com/TheFedzNFT" target="_blank" rel="noopener noreferrer">
                                <li className="cursor-pointer hover:opacity-85 p-1 w-9 h-9 bg-transparent border-[1px] border-[#4A88ED] rounded-full flex items-center justify-center">
                                    <svg
                                        width="21"
                                        height="21"
                                        viewBox="0 0 21 21"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M12.1958 11.4112H14.2893L15.1267 8.06162H12.1958V6.38683C12.1958 5.5243 12.1958 4.71203 13.8706 4.71203H15.1267V1.89836C14.8537 1.86236 13.8228 1.78113 12.7342 1.78113C10.4607 1.78113 8.84618 3.1687 8.84618 5.71691V8.06162H6.33398V11.4112H8.84618V18.5291H12.1958V11.4112Z"
                                            fill="#4A88ED"
                                        />
                                    </svg>
                                </li>
                                </a> */}
                                <a
                                    href="https://x.com/TheFedzNFT"
                                    target="_blank"
                                    rel="noopener noreferrer">
                                    <li className="cursor-pointer hover:opacity-85 p-1 w-9 h-9 bg-transparent border-[1px] border-[#4A88ED] rounded-full flex items-center justify-center">
                                        <svg
                                            width="21"
                                            height="21"
                                            viewBox="0 0 21 21"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg">
                                            <g>
                                                <path
                                                    d="M16.1892 1.04773H19.2716L12.5389 8.76269L20.4599 19.2612H14.2585L9.4012 12.8927L3.84296 19.2612H0.759232L7.96045 11.0086L0.362305 1.04773H6.72194L11.112 6.86724L16.1892 1.04773ZM15.1089 17.4122H16.8172L5.79242 2.79999H3.96103L15.1089 17.4122Z"
                                                    fill="#4A88ED"
                                                />
                                            </g>
                                        </svg>
                                    </li>
                                </a>
                            </ul>
                        </div>
                    </div>
                    <div className="flex gap-8 flex-wrap justify-center md:justify-start">
                        <div>
                            <h2 className="font-semibold mb-4">Company</h2>
                            <div className="flex flex-col gap-3">
                                <Link href="/">Home</Link>
                                <Link href="/#about-us">About Us</Link>
                                <Link href="/#how-it-works">How It Works</Link>
                                <Link href="/#features">Features</Link>
                            </div>
                        </div>
                        <div>
                            <h2 className="font-semibold mb-4">Information</h2>
                            <div className="flex flex-col gap-3">
                                <a
                                    href="https://blog.thefedz.org"
                                    target="_blank">
                                    Blog
                                </a>
                                <a
                                    href="https://the-fedz.gitbook.io/the-fedz"
                                    target="_blank">
                                    GitBook
                                </a>
                                <a href="/terms-of-use" target="_blank">
                                    Terms & Conditions
                                </a>
                                <p>Privacy Policy</p>
                                <a
                                    href="https://coinpaprika.com/coin/fusd-fusd/ "
                                    target="_blank">
                                    Trac $FUSD on CoinPaprika
                                </a>
                            </div>
                        </div>
                        <div>
                            <h2 className="font-semibold mb-4">Contact Us</h2>
                            <div className="flex flex-col gap-3">
                                <p className="flex items-center gap-2">
                                    <svg
                                        width="20"
                                        height="17"
                                        viewBox="0 0 20 17"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M18 4.22007L10 9.49517L2 4.22007V2.11004L10 7.38513L18 2.11004M18 0H2C0.89 0 0 0.938967 0 2.11004V14.7703C0 15.3299 0.210714 15.8666 0.585786 16.2623C0.960859 16.658 1.46957 16.8803 2 16.8803H18C18.5304 16.8803 19.0391 16.658 19.4142 16.2623C19.7893 15.8666 20 15.3299 20 14.7703V2.11004C20 1.55042 19.7893 1.01372 19.4142 0.618015C19.0391 0.222307 18.5304 0 18 0Z"
                                            fill="#4A88ED"
                                        />
                                    </svg>
                                    Info@TheFedz.org
                                </p>
                                <p className="flex items-center gap-2">
                                    <svg
                                        width="17"
                                        height="22"
                                        viewBox="0 0 17 22"
                                        fill="none"
                                        xmlns="http://www.w3.org/2000/svg">
                                        <path
                                            d="M8.5 11C9.08438 11 9.58481 10.7844 10.0013 10.3532C10.4171 9.92273 10.625 9.405 10.625 8.8C10.625 8.195 10.4171 7.6769 10.0013 7.2457C9.58481 6.81523 9.08438 6.6 8.5 6.6C7.91563 6.6 7.41554 6.81523 6.99975 7.2457C6.58325 7.6769 6.375 8.195 6.375 8.8C6.375 9.405 6.58325 9.92273 6.99975 10.3532C7.41554 10.7844 7.91563 11 8.5 11ZM8.5 22C5.64896 19.4883 3.51971 17.1552 2.11225 15.0007C0.704083 12.8469 0 10.8533 0 9.02C0 6.27 0.854604 4.07917 2.56381 2.4475C4.27231 0.815833 6.25104 0 8.5 0C10.749 0 12.7277 0.815833 14.4362 2.4475C16.1454 4.07917 17 6.27 17 9.02C17 10.8533 16.2963 12.8469 14.8888 15.0007C13.4806 17.1552 11.351 19.4883 8.5 22Z"
                                            fill="#4A88ED"
                                        />
                                    </svg>
                                    The Fedz's headquarters, Metaverse
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
            <p className="mt-7 text-sm md:text-base py-5 text-center border-t border-white/15">
                &copy; {new Date().getFullYear()} The Fedz. All Rights Reserved
            </p>
        </footer>
    );
};

export default Footer;
