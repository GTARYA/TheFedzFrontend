import Head from 'next/head';
import Image from 'next/image';
import Container from '../components/Container';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Endorsements() {
    const endorsements = [
        {
            name: 'Prof. Ilan Alon',
            title: 'Professor, University of Agder | Blockchain and Innovation Researcher',
            imageAlt: 'Prof. Ilan Alon',
            link: 'https://www.linkedin.com/in/ilanalon/',
            imageSrc: '/research/research_1.png',
            quote: 'The Fedz presents a rare opportunity to test bank-run theory in a real-world blockchain setting— bridging the gap between academic models and applied DeFi design.',
        },
        {
            name: 'Dr. Nir Chemaya',
            title: 'Financial Economist, Regulatory Researcher',
            imageAlt: 'Dr. Nir Chemaya',
            link: 'https://www.linkedin.com/in/nirchemaya/',
            imageSrc: '/research/research_2.png',
            quote: 'What excites me about The Fedz is its structured approach to mitigating systemic risk in under-collateralized stablecoins—a long-missing piece in decentralized finance.',
        },
        // {
        //     name: 'Gal Danino',
        //     title: 'Game Theorist | Crypto Strategist | Research Collaborator',
        //     imageAlt: 'Gal Danino',
        //     link: 'https://www.linkedin.com/in/galdanino/',
        //     imageSrc: '/research/research_3.png',
        //     quote: 'Game theory has always been about incentives and belief. Crypto lets us test those models live, with real consequences. The Fedz is a bold case study.',
        // },
    ];

    return (
        <>
            <Head>
                <title className="mb-10 text-[#cccccc] text-[3rem]">
                    The Fedz | Research Endorsements
                </title>
            </Head>
            <main className="bg-[#0e0e0e] text-white font-sans min-h-screen">
                <Navbar />
                <Container>
                    <h1 className="text-[#6ef2ff] font-bold mb-6 text-[2.5rem] pt-10">
                        Research Endorsements
                    </h1>
                    <p className="text-[#cccccc] text-base leading-relaxed mb-10 text-[1.1rem]">
                        The Fedz is grounded in decades of economic theory and
                        advanced by a new generation of builders. Our mission to
                        reinvent stablecoins and create a decentralized
                        financial safety net has received the support of
                        respected researchers in economics, finance, and
                        blockchain systems.
                    </p>

                    {endorsements.map((endorsement, index) => (
                        <div
                            key={index}
                            className="flex flex-col sm:flex-row items-start sm:items-center mb-10 border-b border-[#333] pb-5">
                            <div className="w-24 h-24 rounded-full bg-gray-700 overflow-hidden mr-0 sm:mr-5 mb-4 sm:mb-0">
                                <Image
                                    src={endorsement.imageSrc}
                                    alt={endorsement.imageAlt}
                                    width={100}
                                    height={100}
                                    className="object-cover rounded-full"
                                />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-lg font-semibold text-white">
                                    {endorsement.name}
                                </h3>
                                <p className="text-[#bbbbbb]">
                                    {endorsement.title}
                                </p>
                                <p>
                                    <a
                                        href={endorsement.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#6ef2ff] underline">
                                        LinkedIn Profile
                                    </a>
                                </p>
                                <p className="italic text-[#ff79c6] mt-2">
                                    “{endorsement.quote}”
                                </p>
                            </div>
                        </div>
                    ))}

                    <p className="text-[#cccccc] text-base mt-12">
                        Are you a researcher interested in economic experiments
                        or DeFi protocols?{' '}
                        <a
                            href="mailto:research@thefedz.org"
                            className="text-[#6ef2ff] underline">
                            Get in touch with us.
                        </a>
                    </p>
                </Container>
                <Footer />
            </main>
        </>
    );
}
