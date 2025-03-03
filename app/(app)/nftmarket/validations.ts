import { Asset, NFTDetails } from "@/app/types/types";
import { ValidationResult } from "@/app/types/validation.types";

export class NFTMarketValidations {
  /**
   * Validates NFT path format
   * @param nftPath - Full path of the NFT (e.g. "gno.land/r/test.nft.mycollection.1")
   */
  static validateNFTPath(nftPath: string): ValidationResult {
    const parts = nftPath.split('.');
    if (parts.length < 4) {
      return {
        isValid: false,
        error: {
          title: "Invalid NFT path format",
          description: "Expected path.collection.tokenID"
        }
      };
    }
    return { isValid: true };
  }

  /**
   * Validates the amount for NFT purchase
   * @param amountOut - Amount to pay
   * @param minAmountOut - Minimum amount required
   */
  static validateAmount(amountOut: string, minAmountOut: number): ValidationResult {
    const amount = Number(amountOut.replaceAll(' ', ''));
    
    if (isNaN(amount)) {
      return {
        isValid: false,
        error: {
          title: "Invalid amount format",
          description: "Please enter a valid amount"
        }
      };
    }

    if (amount < minAmountOut) {
      return {
        isValid: false,
        error: {
          title: "Insufficient payment amount",
          description: "Amount must be greater than or equal to the minimum required"
        }
      };
    }

    return { isValid: true };
  }

  /**
   * Validates expiry hours
   * @param hours - Number of hours until expiry
   */
  static validateExpiryHours(hours: string): ValidationResult {
    const hoursNum = Number(hours);
    
    if (isNaN(hoursNum) || hoursNum <= 0) {
      return {
        isValid: false,
        error: {
          title: "Invalid expiry hours",
          description: "Expiry hours must be a positive number"
        }
      };
    }

    return { isValid: true };
  }

  /**
   * Validates NFT sale creation parameters
   */
  static validateNFTSale(
    nft: NFTDetails | null,
    assetOut: Asset | null,
    amountOut: string,
    expiryHours: string
  ): ValidationResult {
    if (!nft) {
      return {
        isValid: false,
        error: {
          title: "NFT must be selected",
          description: "Please select an NFT to sell"
        }
      };
    }

    const nftPathValidation = this.validateNFTPath(nft.key);
    if (!nftPathValidation.isValid) {
      return nftPathValidation;
    }

    if (!assetOut) {
      return {
        isValid: false,
        error: {
          title: "Asset to receive must be selected",
          description: "Please select an asset to receive"
        }
      };
    }

    if (!amountOut || Number(amountOut) <= 0) {
      return {
        isValid: false,
        error: {
          title: "Invalid amount",
          description: "Amount must be greater than 0"
        }
      };
    }

    const expiryValidation = this.validateExpiryHours(expiryHours);
    if (!expiryValidation.isValid) {
      return expiryValidation;
    }

    return { isValid: true };
  }

  /**
   * Validates NFT purchase parameters
   */
  static validateNFTPurchase(
    ticketId: string,
    amountOut: number,
    minAmountOut: number
  ): ValidationResult {
    if (!ticketId) {
      return {
        isValid: false,
        error: {
          title: "Invalid ticket ID",
          description: "Please provide a valid ticket ID"
        }
      };
    }

    const amountValidation = this.validateAmount(String(amountOut), minAmountOut);
    if (!amountValidation.isValid) {
      return amountValidation;
    }

    return { isValid: true };
  }
} 
