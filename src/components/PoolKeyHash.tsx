import React from 'react';

const PoolKeyHashDisplay = ({ poolKeyHash }: { poolKeyHash: string }) => {
    
  return (
    <div className="card bg-base-300 shadow-xl p-4">
      <h2 className="card-title text-lg font-bold mb-2 justify-center">Pool Key Hash:</h2>
      <p className="bg-base-200 p-2 rounded break-all">{poolKeyHash}</p>
    </div>
  );
};

export default PoolKeyHashDisplay;
