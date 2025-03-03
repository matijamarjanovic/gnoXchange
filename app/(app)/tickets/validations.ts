import { Asset } from "@/app/types/types";
import { ValidationResult } from "@/app/types/validation.types";
import { toast } from "@/hooks/use-toast";

interface TicketValidationParams {
  assetInType: Asset | null;
  assetOutType: Asset | null;
  amountIn: string;
  minAmountOut: string;
  expiryHours: string;
}

export function validateTicketCreation({
  assetInType,
  assetOutType,
  amountIn,
  minAmountOut,
  expiryHours,
}: TicketValidationParams): ValidationResult {
  if (!assetInType || !assetOutType || !amountIn || !minAmountOut || !expiryHours) {
    return {
      isValid: false,
      error: {
        title: "Missing fields",
        description: "Please fill in all fields"
      }
    };
  }

  if (assetInType.type === assetOutType.type && 
      (assetInType.type === 'coin' ? 
        assetInType.denom === assetOutType.denom :
        assetInType.path === assetOutType.path)) {
    return {
      isValid: false,
      error: {
        title: "Invalid tokens",
        description: "Cannot create ticket with identical tokens"
      }
    };
  }

  const parsedAmountIn = parseFloat(amountIn.replace(/\s+/g, ''));
  const parsedMinAmountOut = parseFloat(minAmountOut.replace(/\s+/g, ''));
  const parsedExpiryHours = parseInt(expiryHours);

  if (isNaN(parsedAmountIn) || isNaN(parsedMinAmountOut) || isNaN(parsedExpiryHours)) {
    return {
      isValid: false,
      error: {
        title: "Invalid input",
        description: "Please enter valid numbers"
      }
    };
  }

  const decimalsIn = assetInType.decimals || 0;
  const decimalsOut = assetOutType.decimals || 0;
  const minDecimals = Math.min(decimalsIn, decimalsOut);

  if (decimalsIn > minDecimals) {
    const scale = Math.pow(10, decimalsIn - minDecimals);
    if ((parsedAmountIn * Math.pow(10, decimalsIn)) % scale !== 0) {
      return {
        isValid: false,
        error: {
          title: "Invalid amount",
          description: `Amount for ${assetInType.symbol} must be in units of ${1/scale} (token has ${decimalsIn} decimals vs ${minDecimals} decimals for the other token)`
        }
      };
    }
  }

  if (decimalsOut > minDecimals) {
    const scale = Math.pow(10, decimalsOut - minDecimals);
    if ((parsedMinAmountOut * Math.pow(10, decimalsOut)) % scale !== 0) {
      return {
        isValid: false,
        error: {
          title: "Invalid amount",
          description: `Amount for ${assetOutType.symbol} must be in units of ${1/scale} (token has ${decimalsOut} decimals vs ${minDecimals} decimals for the other token)`
        }
      };
    }
  }

  return { isValid: true };
}

export function showValidationError(error: { title: string; description: string }) {
  toast({
    variant: "destructive",
    title: error.title,
    description: error.description
  });
} 
