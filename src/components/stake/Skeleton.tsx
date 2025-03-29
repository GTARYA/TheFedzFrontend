import React from "react";

type Props = {};

function Skeleton({}: Props) {
  return (
    <div
      role="status"
      className="space-y-8 animate-pulse md:space-y-0 md:space-x-8 md:flex items-center w-[60px] h-[30px]" 
    >
      <div className="w-full">
        <div className="h-[30px]  rounded-lg bg-gray-700 max-w-[60px] "></div>
      </div>
    </div>
  );
}

export default Skeleton;
