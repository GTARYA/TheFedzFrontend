/* eslint-disable no-undef */



// Format BigInt to decimal with 2 decimal places
export const formatBigIntToDecimal = (value: bigint, decimals = 18, displayDecimals = 6) => {
    if (typeof value !== 'bigint') {
      return 'Invalid Value';
    }

    let divisor = BigInt('1' + '0'.repeat(decimals));
    let integerPart = value / divisor;
    let fractionalPart = value % divisor;

    // Convert fractional part to a string and pad with leading zeros
    let fractionalStr = fractionalPart.toString().padStart(decimals, '0');
    
    // Take only the first 'displayDecimals' digits of the fractional part
    fractionalStr = fractionalStr.slice(0, displayDecimals);

    // Remove trailing zeros
    fractionalStr = fractionalStr.replace(/0+$/, '');

    return `${integerPart}${fractionalStr ? '.' + fractionalStr : ''}`;
  };