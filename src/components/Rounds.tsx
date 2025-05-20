import React, { useEffect, useState } from "react";
import ActionWindows from "./ActionWindows";
import Title from "./ui/Title";
import RoundInfos from "./RoundInfos";
import Container from "./Container";
import PoolKeyHashDisplay from "./PoolKeyHash";
import { getLatestEventForTurn } from "../hooks/fedz";
import { useAccount } from "wagmi";
import { TurnOrderEntry } from "../type";
type Props = {
  poolKeyHash: string;
};

function Rounds({ poolKeyHash }: Props) {
  const { address } = useAccount();
  const [nfts, setNFTs] = useState<TurnOrderEntry[]>([]);
  const fetchNFTs = async () => {
    const data = await getLatestEventForTurn();
    if (data) {
      setNFTs(data.turnOrder);
    }
  };

  useEffect(() => {
    fetchNFTs();
  }, [address]);

  return (
    <div>
      <ActionWindows data={nfts} />

      <section className="relative py-[50px] md:py-[75px]">
        <Container className="relative z-[5]">
          <Title>Rounds</Title>
          <div className="flex flex-col md:flex-row gap-8 mt-6 md:mt-9">
            <RoundInfos />
            <PoolKeyHashDisplay poolKeyHash={poolKeyHash} />
          </div>
        </Container>
        <img
          src="/blue-glare4.png"
          alt="glare"
          className="absolute w-full -bottom-[10%] md:-bottom-[50%] right-0 max-w-[500px] md:max-w-[700px] pointer-events-none"
        />
        <img
          src="/cursor/10.png"
          alt="eppilse"
          className="absolute bottom-[0] md:bottom-[10%] left-[0px] md:left-[20px] max-w-[50px] md:max-w-[80px]"
        />
        <img
          src="/cursor/7.png"
          alt="eppilse"
          className="absolute bottom-[10px] md:bottom-[300px] right-[50px] md:right-0 max-w-[50px] md:max-w-[80px]"
        />
      </section>
    </div>
  );
}

export default Rounds;
