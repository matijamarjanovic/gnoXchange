import { ValidationResult } from "@/app/types/validation.types";
import { PoolInfo } from "@/app/types/types";

export class PoolValidations {
  /**
   * Validates pool creation parameters
   * @param tokenA - Key/path of first token
   * @param tokenB - Key/path of second token 
   * @param amountA - Amount of first token to provide
   * @param amountB - Amount of second token to provide
   * @param decimalsA - Decimal places of first token
   * @param decimalsB - Decimal places of second token
   */
  static validatePoolCreation(
    tokenA: string,
    tokenB: string,
    amountA: string,
    amountB: string,
    decimalsA: number,
    decimalsB: number
  ): ValidationResult {
    if (!tokenA || !tokenB) {
      return {
        isValid: false,
        error: {
          title: "Invalid tokens",
          description: "Both tokens must be selected"
        }
      };
    }

    if (tokenA === tokenB) {
      return {
        isValid: false,
        error: {
          title: "Invalid token pair",
          description: "Cannot create pool with identical tokens"
        }
      };
    }

    const numAmountA = Number(amountA.replaceAll(' ', ''));
    const numAmountB = Number(amountB.replaceAll(' ', ''));

    if (isNaN(numAmountA) || numAmountA <= 0) {
      return {
        isValid: false,
        error: {
          title: "Invalid amount for first token",
          description: "Amount must be a positive number"
        }
      };
    }

    if (isNaN(numAmountB) || numAmountB <= 0) {
      return {
        isValid: false,
        error: {
          title: "Invalid amount for second token",
          description: "Amount must be a positive number"
        }
      };
    }

    const minDecimals = Math.min(decimalsA, decimalsB);

    if (decimalsA > minDecimals) {
      const expectedScale = Math.pow(10, decimalsA - minDecimals);
      if (numAmountA % expectedScale !== 0) {
        return {
          isValid: false,
          error: {
            title: "Invalid amount scale",
            description: `Amount for first token must be in units of ${expectedScale} (token has ${decimalsA} decimals vs ${minDecimals} decimals for the other token)`
          }
        };
      }
    }

    if (decimalsB > minDecimals) {
      const expectedScale = Math.pow(10, decimalsB - minDecimals);
      if (numAmountB % expectedScale !== 0) {
        return {
          isValid: false,
          error: {
            title: "Invalid amount scale",
            description: `Amount for second token must be in units of ${expectedScale} (token has ${decimalsB} decimals vs ${minDecimals} decimals for the other token)`
          }
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validates liquidity addition parameters
   * @param pool - Pool information containing reserves and total supply
   * @param amountA - Amount of first token to add
   * @param amountB - Amount of second token to add
   */
  static validateAddLiquidity(
    pool: PoolInfo,
    amountA: string,
    amountB: string
  ): ValidationResult {
    const numAmountA = Number(amountA.replaceAll(' ', ''));
    const numAmountB = Number(amountB.replaceAll(' ', ''));

    if (isNaN(numAmountA) || numAmountA <= 0) {
      return {
        isValid: false,
        error: {
          title: "Invalid first amount",
          description: "Amount must be a positive number"
        }
      };
    }

    if (isNaN(numAmountB) || numAmountB <= 0) {
      return {
        isValid: false,
        error: {
          title: "Invalid second amount",
          description: "Amount must be a positive number"
        }
      };
    }

    if (pool.totalSupplyLP > 0) {
      const expectedRatio = pool.reserveB / pool.reserveA;
      const providedRatio = numAmountB / numAmountA;
      
      if (Math.abs(expectedRatio - providedRatio) > 0.0001) {
        return {
          isValid: false,
          error: {
            title: "Invalid ratio",
            description: `Incorrect token ratio, should be ${pool.reserveA}:${pool.reserveB}`
          }
        };
      }
    }

    return { isValid: true };
  }

  /**
   * Validates liquidity withdrawal parameters
   * @param amount - Amount of LP tokens to withdraw
   * @param userLPBalance - User's current LP token balance
   */
  static validateWithdrawLiquidity(
    amount: string,
    userLPBalance: number
  ): ValidationResult {
    const numAmount = Number(amount.replaceAll(' ', ''));

    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        isValid: false,
        error: {
          title: "Invalid amount",
          description: "Amount must be a positive number"
        }
      };
    }

    if (numAmount > userLPBalance) {
      return {
        isValid: false,
        error: {
          title: "Insufficient LP tokens",
          description: "Withdrawal amount exceeds your LP token balance"
        }
      };
    }

    return { isValid: true };
  }

  /**
   * Validates swap parameters
   * @param amount - Amount of input token to swap
   * @param estimatedAmount - Estimated output amount from swap
   * @param userBalance - User's balance of input token
   */
  static validateSwap(
    amount: string,
    estimatedAmount: string,
    userBalance: number
  ): ValidationResult {
    const numAmount = Number(amount.replaceAll(' ', ''));
    
    if (isNaN(numAmount) || numAmount <= 0) {
      return {
        isValid: false,
        error: {
          title: "Invalid amount",
          description: "Amount must be a positive number"
        }
      };
    }

    if (numAmount > userBalance) {
      return {
        isValid: false,
        error: {
          title: "Insufficient balance",
          description: "Swap amount exceeds your token balance"
        }
      };
    }

    if (!estimatedAmount || Number(estimatedAmount) <= 0) {
      return {
        isValid: false,
        error: {
          title: "Invalid swap",
          description: "Could not estimate swap output amount"
        }
      };
    }

    return { isValid: true };
  }
} 
