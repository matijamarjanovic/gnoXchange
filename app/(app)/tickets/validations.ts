import { ValidationResult, TicketValidationParams, FilterTicketsParams } from "@/app/types/validation.types";
import { toast } from "@/hooks/use-toast";
import { Ticket } from "@/app/types/types";

/**
 * Validates the creation of a ticket.
 * @param assetInType - The type of asset being used to create the ticket.
 * @param assetOutType - The type of asset expected in return.
 * @param amountIn - The amount of the input asset.
 * @param minAmountOut - The minimum amount of the output asset expected.
 * @param expiryHours - The number of hours until the ticket expires.
 * @returns A ValidationResult indicating whether the ticket creation parameters are valid.
 */
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

/**
 * Filters tickets based on a search query.
 * @param tickets - The list of tickets to filter.
 * @param searchQuery - The query string to filter tickets by.
 * @param fuse - The Fuse.js instance used for searching.
 * @returns The filtered list of tickets.
 */
export function filterTickets({ tickets, searchQuery, fuse }: FilterTicketsParams): Ticket[] {
  if (!searchQuery) {
    return tickets;
  }

  if (fuse) {
    const results = fuse.search(searchQuery);
    return results.map(result => result.item);
  }

  return tickets;
} 
