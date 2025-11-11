import { ReactNode } from "react";

export type FAQType = {
  question: string;
  answer: string | ReactNode;
};

export const fstocksFAQData: FAQType[] = [
  {
    question: "What exactly are FStocks?",
    answer:
      'FStocks are synthetic tokens that simulate the price behavior of real-world assets — like TSLA or AAPL — without representing ownership or claims on those companies. They\'re part of The Fedz\'s broader liquidity-stability experiment, not a way to "own" or "invest" in stocks. Think of them as digital mirrors, not the objects themselves.',
  },
  {
    question: "How are FStocks connected to real-world assets (RWA)?",
    answer:
      "FStocks use public market oracles to reference the price of real-world equities. They're not backed by actual shares, custodians, or brokers — instead, they track external data purely for simulation and research. This lets The Fedz explore how decentralized markets can replicate stability found in traditional finance — without ever touching the underlying securities.",
  },
  {
    question: "Why are FStocks not securities?",
    answer: (
      <div>
        Because they:
        <ul className="list-disc ml-6 mt-2 space-y-1">
          <li>Don't grant ownership, voting rights, or dividends.</li>
          <li>Don't represent shares or profit participation.</li>
          <li>Don't create an expectation of profit from anyone's effort.</li>
        </ul>
        <p className="mt-2">
          They are algorithmic reference instruments, built for monetary
          research, not investment gain. In short: you can't sue Elon Musk
          through them.
        </p>
      </div>
    ),
  },
  {
    question: "What's the goal of issuing FStocks if not profit?",
    answer:
      "The goal is to study liquidity under stress, not returns under calm. The Fedz uses FStocks to analyze how fractional-reserve mechanisms and sequential access models can stabilize synthetic assets during volatility — similar to how banks manage reserves during runs. It's an academic experiment in decentralized central banking, not a trading product.",
  },
  {
    question: "How do FStocks relate to the fractional reserve model?",
    answer:
      "The same principle that allows banks to lend more than their deposits is tested here — but transparently, on-chain. FStocks and FUSD operate under a fractional reserve system, where liquidity backing is dynamic, not absolute. The experiment tests how trust, liquidity timing, and coordination can sustain a peg without full collateralization.",
  },
  {
    question: "Can I lose money using FStocks or FUSD?",
    answer:
      "Absolutely — and faster than you think. This is an experimental, high-risk system that may depeg, collapse, or behave unpredictably under market stress. There are no guarantees, no insurance, and no recourse. If you're not ready to lose everything in the name of financial science — you probably shouldn't play this game.",
  },
  {
    question: "How do The Fedz mitigate bank runs?",
    answer:
      "Through sequential access and private liquidity pools (PLPs) that organize redemption timing, preventing panic-driven collapses. Instead of everyone rushing to withdraw at once, liquidity is released in rounds and queues, modeling controlled coordination similar to advanced economic experiments. It's not bulletproof — but it's the first time someone tried to build Diamond-Dybvig on-chain for real.",
  },
  {
    question: "What gives FStocks or FUSD their reliability?",
    answer:
      "Reliability comes not from over-collateralization, but from structured participation and rule-based liquidity. Each mechanism, from the PLP design and turn based access, reinforces market confidence algorithmically, not institutionally. Still, this isn't \"reliable\" like a bank; it's reliably experimental, meaning transparent risk, not guaranteed safety.",
  },
  {
    question: "Is The Fedz trying to tokenize the stock market?",
    answer:
      "No, that would make it a securities project. The Fedz doesn't tokenize anything; it simulates financial behavior to study stability. FStocks are synthetic derivatives of reference prices, not ownership certificates. We're not competing with Wall Street, we're rebuilding its plumbing to see what breaks first.",
  },
  {
    question: "Why is The Fedz doing this if it's so risky?",
    answer:
      "Because progress in monetary design never came from safety — it came from experiments that tested the limits of trust. The Fedz explores how private, decentralized systems can create stability with minimal collateral and maximum transparency. Yes, it's risky. But it's also the only way to discover whether liquidity itself can become a new form of monetary policy.",
  },
];
