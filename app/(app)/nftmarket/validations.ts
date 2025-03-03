import { Asset, NFTDetails } from "@/app/types/types";

export class NFTMarketValidations {
  /**
   * Validates NFT path format
   * @param nftPath - Full path of the NFT (e.g. "gno.land/r/test.nft.mycollection.1")
   */
  static validateNFTPath(nftPath: string): { isValid: boolean; error?: string } {
    const parts = nftPath.split('.')
    if (parts.length < 4) {
      return {
        isValid: false,
        error: "Invalid NFT path format: expected path.collection.tokenID"
      }
    }
    return { isValid: true }
  }

  /**
   * Validates the amount for NFT purchase
   * @param amountOut - Amount to pay
   * @param minAmountOut - Minimum amount required
   */
  static validateAmount(amountOut: string, minAmountOut: number): { isValid: boolean; error?: string } {
    const amount = Number(amountOut.replaceAll(' ', ''))
    
    if (isNaN(amount)) {
      return {
        isValid: false,
        error: "Invalid amount format"
      }
    }

    if (amount < minAmountOut) {
      return {
        isValid: false,
        error: "Insufficient payment amount"
      }
    }

    return { isValid: true }
  }

  /**
   * Validates expiry hours
   * @param hours - Number of hours until expiry
   */
  static validateExpiryHours(hours: string): { isValid: boolean; error?: string } {
    const hoursNum = Number(hours)
    
    if (isNaN(hoursNum) || hoursNum <= 0) {
      return {
        isValid: false,
        error: "Expiry hours must be a positive number"
      }
    }

    return { isValid: true }
  }

  /**
   * Validates NFT sale creation parameters
   */
  static validateNFTSale(
    nft: NFTDetails | null,
    assetOut: Asset | null,
    amountOut: string,
    expiryHours: string
  ): { isValid: boolean; error?: string } {
    if (!nft) {
      return {
        isValid: false,
        error: "NFT must be selected"
      }
    }

    const nftPathValidation = this.validateNFTPath(nft.key)
    if (!nftPathValidation.isValid) {
      return nftPathValidation
    }

    if (!assetOut) {
      return {
        isValid: false,
        error: "Asset to receive must be selected"
      }
    }

    if (!amountOut || Number(amountOut) <= 0) {
      return {
        isValid: false,
        error: "Amount must be greater than 0"
      }
    }

    const expiryValidation = this.validateExpiryHours(expiryHours)
    if (!expiryValidation.isValid) {
      return expiryValidation
    }

    return { isValid: true }
  }

  /**
   * Validates NFT purchase parameters
   */
  static validateNFTPurchase(
    ticketId: string,
    amountOut: number,
    minAmountOut: number
  ): { isValid: boolean; error?: string } {
    if (!ticketId) {
      return {
        isValid: false,
        error: "Invalid ticket ID"
      }
    }

    const amountValidation = this.validateAmount(String(amountOut), minAmountOut)
    if (!amountValidation.isValid) {
      return amountValidation
    }

    return { isValid: true }
  }
} 
