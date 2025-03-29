import React from "react";
import Skeleton from "./Skeleton";
type Props = {
  text: string;
  value: any;
  load: boolean;
};

export function InfoLine({ text, value, load }: Props) {
  return (
    <div className="flex flex-row items-center gap-3 justify-between text-lg md:text-xl ">
      <div className=" text-[#cecece]   ">{text}</div>
      {!load ? (
        <div className=" text-white  text-left">{value}</div>
      ) : (
        <Skeleton />
      )}
    </div>
  );
}
