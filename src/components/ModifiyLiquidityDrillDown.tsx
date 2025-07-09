import { useState, useEffect, useRef } from "react";
import { CurrencyAmount } from "@uniswap/sdk-core";
import { ScaleLoader } from "react-spinners";

interface Props {
  validateRoundUnlock: () => Promise<boolean>,
  unlockRound: () => Promise<void>,
  validateSufficientBalance: (amount: CurrencyAmount<any>) => Promise<boolean>,
  validateSufficientAllowance: (amount: CurrencyAmount<any>) => Promise<boolean>,
  validateSufficientAllowanceOnPermit2: (amount: CurrencyAmount<any>) => Promise<boolean>,
  approveToken: (amount: CurrencyAmount<any>) => Promise<void>,
  approveTokenOnPermit2: (amount: CurrencyAmount<any>) => Promise<void>,
  addLPS: (liquidity: string, permitBatch?: any, sig?: string) => Promise<void>,
  onDone: () => void,
  amount0: CurrencyAmount<any>,
  amount1: CurrencyAmount<any>,
  liquidity: string,
  loading: any,
  signBatchPermit: (amount0: CurrencyAmount<any>, amount1: CurrencyAmount<any>) => Promise<{permitBatch: any, signature: string}>,
}

const ModifiyLiquidityDrillDownComponent = ({ 
  amount0, amount1, liquidity,
  loading, onDone,
  validateRoundUnlock, unlockRound,
  validateSufficientBalance, validateSufficientAllowance, 
  approveToken, signBatchPermit, addLPS, 
}: Props) => {
  const [roundUnlocked, setRoundUnlocked] = useState<boolean>();
  const [sufficientBalance0, setSufficientBalance0] = useState<boolean>();
  const [sufficientBalance1, setSufficientBalance1] = useState<boolean>();
  const [sufficientAllowance0, setSufficientAllowance0] = useState<boolean>();
  const [sufficientAllowance1, setSufficientAllowance1] = useState<boolean>();
  const [waitingTx, setWaitingTx] = useState<boolean>(false);
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [buttonText, setButtonText] = useState("Confirm");

  const [approveToken0Status, setApproveToken0Status] = useState<string>();
  const [approveToken1Status, setApproveToken1Status] = useState<string>();
  const [releaseRoundStatus, setReleaseRoundStatus] = useState<string>();
  const [batchPermitStatus, setBatchPermitStatus] = useState<any>();
  const [isSigningPermit, setSigningPermit] = useState<boolean>();

  function start() {
    validateSufficientBalance(amount0).then((result) => {
      console.log(`Sufficient ${amount0.currency.name} Allowance:`, result);
      setSufficientBalance0(result);
    }).catch((error) => {
      console.error("Error validating FUSD allowance:", error);
    });
    validateSufficientBalance(amount1).then((result) => {
      console.log(`Sufficient ${amount1.currency.name} Allowance:`, result);
      setSufficientBalance1(result);
    }).catch((error) => {
      console.error("Error validating FUSD allowance:", error);
    });
    validateSufficientAllowance(amount0).then((result) => {
      console.log(`Sufficient ${amount0.currency.name} Permit:`, result);
      setSufficientAllowance0(result);
    }).catch((error) => {
      console.error("Error validating FUSD allowance:", error);
    });
    validateSufficientAllowance(amount1).then((result) => {
      console.log(`Sufficient ${amount1.currency.name} Allowance:`, result);
      setSufficientAllowance1(result);
    }).catch((error) => {
      console.error("Error validating FUSD allowance:", error);
    });
    validateRoundUnlock().then((result) => {
      console.log(`Sufficient ${amount1.currency.name} Allowance:`, result);
      setRoundUnlocked(result);
    }).catch((error) => {
      console.error("Error validating FUSD allowance:", error);
    });
    console.log({batchPermitStatus})
  }
  const callbackRef = useRef(start);
  const [showProcess, setShowProcess] = useState<boolean>();
  useEffect(() => {
    if (
      sufficientBalance0 !== undefined &&
      sufficientBalance1 !== undefined &&
      sufficientAllowance0 !== undefined &&
      sufficientAllowance1 !== undefined &&
      roundUnlocked !== undefined
    ) {
      setShowProcess(sufficientBalance0 && sufficientBalance1);
      if (!sufficientBalance0 || !sufficientBalance1) {
        setButtonText(`Insufficient Balances`);
      } else if (!roundUnlocked) {
        callbackRef.current = onClickReleaseRound;
      } else if (!sufficientAllowance0) {
        callbackRef.current = onClickApprove0;
      } else if (!sufficientAllowance1) {
        callbackRef.current = onClickApprove1;
      } else if (!batchPermitStatus) {
          callbackRef.current = onClickSignBatchPermit;
      } else if (batchPermitStatus) {
        console.log('!!@#!@#');
        callbackRef.current = () => {
          addLPS(liquidity, batchPermitStatus.permitBatch, batchPermitStatus.signature)
        }
      }
    }
  }, [
    sufficientBalance0, sufficientBalance1, sufficientAllowance0, sufficientAllowance1
    , roundUnlocked, batchPermitStatus
  ]);
  async function onClickApprove0 () {
    setApproveToken0Status('pending');
    approveToken(amount0).then(() => {
      setApproveToken0Status('done');
    }).catch((error) => {
      setApproveToken0Status('failed');
    }).finally(() => {
      start();
    });
  }

  async function onClickApprove1 () {
    setApproveToken1Status('pending');
    approveToken(amount1).then(() => {
      setApproveToken1Status('done');
    }).catch((error) => {
      setApproveToken1Status('failed');
    }).finally(() => {
      start();
    });
  }

  async function onClickSignBatchPermit () {
    setSigningPermit(true);
    signBatchPermit(amount0, amount1).then(({permitBatch, signature}: any) => {
      setBatchPermitStatus({permitBatch, signature});
      callbackRef.current = () => {
        addLPS(liquidity, permitBatch, signature)
      }
      setButtonText('Sign Modify Liquidity');
    }).catch((error: any) => {
      console.error(error)
    }).finally(() => {
      setSigningPermit(false);
    });
  }

  async function onClickReleaseRound () {
    setReleaseRoundStatus('pending');
    unlockRound().then(() => {
      setReleaseRoundStatus('done');
    }).catch((error) => {
      console.error(error);
      setReleaseRoundStatus('failed');
    }).finally(() => {
      start();
    });
  }

  useEffect(() => {
    if (sufficientBalance0 === undefined) {
      return;
    }
    if (sufficientBalance0===false) {
      setButtonDisabled(true);
      setButtonText(`Insufficient ${amount0.currency.name} Allowance`);
    } else {
      validateSufficientBalance(amount1).then((result) => {
        console.log(`Sufficient ${amount1.currency.name} Balance:`, result);
        setSufficientBalance1(result);
      }).catch((error) => {
        console.error("Error validating USDT balance:", error);
      });
    }
  }, [sufficientBalance0]);

  useEffect(() => {
    if (waitingTx) {
      setButtonDisabled(true);
      setButtonText("Waiting for transaction...");
    } else {
      setButtonDisabled(false);
    }
  }, [waitingTx]);


  return (
    <div className="drill-bg text-white">
      <div className="text-white">
        { amount0.toSignificant() } { amount0.currency.name }
        <hr />
        { amount1.toSignificant() } { amount1.currency.name }
        <hr />
        Rate: <span>1 { amount0.currency.name } = { (parseFloat(amount0.toSignificant()) / parseFloat(amount1.toSignificant())).toPrecision(6) } {amount1.currency.name}</span>
      </div>
      {
        showProcess &&
        <>
          {
            !sufficientAllowance0 &&
            <>
              <div className="text-white">
                {
                  approveToken0Status === 'pending' &&
                  <div className="text-white">
                    {'>'} Processing
                  </div>
                }
                {
                  approveToken0Status === 'done' &&
                  <div className="text-white">
                    {'V'} Done
                  </div>
                }
                Approve {amount0.currency.name}
              </div>
              <hr />
            </>
          }
          {
            !sufficientAllowance1 &&
            <>
              <div className="text-white">
                {
                  approveToken1Status === 'pending' &&
                  <div className="text-white">
                    {'>'} Processing
                  </div>
                }
                {
                  approveToken1Status === 'done' &&
                  <div className="text-white">
                    {'V'} Done
                  </div>
                }
                Approve {amount1.currency.name}
              </div>
              <hr />
            </>
          }
          {
            !roundUnlocked &&
            <>
                <div className="text-white">
                {
                  releaseRoundStatus === 'pending' &&
                  <div className="text-white">
                    {'>'} Processing
                  </div>
                }
                {
                releaseRoundStatus === 'done' &&
                  <div className="text-white">
                    {'V'} Done
                  </div>
                }
                Unlock Round
                </div>
                <hr />
            </>
          }
          <div className="text-white">
            {!batchPermitStatus && isSigningPermit && '>'}
            {batchPermitStatus && 'V'}
            Permit Transfers
          </div>
          <hr />
        </>
      }
      {
        !showProcess && waitingTx &&
        <button
          style={{
            width: '100%',
            height: '50px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={callbackRef.current || (() => {
            console.log("Button clicked, but no action defined.");
          })}
          disabled={buttonDisabled}
          >{buttonText}
                <div style={{
                }}>
                  <ScaleLoader
                    height={20}
                    loading={loading}
                    color="#ffffff"
                    className="text-white"
                    aria-label="Loading Spinner"
                    data-testid="loader"
                  />
            </div>
          </button>
      }
      {
        !waitingTx &&
        <button key={buttonText}
          style={{
            width: '100%',
            height: '50px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
          }}
          onClick={callbackRef.current || (() => {
            console.log("Button clicked, but no action defined.");
          })}
          disabled={buttonDisabled}
          >{buttonText}
            {
              waitingTx && <>
                <div style={{

                }}>
                  <ScaleLoader
                      height={20}
                      loading={loading}
                      color="#ffffff"
                      className="text-white"
                      aria-label="Loading Spinner"
                      data-testid="loader"
                    />
                    </div>
                  </>                            

            }
          </button>
      }
    </div>
  );
};

export default ModifiyLiquidityDrillDownComponent;
