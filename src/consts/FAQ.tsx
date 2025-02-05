import { ReactNode } from 'react';

export type FAQType = {
    question: string;
    answer: string | ReactNode;
};

export const faqData: FAQType[] = [
    {
        question: 'Wtf is The Fedz? Another DeFi Ponzi?',
        answer: 'Nah, The Fedz is the opposite of a Ponzi. It’s a new financial system that lets you mint an under-collateralized stablecoin (FUSD) without overlocking your assets like some yield-farming scam. It’s built to survive bank runs and market crashes, unlike most DeFi experiments that die in a bear market.',
    },
    {
        question:
            'Wait, under-collateralized stablecoin? Doesn’t that mean it’s gonna implode like UST?',
        answer: 'Good question. No. FUSD isn’t backed by hype and Hopium rather it’s designed with real economic models (think Diamond-Dybvig & Andolfatto’s work) that make sure it stays stable even when everyone panics.Terra-Luna utilized a dual-token system where the value of Terra was maintained through the minting and burning of Luna. This mechanism proved vulnerable to extreme market conditions, leading to significant instability and eventual collapse. The Fedz uses a bank-run mitigation mechanism to manage liquidity, preventing the classic death spiral that wrecked UST.',
    },
    {
        question: 'So how do I mint FUSD? Do I need to deposit a ton of ETH?',
        answer: 'Nope. Unlike traditional stablecoins that need 100%+ collateral, FUSD lets you mint with less. The exact mechanism involves Private Liquidity Pools (PLPs), where NFT holders get priority on liquidity access and yields. The system ensures there’s always enough backing without forcing you to overcommit your assets.',
    },
    {
        question:
            'Sounds cool, but what stops people from printing FUSD and dumping it like a degen?',
        answer: (
            <p>
                Printing FUSD isn’t unlimited because{' '}
                <b className="text-white">Private Liquidity Pools (PLPs)</b> and{' '}
                <b className="text-white">NFT holders</b> control liquidity
                access. The market monitors the ratio between locked liquidity
                and circulating FUSD, ensuring controlled growth.{' '}
                <b className="text-white">
                    NFT holders are incentivized to keep liquidity and prices
                    stable,
                </b>
                prioritizing long-term sustainability over short-term quick
                gains.
            </p>
        ),
    },
    {
        question: 'Why do I need an NFT? Isn’t that just a cash grab?',
        answer: (
            <div>
                There’s a clear split between users:{' '}
                <b className="text-white">NFT holders</b> manage FUSD’s minting
                and stability, while{' '}
                <b className="text-white">everyone else </b>can freely use FUSD
                like any standard ERC20 token. If you don’t want to be
                responsible for stability, you don’t need an NFT. You’re still
                welcome to trade, hold, or spend FUSD however you like.{' '}
                <p className="mt-2">
                    NFT holders, however, get priority access to liquidity,
                    yield opportunities, and governance influence. They’re
                    incentivized to keep the system stable, ensuring long-term
                    sustainability rather than short-term speculation
                </p>
            </div>
        ),
    },
    {
        question: 'How is this better than just using USDC or DAI?',
        answer: (
            <div>
                FUSD isn’t just another stablecoin, it’s a{' '}
                <b className="text-white">synthetic dollar derivative</b> with a
                different risk/reward structure. Unlike USDC, which is fully
                backed and redeemable for USD,{' '}
                <b className="text-white">
                    you can’t directly redeem FUSD for dollars.
                </b>{' '}
                Instead, it operates on a market-driven liquidity system where
                stability comes from{' '}
                <b className="text-white">Private Liquidity Pools (PLPs)</b> and{' '}
                <b className="text-white">priority redemption mechanisms</b>{' '}
                rather than over-collateralization like DAI.{' '}
                <p className="mt-2">
                    This makes FUSD far more{' '}
                    <b className="text-white">capital-efficient,</b> allowing
                    the system to support higher liquidity with less locked
                    capital. Instead of tying up excessive reserves, The Fedz
                    optimizes liquidity distribution, making FUSD more scalable
                    while still maintaining price stability.
                </p>
            </div>
        ),
    },
    {
        question:
            'What’s stopping a bank run on FUSD? Won’t everyone just withdraw at once?',
        answer: (
            <>
                <div>
                    This is our <b className="text-white">main focus</b> and the{' '}
                    <b className="text-white">core issue</b> The Fedz and FUSD
                    are designed to solve. From day one, we built the system
                    assuming a <b className="text-white">bank run scenario</b>{' '}
                    and structured every mechanism to mitigate that risk.
                </div>
                <p className="my-2">
                    To prevent mass panic withdrawals, we’ve implemented:
                </p>
                <ul className="list-disc ml-10">
                    <li>
                        <b className="text-white">A structured queue system</b>{' '}
                        accessing a permissioned liquidity pool.
                    </li>
                    <li>
                        <b className="text-white">Long-term incentives</b> for
                        NFT holders to maintain stability.
                    </li>
                    <li>
                        <b className="text-white">Isolated decision-making</b>{' '}
                        reducing herd behavior.
                    </li>
                    <li>
                        <b className="text-white">Liquidity locks</b> that
                        prevent sudden drainage.
                    </li>
                    <li>
                        <b className="text-white">
                            User coordination mechanisms
                        </b>{' '}
                        to reinforce trust.
                    </li>
                </ul>
                <p className="mt-2">
                    We’re continuously improving based on real-world feedback
                    and <b className="text-white">academic research</b> to
                    refine FUSD’s resilience and stability.
                </p>
            </>
        ),
    },
    {
        question:
            'Is this thing audited, or are we yolo’ing smart contract risk?',
        answer: 'Security is top priority. The Fedz is rolling out in phases, with audits planned before scaling to the Alpha stage. Plus, unlike most DeFi protocols that just copy-paste code, The Fedz is built from deep economic research—meaning it’s structured to be robust even beyond standard security audits.',
    },
    {
        question: 'What’s the roadmap? When moon?',
        answer: (
            <>
                <p>The Fedz has three key phases:</p>
                <p>
                    🚀 <b className="text-white">Season 1 (POC):</b> Small-scale
                    launch, 10,000 FUSD liquidity, 50-100 NFTs
                </p>
                <p>
                    ⚡ <b className="text-white">Season 2 (Alpha):</b> Contract
                    audit, working client app, 1M FUSD liquidity, 100-1000 NFTs
                </p>
                <p>
                    🔥 <b className="text-white">Season 3 (Beta):</b> Fully
                    audited, mobile & web clients with notification system,
                    governance tokens, 100M FUSD liquidity, 5000-10000 NFTs
                </p>
                <p className="mt-2">
                    TL;DR: If you get in early, you’ll be sitting in VIP when
                    the real action starts.
                </p>
            </>
        ),
    },
    {
        question: 'Alright, I’m in. Where do I start?',
        answer: (
            <div>
                Follow The Fedz on{' '}
                <a
                    className="text-lightblue"
                    target="_blank"
                    href="https://x.com/thefedznft">
                    https://x.com/thefedznft
                </a>{' '}
                for updates. Join the community, and get your hands on an NFT
                when minting opens is based on invitation.Requests to join are
                handled through (add join us button link). If you want to
                actually be part of the next evolution in DeFi instead of just
                watching from the sidelines, now’s your turn.
            </div>
        ),
    },
];
