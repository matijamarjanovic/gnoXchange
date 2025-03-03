import { Ticket } from "@/app/types/types"

/**
 * Validates the fulfillment of a ticket.
 * @param ticket - The ticket to validate.
 * @param amount - The amount being offered to fulfill the ticket.
 * @param walletAddress - The wallet address of the user attempting to fulfill the ticket.
 * @returns A string containing an error message if validation fails, null if validation passes.
 */
export function validateTicketFulfillment(ticket: Ticket, amount: number, walletAddress: string | null): string | null {
  if (!ticket) {
    return "Ticket not found"
  }

  if (walletAddress === ticket.creator) {
    return "You cannot fulfill your own ticket"
  }

  if (ticket.status !== "open") {
    return "Ticket is not open"
  }

  const now = new Date()
  const expiresAt = new Date(ticket.expiresAt)
  if (now > expiresAt) {
    return "Ticket has expired"
  }

  if (amount < ticket.minAmountOut) {
    return `Insufficient amount. Minimum required: ${ticket.minAmountOut}`
  }

  return null
}

/**
 * Validates the cancellation of a ticket.
 * @param ticket - The ticket to validate.
 * @param walletAddress - The wallet address of the user attempting to cancel the ticket.
 * @returns A string containing an error message if validation fails, null if validation passes.
 */
export function validateTicketCancellation(ticket: Ticket, walletAddress: string | null): string | null {
  if (!ticket) {
    return "Ticket not found"
  }

  if (walletAddress !== ticket.creator) {
    return "Only the ticket creator can cancel"
  }

  if (ticket.status !== "open") {
    return "Ticket is not open"
  }

  return null
}

/**
 * Validates the fulfillment of an NFT ticket.
 * @param ticket - The NFT ticket to validate.
 * @param amount - The amount being offered to fulfill the ticket.
 * @param walletAddress - The wallet address of the user attempting to fulfill the ticket.
 * @returns A string containing an error message if validation fails, null if validation passes.
 */
export function validateNFTTicketFulfillment(ticket: Ticket, amount: number, walletAddress: string | null): string | null {
  const standardValidation = validateTicketFulfillment(ticket, amount, walletAddress)
  if (standardValidation) {
    return standardValidation
  }

  if (ticket.assetIn.type !== "nft") {
    return "Not an NFT ticket"
  }

  return null
}
