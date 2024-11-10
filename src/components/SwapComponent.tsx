import { useState, useEffect } from 'react';
import { useAccount, useBalance, useReadContract, useContractWrite, useWriteContract } from 'wagmi';
import { parseEther, formatEther, parseGwei } from 'viem';
import {PoolSwapTestAddress, HookAddress, MockFUSDAddress, MockUSDTAddress, TimeSlotSystemAddress} from "../contractAddress";
import PoolSwapTestAbi from "../abi/PoolSwapTest_abi.json";
import MockERC20Abi from "../abi/MockERC20_abi.json";
import { getPoolId } from '../misc/v4helpers';
import {formatBigIntToDecimal} from '../misc/formatBigIntToDecimals';
import MockERC721Abi from '../abi/MockERC721_abi.json';
import {MockERC721Address} from '../contractAddress';
import TimeSlotSystemAbi from '../abi/TimeSlotSystem_abi.json';
import PoolKeyHashDisplay from './PoolKeyHash';
import TimeSlotSystem from './TimeSlotSystem';
import RoundInfos from './RoundInfos';


const SwapComponent = () => {
  const [poolKeyHash, setPoolKeyHash] = useState('');
  const [token0, setToken0] = useState(MockFUSDAddress);
  const [token1, setToken1] = useState(MockUSDTAddress);
  const [amount, setAmount] = useState('1');
  const [tickSpacing, setTickSpacing] = useState(60);
  const [swapFee, setSwapFee] = useState(4000);
  const [isToken0Approved, setIsToken0Approved] = useState(false);
  const [isToken1Approved, setIsToken1Approved] = useState(false);
  const [MockFUSDBalanceState, setMockFUSDBalanceState] = useState<BigInt>(BigInt(0));
  const [MockUSDTBalanceState, setMockUSDTBalanceState] = useState<BigInt>(BigInt(0));
  const [isNFTHolderState, setIsNFTHolderState] = useState(false);
  const [isPlayerTurnState, setIsPlayerTurnState] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Function to swap tokens
  const switchTokens = () => {
    setTimeout(() => {
      setToken0(token1);
      setToken1(token0);
    }, 500); // Adjust this delay to match your rotation animation duration
  };

  const [hookData, setHookData] = useState<`0x${string}`>("0x0"); // New state for custom hook data
  const [swapError, setSwapError] = useState();


  const MIN_SQRT_PRICE_LIMIT = BigInt("4295128739") + BigInt("1");
  const MAX_SQRT_PRICE_LIMIT = BigInt("1461446703485210103287273052203988822378723970342") - BigInt("1");


  const { data: writeSwapData, error: writeSwapError, isPending: isSwapPending, writeContract: writeSwapContract } = useWriteContract();
  const { data: writeApprove0Data, error: writeApprove0Error, isPending: isApprove0Pending, writeContract: writeApproveToken0Contract } = useWriteContract();
  const { data: writeApprove1Data, error: writeApprove1Error, isPending: isApprove1Pending, writeContract: writeApproveToken1Contract } = useWriteContract();



  const { address } = useAccount();

  const {data: isNFTHolder} = useReadContract({
      address: MockERC721Address,
      abi: MockERC721Abi,
      functionName: 'isNFTHolder',
      args: [address],
  });

  const {data: isPlayerTurn} = useReadContract({
    address: TimeSlotSystemAddress,
    abi: TimeSlotSystemAbi,
    functionName: 'canPlayerAct',
    args: [address],
});

  useEffect(() => {
    if (isPlayerTurn !== undefined) {
      setIsPlayerTurnState(isPlayerTurn as boolean);
    }
  }, [isPlayerTurn]);

  useEffect(() => {
    if (isNFTHolder !== undefined) {
      setIsNFTHolderState(isNFTHolder as boolean);
    }
    console.log("is address NFT holder", isNFTHolder);
  }, [isNFTHolder]);


  
  const { data: token0Allowance} = useReadContract({
    address: MockFUSDAddress,
    abi: MockERC20Abi,
    functionName: 'allowance',
    args: [address, PoolSwapTestAddress], 
  });


  const { data: token1Allowance } = useReadContract({
    address: MockUSDTAddress,
    abi: MockERC20Abi,
    functionName: 'allowance',
    args: [address, PoolSwapTestAddress], 
  });

  const { data: MockFUSDBalance } = useReadContract({
    address: MockFUSDAddress,
    abi: MockERC20Abi,
    functionName: 'balanceOf',
    args: [address], 
  });

  const { data: MockUSDTBalance } = useReadContract({
    address: MockUSDTAddress,
    abi: MockERC20Abi,
    functionName: 'balanceOf',
    args: [address], 
  });


  useEffect(() => {
  if (token0Allowance != null && token1Allowance != null && amount != null) {
    try {
      const amountBigInt = parseEther(amount.toString());
      const token0AllowanceBigInt = BigInt(token0Allowance.toString());
      const token1AllowanceBigInt = BigInt(token1Allowance.toString());
      const isToken0Approved = token0AllowanceBigInt >= amountBigInt;
      const isToken1Approved = token1AllowanceBigInt >= amountBigInt;
      setIsToken0Approved(isToken0Approved);
      setIsToken1Approved(isToken1Approved);
      
    } catch (error) {
      console.error('Error converting values to BigInt:', error);
      setIsToken0Approved(false);
      setIsToken1Approved(false);

    }
  } else {
    setIsToken0Approved(false);
    setIsToken1Approved(false);

  }
}, [token0Allowance, token1Allowance, amount]);

useEffect(() => {
  if (MockFUSDBalance != null && MockUSDTBalance != null) {
    try {
      const formattedToken0Balance = (MockFUSDBalance);
      const formattedToken1Balance = (MockUSDTBalance);
      
      setMockFUSDBalanceState(formattedToken0Balance as BigInt);
      setMockUSDTBalanceState(formattedToken1Balance as BigInt);
      
    } catch (error) {
      console.error('Error formatting balance values:', error);
      setMockFUSDBalanceState(BigInt(0));
      setMockUSDTBalanceState(BigInt(0));
    }
  } else {
    setMockFUSDBalanceState(BigInt(0));
    setMockUSDTBalanceState(BigInt(0));
  }
}, [MockFUSDBalance, MockUSDTBalance]);



  const approveFUSD = async () => {

    try {
      await writeApproveToken0Contract({
        address: MockFUSDAddress,
        abi: MockERC20Abi,
        functionName: 'approve',
        args: [PoolSwapTestAddress, parseEther(amount)]
      });
    } catch (err) {
        console.log(err)   
  }
  };

  const approveUSDT = async () => {

    try {
      await writeApproveToken1Contract({
        address: MockUSDTAddress,
        abi: MockERC20Abi,
        functionName: 'approve',
        args: [PoolSwapTestAddress, parseEther(amount)]
      });
    } catch (err) {
        console.log(err)   
  }
  };


 


  const swap = async () => {
    try {
      const result = await writeSwapContract({
        address: PoolSwapTestAddress,
        abi: PoolSwapTestAbi,
        functionName: 'swap',
        args: [
          {
            currency0: token0.toLowerCase() < token1.toLowerCase() ? token0 : token1,
            currency1: token0.toLowerCase() < token1.toLowerCase() ? token1 : token0,
            fee: Number(swapFee),
            tickSpacing: Number(tickSpacing),
            hooks: HookAddress,
          },
          {
            zeroForOne: token0.toLowerCase() < token1.toLowerCase(),
            amountSpecified: parseEther(amount), // TODO: assumes tokens are always 18 decimals
            sqrtPriceLimitX96:
              token0.toLowerCase() < token1.toLowerCase() ? MIN_SQRT_PRICE_LIMIT : MAX_SQRT_PRICE_LIMIT, // unlimited impact
          },
          {
            takeClaims	: false,
            settleUsingBurn: false
            
          },
          hookData,
        ],
      });
      console.log('Swap transaction sent:', writeSwapData);
    } catch (error) {
      console.error('Error in deposit:', error);
      //setSwapError(error);
    }
  };

  useEffect(() => {
    if (token0 && token1 && swapFee !== undefined && tickSpacing !== undefined && HookAddress) {
      try {
        const id = getPoolId({currency0: token0,currency1: token1, fee: swapFee, tickSpacing,hooks:  HookAddress});
        setPoolKeyHash(id);
      } catch (error) {
        console.error('Error calculating pool ID:', error);
        setPoolKeyHash('');
      }
    } else {
      setPoolKeyHash('');
    }
  }, [token0, token1, swapFee, tickSpacing, HookAddress]);
  

  const handleMaxClick = () => {
    if(token0.toLowerCase() === MockFUSDAddress.toLowerCase()) setAmount(formatEther(MockFUSDBalanceState as bigint));
    if(token0.toLowerCase() === MockUSDTAddress.toLowerCase()) setAmount(formatEther(MockUSDTBalanceState as bigint));
  };
  

  return (
    
    
    <div className="flex justify-center  min-h-screen">
        <div className="flex flex-col gap-4 mr-6">
          {address && (<div className="card w-full bg-base-100 shadow-xl">
            <div className="card-body">
              <TimeSlotSystem address={address}/>
            </div>
          </div>)}

          <div className="card w-full bg-base-100 shadow-xl">
            <div className="card-body">
              <RoundInfos />
            </div>
          </div>
          
          <div className="card w-full bg-base-100 shadow-xl">
            <div className="card-body">
              <PoolKeyHashDisplay poolKeyHash={poolKeyHash} />
            </div>
          </div>
        </div>

      <div className="card w-96 bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title justify-center">Swap Tokens</h2>
          
          

          <div className="form-control w-full max-w-xs mb-4">
          {token0 == MockFUSDAddress ? (
              <label className="label flex flex-col items-start">
                <div className="flex flex-col">
                  <span className="label-text">Input Token: mFUSD</span>
                  <span className="label-text text-sm opacity-70">
                    Balance: {Number(formatEther(MockFUSDBalanceState as bigint)).toFixed(3)}
                  </span>
                </div>
              </label>
            ) : (
              <label className="label flex flex-col items-start">
                <div className="flex flex-col">
                  <span className="label-text">Input Token: mUSDT</span>
                  <span className="label-text text-sm opacity-70">
                    Balance: {Number(formatEther(MockUSDTBalanceState as bigint)).toFixed(3)}
                  </span>
                </div>
              </label>
            )}
            
            <select 
              className="select select-bordered"
              value={token0}
              onChange={(e) => {setToken0(e.target.value);
                                setToken1(token0);
              }}
            >
              <option disabled defaultValue={"SelectToken"}>Select token</option>
              <option value={MockFUSDAddress}>mFUSD</option>
              <option value={MockUSDTAddress}>mUSDT</option>
              {/* Add more token options */}
            </select>
          </div>

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Amount</span>
            </label>
            <div className="flex items-center">
              <button className="btn btn-square mr-1" onClick={handleMaxClick}>Max</button>
              <input 
                type="text" 
                placeholder="0.0" 
                className="input input-bordered w-full" 
                value={amount}
                onChange={(e) => {
                  const re = /^[0-9]*\.?[0-9]*$/;
                  if (e.target.value === '' || re.test(e.target.value)) {
                    setAmount(e.target.value);
                  }
                }} 
              />
            </div>
          </div>


          {/* Swap button */}
          <div className="flex justify-center items-center my-2 relative group">
            <label className="swap swap-rotate cursor-pointer">
              <input type="checkbox" onClick={switchTokens} />
              <svg className="swap-on fill-current w-6 h-6 group-hover:w-8 group-hover:h-8 transition-all duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 6v3l4-4l-4-4v3a8 8 0 0 0-8 8c0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.9 5.9 0 0 1 6 12a6 6 0 0 1 6-6m6.76 1.74L17.3 9.2c.44.84.7 1.8.7 2.8a6 6 0 0 1-6 6v-3l-4 4l4 4v-3a8 8 0 0 0 8-8c0-1.57-.46-3.03-1.24-4.26" />
              </svg>
              <svg className="swap-off fill-current w-6 h-6 group-hover:w-8 group-hover:h-8 transition-all duration-300" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                <path d="M12 6v3l4-4l-4-4v3a8 8 0 0 0-8 8c0 1.57.46 3.03 1.24 4.26L6.7 14.8A5.9 5.9 0 0 1 6 12a6 6 0 0 1 6-6m6.76 1.74L17.3 9.2c.44.84.7 1.8.7 2.8a6 6 0 0 1-6 6v-3l-4 4l4 4v-3a8 8 0 0 0 8-8c0-1.57.03-1.24-4.26" />
              </svg>
            </label>
            <span className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              Swap Tokens
            </span>
          </div>



          <div className="form-control w-full max-w-xs mb-4">
          {token1 == MockFUSDAddress ? (
              <label className="label flex flex-col items-start">
                <div className="flex flex-col">
                  <span className="label-text">Output Token: mFUSD</span>
                  <span className="label-text text-sm opacity-70">
                    Balance: {Number(formatEther(MockFUSDBalanceState as bigint)).toFixed(3)}
                  </span>
                </div>
              </label>
            ) : (
              <label className="label flex flex-col items-start">
                <div className="flex flex-col">
                  <span className="label-text">Output Token: mUSDT</span>
                  <span className="label-text text-sm opacity-70">
                    Balance: {Number(formatEther(MockUSDTBalanceState as bigint)).toFixed(3)}
                  </span>
                </div>
              </label>
            )}
           
            <select 
              className="select select-bordered"
              value={token1}
              onChange={(e) => {
                setToken1(e.target.value);
                setToken0(token1);
              }}
            >
              <option disabled defaultValue={"SelectToken"}>Select token</option>
              <option value={MockUSDTAddress}>mUSDT</option>
              <option value={MockFUSDAddress}>mFUSD</option>

              {/* Add more token options */}
            </select>
          </div>

      <div className="form-control">
        <label className="label cursor-pointer">
          <span className="label-text">Pool Settings</span> 
          <input 
            type="checkbox" 
            className="toggle toggle-primary"
            checked={showSettings}
            onChange={() => setShowSettings(!showSettings)}
          />
        </label>
      </div>

      {showSettings && (
        <div className="mt-4">
          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Tick Spacing </span>
            </label>
            <input 
              type="text" 
              placeholder="0.0" 
              className="input input-bordered w-full max-w-xs" 
              value={tickSpacing}
              onChange={(e) => {
                const re = /^[0-9]*\.?[0-9]*$/;
                if (e.target.value === '' || re.test(e.target.value)) {
                  setTickSpacing(Number(e.target.value));
                }
              }} 
            />
          </div>

          <div className="form-control w-full max-w-xs mb-4">
            <label className="label">
              <span className="label-text">Fee Percent </span>
            </label>
            <input 
              type="text" 
              placeholder="0.0" 
              className="input input-bordered w-full max-w-xs" 
              value={swapFee}
              onChange={(e) => {
                const re = /^[0-9]*\.?[0-9]*$/;
                if (e.target.value === '' || re.test(e.target.value)) {
                  setSwapFee(Number(e.target.value));
                }
              }} 
            />
          </div>
        </div>
      )}

          


          {/* 
          <div className="mb-4">
            <p className="bg-base-200 p-2 rounded break-all font-bold">Approval Status: {isToken0Approved ? 'Approved for Token 0' : 'Token 0 not Approved'} {isToken1Approved ? 'Approved for Token 1' : 'Token 1 not Approved'}</p>
          </div>
          */}
          
          {isNFTHolderState && (
          <div className="card-actions justify-end">
          
            <div className="flex justify-between w-full">
              <button className="btn btn-primary hover:scale-110 transition-transform duration-200" onClick={approveFUSD} disabled={isToken0Approved || !isNFTHolderState || token0 != MockFUSDAddress}>
                Approve FUSD
              </button>
              <button className="btn btn-secondary hover:scale-110 transition-transform duration-200" onClick={approveUSDT} disabled={isToken1Approved || !isNFTHolderState || token0 != MockUSDTAddress}>
                Approve USDT
              </button>
              
            </div>
          </div>)}

          <div className="card-actions justify-center mt-4">
            {isNFTHolderState ? (
              
              <div >
                {isPlayerTurnState ? (
                <div className='w-full'>
                  {(isToken0Approved && !(token0.toLowerCase() < token1.toLowerCase())) && 
                    <button className="btn btn-primary btn-wide hover:scale-110 transition-transform duration-200" onClick={swap}>Swap</button>
                  }
                  {(isToken1Approved && (token0.toLowerCase() < token1.toLowerCase())) && 
                    <button className="btn btn-primary btn-wide hover:scale-110 transition-transform duration-200" onClick={swap}>Swap</button>
                  }
                </div>) : 
                
                (<div>
                  <div className="alert alert-error">
                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <span>It's not your turn to Act !</span>
                  </div>
                </div>)}
                
              </div>
            ) : (
              <div className="alert alert-warning">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                <span>You need to be an NFT holder to swap tokens.</span>
              </div>
            )}
          </div>

          <div className="form-control w-full max-w-xs mt-4">
            <label className="label">
              <span className="label-text">Output Amount (Estimated) </span>
            </label>
            <input 
              type="text" 
              placeholder="0.0" 
              className="input input-bordered w-full max-w-xs" 
              value={'0'}
              onChange={(e) => {
                
              }} 
            />
          </div>


        </div>
      </div>
    </div>
    
  );
};

export default SwapComponent;
